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
    couponList: {
      type: Array,
      value: []
    }
  },
  data: {
  },
  lifetimes: {
    attached: function () {
      const that = this;
      console.log(that.data.modalArr)
    }
  },
  pageLifetimes: {
    show: function () {
      const that = this;
      console.log(222)
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
    // goLink () {
    //   this.setData({
    //     modalShow: false
    //   })
    //   wx.navigateTo({
    //     url: '/page/product/pages/coupons/coupons'
    //   })
    // }
  }
})