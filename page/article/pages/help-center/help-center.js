var app = getApp();
var scene_val = '';      //场景值
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '帮助中心',
      // goback_pic: '../../image/goback4.png'
    },

    listData: [],         //页面数据列表
    userId: '',           //用户uid
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
  // },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/help_center_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        console.log(result.data);
        if (result.code == '0000') {
          that.setData({
            listData: result.data.listData
          })
        }
      }
    });
  },
  /**
   * 展开/隐藏
  */
  toggleFunc: function (e) {
    const that = this;
    let tapIndex = e.currentTarget.dataset.index;
    console.log(tapIndex);
    let up = that.data.listData[tapIndex].up;
    let u = "listData[" + tapIndex + "].up";
    that.setData({
      [u]: !up
    })
  },
})