var app = getApp();
var setTimeoutF = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '商店订单',
      // goback_pic: '../../image/goback4.png'
    },

    paramVal: 0,           //会员中心（我的）传递的参数
    nav_hidden: false,     //导航栏是否隐藏
    typeVal: 1,            //tab切换index
    orderList: [],         //订单列表数据
    noneHidden: true,      //是否没有数据
    is_flag: 1,
    is_onload: 1,          //加载标识，onshow和onload只加载一次数据
    page: 1,               //分页
    noMoreHidden: true,    //是否还有更多
    userId: '',            //用户uid
    countDownList: [],     //倒计时时间列表
    actEndTimeList: [],    //结束时间列表
    is_refresh: true       //页面是否刷新
  },
  onShow: function () {
    const that = this;
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      if (that.data.is_refresh){
        that.setData({
          orderList: [],
          noMoreHidden: true,
          noneHidden: true,
        });
        that.data.is_flag = 1;
        that.data.page = 1;
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
        that.getData();
      }else {
        that.data.is_refresh = true;
      }
    }
  },
  onLoad: function (options) {
    const that = this;
    if (options.typeVal) {
      that.setData({
        nav_hidden: true,
        typeVal: options.typeVal,
        paramVal: options.paramVal
      })
    }
    that.setData({
      'headerArr.height': app.globalData.height
    })
    that.data.is_onload = 1;

    var userInfo = wx.getStorageSync('userInfo');
    //console.log(userInfo);
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.setData({
        orderList: [],
        noMoreHidden: true,
        noneHidden: true,
      });
      that.data.page = 1;
      that.data.userId = userInfo.memberInfo.uid;
      that.getData();
    }
  },
  /**
   * 上拉加载更多
  */
  onReachBottom: function () {
    const that = this;
    if(that.data.typeVal !=5){
      const that = this;
      var page = that.data.page;
      if (that.data.noMoreHidden) {
        that.setData({
          page: page + 1
        })
        that.getData();
      }
    }
  },
  /**
   * 获取后台数据
  */
  getData: function () {
    const that = this;
    let url = '';
    let param_val = 0;
    let type_index = that.data.typeVal;
    if (type_index < 5) {
      url = '/xcx/wxvipjson/common_list_json';
    }else {
      url = '/xcx/wxvipjson/common_th_list_json';
    }
    app.util.request({
      'url': url,
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        page: that.data.page,
        type: type_index,
        cj_code: app.util.getScene(),
      },
      success(res) {
        let result = res.data;
        console.log(result.data);
        if (result.code == '0000') {
          that.data.is_flag = 2;
          let dataList = result.data;
          if (dataList && dataList.length > 0) {
            if (that.data.typeVal == 5) {
              dataList.forEach(function (val,index) {
                if (val.order_type == 1) {
                  dataList[index].url = "/page/product/pages/ordinary-exchange-details/ordinary-exchange-details?ordinary_id=" + val.common_id + "&barter_id=" + val.id;
                } else if (val.order_type == 2){
                  dataList[index].url = "/page/product/pages/ordinary-refund-details/ordinary-refund-details?ordinary_id=" + val.common_id + "&refund_id=" + val.id;
                } else if (val.order_type == 3) {
                  dataList[index].url = "/page/product/pages/ordinary-refund-details/ordinary-refund-details?ordinary_id=" + val.common_id + "&returnrefund_id=" + val.id;
                }
              });
            }
            that.setData({
              orderList: that.data.page == 1 ? dataList : that.data.orderList.concat(dataList),
            })
          } else {
            that.setData({
              noneHidden: that.data.orderList.length == 0 ? false : true,
            })
          }
          if (dataList.length == 0 && that.data.page > 1) {
            that.setData({
              noneHidden: true,
              noMoreHidden: false
            })
          }
          that.data.is_flag = 2;
          console.log(that.data.typeVal);
          if (that.data.typeVal == 1 || that.data.typeVal == 2) {
            // let listData = [{ end_time: orderInfo.over_time }];
            if (that.data.page == 1){
              that.data.actEndTimeList = [];
            }
            const endTimeList = [];
            // 将活动的结束时间参数提成一个单独的数组，方便操作
            dataList.forEach(o => { endTimeList.push(o.over_time); })
            that.data.actEndTimeList = that.data.actEndTimeList.concat(endTimeList);
            console.log(that.data.actEndTimeList);
            //console.log(that.data.actEndTimeList);
            // 执行倒计时函数
            clearTimeout(setTimeoutF);
            
            that.countDown();
            return;
          } else {
            clearTimeout(setTimeoutF);
          }
        }
      }
    });
  },
  /**
   * nav切换
  */
  navFun: function (e) {
    const that = this;
    // if (that.data.is_flag == 2) {
    const type_val = e.target.dataset.typeval;
    that.setData({
      noneHidden: true,
      typeVal: type_val,
      orderList: [],
      page: 1,
      is_flag: 1
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    that.getData();
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
      let obj = null;
      obj = {
        is_show: true
      }
      if(o){
        let endTime = new Date(o).getTime();
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
            sec: that.timeFormat(sec),
            is_show: true,
          }
        } else {//活动已结束，全部设置为'00'
          
          // obj = 0
          if (obj.is_show){
            obj = {
              hou: '00',
              min: '00',
              sec: '00',
              is_show: false
            }
            clearTimeout(setTimeoutF);
            that.setData({
              page: 1,
              orderList: []
            })
            that.getData();
          }
        }
      }else {
        let obj = null;
        obj = {
          hou: '00',
          min: '00',
          sec: '00',
          is_show: false
        }
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
   * 取消订单-未付款
  */
  cancelOrder: function (e) {
    const that = this;
    let common_id = e.currentTarget.dataset.id;
    app.util.request({
      'url': '/xcx/wxjson/cancel_order',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        common_id: common_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            orderList: []
          })
          that.data.page = 1;
          that.getData();
        }
      }
    })
  },
  /**
   * 取消订单-未付款
  */
  cancelPay: function (e) {
    const that = this;
    let common_id = e.currentTarget.dataset.id;
    app.util.request({
      'url': '/xcx/wxjson/cancel_refund_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        common_id: common_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            orderList: []
          })
          that.data.page = 1;
          that.getData();
        }else {
          wx.showToast({
            title: result.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(function(){
            that.setData({
              orderList: []
            })
            that.data.page = 1;
            that.getData();
          },2000)
        }
        
      }
    })
  },
  /**
   * 付款
  */
  payFunc: function (e) {
    const that = this;
    let common_id = e.currentTarget.dataset.id;
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
                that.setData({
                  orderList: []
                })
                that.data.page = 1;
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
  }
})