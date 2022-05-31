var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: false,
      titName: '登录',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
  },
  /**
   * 获取用户手机号
  */
  getPhoneNumber(e) {
    const that = this;
    app.util.getMoblie(function (telNum) {
      //返回telNum为用户手机号
      app.util.goBack();
    }, e);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  goback: function(){
    app.util.goBack();
  }
})