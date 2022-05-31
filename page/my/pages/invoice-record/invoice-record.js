var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: false,
      titName: '我的发票',
      // goback_pic: '../../image/goback4.png'
    },
    type: 1,
    invoiceList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
      'url': '/xcx/wxinvoicejson/invoice_list_json',
      'cachetime': '0',
      data: {
        type: this.data.type
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            invoiceList: result.data
          })
        }
      }
    });
  },
  /**
   * 点击nav
   */
  navFun: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      type
    })
    this.getData();
  },
  goOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    // 1会员订单 2订阅订单 3普通订单
    const type = +e.currentTarget.dataset.type
    let url = ''
    if (type === 1) {
      url = '/page/my/pages/vip-detail/vip-detail?id=' + id
    } else if (type === 2) {
      url = '/page/product/pages/dorder-details/dorder-details?subscribe_id=' + id
    } else if (type === 3) {
      url = '/page/product/pages/ordinary-order-details/ordinary-order-details?ordinary_id=' + id
    }
    wx.navigateTo({
      url,
    })
  },
  goInvoice(e){
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/page/my/pages/invoice-detail/invoice-detail?id=' + id,
    })
  }
})