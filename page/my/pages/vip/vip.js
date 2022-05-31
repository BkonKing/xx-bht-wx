var app = getApp();
var scene_val = '';
var WxParse = require('../../../../resource/wxParse/wxParse.js');
var tmplIds_str = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: 'VIP会员',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    agreeChecked: false, //是否勾选阅读并同意
    link_flag: 1, //页面跳转标识
    userId: '', //用户uid
    vipData: {}, //页面数据
    userData: '', //用户数据
    moreLong: false, //价格长度是否太长 默认false
    bodyShow: false, //数据是否加载完成
    flag: 0,
    couponInfo: {}, // 优惠券信息
    swalHidden: true,
    shareUid: '', // vip推荐人id
    pageType: '' // 线上推荐路径 1 老带新 2 会员
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({
        userId: userInfo.memberInfo.uid,
        userData: userInfo.memberInfo,
      });
    }
    that.data.link_flag = 1;
    scene_val = app.util.getScene();
    that.getMyData();
    if (userInfo && userInfo.memberInfo.is_vip && !userInfo.memberInfo.address_id && userInfo.memberInfo.address_id == null) {
      if (that.data.flag) {
        that.data.flag = 0
      } else {
        wx.navigateTo({
          url: '/page/my/pages/information/information?prev_page=vip',
        })
      }
    }
    var vipRecommendInfo = wx.getStorageSync('vipRecommendInfo')
    if (vipRecommendInfo) {
      that.setData({
        shareUid: vipRecommendInfo.shareUid,
        pageType: vipRecommendInfo.pageType
      })
    }
  },
  onLoad: function (options) {
    const that = this;
    //判断父页面是哪个（触发事件收集）
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      if (prevPage.route == "page/tabBar/my/index") { //父页面-我的
        console.log('我的');
        // app.util.eventFunc(that.data.userId, );
      } else if (prevPage.route == "page/tabBar/index/index") { //父页面-首页(点击了开启购茶新体验)
        console.log('首页');
        // app.util.eventFunc(that.data.userId, );
      }
    }
    if (typeof options.isrenew != 'undefined' && options.isrenew) {
      that.sureFunc(1);
    }
    var share_uid = options.share_uid
    if (share_uid) {
      wx.setStorageSync('vipRecommendInfo', {
        shareUid: share_uid,
        pageType: 2
      });
    }
  },
  getMyData: function () {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/vip_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          tmplIds_str = result.data.tmplIds_str;
          that.setData({
            vipData: result.data,
            fxData: result.data.fxData,
            bodyShow: true
          })
          if (result.data.dy_price.toString().length > 5) {
            that.setData({
              moreLong: true
            })
          } else {
            that.setData({
              moreLong: false
            })
          }
          WxParse.wxParse('articleContent', 'html', result.data.article_info.content, that, 10);
        }
      }
    });
  },
  /**
   * 联系客服
   */
  telFunc: function (e) {
    const that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.globalData.phone
    })
  },
  /**
   * 跳转
   */
  linkFunc: function (href_v) {
    const that = this;
    if (that.data.link_flag == 1) {
      wx.navigateTo({
        url: href_v,
        success: function () {
          that.data.link_flag = 2;
        }
      })
    }
  },

  /**
   * 同意并阅读
   */
  agreeFunc: function () {
    const that = this;
    that.setData({
      agreeChecked: !that.data.agreeChecked
    })
  },
  /**
   * 立即开通
   */
  sureFunc: function (ispay = '') {
    if (ispay != 1 && !this.data.agreeChecked && this.data.vipData.is_renewal != 1) {
      wx.showToast({
        title: '请先阅读并同意会员协议 ',
        icon: 'none'
      })
    } else {
      //是否有可用优惠券支付
      this.get_coupon_vip()
    }
  },
  // 查询是否有可用优惠券
  get_coupon_vip: function () {
    var that =  this
    app.util.request({
      'url': '/xcx/wxvipjson/available_coupon_vip',
      'cachetime': '0',
      data: {
        uid: this.data.userId,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          if (result.is_coupon == 0) {
            that.create_vip_order()
          } else {
            //新弹窗展示
            that.setData({
              couponInfo: result.user_coupon_data,
              swalHidden: false
            })
          }
        }
      }
    })
  },
  couponPay: function() {
    this.create_vip_order(this.data.couponInfo.user_coupon_id)
  },
  // 会员支付
  create_vip_order: function (user_coupon_id) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxvipjson/create_vip_order',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        user_coupon_id: user_coupon_id || '',
        active_uid: that.data.shareUid,
        page_type: that.data.pageType
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          //付款
          app.util.getMessage(function () {
            wx.requestPayment({
              'timeStamp': result.data.timeStamp,
              'nonceStr': result.data.nonceStr,
              'package': result.data.package,
              'signType': 'MD5',
              'paySign': result.data.paySign,
              'success': function (res2) {
                var userInfo = wx.getStorageSync('userInfo');
                userInfo.memberInfo.is_vip = true;
                wx.setStorageSync('userInfo', userInfo);
                that.setData({
                  flag: 1,
                  swalHidden: true
                })
                if (!+that.data.vipData.vip_num || !+that.data.vipData.usercontact_num) {
                  wx.navigateTo({
                    url: '/page/my/pages/information/information?prev_page=vip',
                  })
                } else {
                  that.getMyData();
                }
              },
              'fail': function (res) {
                console.log(res)
              }
            })
          }, tmplIds_str);
        } else {
          wx.showModal({
            title: '提示',
            content: result.msg,
            showCancel: false
          });
        }
      }
    })
  },
  /**
   * 模态框数据回调
   */
  modalCall: function (e) {
    const that = this;
    that.sureFunc(1);
  },
  /**
   * 获取用户手机号
   */
  getPhoneNumber(e) {
    const that = this;
    app.util.getMoblie(function (telNum) {
      //返回telNum为用户手机号
      that.setData({
        'userData.mobile': telNum
      })
    }, e);
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
    //     page_type: 'vip'
    //   }
    // });
    return {
      title: that.data.fxData.txt,
      path: 'page/my/pages/vip/vip?share_uid=' + that.data.userId + '&share_tid=' + visitor_uid,
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
  closeSwal() {
    this.setData({
      swalHidden: true
    })
  },
  swalFunc: function (e) {
    const that = this;
    if (typeof e.currentTarget.dataset.nohide !== "undefined" && e.currentTarget.dataset.nohide) {
      that.setData({
        swalHidden: false
      })
    } else {
      that.setData({
        swalHidden: !that.data.swalHidden
      })
    }

  },
})