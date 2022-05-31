// page/my/pages/invoice-title-detail/invoice-title-detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: false,
      titName: '发票抬头'
    },
    riseId: '',
    info: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.riseId = options.id
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
  },
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxinvoicejson/user_rise_info',
      'cachetime': '0',
      data: {
        user_rise_id: this.riseId
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            info: result.data,
          })
        }
      }
    });
  },
  goEdit() {
    wx.navigateTo({
      url: '/page/my/pages/invoice-title-edit/invoice-title-edit?id=' + this.riseId,
    })
  }
})