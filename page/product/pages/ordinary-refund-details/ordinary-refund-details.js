var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '退款详情',
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    ordinary_id: '',      //订阅订单id
    refund_id: '',         //订单退款id
    returnrefund_id: '',   //订单退货id

    //弹窗
    pickerShow: false,
    pickerObj: {},
    selectVal: [0, 0],
    alertShow: false, // 取消订单确认弹窗

    is_onload: 1,           //加载标识，onshow和onload只加载一次数据
    userId: '',             //用户uid
    refundData: '',      //订阅订单详情数据
    isSelectAddress: false,//是否选择地址
    userAddId: '',         //选中的地址id
    uname: '',             //选中地址-收货人姓名
    utel: '',              //选中地址-收货人电话
    userAddress: '',       //选中的地址详情
    isClick: false,         //是否点击了编辑按钮
    m_days: '',
    m_time: '',
    m_days_val: '',
    m_time_val: '',
    explainVal: '',
    listRefresh: false
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
  onUnload: function (options) {
    if (!this.data.listRefresh) {
      app.util.orderRefresh();
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    if (typeof options.refund_id != 'undefined') {
      that.data.refund_id = options.refund_id;
      that.setData({
        'barObj.titName': '退款详情'
      })
    }
    if (typeof options.returnrefund_id != 'undefined') {
      that.setData({
        returnrefund_id: options.returnrefund_id,
        'barObj.titName': '退货退款详情'
      })
    }
    that.data.ordinary_id = options.ordinary_id;
    that.getData();
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/ordinary_refund_detail_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        common_id: that.data.ordinary_id,
        refund_id: that.data.refund_id,
        returnrefund_id: that.data.returnrefund_id,
        take_name: that.data.uname,
        take_mobile: that.data.utel,
        take_address: that.data.userAddress,
        s_status: that.data.s_status
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            pickerObj: that.data.returnrefund_id ? result.data.pickerObj : '',
            refundData: result.data.order_info
          })
          if (that.data.isSelectAddress) {
            console.log(that.data.isSelectAddress);
            that.setData({
              "refundData.take_name": that.data.uname,
              "refundData.take_mobile": that.data.utel,
              "refundData.take_address": that.data.userAddress
            })
            that.data.isSelectAddress = false;
            // that.data.userAddress = '';
          }
          if(that.data.m_days){
            that.setData({
              'refundData.m_time_val': that.data.m_days_val + ' ' + that.data.m_time_val
            })
          }
        } else {
          that.data.isSelectAddress = false;
          that.data.userAddress = '';
          that.errorFunc(result.msg);
        }
      }
    });
  },
  /**
   * 取消退货
  */
  cancelOrder () {
    this.setData({
      alertShow: true
    })
  },
  sureCall () {
    const that = this;
    that.setData({
      alertShow: false
    })
    app.util.request({
      'url': '/xcx/wxvipjson/cancel_common_returnrefund',
      'cachetime': '0',
      data: {
        returnrefund_id: that.data.returnrefund_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.data.listRefresh = true
          let pages = getCurrentPages();
          if (pages.length > 1) {
            let prevPage = pages[pages.length - 2];
            if (prevPage.route.indexOf('ordinary-order-details/ordinary-order-details') > -1) {
              prevPage.data.listRefresh = true
              wx.navigateBack({});
            } else if (prevPage.route.indexOf('ordinary-order/ordinary-order') > -1) {
              wx.redirectTo({
                url: '/page/product/pages/ordinary-order-details/ordinary-order-details?ordinary_id='+that.data.ordinary_id+'&listRefresh=1'
              })
            }
          }
        } else {
          that.errorFunc(result.msg);
        }
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
    //   'url': '/xcx/wxjson/ordinary_refund_edit',
    //   'cachetime': '0',
    //   'showLoading': false,
    //   data: {
    //     uid: that.data.userId,
    //     id: that.data.refundData.id,
    //     m_days: col1[col1_key].id,
    //     m_time: col2[col2_key].id,
    //     s_status: that.data.s_status
    //   },
    //   success(res) {
    //     let result = res.data;
    //     if (result.code == '0000') {
    //       that.setData({
    //         'refundData.m_time_val': col1[col1_key].value + ' ' + col2[col2_key].value
    //       })
    //     } else {
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
    //     'url': '/xcx/wxjson/ordinary_refund_edit',
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
    app.util.request({
      'url': '/xcx/wxjson/ordinary_refund_edit',
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
          that.setData({
            isClick: false
          })
          that.tipFunc(result.msg);
        }else {
          that.errorFunc(result.msg);
        }
      }
    })
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