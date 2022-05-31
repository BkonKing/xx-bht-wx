
var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '购物车',
      // goback_pic: '../../image/goback4.png'
    },
    carts: [],           //购物车
    priceTotal: '',      //支付总额
    numTotal: '',        //支付商品总件数
    noneHidden: true,    //购物车是否为空
    allSelected: true,   //全选
    couponHidden: true,  //优惠信息是否展示 false
    userId: '',          //用户uid
    userData: '',        //用户信息
    discountInfo: '',    //优惠信息
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({
        userData: userInfo.memberInfo
      })
      that.data.userId = userInfo.memberInfo.uid;
    }
    let carts_arr = wx.getStorageSync('cart') || [];
    console.log(carts_arr);
    if (carts_arr && carts_arr.length > 0) {
      that.setData({
        noneHidden: true,
        carts: carts_arr
      })
      that.total();
    } else {
      that.setData({
        noneHidden: false,
        carts: carts_arr
      })
    }
    scene_val = app.util.getScene();
    // that.getData();
  },
  onHide: function (options) {
    const that = this;
    that.setData({
      couponHidden: true
    })
  },
  onLoad: function (options) {
    const that = this;
  },
  getData: function () {
    const that = this;
  },
  /*
  *商品数量加减
  */
  countTab: function (e) {
    const that = this;
    let types = parseInt(e.currentTarget.dataset.types);
    let indexTab = parseInt(e.currentTarget.dataset.index);
    if (parseInt(that.data.carts[indexTab].count) + types > 0) {
      let arrcount_val = "carts[" + indexTab + "].count";
      that.setData({
        [arrcount_val]: parseInt(that.data.carts[indexTab].count) + types
      })
    } else {
      let carts_arr = that.data.carts;
      carts_arr.splice(indexTab, 1);
      that.setData({
        carts: carts_arr
      })
    }
    if (that.data.carts.length < 1) {
      // app.util.eventFunc(that.data.userId, 3);
      that.setData({
        noneHidden: false
      })
    }
    that.total();
    wx.setStorageSync('cart', that.data.carts);
  },
  notAdd: function (e) {
    const indexTab = parseInt(e.currentTarget.dataset.index);
    const max_buy = this.data.carts[indexTab].stock
    wx.showToast({
      icon: 'none',
      title: '抱歉，数量有限，您最多只能购买'+max_buy+'件',
    })
  },
  /*
  *删除购物车中的某个商品
  */
  delCarts: function (e) {
    const that = this;
    // app.util.eventFunc(that.data.userId, 3);
    let indexTab = parseInt(e.currentTarget.dataset.index);
    let carts_arr = that.data.carts;
    carts_arr.splice(indexTab, 1);
    that.setData({
      carts: carts_arr
    })
    console.log(carts_arr.length);
    if (carts_arr.length == 0) {
      that.setData({
        noneHidden: false
      })
    }
    that.total();
    wx.setStorageSync('cart', that.data.carts);
  },
  /**
   * 计算商品数量/价格
   */
  total: function (e) {
    const that = this;
    let carts_arr = that.data.carts;
    let carts_list = [];
    let numTotal = 0;
    let priceTotal = 0;
    let checked_num = 0;
    for (var j in carts_arr) {
      if (carts_arr[j].is_checked) {
        checked_num++;
        numTotal += parseInt(carts_arr[j].count);
        // priceTotal += parseFloat(carts_arr[j].count * carts_arr[j].pay_price);
      }
    }
    console.log(carts_arr, carts_arr.length);
    that.setData({
      allSelected: checked_num === carts_arr.length ? true : false,
      numTotal: numTotal,
      // priceTotal: priceTotal == 0 ? '0.00' : priceTotal.toFixed(2)
    })

    if (numTotal > 0) {
      app.util.request({
        'url': '/xcx/wxvipjson/common_pay',
        'cachetime': '0',
        'showLoading': false,
        'data': {
          uid: that.data.userId,
          giftbag: JSON.stringify(that.data.carts),
        },
        success(res) {
          let result = res.data;
          if (result.code == '0000') {
            that.setData({
              discountInfo: result.data,
              carts: result.goods_arr,
              priceTotal: result.data.total_price ? (result.data.total_price).toFixed(2) : 0
            })
            wx.setStorageSync('cart', result.goods_arr);
            const list = result.data.superposition_list || []
            const listOrder = {
              1: 1,
              2: 1,
              3: 1,
            }
            list.forEach((obj, index) => {
              listOrder[obj.superposition_id] = index
            })
            that.setData({
              listOrder: listOrder
            })
            // if (res.data.giftbag) {
            //   that.setData({
            //     carts: res.data.giftbag
            //   })
            //   wx.setStorageSync('cart', that.data.carts);
            //   if (res.data.giftbag.length > 0) {
            //     res.data.giftbag.forEach(function (val, index) {
            //       that.limitNum(parseInt(val.quota_num), val.goods_id, index);
            //     })
            //   }
            // }
            // if (res.data.data.goods_money > 0) {
            //   let real_pay = that.data.is_use ? res.data.data.integral_pay_money.toFixed(2) : res.data.data.new_pay_money.toFixed(2);
            //   that.setData({
            //     payTotal: real_pay,
            //   })
            // } else {
            //   that.setData({
            //     payTotal: '0.00',
            //   })
            // }
            // that.setData({
            //   price_info: res.data.data
            // })
          } else {
            wx.showToast({
              title: result.msg,
              icon: 'none',
              duration: 3000
            })
            that.setData({
              carts: result.goods_arr
            })
            wx.setStorageSync('cart', result.goods_arr);
            that.total();
            return;
          }
        }
      });
    }
  },
  /**
   * 判断限购数量是否大于购物车数量
  */
  limitNum: function (quota_num, goods_id, index) {
    const that = this;
    if (quota_num > 10000) return;
    let carts_arr = that.data.carts;
    let u = "carts[" + index + "].not_add";
    let u2 = "carts[" + index + "].count";
    var num_count = 0;
    if (carts_arr.length > 0) {
      carts_arr.forEach(function (val, index) {
        if (val.goods_id == goods_id) {
          num_count += parseInt(val.count);
        }
      })
    }

    if (num_count >= quota_num) {
      that.setData({
        [u]: true,
      })
    } else {
      that.setData({
        [u]: false,
      })
    }
  },
  /**
   * 联系客服
  */
  telFunc: function (e) {
    const that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.globalData.phone
    })
  },
  /**
   * 获取用户手机号
  */
  getPhoneNumber(e) {
    const that = this;
    app.util.getMoblie(function (telNum) {
      //返回telNum为用户手机号
      that.setData({
        'userData.mobile': telNum
      })
    }, e);
  },
  /**
   * 展开/隐藏优惠信息
  */
  couponFunc: function (e) {
    const that = this;
    console.log(e.currentTarget);
    let hide = e.currentTarget.dataset.hide;
    that.setData({
      couponHidden: hide == 1 ? true : !that.data.couponHidden
    })
  },
  /**
   * 勾选/取消单个商品
  */
  checkboxOne: function (e) {
    const that = this;
    let indexTab = parseInt(e.currentTarget.dataset.index);
    let u = "carts[" + indexTab + "].is_checked";
    that.setData({
      [u]: !that.data.carts[indexTab].is_checked
    })
    that.total();
    wx.setStorageSync('cart', that.data.carts);
  },
  /**
   * 全选/全不选
  */
  checkboxAll: function (e) {
    const that = this;
    let carts_arr = that.data.carts;
    let is_checked = that.data.allSelected;
    for (let i = 0; i < carts_arr.length; i++) {
      carts_arr[i].is_checked = !is_checked;
    }
    that.setData({
      carts: carts_arr,
      allSelected: !is_checked
    })
    that.total();
    wx.setStorageSync('cart', that.data.carts);
  },
  /**
   * 结算
  */
  payFunc: function (e) {
    const that = this;
    // app.util.eventFunc(that.data.userId, 3);
    if (that.data.numTotal === 0) {
      wx.showToast({
        title: '请选择要结算的商品',
        icon: 'none',
        duration: 1500,
        mask: true
      })
    } else {
      that.total();
      wx.navigateTo({
        url: '/page/product/pages/settlement/settlement',
      })
    }
  }
})