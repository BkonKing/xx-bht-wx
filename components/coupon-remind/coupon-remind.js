var WxParse = require('../../resource/wxParse/wxParse.js');
Component({
  options: {
    styleIsolation: 'isolated',   //isolated 表示启用样式隔离
    pureDataPattern: /^_/  // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    modalShow: {
      type: Boolean,
      value: true
    },
    couponTip: {
      type: String,
      value: '',
      observer:function (newval, oldval) {
        console.log(this.properties.couponTip)
        WxParse.wxParse('articleContent', 'html', this.properties.couponTip, this, 10);
        // this.setData({
        //   imglist:this.properties.imgs
        // })
      }
    },
  },
  data: {
  },
  lifetimes: {
    attached: function () {
      const that = this;
      // console.log(that.data.couponTip)
      // WxParse.wxParse('articleContent', 'html', that.data.couponTip, that, 10);
    },
    created: function () {
      const that = this;
      // console.log(that.data.couponTip)
      // WxParse.wxParse('articleContent', 'html', that.data.couponTip, that, 10);
    },
  },
  pageLifetimes: {
    show: function () {
      const that = this;
    }
  },
  methods:{
    modalFunc: function (e) {
      let that = this;
      that.setData({
        modalShow: !that.data.modalShow
      })
      that.triggerEvent('hide')
    },
    showModal () {
      this.setData({
        modalShow: true
      })
    },
    hideModal () {
      this.setData({
        modalShow: false
      })
    },
    goLink () {
      this.setData({
        modalShow: false
      })
      wx.navigateTo({
        url: '/page/product/pages/coupons/coupons',
      })
    }
  }
})