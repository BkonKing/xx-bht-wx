var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '确认订单',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    subscribe_id: '',       //订阅订单id
    modalShow: false,       //购买退换选择弹窗
    modalIndex: 0,          //0、未选择 1、退货(临时选中) 2、购买
    selectIndex: 0,         //0、未选择 1、退货 2、购买
    reasonIndex: 0,         //退货原因选择index
    reasonId: 0,            //退货原因id 0未选
    //弹窗
    modalArr: [],
    is_onload: 1,           //加载标识，onshow和onload只加载一次数据
    nowIndex: 0,            //当前点击的是第几个商品
    refundNum: 0,           //退款商品数
    buyNum: 0,              //购买商品数
    listData: [],           //列表数据
    userId: '',             //用户uid
    priceInfo: '',          //订单价格信息
    couponInfo: '',         //优惠券信息
    isSelectCoupon: false,  //是否选择优惠券
    selectCouponId: '',     //选择的优惠券id
    selectCouponTxt: '',    //选择的优惠券信息
    coupon_id: '',          //优惠券id
    coupon_price: '',       //优惠券金额
    subscribe_goods_arr: '',//（提交后台）
    is_link: false,        //判断页面是否跳转到下个页面
    flag: 0,
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
      if (that.data.isSelectCoupon) {
        that.setData({
          "couponInfo.user_coupon_id": that.data.selectCouponId,
        })
      }
      that.getData();
    }
    if (that.data.is_link) {
      if (that.data.flag){
        that.data.flag = 0;
      }else {
        wx.navigateBack({
          delta: 2
        })
      }
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    let subscribe_data = wx.getStorageSync("subscribe_data");
    let modalArr = wx.getStorageSync("modalArr");
    that.data.subscribe_id = options.subscribe_id;
    that.setData({
      listData: subscribe_data,
      modalArr: modalArr
    })
    that.getData();
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    // for (var i = 0; i < 2; i++) {
    //   let u = "listData[" + i + "].tip_hidden";      //是否选择了不满意原因
    //   let y = "listData[" + i + "].select_status";  //1选择不满意或者2我要了  0未选择
    //   let x = "listData[" + i + "].no_val";  //不满意原因
    //   let z = "listData[" + i + "].no_id";  //不满意原因
    //   that.setData({
    //     [u]: true,
    //     [y]: 0,
    //     [x]: '',
    //     [z]: '',
    //   })
    // }
    that.countFunc();
    // console.log(that.data.listData); return;
  },

  /**
   * 这款我要了
  */
  yesFunc: function (e) {
    const that = this;
    let tapIndex = e.currentTarget.dataset.index;
    let u = "listData[" + tapIndex + "].tip_hidden";      //是否选择了不满意原因
    let y = "listData[" + tapIndex + "].select_status";  //1选择不满意或者2我要了  0未选择
    that.setData({
      [u]: true,
      [y]: 2
    })
    that.countFunc();
  },
  /**
   * 不太满意原因展开
  */
  modalFunc: function (e) {
    const that = this;
    let tapIndex = e.currentTarget.dataset.index;
    that.data.nowIndex = tapIndex;
    let thisData = that.data.listData[tapIndex];
    that.setData({
      modalIndex: thisData.select_status
    })
    if (thisData.select_status == 1){
      that.setData({
        reasonId: thisData.no_id
      })
    }else {
      that.setData({
        reasonId: 0
      })
    }
    that.setData({
      modalShow: true
    })
  },
  /**
   * 不太满意原因隐藏
  */
  modalCancel: function (e) {
    const that = this;
    that.setData({
      modalShow: false
    })
  },
  /**
   * 模态框数据回调
  */
  modalCall: function (e) {
    const that = this;
    let u = "listData[" + that.data.nowIndex + "].tip_hidden";      //是否选择了不满意原因
    let y = "listData[" + that.data.nowIndex + "].select_status";  //1不满意 2我要了  0未选择
    let x = "listData[" + that.data.nowIndex + "].no_val";  //不满意原因
    let z = "listData[" + that.data.nowIndex + "].no_id";  //不满意原因id
    that.setData({
      [u]: false,
      [y]: 1,
      [x]: e.detail.modalStr,
      [z]: e.detail.id,
    })
    that.data.modalShow = false;
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
    that.setData({
      buyNum: buyNum
    })
    that.data.refundNum = refundNum;
    /**
     * 订阅付款优惠券
    */
    console.log(that.data.listData)
    let listData = that.data.listData;
    let list_data = [];
    let obj = {};
    for (let i = 0; i < listData.length; i++) {
      obj.subscribe_id = listData[i].subscribe_id;
      obj.subscribe_goods_id = listData[i].id;
      obj.is_retreat = listData[i].select_status == 1 ? 1 : 0;
      obj.reason_type = listData[i].select_status == 1 ? listData[i].no_id : 0;
      list_data[i] = obj;
      obj = {};
    }
    that.data.subscribe_goods_arr = list_data;
    app.util.request({
      'url': '/xcx/wxjson/subscribe_pay_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        subscribe_id: that.data.subscribe_id,
        cs_user_coupon_id: that.data.couponInfo.user_coupon_id,
        subscribe_goods_arr: JSON.stringify(list_data),
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          console.log(that.data.couponInfo);
          that.setData({
            priceInfo: result.pay,
            couponInfo: result.coupon_arr.length > 0 && !that.data.couponInfo ? result.coupon_arr[0] : that.data.couponInfo
          })
          console.log(result.coupon_arr.length > 0 && !that.data.couponInfo);
          if (that.data.isSelectCoupon) {
            that.setData({
              "couponInfo.user_coupon_id": that.data.selectCouponId,
              "couponInfo.coupon_text": that.data.selectCouponTxt
            })
            that.data.isSelectCoupon = '';
          }
          console.log(that.data.couponInfo);
          // payTotal-'优惠券金额';
        }
      }
    })
  },
  /**
   * 确认按钮
  */
  sureFunc: function (e) {
    const that = this;
    wx.removeStorageSync("subscribe_data");
    wx.removeStorageSync("modalArr");
    app.util.request({
      'url': '/xcx/wxvipjson/create_subscribe_order',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        subscribe_id: that.data.subscribe_id,
        cs_user_coupon_id: that.data.couponInfo.user_coupon_id,
        subscribe_goods_arr: JSON.stringify(that.data.subscribe_goods_arr),
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          if (that.data.buyNum == 0) {   //购买数为零（全退）
            that.data.is_link = true;
            wx.navigateTo({
              url: '/page/product/pages/subscribe-refund/subscribe-refund?subscribe_id=' + that.data.subscribe_id,
            })
          } else {
            //付款
            wx.requestPayment({
              'timeStamp': result.pay_params.timeStamp,
              'nonceStr': result.pay_params.nonceStr,
              'package': result.pay_params.package,
              'signType': 'MD5',
              'paySign': result.pay_params.paySign,
              'success': function (res2) {
                if (res2.errMsg == 'requestPayment:ok') {
                  wx.showToast({
                    title: '支付成功',
                  })
                  /*微信后台统计支付成功*/
                  // wx.reportAnalytics('pay_sucess', {
                  //   product_num: that.data.numVal,
                  //   order_price: that.data.payTotal,
                  // });
                  that.data.is_link = true;
                  that.data.flag = 1;
                  if (that.data.refundNum > 0) {  //有退货
                    wx.navigateTo({
                      url: '/page/product/pages/subscribe-refund/subscribe-refund?subscribe_id=' + that.data.subscribe_id,
                    })
                  } else {               //全部购买
                    wx.navigateTo({
                      url: '/page/product/pages/dorder-details/dorder-details?subscribe_id=' + that.data.subscribe_id,
                    })
                  }
                }
              },
              'fail': function (res) {
                // self.setData({
                //   radioVal: '',
                // });
                console.log(res)
              }
            })
          }
        } else {
          wx.showModal({
            title: '提示',
            content: result.msg,
            showCancel: false
          });
        }
      }
    })
  },


  /**
   * 收茶设置展开/隐藏
  */
  // modalFunc: function (e) {
  //   const that = this;
  //   that.setData({
  //     modalShow: !that.data.modalShow
  //   })
  // },
  /**
   * 购买/退货选择确定
  */
  modalSure: function (e) {
    const that = this;
    that.data.selectIndex = that.data.modalIndex;
    if (that.data.modalIndex == 1 && that.data.reasonId == 0){
      wx.showToast({
        title: '请选择退货原因',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    let u = "listData[" + that.data.nowIndex + "].tip_hidden";     //是否选择了不满意原因
    let y = "listData[" + that.data.nowIndex + "].select_status";  //1不满意 2我要了  0未选择
    let x = "listData[" + that.data.nowIndex + "].no_val";  //不满意原因
    let z = "listData[" + that.data.nowIndex + "].no_id";  //不满意原因id
    that.setData({
      [u]: that.data.modalIndex==1 ? false : true,
      [y]: that.data.modalIndex,
      [x]: that.data.modalArr[that.data.reasonIndex].modalStr,
      [z]: that.data.reasonId,
    })
    that.modalCancel();
    that.countFunc();
  },
  /**
   * 退换购买选择
  */
  modalSelect: function (e) {
    let that = this;
    let tapIndex = e.currentTarget.dataset.index;
    that.setData({
      modalIndex: tapIndex
    })
    if (tapIndex == 2) {
      that.setData({
        reasonId: 0
      })
    }
  },
  /**
   * 退货原因选择
  */
  itemSelect: function (e) {
    let that = this;
    let tapId = e.currentTarget.dataset.id;
    let tapIndex = e.currentTarget.dataset.index;
    that.setData({
      reasonId: tapId,
      modalIndex: 1
    })
    that.data.reasonIndex = tapIndex;
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