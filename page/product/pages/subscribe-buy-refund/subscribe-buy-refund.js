var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '购买或预约取退',
      // goback_pic: '../../image/goback4.png'
    },

    //弹窗
    modalShow: false,
    modalArr: [],
    is_onload: 1,       //加载标识，onshow和onload只加载一次数据
    nowIndex: 0,        //当前点击的是第几个商品
    refundNum: 0,       //退款商品数
    buyNum: 0,          //购买商品数
    subscribe_id: '',   //订阅订单id
    listData: [],       //列表数据
    userId: '',          //用户uid
  },
  onShow: function () {

    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.data.userId = userInfo.memberInfo.uid
    }
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    that.setData({
      subscribe_id: options.subscribe_id,
    })
    that.getData();
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    // for (var i = 0; i < 2; i++) {
    //   let u = "listData[" + i + "].tip_hidden";     //默认没有选择不满意理由（隐藏）
    //   let y = "listData[" + i + "].select_status";  //1选择不满意或者2我要了  0未选择
    //   let x = "listData[" + i + "].no_id";          //不满意原因id
    //   that.setData({
    //     [u]: true,
    //     [y]: 0,
    //     [x]: ''
    //   })
    // }
    app.util.request({
      'url': '/xcx/wxjson/subscribe_buy_refund_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        subscribe_id: that.data.subscribe_id,
        cj_code: app.util.getScene(),
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            modalArr: result.data.retreat_list,
          })
          if (that.data.listData.length == 0){
            that.setData({
              listData: result.data.goods_list,
            })
          }
        }
      }
    });
    that.countFunc();
    console.log(that.data.listData); return;
  },
  /**
   * 这款我要了
  */
  yesFunc: function (e) {
    const that = this;
    let tapIndex = e.currentTarget.dataset.index;
    console.log(tapIndex)
    let u = "listData[" + tapIndex + "].tip_hidden";      //是否选择了不满意原因
    let y = "listData[" + tapIndex + "].select_status";  //1选择不满意或者2我要了  0未选择
    that.setData({
      [u]: true,
      [y]: 2
    })
    console.log(that.data.listData)
    that.countFunc();
  },
  /**
   * 不太满意原因展开/隐藏
  */
  modalFunc: function (e) {
    const that = this;
    console.log(that.data.modalShow);
    that.data.nowIndex = e.currentTarget.dataset.index;
    that.setData({
      modalShow: true
    })
  },
  /**
   * 模态框数据回调
  */
  modalCall: function (e) {
    console.log(e.detail)
    const that = this;
    console.log(that.data.nowIndex);
    let u = "listData[" + that.data.nowIndex + "].tip_hidden";      //是否选择了不满意原因
    let y = "listData[" + that.data.nowIndex + "].select_status";  //1不满意 2我要了  0未选择
    let x = "listData[" + that.data.nowIndex + "].no_val";  //不满意原因
    let z = "listData[" + that.data.nowIndex + "].no_id";  //不满意原因id
    that.setData({
      [u]: false,
      [y]: 1,
      [x]: e.detail.modalStr,
      [z]: e.detail.id,
      modalShow: false
    })
    that.countFunc();
  },
  /**
   * 计算购买数和退货数
  */
  countFunc: function (e) {
    const that = this;
    let buyNum = 0, refundNum = 0;
    for (let i = 0; i < that.data.listData.length; i++) {
      if (that.data.listData[i].select_status == 1) {
        refundNum++;
      } else if (that.data.listData[i].select_status == 2) {
        buyNum++;
      }
    }
    console.log('count')
    that.setData({
      buyNum: buyNum,
      refundNum: refundNum
    })
  },
  /**
   * 确认按钮
  */
  sureFunc: function (e) {
    const that = this;
    // console.log(that.data.listData);return;
    if (that.data.listData.length == that.data.buyNum + that.data.refundNum) {
      wx.setStorageSync("subscribe_data", that.data.listData);
      wx.setStorageSync("modalArr", that.data.modalArr);
      wx.navigateTo({
        url: '/page/product/pages/subscribe-pay/subscribe-pay?subscribe_id=' + that.data.subscribe_id,
      })
    } else {
      wx.showToast({
        title: '请选择购买或退货',
        icon: 'none'
      })
    }
  }
})