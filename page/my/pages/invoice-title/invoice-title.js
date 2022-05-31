var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: false,
      titName: '发票抬头',
      // goback_pic: '../../image/goback4.png'
    },
    listData: [],
    isSelect: false // 是否为选择模式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const type = options.type
    if (type) {
      this.setData({
        isSelect: true
      })
    }
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
      'url': '/xcx/wxinvoicejson/user_rise_list',
      'cachetime': '0',
      data: {},
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            listData: result.data,
          })
        }
      }
    });
  },
  goDetail(e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    if (this.data.isSelect) {
      this.setPrevPage(index)
    } else {
      wx.navigateTo({
        url: '/page/my/pages/invoice-title-detail/invoice-title-detail?id=' + id,
      })
    }
  },
  setPrevPage(index) {
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      const active = this.data.listData[index]
      //将选中的抬头传回上个页面
      prevPage.setData({
        rise: active.rise,
        rise_type: active.rise_type,
        address: active.address,
        bank: active.bank,
        bank_card: active.bank_card,
        duty_paragraph: active.duty_paragraph,
        phone: active.phone,
      })
      wx.navigateBack({})
    }
  },
  goEdit(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/page/my/pages/invoice-title-edit/invoice-title-edit?id=' + id,
    })
  }
})