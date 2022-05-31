Component({
  options: {
    styleIsolation: 'isolated',   //isolated 表示启用样式隔离
    pureDataPattern: /^_/  // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    alertShow: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  lifetimes: {
    attached: function () {
      const that = this;
    }
  },
  pageLifetimes: {
    show: function () {
      const that = this;
      let app = getApp();
      let userInfo = wx.getStorageSync('userInfo');
      // let renewObj = {clickTime: 0, notShow: 0};
      let renewObj = wx.getStorageSync('renewObj') || '';
      console.log(renewObj);
    }
  },
  methods:{
    modalHide: function (e) {
      const that = this;
      that.setData({
        alertShow: false
      })
    },
    modalShow: function (e) {
      const that = this;
      that.setData({
        alertShow: true
      })
    },
    sureFunc: function (e) {
      const that = this;
      that.triggerEvent('sureCall');
    }
  }
})