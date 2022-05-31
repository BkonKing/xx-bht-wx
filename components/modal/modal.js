Component({
  options: {
    styleIsolation: 'isolated',   //isolated 表示启用样式隔离
    pureDataPattern: /^_/  // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    modalArr: {
      type: Array,
    },
    modalShow: {
      type: Boolean,
      value: true
    },
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
      
    }
  },
  methods:{
    modalSelect: function(e){
      let that =  this;
      let tapIndex = e.currentTarget.dataset.index;
      that.setData({
        modalShow: !that.data.modalShow
      })
      that.triggerEvent('modal', that.data.modalArr[tapIndex])
    },
    modalFunc: function (e) {
      let that = this;
      that.setData({
        modalShow: !that.data.modalShow
      })
      that.triggerEvent('hide')
    }
  }
})