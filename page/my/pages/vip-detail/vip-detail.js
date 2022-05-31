var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: true,
      titName: '会员订单详情',
      goback_pic: '/resource/images/goback3.png'
    },
    id: '',
    infoData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
  },

  /**
   * 获取后台数据
   */
  getData: function () {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/new_vip_details',
      'cachetime': '0',
      data: {
        vip_id: that.data.id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            infoData: result.data
          })
        }
      }
    });
  },

  // 复制订单编号
  copyOrderNum() {
    wx.setClipboardData({
      data: this.data.infoData.vip_numb,
      success (res) {
      }
    })
  }
})