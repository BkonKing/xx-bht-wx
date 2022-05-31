var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '购买会员记录',
      // goback_pic: '../../image/goback4.png'
    },
    noneHidden: true,    //列表数据是否为空
    listData: [],        //列表数据
    userId: '',          //用户uid
  },
  onShow: function () {
    const that = this;
    scene_val = app.util.getScene();
    if (scene_val > 0) {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    scene_val = app.util.getScene();
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.data.userId = userInfo.memberInfo.uid;
    }
    that.getData();
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/new_vip_list',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            listData: result.data
          })
        }
      }
    });
  },

  goDetail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/page/my/pages/vip-detail/vip-detail?id=' + id,
    })
  }
})