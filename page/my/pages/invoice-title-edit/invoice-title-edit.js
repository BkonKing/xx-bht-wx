var app = getApp();
// 引入SDK核心类
// var QQMapWX = require('../../resource/js/qqmap-wx-jssdk.js');

// 实例化API核心类
// var qqmapsdk;

Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '发票抬头'
    },
    rise_id: '', // 发票抬头id
    btnDisabled: true, //保存按钮是否能点击
    rise_type: '1', // 发票	抬头类型 1个人 2企业
    rise: '', // 发票抬头名
    is_default: '', //是否默认 0否 1是
    duty_paragraph: '', // 税号（企业 必填）
    bank: '',
    bank_card: '',
    address: '',
    phone: '',
  },
  onShow: function () {},
  onLoad: function (options) {
    this.setData({
      rise_id: options.id
    })
    if (this.data.rise_id) {
      this.setData({
        btnDisabled: false
      })
      this.getData()
    }
  },
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxinvoicejson/user_rise_info',
      'cachetime': '0',
      data: {
        user_rise_id: this.data.rise_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            rise_type: result.data.rise_type,
            rise: result.data.rise,
            is_default: +result.data.is_default ? true : false,
            duty_paragraph: result.data.duty_paragraph,
            bank: result.data.bank,
            bank_card: result.data.bank_card,
            address: result.data.address,
            phone: result.data.phone,
          })
        }
      }
    });
  },
  // 发票抬头类型切换
  radioChange(e) {
    this.setData({
      rise_type: e.detail.value
    })
    if (this.data.rise_type === '1') {
      this.setData({
        duty_paragraph: '',
        bank: '',
        bank_card: '',
        address: '',
        phone: '',
      })
    }
  },
  formatCardNumber (e) {
    const {value:cardNum} = e.detail
    // 获取input的dom对象，这里因为用的是vant ui的input，所以需要这样拿到
    const input = e.target
    // 获取当前光标的位置
    const cursorIndex = input.selectionStart
    // 字符串中光标之前-的个数
    const lineNumOfCursorLeft = (
      cardNum.slice(0, cursorIndex).match(/ /g) || []
    ).length
    // 去掉所有-的字符串
    const noLine = cardNum.replace(/ /g, '')
    // 去除格式不对的字符并重新插入-的字符串
    const newCardNum = noLine
      .replace(/\D+/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .replace(/ $/, '')
    // 改后字符串中原光标之前-的个数
    const newLineNumOfCursorLeft = (
      newCardNum.slice(0, cursorIndex).match(/ /g) || []
    ).length
    // 光标在改后字符串中应在的位置
    const newCursorIndex =
      cursorIndex + newLineNumOfCursorLeft - lineNumOfCursorLeft
    // 赋新值，nextTick保证-不能手动输入或删除，只能按照规则自动填入
    this.setData({
      bank_card: newCardNum
    })
    // 修正光标位置，nextTick保证在渲染新值后定位光标
    // selectionStart、selectionEnd分别代表选择一段文本时的开头和结尾位置
    input.selectionStart = newCursorIndex
    input.selectionEnd = newCursorIndex
  },
  formatNumber (e) {
    const {value} = e.detail
    const newValue = value
      .replace(/\D+/g, '')
      .replace(/ $/, '')
    this.setData({
      phone: newValue
    })
  },
  formatNumberLetter (e) {
    const {value} = e.detail
    const newValue = value
      .replace(/[^a-z0-9]+/i, '')
      .replace(/ $/, '')
    this.setData({
      duty_paragraph: newValue
    })
    this.judgeSumbit()
  },
  // 判读是否等保存
  judgeSumbit() {
    if (this.data.rise) {
      if (this.data.rise_type === '2') {
        if (this.data.duty_paragraph) {
          this.setData({
            btnDisabled: false
          })
        }
      } else {
        this.setData({
          btnDisabled: false
        })
      }
    }
  },
  /**
   * 提交
   */
  formSubmit: function (e) {
    const that = this;
    that.setData({
      btnDisabled: true
    })
    app.util.request({
      'url': '/xcx/wxinvoicejson/edit_user_rise',
      'cachetime': '0',
      'data': {
        user_rise_id: this.data.rise_id,
        rise_type: this.data.rise_type,
        rise: this.data.rise,
        is_default: this.data.is_default ? 1 : 0,
        duty_paragraph: this.data.duty_paragraph,
        bank: this.data.bank,
        bank_card: this.data.bank_card,
        address: this.data.address,
        phone: this.data.phone,
      },
      success(res) {
        that.setData({
          btnDisabled: false
        })
        var status = res.data.code;
        if (status == '0000') {
          wx.showToast({
            title: '保存成功！',
            duration: 2000
          });
          setTimeout(function() {
            wx.navigateBack();
          }, 500)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },
  inputTxet: function (e) {
    var value = e.detail.value;
    this.setData({
      key_word: value,
    })
    if (e.currentTarget.dataset.key_word == "") {
      wx.showToast({
        title: '请输入内容',
        icon: 'success',
        duration: 1000
      })
    } else {
      var that = this;
      that.GetLocation();
    }
  },
  /**
   * 判断提交按钮是否能够点击
   */
  isAble: function (e) {
    const that = this;
    if (that.data.uname.trim() == '' || that.data.utel.trim() == '') {
      that.setData({
        btnDisabled: true
      })
    } else {
      that.setData({
        btnDisabled: false
      })
    }
  },
  /**
   * 设置结果
   */
  handler: function (e) {
    const that = this;
    if (e.detail.authSetting["scope.userLocation"]) {
      that.setData({
        markHidden: true
      })
      // that.GetLocation();
    }
  },
  /**
   * 设置默认
   */
  defaultFunc: function (e) {
    const that = this;
    that.setData({
      switchChecked: !that.data.switchChecked
    })
  },
})