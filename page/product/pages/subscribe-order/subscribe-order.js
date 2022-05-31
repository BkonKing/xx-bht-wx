var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '订阅订单',
      // goback_pic: '../../image/goback4.png'
    },

    listData: [],       //数据列表
    noMoreHidden: true, //上拉加载更多，没有更多是否隐藏
    noneHidden: true,   //数据是否为空
    bodyShow: false,    //数据是否加载完成
    page: 1,            //页码
    userId: '',         //用户uid
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.setData({
        userId: userInfo.memberInfo.uid
      })
    }
    that.data.page = 1;
    that.listData();
  },
  onLoad: function (options) {
    const that = this;
  },
  /**
   * 获取后台数据
  */
  listData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/subscribe_order_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        page: that.data.page
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            listData: that.data.page == 1 ? result.data.list_data : that.data.listData.concat(result.data.list_data),
            bodyShow: true
          })
          if (result.data.list_data.length == 0 && that.data.page == 1) {
            that.setData({
              noneHidden: false
            })
          } else {
            that.setData({
              noneHidden: true
            })
          }
          if (result.data.list_data.length == 0 && that.data.page > 1) {
            that.setData({
              noMoreHidden: false
            })
          }else {
            that.setData({
              noMoreHidden: true
            })
          }
        }
      }
    });
  },
  /**
   * 上拉加载
  */
  onReachBottom: function () {
    const that = this;
    var page = that.data.page;
    if (that.data.noMoreHidden) {
      that.data.page = page + 1;
      that.listData();
    }
  },
  /**
   * 跳转
  */
  linkFunc: app.util.throttle(function (e) {
    const that = this;
    console.log(e);
    let _href = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: _href,
    })
  }, 1000),

})