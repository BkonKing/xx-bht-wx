// page/product/pages/special/special.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //顶部标题栏数据
    barObj: {
      isBorder: false,
      titName: '不荒唐',
      goback_pic: '../../resource/images/goback4.png'
    },
    specialId: '', // 专题ID
    loginModelHidden: true,
    page: 1, //分页页码
    noMoreHidden: true, //上拉加载更多，没有更多是否隐藏
    type: 0, // 1 商品组，2 图片组
    arrange: 0, // 商品组，排列形式 1一行一个 2一行两个
    topicUrl: '', // 专题图片简介
    topicTitle: '', // 专题简介标题
    topicContent: '', // 专题简介内容
    groupList: [], // 商品组列表
    list: [], // 图文组列表
    errorShow: false,
    wxShareTitle: '', // 分享标题
    wxShareImage: '', // 分享图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      specialId: options.id
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.data.userId = userInfo.memberInfo.uid
      this.getListData();
    } else {
      this.setData({
        loginModelHidden: false
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // this.setData({
    //   page: 1,
    //   list: []
    // });
    // this.getListData();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    console.log(this.data.noMoreHidden)
    var page = this.data.page;
    if (this.data.noMoreHidden && (this.data.list && this.data.list.length > 0)) {
      this.data.page = page + 1;
      this.getListData();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.wxShareTitle,
      path: 'page/product/pages/special/special?id=' + this.data.specialId,
      imageUrl: this.data.wxShareImage,
      success: function (res) {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })
      }
    }
  },

  // 授权
  updateUserInfo() {
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
      that.getListData();
    }, 1)
  },

  getListData() {
    const that = this;
    app.util.request({
      'url': '/xcx/special/getSpecial',
      'cachetime': '0',
      data: {
        // uid: that.data.userId,
        special_id: that.data.specialId,
        page: that.data.page,
        size: 5
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          const data = result.info
          that.setData({
            type: data.content_type,
            wxShareTitle: data.wx_sharelink || data.title,
            wxShareImage: data.wx_sharepic,
            ['barObj.titName']: data.title
          })
          console.log(that.data.barObj)
          // 商品组
          if (data.content_type === 1) {
            if (data.combination && data.combination.length > 0) {
              that.setData({
                list: that.data.page == 1 ? data.combination : that.data.list.concat(data.combination)
              })
            }
            that.setData({
              arrange: data.arrange,
              topicUrl: data.topic_url,
              topicTitle: data.topic_title,
              topicContent: data.topic_content,
              noMoreHidden: that.data.page > 1 && data.combination.length == 0 ? false : true
            })
          } else {
            if (data.list && data.list.length > 0) {
              that.setData({
                list: that.data.page == 1 ? data.list : that.data.list.concat(data.list)
              })
            }
            that.setData({
              noMoreHidden: that.data.page > 1 && data.list.length == 0 ? false : true
            })
          }
        } else {
          that.errorModalFunc()
        }
      }
    });
  },
  showErrorModal() {
    this.showModal('errorShow')
  },
  goBack() {
    this.errorModalFunc();
    app.util.goBack();
  },
  errorModalFunc() {
    this.closeModal('errorShow')
  },
  closeModal(key) {
    this.setData({
      [key]: !this.data[key]
    })
    this.triggerEvent('hide')
  },

  // 跳转
  jump(e) {
    const isSpecail = e.currentTarget.dataset.type == 2
    const id = e.currentTarget.dataset.id
    if (id) {
      // 专题
      if (isSpecail) {
        wx.navigateTo({
          url: '/page/product/pages/special/special?id=' + id,
        })
      } else {
        wx.navigateTo({
          url: '/page/product/pages/goods-details/goods-details?goods_id=' + id,
        })
      }
    }
  }
})