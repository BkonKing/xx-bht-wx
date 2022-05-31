var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '我的',
      // goback_pic: '../../image/goback4.png'
    },
    bodyShow: false, //数据是否加载完成
    userId: '', //用户uid
    planData: '', //当前订阅信息
    userData: '', //用户信息
    myData: { //页面数据
      is_vip: 0
    },
    loginModelHidden: true, //授权弹窗
    bannerSrc: '',
    isOpenInvoice: false
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');

    if (userInfo) {
      that.setData({
        userId: userInfo.memberInfo.uid,
        userData: userInfo.memberInfo,
        loginModelHidden: true,
      });
    } else {
      var loginTime = wx.getStorageSync('loginTime') || '';
      if (loginTime) {
        that.setData({
          loginModelHidden: true,
        });
      } else {
        that.setData({
          loginModelHidden: false,
        });
      }
    }
    console.log(that.data.userData);
    scene_val = app.util.getScene();
    that.getMyData();
    that.getSetting();
  },
  onLoad: function (options) {
    const that = this;
  },
  updateUserInfo(result) {
    const that = this;

    //拿到用户数据时，通过app.util.getUserinfo将加密串传递给服务端
    //服务端会解密，并保存用户数据，生成sessionid返回
    app.util.getUserInfo(function (userInfo) {
      //这回userInfo为用户信息
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.memberInfo.nickName) {
        that.setData({
          userData: userInfo.memberInfo,
          loginModelHidden: true,
          userId: userInfo.memberInfo.uid
        });
      } else {
        that.setData({
          loginModelHidden: true,
        });
      }
      that.getMyData();
    })
  },
  getMyData: function () {
    const that = this;
    // wx.getUserInfo({
    //   success: res => {
    //     app.util.request({
    //       'url': '/xcx/wxjson/tx_user_data',
    //       'cachetime': '0',
    //       showLoading: false,
    //       data: {
    //         uid: that.data.userId,
    //         nickname: res.userInfo.nickName,
    //         avatar_url: res.userInfo.avatarUrl,
    //         gender: res.userInfo.gender,
    //         city: res.userInfo.city,
    //         province: res.userInfo.province
    //       },
    //       success(res) {
    // var userInfo = wx.getStorageSync('userInfo');
    // userInfo.memberInfo.avatarUrl = res.data.keep_avatar;
    // wx.setStorageSync('userInfo', userInfo);
    //       }
    //     })
    //   },
    //   fail: res => {
    //     console.log(res);
    //     console.log('失败')
    //   },
    // })
    app.util.request({
      'url': '/xcx/wxjson/my_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        console.log('vip信息', res)
        if (result.code == '0000') {
          that.setData({
            myData: result.data,
            planData: result.data.user_plan_info,
          })
          if (result.data.is_vip) {
            that.getBanner()
          }
        }
        that.setData({
          bodyShow: true
        })
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

  // 获取分销banner图
  getBanner() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/getCopy',
      'cachetime': '0',
      data: {
        uid: that.data.userId
      },
      success(res) {
        var result = res.data
        if (result.code == '0000') {
          that.setData({
            bannerSrc: result.info.is_open ? result.info.my_banner : ''
          })
        }
      }
    });
  },

  getSetting() {
    var that = this
    app.util.request({
      'url': '/xcx/wxjson/setting_data',
      'cachetime': '0',
      data: {},
      success(res) {
        var result = res.data
        if (result.code == '0000') {
          console.log(result.data.is_open_invoice)
          that.setData({
            isOpenInvoice: !!+result.data.is_open_invoice
          })
        }
      }
    });
  }
})