var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '订单详情',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    is_onload: 1,           //加载标识，onshow和onload只加载一次数据
    userId: '',             //用户uid
    subscribe_id: '',       //订单id
    subscribeData: '',      //订阅订单详情数据
    zzGoodsList: [],        //正装商品列表
    isSelectAddress: false,//是否选择地址
    userAddId: '',         //选中的地址id
    uname: '',             //选中地址-收货人姓名
    utel: '',              //选中地址-收货人电话
    userAddress: '',        //选中的地址详情
    bodyShow: true,      //数据是否加载完成
    loginModelHidden: false,// 授权弹窗是否隐藏
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({
        loginModelHidden: true
      })
      that.data.userId = userInfo.memberInfo.uid
    }else {
      that.setData({
        loginModelHidden: false
      })
    }
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    that.setData({
      subscribe_id: options.subscribe_id
    })
    that.getData();
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
      that.getData();
    })
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/subscribe_detail_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        subscribe_id: that.data.subscribe_id,
        rece_realname: that.data.uname,
        rece_mobile: that.data.utel,
        rece_address: that.data.userAddress,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            subscribeData: result.data.subscribe_detail,
            zzGoodsList: result.data.zz_goods_list,
            bodyShow: true
          })
          if (that.data.isSelectAddress) {
            that.setData({
              "subscribeData.rece_realname": that.data.uname,
              "subscribeData.rece_mobile": that.data.utel,
              "subscribeData.rece_address": that.data.userAddress
            })
            that.data.isSelectAddress = false;
            that.data.userAddress = '';
          }
          if (result.data.subscribe_detail.order_status == 2) {  //已签收（请及时购买或退货）
            wx.redirectTo({
              url: '/page/product/pages/subscribe-buy-refund/subscribe-buy-refund?subscribe_id=' + result.data.subscribe_detail.id,
            })
          }
        }else {
          that.data.isSelectAddress = false;
          that.data.userAddress = '';
          that.setData({
            bodyShow: false
          })
          // that.errorFunc(result.msg);
        }
      }
    });
  },
  /**
   * 修改错误提示
  */
  errorFunc: function (msg = '') {
    const that = this;
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1500
    })
    // setTimeout(function () {
    //   that.getData();
    // }, 1500)
  },
  /**
   * 跳转
  */
  linkFunc: app.util.throttle(function (e) {
    const that = this;
    console.log(e);
    let _href = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: _href,
    })
  }, 1000),
})