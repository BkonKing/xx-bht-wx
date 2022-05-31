var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '选择优惠券',
      // goback_pic: '../../image/goback4.png'
    },
    page_type: 1,         //入口页面类型 1普通订单 2订阅订单
    coupon_id: '',        //优惠券id
    is_onload: 1,         //加载标识，onshow和onload只加载一次数据
    userId: '',           //用户uid
    goods_list: '',       //商品数据
    ableNum: 0,           //可用优惠券数量
    unableNum: 0,         //不可用优惠券数量
    couponAbleList: [],   //可用优惠券
    couponUnableList: [], //不可用优惠券

    isSelectCoupon: false,//是否选择优惠券
    selectCouponId: '',   //选择的优惠券id
    selectCouponTxt: '',  //选择的优惠券信息


  },
  onShow: function () {
    const that = this;
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getList();
    }
  },
  onUnload: function (options) {
    const that = this;
    if (that.data.isSelectCoupon) {  //判断是否选中了优惠券
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      //将选中的地址传回上个页面
      let prevPage = pages[pages.length - 2];
      prevPage.data.isSelectCoupon = true
      prevPage.data.selectCouponId = that.data.selectCouponId;
      prevPage.data.selectCouponTxt = that.data.selectCouponTxt;
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    that.data.page_type = options.page_type;
    that.setData({
      coupon_id: options.coupon_id
    })
    
    if (options.page_type == 1){  //普通订单
      let carts_arr = wx.getStorageSync('cart') || [];
      if (typeof options.prev_page != 'undefined' && options.prev_page!=0){
        console.log(3333);
        carts_arr = wx.getStorageSync('cart2') || [];
      }
      let carts_list = [];
      if (carts_arr && carts_arr.length > 0) {
        for (var j in carts_arr) {
          if (carts_arr[j].is_checked) {
            carts_list.push(carts_arr[j]);
          }
        }
        that.setData({
          goods_list: carts_list
        })
        
      } else {
        return;
      }
    }else {          //订阅订单
      let subscribe_data = wx.getStorageSync("subscribe_data");
      that.setData({
        goods_list: subscribe_data
      })
    }
    console.log(12233);
    that.getList();
  },
  /**
   * 获取后台数据
  */
  getList: function (is_nav = '') {
    const that = this;
    console.log(that.data.goods_list);

    if (that.data.page_type == 1){
      app.util.request({
        'url': '/xcx/wxvipjson/common_coupon_choice',
        'cachetime': '0',
        data: {
          giftbag: JSON.stringify(that.data.goods_list),
          user_coupon_id: that.data.coupon_id,
          uid: that.data.userId,
          cj_code: app.util.getScene()
        },
        success(res) {
          let result = res.data;
          if (result.code == '0000') {
            that.setData({
              couponAbleList: result.data.available,
              couponUnableList: result.data.disable,
              ableNum: result.data.available_num,
              unableNum: result.data.disable_num,
            })
          }
        }
      });
    }else {
      let listData = that.data.goods_list;
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
      app.util.request({
        'url': '/xcx/wxvipjson/subscribe_coupon_choice',
        'cachetime': '0',
        data: {
          subscribe_goods_arr: JSON.stringify(list_data),
          cs_user_coupon_id: that.data.coupon_id,
          uid: that.data.userId,
          subscribe_id: that.data.goods_list[0].subscribe_id,
          cj_code: app.util.getScene()
        },
        success(res) {
          // return;
          let result = res.data;
          if (result.code == '0000') {
            that.setData({
              couponAbleList: result.data.available,
              couponUnableList: result.data.disable,
              ableNum: result.data.available_num,
              unableNum: result.data.disable_num,
            })
          }
        }
      });
    }
  },
  /**
   * 选择优惠券
  */
  selectCoupon: function (e) {
    const that = this;
    let tabIndex = e.currentTarget.dataset.index;
    let selectCouponId = that.data.couponAbleList[tabIndex].user_coupon_id;
    let selectCouponTxt = that.data.couponAbleList[tabIndex].coupon_text;
    that.data.isSelectCoupon = true;
    that.data.selectCouponId = selectCouponId;
    that.data.selectCouponTxt = selectCouponTxt;
    wx.navigateBack({})
  },
  /**
   * 详情显示/隐藏
  */
  contToggle: function (e) {
    const that = this;
    let type = e.currentTarget.dataset.type;
    let toggleIndex = e.currentTarget.dataset.id;
    if (type == 'able') { 
      var up = "couponAbleList[" + toggleIndex + "].is_down";
      that.setData({
        [up]: !that.data.couponAbleList[toggleIndex].is_down
      })
    }else {
      var up = "couponUnableList[" + toggleIndex + "].is_down";
      that.setData({
        [up]: !that.data.couponUnableList[toggleIndex].is_down
      })
    }
    
  },
  /**
   * 跳转
  */
  linkFunc: app.util.throttle(function (e) {
    const that = this;
    let _href = e.currentTarget.dataset.url;
    wx.switchTab({
      url: _href,
    })
  }, 1000),
})