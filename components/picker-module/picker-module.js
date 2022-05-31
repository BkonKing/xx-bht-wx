Component({
  options: {
    styleIsolation: 'isolated',   //isolated 表示启用样式隔离
    pureDataPattern: /^_/  // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    pickerTit: {      //picker标题
      type: String,
      value: '时间选择'
    },     
    pickerObj: {       //picker初始数据
      type: Object,
      value: {}
    },
    selectVal: {       //picker默认选中
      type: Array,
      value: [],
    },
    pickerShow: {
      type: Boolean,
      value: false
    },
  },
  data: {
    selectArr: {       //picker选中的值
      type: Array,
      value: []
    },
    isChange: false,
  },
  lifetimes: {
    attached: function () {
      const that = this;
      console.log(that.data.pickerObj)
    }
  },
  pageLifetimes: {
    show: function () {
      const that = this;
      
    }
  },
  methods:{
    /*
    *picker变动
    */
    bindChange: function (e) {
      const that = this;
      const val = e.detail.value
      that.data.isChange = true;
      that.data.selectArr = val;
    },
    /*
    *确认
    */
    suerFunc: function (e) {
      const that = this;
      that.setData({
        pickerShow: false
      })
      if (that.data.isChange){
        that.triggerEvent('pickerFunc', that.data.selectArr);
        that.data.isChange = false;
      }else {
        that.triggerEvent('pickerFunc', that.data.selectVal);
      }
    },
    /*
    *取消
    */
    cancelFunc: function (e) {
      const that = this;
      that.setData({
        pickerShow: false
      })
    }
  }
})