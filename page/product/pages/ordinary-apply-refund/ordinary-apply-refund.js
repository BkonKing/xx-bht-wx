
var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '申请退换',
      // goback_pic: '../../image/goback4.png'
    },

    is_onload: 1,         //加载标识，onshow和onload只加载一次数据
    userId: '',           //用户uid
    isShow: false,        //商品列表超过四个，超出部分是否显示
    checked_num: 0,       //选中的商品数
    goods_arr: [],        //选中的商品列表
    ordinary_id: '',      //订单id
    id_arr: [],           //选中订单商品列表id集合
    ordinaryData: '',     //普通订单详情数据
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
      ordinary_id: options.ordinary_id
    })
    that.getData();
  },
  getData: function () {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/apply_refund_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        common_id: that.data.ordinary_id,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            ordinaryData: result.data.common_detail,
          })
          let goods_list = result.data.common_detail.goods_list;
          if (goods_list.length > 0){
            
            for (let i = 0; i < goods_list.length;i++){
              if (that.data.id_arr.indexOf(goods_list[i].id) > -1){
                console.log(4)
                let u = 'ordinaryData.goods_list[' + i +'].is_checked';
                that.setData({
                  [u]: true
                })
              }
            }
          }
          
        }
      }
    });
  },
  /**
   * 勾选/取消单个商品
  */
  checkboxFunc: function (e) {
    const that = this;
    let indexTab = parseInt(e.currentTarget.dataset.index);
    let u = "ordinaryData.goods_list[" + indexTab + "].is_checked";
    that.setData({
      [u]: !that.data.ordinaryData.goods_list[indexTab].is_checked
    })
    that.total();
  },
  /**
   * 勾选/取消单个商品
  */
  total: function (e) {
    const that = this;
    let goods_list = that.data.ordinaryData.goods_list;
    let checked_num = 0;
    let id_arr = [];
    let goods_arr = [];
    for (let i = 0; i < goods_list.length; i++) {
      if (goods_list[i].is_checked){
        id_arr.push(goods_list[i].id);
        checked_num++;
        goods_arr.push(goods_list[i]);
      }
    }
    that.data.id_arr = id_arr;
    that.data.goods_arr = goods_arr;
    that.data.checked_num = checked_num;
    console.log(that.data.checked_num)
  },
  /**
   * 商品列表伸缩
  */
  toggleFunc: function (type = 0) {
    const that = this;
    that.setData({
      isShow: !that.data.isShow
    })
  },
  /**
   * 跳转
  */
  linkFunc: app.util.throttle(function (e) {
    const that = this;
    if (that.data.goods_arr.length < 1){
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
    }else {
      wx.setStorageSync('goods_arr', that.data.goods_arr);
      let _href = e.currentTarget.dataset.url;
      wx.navigateTo({
        url: _href,
      })
    }
    
  }, 1000),
})