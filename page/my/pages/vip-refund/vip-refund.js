var app = getApp();
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '申请退款',
      isBorder: false,
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    vip_id: '',
    bodyShow: false,
    is_onload: 1,           //加载标识，onshow和onload只加载一次数据
    wordsVal: '', //说明
    reasonVal: '',//退款原因
    // stepVal: 0,  //步骤 0申请 1审核中 3完成
    //弹窗
    modalShow: false,
    modalArr: [],

    infoData: [],         //页面数据列表
    userId: '',           //用户uid
  },
  onShow: function () {
    const that = this;
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.data.userId = userInfo.memberInfo.uid;
    }
    if (options.vip_id) {
      this.setData({
        vip_id: options.vip_id
      })
    }
    that.getData();
  },
  // },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/user_refund_vip_details',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        vip_id: this.data.vip_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            infoData: result.data,
            modalArr: result.data.vip_refund_arr,
            bodyShow: true
          })
        }
      }
    });
  },
  /**
   * 退款说明
  */
  getWords: function (e) {
    const that = this;
    that.setData({
      wordsVal: e.detail.value
    })
  },
  /**
   * 不太满意原因展开/隐藏
  */
  modalFunc: function (e) {
    const that = this;
    console.log(that.data.modalShow);
    that.setData({
      modalShow: true
    })
  },
  /**
   * 模态框数据回调
  */
  modalCall: function (e) {
    const that = this;
    that.setData({
      modalShow: false,
      reasonVal: e.detail.modalStr
    })
    // console.log(that.data.nowIndex);
  },
  modalHide: function (e) {
    const that = this;
    that.setData({
      modalShow: false,
    })
  },
  /**
   * 复制服务单号
  */
  copyNo: function () {
    const that = this;
    wx.setClipboardData({
      data: that.data.infoData.viprefund_info.viprefund_numb,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon: 'none'
            })
          }
        })
      }
    })
  },
  submitFunc: function (e) {
    const that = this;
    if (that.data.reasonVal == '') {
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none'
      })
      return;
    }
    app.util.request({
      'url': '/xcx/wxjson/user_refund_vip',
      'cachetime': '0',
      'data': {
        uid: that.data.userId,
        retreat_reason: that.data.reasonVal,
        retreat_explain: that.data.wordsVal
      },
      success(res) {
        if (res.data.code == '0000') {
          that.getData();
        } else {
          wx.showToast({
            title: result.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    });
  }
})