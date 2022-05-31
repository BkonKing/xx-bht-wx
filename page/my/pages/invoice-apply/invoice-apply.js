var app = getApp();
var scene_val = ''; //场景值
// 引入SDK核心类
// var QQMapWX = require('../../resource/js/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk;

Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '申请开票'
    },
    invoice_id: '',
    wxpay_id: '',
    order_data: [],
    type_data: [],
    goods_type_data: [],
    i_type: '', // 发票类型
    i_type_name: '',
    c_type: '', // 	发票内容
    c_type_name: '',
    mail: '',
    duty_paragraph: '', // 税号（企业 必填）
    bank: '', // 开户银行（企业）
    bank_card: '', // 银行账号（企业）
    address: '', // 	企业地址（企业）
    phone: '', // 	企业电话（企业）
    rise_type: '1', // 发票	抬头类型 1个人 2企业
    rise: '',
    invoiceMoney: '', // 开票金额
    is_default: false, //是否默认 0否 1是
    typeHidden: true, //类型
    contentHidden: true, //发票内容弹窗
    swalHidden: true, //开票说明弹窗是否隐藏 true
    btnDisabled: true, //保存按钮是否能点击
    isFold: true,
    userAddId: '',
    rece_realname: '',
    rece_mobile: '',
    // rece_province: '',
    // rece_city: '',
    // rece_area: '',
    rece_address: '',
    rece_label: '',
    isNotOrderIn: true // 不是从订单进入
  },
  onShow: function () {
    if (this.data.userAddId) {
      this.setData({
        userAddId: this.data.userAddId,
        rece_realname: this.data.uname,
        rece_mobile: this.data.utel,
        // rece_province: this.data.uname,
        // rece_city: this.data.uname,
        // rece_area: this.data.uname,
        rece_address: this.data.userAddress,
        rece_label: this.data.ulabel,
      })
    }
    this.isAble()
  },
  onLoad: function (options) {
    var id = options.id
    var order_id = options.order_id
    if (id || order_id) {
      this.setData({
        invoice_id: id,
        wxpay_id: order_id,
        isNotOrderIn: false
      })
    }
    this.getData()
  },
  getData: function (isOnlyOrder) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxinvoicejson/apply_invoice',
      'cachetime': '0',
      data: {
        invoice_id: this.data.invoice_id,
        wxpay_id: this.data.wxpay_id
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          const invoiceMoney = result.data.order_data.reduce(function (num, obj) {
            return num + parseFloat(obj.invoice_money)
          }, 0)
          that.setData({
            order_data: result.data.order_data,
            invoiceMoney
          })
          if (isOnlyOrder) {
            return
          }
          that.setData({
            type_data: result.data.i_type_data,
            goods_type_data: result.data.c_type_data,
          })
          if (result.data.invoice_data.rise) {
            that.setData(result.data.invoice_data)
            that.isAble()
            return
          }
          const c_type_data = {
            value: '1',
            text: '商品类别'
          }
          const cTypeData = result.data.c_type_data && result.data.c_type_data.length === 1 ? result.data.c_type_data[0] : c_type_data
          that.setData({
            c_type: cTypeData.value,
            c_type_name: cTypeData.text,
          })
          const i_type_data = {
            value: '1',
            text: '增值税电子普通发票'
          }
          const iTypeData = result.data.i_type_data && result.data.i_type_data.length === 1 ? result.data.i_type_data[0] : i_type_data
          that.setData({
            i_type: iTypeData.value,
            i_type_name: iTypeData.text,
          })
          that.isAble()
        }
      }
    });
  },
  // 选择订单
  selectOrder() {
    if (this.data.isNotOrderIn) {
      wx.navigateTo({
        url: '/page/my/pages/invoice-select-order/invoice-select-order',
      })
    }
  },
  // 选择发票类型
  selectType(e) {
    var i_type = e.currentTarget.dataset.id
    var i_type_name = e.currentTarget.dataset.text
    this.setData({
      i_type,
      i_type_name,
      typeHidden: true
    })
  },
  // 选择发票内容
  selectContent(e) {
    var c_type = e.currentTarget.dataset.id
    var c_type_name = e.currentTarget.dataset.text
    this.setData({
      c_type,
      c_type_name,
      contentHidden: true
    })
  },
  // 收缩
  changeFold() {
    this.setData({
      isFold: !this.data.isFold
    })
  },
  goAddress() {
    wx.navigateTo({
      url: '/page/my/pages/address/address?page_type=1',
    })
  },
  // 发票抬头类型切换
  radioChange(e) {
    this.setData({
      rise_type: e.detail.value
    })
    if (this.data.rise_type === '1') {
      this.setData({
        rise: '',
        duty_paragraph: '',
        bank: '',
        bank_card: '',
        address: '',
        phone: '',
      })
    } else {
      this.setData({
        rise: '',
      })
    }
    this.isAble()
  },
  formatCardNumber(e) {
    const {
      value: cardNum
    } = e.detail
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
  formatNumber(e) {
    const {
      value
    } = e.detail
    const newValue = value
      .replace(/\D+/g, '')
      .replace(/ $/, '')
    this.setData({
      phone: newValue
    })
  },
  formatNumberLetter(e) {
    const {
      value
    } = e.detail
    const newValue = value
      .replace(/[^a-z0-9]+/i, '')
      .replace(/ $/, '')
    this.setData({
      duty_paragraph: newValue
    })
    this.isAble()
  },
  /**
   * 提交
   */
  formSubmit: function (e) {
    const that = this;
    that.setData({
      btnDisabled: true
    })
    let data = {
      invoice_id: that.data.invoice_id,
      wxpay_id: that.data.wxpay_id,
      i_type: that.data.i_type,
      is_default: that.data.is_default ? 1 : 0,
      c_type: that.data.c_type,
      rise_type: that.data.rise_type,
      rise: that.data.rise,
      mail: that.data.mail,
      bank_card: that.data.bank_card,
    }
    if (that.data.rise_type === '2') {
      data = {
        ...data,
        duty_paragraph: that.data.duty_paragraph,
        bank: that.data.bank,
        bank_car: that.data.bank_car,
        address: that.data.address,
        phone: that.data.phone,
        rece_realname: that.data.rece_realname,
        rece_mobile: that.data.rece_mobile,
        rece_province: that.data.rece_province,
        rece_city: that.data.rece_city,
        rece_area: that.data.rece_area,
        rece_address: that.data.rece_address,
      }
    }
    app.util.request({
      'url': '/xcx/wxinvoicejson/edit_invoice',
      'cachetime': '0',
      'data': data,
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
          wx.navigateBack();
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
  /**
   * 判断提交按钮是否能够点击
   */
  isAble: function () {
    const type1 = this.data.rise_type === '1' && this.data.rise
    const type2 = this.data.rise_type === '2' && this.data.duty_paragraph && this.data.rise
    if (type1 || type2) {
      this.setData({
        btnDisabled: false
      })
    } else {
      this.setData({
        btnDisabled: true
      })
    }
  },
  /**
   * 自定义标签弹窗
   */
  swalFunc: function (e) {
    const that = this;
    const key = e.currentTarget.dataset.key
    if (key === 'contentHidden' && this.data.goods_type_data && this.data.goods_type_data.length < 2) {
      return
    }
    if (key === 'typeHidden' && this.data.type_data && this.data.type_data.length < 2) {
      return
    }
    if (typeof e.currentTarget.dataset.nohide !== "undefined" && e.currentTarget.dataset.nohide) {
      that.setData({
        [key]: false
      })
    } else {
      that.setData({
        [key]: !that.data[key]
      })
    }
  },
  goInvoiceTile() {
    wx.navigateTo({
      url: '/page/my/pages/invoice-title/invoice-title?type=1',
    })
  },
  handleInput() {}
})