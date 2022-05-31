var app = getApp();
var pic = '';

Page({
  data: {
    barObj: {
      isBorder: false
    },
    userId: '',
    posterSrc: {}
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
    var userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userId: userInfo.memberInfo.uid
    })
    this.getPoster()
  },

  getPoster: function () {
    const that = this;
    wx.showLoading({
      title: '图片生成中',
    });
    app.util.request({
      'url': '/xcx/invite/genrePic',
      'cachetime': '0',
      'data': {
        uid: this.data.userId,
      },
      showLoading: false,
      success(res) {
        wx.hideLoading();
        that.setData({
          posterSrc: res.data.poster 
        })
      }
    });
  },
  /**
   * 保存图片
   */
  savePic: function () {
    const self = this;
    // 相册授权
    wx.getSetting({
      success(res) {
        // 进行授权检测，未授权则进行弹层授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              self.saveImage();
            },
            // 拒绝授权时，则进入手机设置页面，可进行授权设置
            fail() {
              wx.showModal({
                title: '授权提示',
                content: '允许小程序保存图片到你的相册，才能分享图片哦！',
                showCancel: false,
                success: function (res2) {
                  if (res2.confirm) {
                    wx.openSetting({
                      success: function (data) {
                        console.log("openSetting success");
                        self.saveImage();
                        self.setData({
                          wxChartIndex: 0,
                          scrollLeft: 0
                        })
                      },
                      fail: function (data) {
                        self.setData({
                          wxChartIndex: 0,
                          scrollLeft: 0
                        })
                        console.log("openSetting fail");
                      }
                    });
                  }
                }
              })
            }
          })
        } else {
          // 已授权则直接进行保存图片
          self.saveImage();
        }
      },
      fail(res) {
        console.log(res);
      }
    })
  },
  saveImage: function (e) {
    const self = this;
    wx.showLoading({
      title: '图片保存中',
    });
    wx.getImageInfo({
      src: this.data.posterSrc,
      success: function (ret) {
        var path = ret.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            wx.hideLoading();
            self.setData({
              wxChartIndex: 0,
              scrollLeft: 0
            })
            wx.showToast({
              title: '图片已保存至相册',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            // wx.previewImage({
            //   current: pic, // 当前显示图片的http链接
            //   urls: [pic] // 需要预览的图片http链接列表
            // })
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
})