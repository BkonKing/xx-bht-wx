var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barObj: {
      isBorder: false,
      titName: '发票详情',
      // goback_pic: '../../image/goback4.png'
    },
    isFold: true,
    id: '',
    info: {},
    alertShow: false,
    imageShow: false,
    orderLength: 0,
    isCompany: true,
    imageIndex: 0
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
  getData: function (e) {
    const that = this;
    
    app.util.request({
      'url': '/xcx/wxinvoicejson/invoice_details',
      'cachetime': '0',
      data: {
        invoice_id: this.data.id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            info: result.data,
            orderLength: result.data.order_arr ? Object.keys(result.data.order_arr).length : 0,
            'info.i_state': +result.data.i_state,
            isCompany: result.data.rise_type === '2'
          })
        }
      }
    });
  },
  openCancel() {
    this.setData({
      alertShow: true
    })
  },
  cancelApply() {
    const that = this;
    app.util.request({
      'url': '/xcx/wxinvoicejson/invoice_ready',
      'cachetime': '0',
      data: {
        invoice_id: this.data.id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          wx.showToast({
            icon: 'none',
            title: '取消成功',
          })
          setTimeout(() => {
            wx.navigateBack()
          },500)
        } else {
          wx.showToast({
            icon: 'none',
            title: '取消失败',
          })
        }
      }
    });
  },
  editApply() {
    wx.navigateTo({
      url: `/page/my/pages/invoice-apply/invoice-apply?id=${this.data.id}`,
    })
  },
  goOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    // 1会员订单 2订阅订单 3普通订单
    const type = +e.currentTarget.dataset.type
    // 1会员订单 2订阅订单 3普通订单
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
  // 收缩
  changeFold() {
    this.setData({
      isFold: !this.data.isFold
    })
  },
  openBigPic(e) {
    var index = e.currentTarget.dataset.index;//获取data-src
    //图片预览
    this.setData({
      imageShow: true,
      imageIndex: index, // 当前显示图片的http链接
    })
  },
  bindImageChange({detail}) {
    const {current} = detail
    this.setData({
      imageIndex: current
    })
  },
  saveImg() {
    this.data.info.image_arr.forEach((src) => {
      this.downloadImage(src)
    })
  },
  saveImage(e) {
    const src = e.currentTarget.dataset.src
    this.downloadImage(src)
  },
  downloadImage(src) {
    wx.showLoading({
      title: '图片保存中',
    });
    wx.getImageInfo({
      src,
      success: function (ret) {
        var path = ret.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            wx.hideLoading();
            wx.showToast({
              title: '图片已保存至相册',
              icon: 'none',
              duration: 3000,
              mask: true
            });
          },
          fail() {
            wx.hideLoading();
          }
        })
      },
      fail() {
        wx.hideLoading();
      }
    })
  },
  modalHide: function (e) {
    const that = this;
    that.setData({
      alertShow: false
    })
  },
  imagePreviewHide() {
    this.setData({
      imageShow: false
    })
  }
})