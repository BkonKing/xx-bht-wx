var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '退货详情',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    subscribe_id: '',      //订阅订单id
    s_status: '',          //退货/换货标识 1退货2换货

    //弹窗
    pickerShow: false,
    pickerObj: {},
    selectVal: [0, 0],

    is_onload: 1,           //加载标识，onshow和onload只加载一次数据
    userId: '',             //用户uid
    refundData: '',      //订阅订单详情数据
    isSelectAddress: false,//是否选择地址
    userAddId: '',         //选中的地址id
    uname: '',             //选中地址-收货人姓名
    utel: '',              //选中地址-收货人电话
    userAddress: '',       //选中的地址详情
    isBack: false,          //如果父页面是订单详情页，则点击订单详情-返回
    isClick: false,         //是否点击了编辑按钮
    tmplIds_str: '',        //
    m_days: '',
    m_time: '',
    m_days_val: '',
    m_time_val: '',
    explainVal: '',
    swalHidden: true,
    refundGoods: [], // 可以取消退货的商品
    idArr: [],
    refundMoney: 0 // 取消退款支付金额
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
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      if (prevPage.route == 'page/product/pages/dorder-details/dorder-details') {  //父页面是订单详情页
        // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        that.setData({
          isBack: true
        })
      }
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    that.setData({
      subscribe_id: options.subscribe_id
    })
    that.data.s_status = options.s_status
    that.getData();
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/subscribe_refund_detail_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        subscribe_id: that.data.subscribe_id,
        take_name: that.data.uname,
        take_mobile: that.data.utel,
        take_address: that.data.userAddress,
        s_status: that.data.s_status
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.data.tmplIds_str= result.data.tmplIds_str;
          that.setData({
            pickerObj: result.data.pickerObj,
            refundData: result.data.subscribe_refund_info
          })
          const goodsArr = result.data.subscribe_refund_info.goods_list
          let listGoods = []
          let moneyVal = 0
          let idArr = []
          if (goodsArr && goodsArr.length) {
            for(let i=0;i<goodsArr.length;i++) {
              if (goodsArr[i].isIng) {
                listGoods.push(goodsArr[i])
                if (goodsArr[i].isSelect) {
                  moneyVal+=parseFloat(goodsArr[i].e_price)
                }
                idArr.push(goodsArr[i].id)
              }
            }
            that.setData({
              refundMoney: moneyVal,
              refundGoods: listGoods
            })
            if (idArr.length == 1) {
              that.data.idArr = idArr
              that.setData({
                refundMoney: listGoods[0].e_price
              })
            }
          }
          console.log(that.data.isSelectAddress)
          if (that.data.isSelectAddress) {
            console.log(that.data.isSelectAddress);
            that.setData({
              "refundData.take_name": that.data.uname,
              "refundData.take_mobile": that.data.utel,
              "refundData.take_address": that.data.userAddress
            })
            // that.data.isSelectAddress = false;
            // that.data.userAddress = '';
          }
          if(that.data.m_days){
            that.setData({
              'refundData.m_time_val': that.data.m_days_val + ' ' + that.data.m_time_val
            })
          }
        }else {
          that.data.isSelectAddress = false;
          that.data.userAddress = '';
          that.errorFunc(result.msg);
        }
        console.log(that.data.refundData.take_name, that.data.refundData);
      }
    });
  },

  /**
   * 模态框数据回调
  */
  modalCall: function (e) {
    console.log(e.detail)
   
  },
  /**
   * 时间选择器
  */
  pickerTime: function (e) {
    this.setData({
      pickerShow: true
    })
  },
  /**
   * picker自定义组件回调
  */
  pickerCall: function (e) {
    const that = this;
    // that.data.pickerShow = false;
    console.log(e.detail[0], e.detail[1])
    let col1_key = e.detail[0];
    let col2_key = e.detail[1];
    let col1 = that.data.pickerObj['col1'];
    let col2 = that.data.pickerObj['col2'];
    that.setData({
      m_days: col1[col1_key].id,
      m_time: col2[col2_key].id,
      m_days_val: col1[col1_key].value,
      m_time_val: col2[col2_key].value,
      'refundData.m_time_val': col1[col1_key].value + ' ' + col2[col2_key].value
    })
    // app.util.request({
    //   'url': '/xcx/wxjson/subscribe_refund_edit',
    //   'cachetime': '0',
    //   'showLoading': false,
    //   data: {
    //     uid: that.data.userId,
    //     id: that.data.refundData.id,
    //     m_days: col1[col1_key].id,
    //     m_time: col2[col2_key].id,
    //     s_status: that.data.s_status
    //   },
    //   that.setData({
    //     'refundData.m_time_val': col1[col1_key].value + ' ' + col2[col2_key].value
    //   })
    //   success(res) {
    //     let result = res.data;
    //     if (result.code == '0000') {
    //       that.setData({
    //         'refundData.m_time_val': col1[col1_key].value + ' ' + col2[col2_key].value
    //       })
    //     }else {
    //       that.errorFunc(result.msg);
    //     }
    //   }
    // })
  },
  /**
   * 其他说明提交
  */
  explainFunc: function (e) {
    const that = this;
    that.data.explainVal = e.detail.value.trim();
    that.setData({
      'refundData.other_explain': e.detail.value.trim()
    })
    // if (e.detail.value.trim() !== '') {
    //   app.util.request({
    //     'url': '/xcx/wxjson/subscribe_refund_edit',
    //     'cachetime': '0',
    //     'showLoading': false,
    //     data: {
    //       uid: that.data.userId,
    //       id: that.data.refundData.id,
    //       other_explain: e.detail.value.trim(),
    //     },
    //     success(res) {
    //       let result = res.data;
    //       if (result.code == '0000') {
    //         that.setData({
    //           'refundData.other_explain': e.detail.value.trim()
    //         })
    //       } else {
    //         that.errorFunc(result.msg);
    //       }
    //     }
    //   })
    // }
  },
  /**
   * 修改错误提示
  */
  errorFunc: function (msg='') {
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
   * toast
  */
  tipFunc: function (msg='') {
    const that = this;
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1500
    })
  },
  /**
   * 拨打电话
  */
  callTel: function (e) {
    const that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.refundData.courier_mobile
    })
  },
  /**
   * 编辑点击
  */
  editFunc: function (e) {
    const that = this;
    that.setData({
      isClick: true
    })
  },
  /**
   * 提交
  */
  editSubmit: function (e) {
    const that = this;
    if(that.data.refundData.status_val == 0){
      if(!that.data.m_days){
        that.tipFunc('请选择上门揽退时间');
        return;
      }
      if(!that.data.uname){
        that.tipFunc('请选择取件地址');
        return;
      }
    }
    app.util.getMessage(function () {
      app.util.request({
        'url': '/xcx/wxjson/subscribe_refund_edit',
        'cachetime': '0',
        'showLoading': false,
        data: {
          uid: that.data.userId,
          id: that.data.refundData.id,
          m_days: that.data.m_days,
          m_time: that.data.m_time,
          s_status: that.data.s_status,
          other_explain: that.data.explainVal,
          take_name: that.data.uname,
          take_mobile: that.data.utel,
          take_address: that.data.userAddress,
        },
        success(res) {
          let result = res.data;
          if (result.code == '0000') {
            that.data.isSelectAddress = false;
            that.setData({
              'refundData.status_val': 1,
              isClick: false
            })
            that.tipFunc(result.msg);
          }else {
            that.errorFunc(result.msg);
          }
        }
      })
    }, that.data.tmplIds_str);
  },
  /**
   * 取消退货
  */
  OpenSwal () {
    this.setData({
      swalHidden: false
    })
  },
  closeSwal () {
    this.setData({
      swalHidden: true
    })
  },
  sureSwal: function () {
    const that = this;
    // console.log(this.data.idArr)
    if (that.data.idArr.length < 1) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
        duration: 1500
      })
      return
    }
    app.util.request({
      'url': '/xcx/wxvipjson/cancel_subscribe_order_retreat',
      'cachetime': '0',
      data: {
        subscribe_id: that.data.subscribe_id,
        subscribe_goods_ids: that.data.idArr.join(','),
        z_money: that.data.refundMoney
      },
      success(res) {
        that.OpenSwal()
        let result = res.data;
        if (result.code == '0000') {
          //付款
          wx.requestPayment({
            'timeStamp': result.pay_params.timeStamp,
            'nonceStr': result.pay_params.nonceStr,
            'package': result.pay_params.package,
            'signType': 'MD5',
            'paySign': result.pay_params.paySign,
            'success': function (res2) {
              that.goDetail();
            },
            'fail': function (res2) {}
          })
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
  goDetail () {
    const that = this;
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      if (prevPage.route.indexOf('dorder-details/dorder-details') > -1) {
        wx.navigateBack({});
      } else {
        wx.redirectTo({
          url: '/page/product/pages/dorder-details/dorder-details?subscribe_id='+that.data.subscribe_id
        })
      }
    }
  },
  /**
   * 取消退款商品选择
  */
  swalSelect: function (e) {
    let that = this;
    let tapIndex = e.currentTarget.dataset.index
    let u = 'refundGoods['+tapIndex+'].isSelect'
    let isSelect = that.data.refundGoods[tapIndex].isSelect
    let flag = 1
    if (isSelect) {
      flag = -1
    }
    that.setData({
      modalIndex: tapIndex,
      [u]: !isSelect,
      refundMoney: parseFloat(that.data.refundMoney + flag * that.data.refundGoods[tapIndex].e_price)
    })
    let idArr = []
    for(let i=0; i < that.data.refundGoods.length; i++) {
      if (that.data.refundGoods[i].isSelect) {
        idArr.push(that.data.refundGoods[i].id)
      }
    }
    that.data.idArr = idArr
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