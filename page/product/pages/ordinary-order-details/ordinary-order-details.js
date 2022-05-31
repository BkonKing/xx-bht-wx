var app = getApp();
var scene_val = '';
var setTimeoutF = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '订单详情',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },

    countDownList: [],    //倒计时时间列表
    actEndTimeList: [],   //结束时间列表
    isShow: false,        //商品列表超过四个，超出部分是否显示
    is_onload: 1,         //加载标识，onshow和onload只加载一次数据
    userId: '',           //用户uid
    ordinary_id: '',      //订单id
    ordinaryData: '',     //普通订单详情数据
    loginModelHidden: false,// 授权弹窗是否隐藏
    bodyShow: true,      //数据是否加载完成
    listRefresh: false,   // 订单列表是否刷新
    listOrder: {}
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({
        loginModelHidden: true
      })
      that.data.userId = userInfo.memberInfo.uid
    }else {
      that.setData({
        loginModelHidden: false
      })
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
    if (typeof options.listRefresh !='undefined') {
      that.data.listRefresh = true
    }
    that.getData();
  },
  onUnload: function (options) {
    if (!this.data.listRefresh) {
      app.util.orderRefresh();
    }
  },
  updateUserInfo(result) {
    const that = this;
    //拿到用户数据时，通过app.util.getUserinfo将加密串传递给服务端
    //服务端会解密，并保存用户数据，生成sessionid返回
    app.util.getUserInfo(function (userInfo) {
      //这回userInfo为用户信息
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.memberInfo.nickName) {
        that.setData({
          userData: userInfo.memberInfo,
          loginModelHidden: true,
          userId: userInfo.memberInfo.uid
        });
      } else {
        that.setData({
          loginModelHidden: true,
        });
      }
      that.getData();
    }, result.detail)
  },
  /**
   * 获取后台数据
  */
  getData: function (type=0) {
    const that = this;
    // ordinaryData.order_status == 1 && ordinaryData.is_ready == 0
    app.util.request({
      'url': '/xcx/wxjson/ordinary_detail_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        common_id: that.data.ordinary_id,
        is_cancel: type
      },
      success(res) {
        let result = res.data;
        let orderInfo = result.data.common_detail;
        if (result.code == '0000') {
          that.setData({
            ordinaryData: orderInfo,
            bodyShow: true
          })
          const list = result.data.common_detail.superposition_list || []
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
          if (orderInfo.order_status == 0) {
            console.log(orderInfo.over_time);
            let listData = [{ end_time: orderInfo.over_time }];
            that.data.actEndTimeList = [];
            const endTimeList = [];
            // 将活动的结束时间参数提成一个单独的数组，方便操作
            listData.forEach(o => { endTimeList.push(o.end_time) })
            that.data.actEndTimeList = that.data.actEndTimeList.concat(endTimeList);
            console.log(that.data.actEndTimeList);
            //console.log(that.data.actEndTimeList);
            // 执行倒计时函数
            clearTimeout(setTimeoutF);
            that.countDown();
            return;
          }else {
            clearTimeout(setTimeoutF);
          }
        }else {
          that.setData({
            bodyShow: false
          })
        }
      }
    });
    
  },
  /**
   * 倒计时函数
  */
  countDown() {
    // 获取当前时间，同时得到活动结束时间数组
    let that = this;
    let newTime = new Date().getTime();
    let endTimeList = that.data.actEndTimeList;
    let countDownArr = [];

    // 对结束时间进行处理渲染到页面
    endTimeList.forEach(o => {
      let endTime = new Date(o).getTime();
      let obj = null;
      // 如果活动未结束，对时间进行处理
      if (endTime - newTime > 0) {
        let time = (endTime - newTime) / 1000;
        // 获取天、时、分、秒
        let day = parseInt(time / (60 * 60 * 24));
        let hou = parseInt(time % (60 * 60 * 24) / 3600 + day * 24);
        let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
        let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
        obj = {
          //day: that.timeFormat(day),
          hou: that.timeFormat(hou),
          min: that.timeFormat(min),
          sec: that.timeFormat(sec)
        }
      } else {//活动已结束，全部设置为'00'
        // obj = {
        //   hou: '00',
        //   min: '00',
        //   sec: '00'
        // }
        obj = 0
        clearTimeout(setTimeoutF);
        that.getData();
      }
      countDownArr.push(obj);
    })
    // 渲染，然后每隔一秒执行一次倒计时函数
    that.setData({
      countDownList: countDownArr
      // countDownList: that.data.countDownList.concat(countDownArr),
    })
    setTimeoutF = setTimeout(that.countDown, 1000);
  },
  /**
   * 小于10的格式化函数
  */
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
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
   * 取消订单-未付款
  */
  cancelOrder: function (e) {
    const that = this;
    wx.showModal({
      title: '',
      content: '是否确定取消订单',
      success(res) {
        if (res.confirm) {
          that.getData(1);
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 取消订单-已付款
  */
  refundFunc: function (e) {
    const that = this;
    wx.showModal({
      title: '',
      content: '是否确定取消订单',
      success(res) {
        if (res.confirm) {
          app.util.request({
            'url': '/xcx/wxjson/cancel_refund_json',
            'cachetime': '0',
            data: {
              uid: that.data.userId,
              cj_code: app.util.getScene(),
              common_id: that.data.ordinary_id,
            },
            success(res) {
              let result = res.data;
              if (result.code == '0000') {
                that.getData();
              }else {
                that.errorFunc(result.msg);
              }
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 错误提示
  */
  errorFunc: function (msg = '') {
    const that = this;
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1500
    })
    // setTimeout(function () {
    //   that.getData();
    // }, 1500)
  },
  /**
   * 确认按钮
  */
  payFunc: function (e) {
    const that = this;
    let common_id = that.data.ordinary_id;
    app.util.request({
      'url': '/xcx/wxvipjson/create_common_order_again',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        common_id: common_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
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
                that.getData();
              },
              'fail': function (res) {
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
})