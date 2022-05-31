var app = getApp();
var share_uid = '';
var share_tid = '';
var qb_uid = '',
  qb_mobile = '',
  ptime = '',
  md5_sign = ''; //钱包app传参
var WxParse = require('../../../resource/wxParse/wxParse.js');
Page({
  data: {
    //顶部标题栏数据
    barObj: {
      isBorder: true,
      titName: '加入不荒唐会员',
      // goback_pic: '../../image/goback4.png'
    },
    bodyShow: false, //数据是否加载完成
    userId: '', //用户uid
    userData: '', //用户数据
    is_vip: 0,
    couponRmindShow: false,
    couponModalShow: false,
    couponList: [],
    couponTip: '',
    winHeight: '',
    fixedBtn: '' // 滚动超过一屏就固定按钮class
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({
        userId: userInfo.memberInfo.uid,
      })
      that.data.userData = userInfo.memberInfo;
    }
    that.listData();
  },
  onLoad: function (options) {
    const that = this;
    if (options.qb_uid) {
      qb_uid = options.qb_uid;
      qb_mobile = options.mobile;
      ptime = options.ptime;
      md5_sign = options.md5_sign;
    }
    if (options.share_uid || options.share_tid) {
      share_uid = options.share_uid;
      share_tid = options.share_tid;
    }
    this.getHeight()
  },
  // 获取窗口高度
  getHeight() {
    let that = this;
    // 获取系统信息
    let systemInfo = wx.getSystemInfoSync()
	    // px转换到rpx的比例
      let pxToRpxScale = 750 / systemInfo.windowWidth;
      that.setData({
        winHeight: (956 + 138) / pxToRpxScale
      });
  },
  /**
   * 获取后台数据
   */
  listData: function () {
    const that = this;
    var scene_1 = 0;
    scene_1 = app.util.getScene();
    console.log(that.data.userId);
    app.util.request({
      'url': '/xcx/wxjson/index_json',
      'cachetime': '0',
      showLoading: false,
      data: {
        uid: that.data.userId,
        share_uid: 22,
        share_tid: share_tid,
        cj_code: scene_1,
        qb_uid: qb_uid,
        mobile: qb_mobile,
        ptime: ptime,
        md5_sign: md5_sign
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.data.fxData = result.data.fxData; //分享数据
          that.setData({
            bodyShow: true,
            is_vip: result.data.is_vip,
            couponModalShow: result.data.tips_coupons.length ? true : false,
            couponList: result.data.tips_coupons,
            couponRmindShow: result.data.dq_tips ? true : false,
            couponTip: result.data.dq_tips
          })
          WxParse.wxParse('articleContent', 'html', result.data.article_info.content, that, 10);
          if (qb_mobile) { //如果是从钱包进来的用户，将用户手机号写入缓存
            var userInfo = wx.getStorageSync('userInfo');
            userInfo.memberInfo.mobile = qb_mobile;
            wx.setStorageSync('userInfo', userInfo);
            //清除分享数据和钱包用户数据
            share_uid = '';
            share_tid = '';
            qb_uid = '';
            qb_mobile = '';
            ptime = '';
            md5_sign = '';
          }
        }
      }
    });
  },
  /**
   * 分享
   */
  onShareAppMessage: function () {
    const that = this;
    var visitor_uid = wx.getStorageSync('visitor_uid') || '';
    // app.util.request({
    //   'url': '/xcx/wxjson/share_tap',
    //   'cachetime': '0',
    //   data: {
    //     uid: that.data.userId,
    //     share_uid: that.data.userId,
    //     share_tid: visitor_uid,
    //     share_type: 1,
    //     page_type: 'index'
    //   }
    // });
    return {
      title: that.data.fxData.txt,
      path: 'page/tabBar/index/index?share_uid=' + that.data.userId + '&share_tid=' + visitor_uid,
      imageUrl: that.data.fxData.img,
      success: function (res) {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })
      }
    }
  },
  // 页面滚动触发
  onPageScroll(scrollTop) {
    if (scrollTop.scrollTop >= this.data.winHeight && !this.data.fixedBtn) {
      this.setData({
        fixedBtn: 'fixedBtn'
      })
    } else if (scrollTop.scrollTop < this.data.winHeight && this.data.fixedBtn) {
      this.setData({
        fixedBtn: ''
      })
    }
  }
})