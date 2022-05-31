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
  updateUserInfo(result) {
    const that = this;
    //拿到用户数据时，通过app.util.getUserinfo将加密串传递给服务端
    //服务端会解密，并保存用户数据，生成sessionid返回
    app.util.getUserInfo(function (userInfo) {
      //这回userInfo为用户信息
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        wx.removeStorageSync('visitor_uid');
        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          userId: userInfo.memberInfo.uid
        })
        if (userInfo.memberInfo.mobile) {
          wx.navigateBack({})
        } else {
          wx.redirectTo({
            url: '/page/my/pages/tel-reg/tel-reg',
          })
        }
      }
      // that.setData({
      //   mobile: userInfo.memberInfo.mobile
      // });
      // that.data.userId = userInfo.memberInfo.uid;
    })
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
    const that = that;
    app.util.goBack();
  }
})