Component({
  options: {
    styleIsolation: 'isolated',   //isolated 表示启用样式隔离
    pureDataPattern: /^_/  // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    
  },
  data: {
    vipEndtime: '',
    modalShow: false,
    isSelect: 0
  },
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
      if(userInfo){
        // that.setData({
        //   modalShow: !that.data.modalShow
        // })
        app.util.request({
          'url': '/xcx/wxjson/renew_json',
          'cachetime': '0',
          'showLoading': false,
          data: {
            
          },
          success(res) {
            if(res.data.code == '0000'){
              let result = res.data.data;
              if(result.is_vip && result.is_renewal){
                if(renewObj == '' || (renewObj && !renewObj.notShow && (renewObj.clickTime < result.beginToday || renewObj.clickTime > result.endToday))){
                  //没有缓存值 或 有缓存值并且没有设置不再提醒并且今天没点击过
                  that.setData({
                    modalShow: true,
                    vipEndtime: result.vip_etime
                  })
                }else {
                  that.setData({
                    modalShow: false
                  })
                }
              }
            }
          }
        });
      }
    }
  },
  methods:{
    modalHide: function (e) {
      const that = this;
      that.setData({
        modalShow: false
      })
      let nowTime = Date.parse(new Date())/1000;
      let renewObj = {clickTime: nowTime, notShow: that.data.isSelect};
      wx.setStorageSync('renewObj', renewObj);
    },
    radioSelect: function (e) {
      const that = this;
      that.setData({
        isSelect: that.data.isSelect ? 0 : 1
      })
    },
    goRenew: function (e) {
      const that = this;
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 1];
      that.modalHide();
      if (prevPage.route == "page/my/pages/vip/vip") {
        that.triggerEvent('modal')
      }else {
        wx.navigateTo({
          url: '/page/my/pages/vip/vip?isrenew=1',
        })
      }
    }
  }
})