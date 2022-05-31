var app = getApp();
var scene_val = '';
var tmplIds_str = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '结算',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    nocarts: [], //未选中商品
    carts: [], //购物车
    goodsNum: '', //购物车商品件数
    priceTotal: '', //支付总额
    userId: '', //用户uid
    userData: '', //用户信息
    remarks: '', //备注
    coupon_id: '', //优惠券id
    isSelectCoupon: false, //是否选择优惠券
    selectCouponId: '', //选择的优惠券id
    selectCouponTxt: '', //选择的优惠券信息
    couponInfo: '', //优惠券信息
    coupon_price: '', //优惠券金额
    priceInfo: '', //优惠信息
    addressInfo: '', //收货地址信息
    is_onload: 1, //加载标识，onshow和onload只加载一次数据

    isSelectAddress: false, //是否选择地址
    userAddId: '', //选中的地址id
    uname: '', //选中地址-收货人姓名
    utel: '', //选中地址-收货人电话
    userAddress: '', //选中的地址详情
    is_default: 0, //默认地址
    prev_page: 0, //1商品详情页直接购买
    is_link: false, //是否跳转
    listOrder: {}
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
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      console.log(that.data.carts.length, that.data.carts);
      if (that.data.carts.length > 0) {
        if (that.data.isSelectCoupon) {
          that.setData({
            "couponInfo.user_coupon_id": that.data.selectCouponId,
          })
        }
        that.total();
        if (!that.data.userAddId) {
          that.getData();
        }
      } else {
        if (!that.data.is_link) {
          wx.switchTab({
            url: '/page/tabBar/my/index',
          })
          // wx.redirectTo({
          //   url: '/page/product/pages/ordinary-order/ordinary-order',
          // })
        } else {
          that.data.is_link = false;
        }

      }
    }

  },
  onLoad: function (options) {
    const that = this;
    if (typeof options.page_type != 'undefined') {
      that.setData({
        prev_page: 1
      })
    }
    that.data.is_onload = 1;
    that.total();
    that.getData();
  },
  /**
   * 计算商品数量/价格
   */
  total: function (e) {
    const that = this;
    let carts_arr = [];
    if (that.data.prev_page == 1) {
      carts_arr = wx.getStorageSync('cart2') || [];
    } else {
      carts_arr = wx.getStorageSync('cart');
    }
    let carts_list = [];
    let carts_list2 = [];
    let goodsNum = 0;
    console.log(carts_arr);
    if (carts_arr && carts_arr.length > 0) {
      let priceTotal = 0;
      for (var j in carts_arr) {
        if (carts_arr[j].is_checked) {
          carts_list.push(carts_arr[j]);
          goodsNum += carts_arr[j].count
        } else {
          carts_list2.push(carts_arr[j]);
        }
      }
      that.setData({
        carts: carts_list,
        goodsNum: goodsNum
      })
      that.data.nocarts = carts_list2;
    } else {
      return;
    }

    // that.setData({
    //   priceTotal: priceTotal == 0 ? '0.00' : priceTotal.toFixed(2)
    // })
    app.util.request({
      'url': '/xcx/wxvipjson/common_pay',
      'cachetime': '0',
      'showLoading': false,
      'data': {
        uid: that.data.userId,
        user_coupon_id: that.data.couponInfo.user_coupon_id,
        cj_code: app.util.getScene(),
        giftbag: JSON.stringify(that.data.carts),
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            priceInfo: result.data,
            couponInfo: result.data.coupon_arr.length > 0 && !that.data.couponInfo ? result.data.coupon_arr[0] : that.data.couponInfo,
            carts: result.goods_arr
          })
          console.log(that.data.couponInfo);
          if (that.data.isSelectCoupon) {
            that.setData({
              "couponInfo.user_coupon_id": that.data.selectCouponId,
              "couponInfo.coupon_text": that.data.selectCouponTxt
            })
            that.data.isSelectCoupon = '';
          }
          let carts_arr2 = result.goods_arr;
          that.setData({
            'priceInfo.total_price': result.data.total_price.toFixed(2), //付款金额
            'priceInfo.total_vip_money': result.data.total_vip_money.toFixed(2), //vip优惠金额
            'priceInfo.total_e_money': result.data.total_e_money.toFixed(2), //优享优惠金额
            'priceInfo.activity_money': (+result.data.activity_money || 0).toFixed(2), //活动优惠金额
            'priceInfo.coupon_money': (+result.data.coupon_money || 0).toFixed(2), //优惠券优惠金额
            'priceInfo.total_reduce_money': (+result.data.total_reduce_money || 0).toFixed(2), //满件优惠金额
            'priceInfo.sell_total': result.data.sell_total.toFixed(2), //售价
          })
          if (that.data.isSelectAddress) {
            that.setData({
              "addressInfo.id": that.data.userAddId,
              "addressInfo.uname": that.data.uname,
              "addressInfo.utel": that.data.utel,
              "addressInfo.userAddress": that.data.userAddress,
              "addressInfo.is_default": that.data.is_default
            })
            that.data.isSelectAddress = false;
            that.data.userAddress = '';
          }
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
        }
      }
    });
  },
  /**
   * 地址
   */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/get_user_address',
      'cachetime': '0',
      'showLoading': false,
      'data': {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          let address_info = result.data.address_info;
          tmplIds_str = result.data.tmplIds_str;
          that.setData({
            addressInfo: address_info
          })
          console.log(address_info);
          if (address_info) { //判断是否有收货地址
            let userAddress = '';
            if (address_info.uaddress_name) {
              userAddress = app.util.getArea(address_info.uaddress_detail) + address_info.uaddress_name + address_info.uaddress_house
            } else {
              userAddress = address_info.uaddress_detail + address_info.uaddress_house;
            }
            console.log(userAddress);
            that.setData({
              "addressInfo.userAddress": userAddress,
            })
          }
        }
      }
    });
  },
  /**
   * 订单备注
   */
  remarksFunc: function (e) {
    const that = this;
    that.data.remarks = e.detail.value.trim();
  },
  /**
   * 结算
   */
  payFunc: function (e) {
    const that = this;
    if (!that.data.addressInfo.id) {
      wx.showToast({
        title: '请先选择收货地址',
        icon: 'none'
      })
      return;
    }
    app.util.getMessage(function () {
      app.util.request({
        'url': '/xcx/wxvipjson/create_common_order',
        'cachetime': '0',
        data: {
          uid: that.data.userId,
          address_id: that.data.addressInfo.id,
          remarks: that.data.remarks,
          user_coupon_id: that.data.couponInfo.user_coupon_id,
          giftbag: JSON.stringify(that.data.carts),
          pricetotal: that.data.priceInfo.total_price
        },
        success(res) {
          let result = res.data;
          if (result.code == '0000') {
            //付款
            wx.requestPayment({
              'timeStamp': result.data.timeStamp,
              'nonceStr': result.data.nonceStr,
              'package': result.data.package,
              'signType': 'MD5',
              'paySign': result.data.paySign,
              'success': function (res2) {
                that.data.is_link = true;
                if (that.data.prev_page) {
                  wx.removeStorageSync('cart2');
                } else {
                  wx.removeStorageSync('cart');
                  wx.setStorageSync('cart', that.data.nocarts);
                }
                that.data.carts = [];
                wx.navigateTo({
                  url: '/page/product/pages/ordinary-order-details/ordinary-order-details?ordinary_id=' + result.common_id,
                })
              },
              'fail': function (res) {
                that.data.is_link = true;
                if (that.data.prev_page) {
                  wx.removeStorageSync('cart2');
                } else {
                  wx.removeStorageSync('cart');
                  wx.setStorageSync('cart', that.data.nocarts);
                }
                that.data.carts = [];
                wx.navigateTo({
                  url: '/page/product/pages/ordinary-order-details/ordinary-order-details?ordinary_id=' + result.common_id,
                })
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: result.msg && result.msg != '' ? result.msg : '购物车有变动',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({});
                }
              }
            });
          }
        }
      })
    }, tmplIds_str);
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