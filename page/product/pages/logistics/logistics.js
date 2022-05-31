var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '物流信息',
      // goback_pic: '../../image/goback4.png'
    },
    
    logistics_id: '',     //物流id
    order_id: '',         //订单id
    logistice_type: '1',  //上门自提（1正常收货物流 2退货 3换货）
    order_mark: '1',      //上门自提（1商店订单 2订阅订单）
    logisticsInfo: '',    //物流信息
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
      that.data.order_id = options.order_id;
      that.data.logistice_type = options.logistice_type;
      that.data.order_mark = options.order_mark;
      console.log(options.logistics_id);
      that.setData({
        logistics_id: options.logistics_id&&options.logistics_id!='null'&&options.logistics_id!=0 ? options.logistics_id : 0
      })

    }
    that.getData();
  },
  onUnload: function (options) {
    const that = this;
    app.util.orderRefresh();
  },
  // },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/logistice_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val,
        logistice_id: that.data.logistics_id,
        order_id: that.data.order_id,
        logistice_type: that.data.logistice_type,
        order_mark: that.data.order_mark,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          if(that.data.logistics_id && that.data.logistics_id!='null' && that.data.logistics_id!=0){
            that.setData({
              listData: result.data.logistice_data.kd_text_arr.data
            })
          }
          that.setData({
            logisticsInfo: result.data.logistice_data
          })
          console.log(that.data.logisticsInfo)
        }
      }
    });
  },
  /**
   * 复制运单编号
  */
  copyNo: function () {
    const that = this;
    wx.setClipboardData({
      data: that.data.logisticsInfo.kuaidi_numb,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
})