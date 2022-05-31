
var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '会员订阅计划',
      // goback_pic: '../../image/goback4.png'
    },
    bodyShow: false,        //数据是否加载完成
    modalHidden: false,     //收茶设置弹窗
    modalIndex: 0,          //收茶设置选中 默认0、寄正装
    planIndex: 0,           //收茶设置 默认0、寄正装，确认后传后台
    dispose: 0,             //初始后台获取的收茶设置
    modalList: [            //收茶设置文字
      "每期试喝茶连同正装一起寄",
      "以后不要帮我寄正装"
    ],
    modalTip: '',           //本月生效、次月生效
    monthVal: 0,            //收茶设置生效时间 0本月 1次月
    swiperIndex: 0,         //轮播图当前显示index
    planList: [],           //订阅计划列表（轮播）
    nowPlan: '',            //当月订阅计划
    isSet: false,           //收茶设置是否显示
    isAbleSet: false,       //收茶设置是否能够修改
    etimeTip: '',           //订阅有效期
    serverTip: '',          //剩余服务次数
    sendTime: '',           //当月寄茶时间
    userId: '',             //用户uid
    userData: '',           //用户信息
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.data.userData = userInfo.memberInfo;
      that.data.userId = userInfo.memberInfo.uid;
    }
    scene_val = app.util.getScene();
    if (scene_val) {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    scene_val = app.util.getScene();
    that.getData();
  },
  getData: function () {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/subscribe_plan_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            modalIndex: result.data.dispose,
            planIndex: result.data.dispose,
            dispose: result.data.dispose,
            planList: result.data.plan_list,
            nowPlan: result.data.now_plan,
            isSet: result.data.is_set,
            isAbleSet: result.data.is_settable,
            etimeTip: result.data.etime_tip,
            serverTip: result.data.server_tip,
            sendTime: result.data.estimate_time2,
          })
          let j = 0;
          for (var i in result.data.plan_list) {
            if (result.data.plan_list[i].is_that) {
              that.setData({
                swiperIndex: j
              })
              return;
            }
            j++;
          }
          that.setData({
            bodyShow: true
          })
        }
      }
    });
  },
  /**
   * 轮播图切换
  */
  swiperChange: function (e) {
    const that = this;
    if (e.detail.source) {
      that.setData({
        swiperIndex: e.detail.current
      })
    }
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
   * 收茶设置展开/隐藏
  */
  modalFunc: function (e) {
    const that = this;
    let sendTime = that.data.sendTime;
    let nowTime = new Date(new Date().toLocaleDateString()).getTime();
    nowTime = parseInt(nowTime/1000);
    if (nowTime < sendTime-4*24*60*60){
      //本月生效
      that.data.monthVal = 0;
      that.setData({
        modalTip: "(本月生效)"
      })
    }else {
      //次月生效
      that.data.monthVal = 1;
      that.setData({
        modalTip: "(次月生效)"
      })
    }
    that.setData({
      modalHidden: !that.data.modalHidden
    })
  },
  /**
   * 收茶设置确定
  */
  modalSure: function (e) {
    const that = this;
    that.setData({
      planIndex: that.data.modalIndex,
      modalHidden: !that.data.modalHidden
    })
    if (that.data.dispose != that.data.modalIndex){
      app.util.request({
        'url': '/xcx/wxjson/subscribe_plan_set',
        'cachetime': '0',
        'showLoading': false,
        data: {
          dispose: that.data.modalIndex,
          month_val: that.data.monthVal
        },
        success(res) {
          that.data.dispose = that.data.modalIndex;
          wx.showToast({
            icon: 'none',
            title: res.data.msg,
            duration: 800,
          })
        }
      })
    }
  },
  /**
   * 收茶设置选中
  */
  modalSelect: function (e) {
    let that = this;
    let tapIndex = e.currentTarget.dataset.index;
    that.setData({
      modalIndex: tapIndex
    })
  }
})