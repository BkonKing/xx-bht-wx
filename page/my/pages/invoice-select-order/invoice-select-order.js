var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: false,
      titName: '选择订单',
      // goback_pic: '../../image/goback4.png'
    },
    orderList: [],
    typeList: [
      {
        value: '1',
        label: '商店订单'
      },
      {
        value: '2',
        label: '订阅订单'
      },
      {
        value: '3',
        label: '购买会员'
      }
    ],
    order_numb: '',
    order_type: '',
    order_type_text: '订单类型',
    typeHidden: true,
    noneHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getOrderData() {
    const that = this;
    app.util.request({
      'url': '/xcx/wxinvoicejson/payorder_data',
      'cachetime': '0',
      data: {
        order_numb: this.data.order_numb,
        order_type: this.data.order_type
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            orderList: result.data,
          })
        }
      }
    });
  },
  showMenu() {
    this.setData({
      typeHidden: false
    })
  },
  hideMenu() {
    this.setData({
      typeHidden: true
    })
    console.log(this.data.typeHidden)
  },
  selectType(e) {
    var type = e.currentTarget.dataset.type
    var label = e.currentTarget.dataset.label
    this.setData({
      order_type: type,
      order_type_text: label
    })
    this.getOrderData()
    this.hideMenu()
  },
  // 选择订单
  selectOrder(e) {
    var index = e.currentTarget.dataset.active
    var active = this.data.orderList[index]
    var error = e.currentTarget.dataset.error
    if (error) {
      wx.showToast({
        title: error,
        icon: 'none',
        duration: 2000
      })
    } else {
      this.setInfo(active)
    }
  },
  // 将订单信息传回上一个页面
  setInfo(active) {
    let pages = getCurrentPages();
    let prevPage = null; //上一个页面

    if (pages.length >= 2) {
      prevPage = pages[pages.length - 2]; //上一个页面
    }

    if (prevPage) {
      prevPage.setData({
        wxpay_id: active.id, 
        // orderNum: this.data.order_numb,
        // invoiceMoney: active.z_order_price || '0'
      });
      prevPage.getData()
    }

    wx.navigateBack()
  }
})