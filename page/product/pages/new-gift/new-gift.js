var app = getApp();
var scene_val = '';

Page({
  data: {
    barObj: {
      isBorder: false,
      goindex_pic: '../../resource/images/goback6.png'
    },
    invitedUid: '',
    userId: '',
    userData: {},
    info: {},
    mobile: '',
    isGet: false,
    modalShow: false,
    vipShow: false,
    errorModalFunc: false,
    errorText: '',
    loginModelHidden: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var uid = options.uid
    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      uid = scene.split('=')[1];
    }
    wx.setStorageSync('vipRecommendInfo', {
      shareUid: uid,
      pageType: 1
    });
    this.setData({
      invitedUid: uid
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var userInfo = wx.getStorageSync('userInfo');

    if (userInfo) {
      this.setData({
        userId: userInfo.memberInfo.uid,
        userData: userInfo.memberInfo,
        loginModelHidden: true,
      });
    } else {
      var loginTime = wx.getStorageSync('loginTime') || '';
      this.setData({
        loginModelHidden: loginTime ? true : false,
      });
    }
    console.log(this.data.userData);
    scene_val = app.util.getScene();
    this.getMyData();
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
    }, 1)
  },
  getMyData: function () {
    const that = this;
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
          that.getData()
          if (result.data.is_vip) {
            that.setData({
              vipShow: true
            })
          }
        }
      }
    });
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
      that.invite()
    }, e);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(this.data)
    return {
      title: this.data.info.share_link,
      path: 'page/product/pages/new-gift/new-gift?uid=' + this.data.userId,
      imageUrl: this.data.info.share_pic,
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

  // 获取信息
  getData() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/getCopy',
      'cachetime': '0',
      data: {
        uid: this.data.userId
      },
      success(res) {
        console.log(res)
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            info: result.info,
          })
          if (!result.info.is_open) {
            that.setData({
              modalShow: true
            })
          } else {
            that.setRegister()
          }
        }
      }
    });
  },

  // 领取
  invite() {
    var that = this
    if (!this.data.mobile) {
      wx.showToast({
        title: '请输入手机号！',
        duration: 2000
      });
      return
    }
    app.util.request({
      'url': '/xcx/invite/getCoupons',
      'cachetime': '0',
      data: {
        mobile: this.data.mobile,
        invited_uid: this.data.invitedUid,
        discount_id: this.data.info.receive_discount_id
      },
      success(res) {
        console.log(res)
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            isGet: true
          })
        } else {
          that.setData({
            errorText: result.msg || ''
          })
          that.errorModalFunc()
        }
      }
    });
  },

  //邀请记录录入
  setRegister() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/setRegister',
      'cachetime': '0',
      data: {
        invite_uid: this.data.userId,
        invited_uid: this.data.invitedUid,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          console.log(result)
        }
      }
    });
  },

  vipModalFunc: function () {
    // this.setData({
    //   vipShow: !this.data.vipShow
    // })
    // this.triggerEvent('hide')
    this.closeModal('vipShow')
    app.util.goBack()
  },
  modalFunc: function () {
    // this.setData({
    //   modalShow: !this.data.modalShow
    // })
    // this.triggerEvent('hide')
    this.closeModal('modalShow')
    app.util.goBack()
  },
  errorModalFunc() {
    this.closeModal('errorShow')
  },
  closeModal(key) {
    this.setData({
      [key]: !this.data[key]
    })
    this.triggerEvent('hide')
  },
  showVipModal() {
    this.showModal('vipShow')
  },
  showLoseModal() {
    this.showModal('modalShow')
  },
  showErrorModal() {
    this.showModal('errorShow')
  },
  showModal (key) {
    this.setData({
      [key]: true
    })
  },
})