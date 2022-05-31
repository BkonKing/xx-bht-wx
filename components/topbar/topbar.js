Component({
  externalClasses: ['customtitle', 'customtitletext'],
  options: {
    styleIsolation: 'isolated',   //isolated 表示启用样式隔离
    pureDataPattern: /^_/  // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    barObj: {
      type: Object,
      value:{
        titName: '',         //标题名称
        goback_pic: '',      //返回图标
        goindex_pic: '',     //返回首页图标
        isBorder: false,     //是否有border-buttom
        information_back: '' //点击返回按钮是否有效（information页面特用）
      }
    }
  },
  data: {
    barHeight: '',
  },
  lifetimes: {
    attached: function () {
      const that = this;
      console.log(that.data.barObj);
      wx.getSystemInfo({
        success: (res) => {
          that.setData({
            barHeight: res.statusBarHeight
          })
        }
      })
    }
  },
  pageLifetimes: {
    show: function () {
      const that = this;
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let tabbarPage = ['page/tabBar/index/index', 'page/tabBar/store/index', 'page/tabBar/cart/index', 'page/tabBar/my/index'];
      if (pages.length == 1) {
        if (tabbarPage.indexOf(pages[0].route) == -1) {
          that.setData({
            'barObj.goback_pic': that.data.barObj.goindex_pic ? that.data.barObj.goindex_pic : '../../resource/images/goback2.png',
          })
        }else {
          that.setData({
            'barObj.goback_pic': '',
          })
        }
      } else {
        if(!that.data.barObj.information_back){
          that.setData({
            'barObj.goback_pic': that.data.barObj.goback_pic ? that.data.barObj.goback_pic : '../../resource/images/goback4.png'
          })
        }
      }
    }
  },
  methods:{
    goback: function (e) {
      const that = this;
      if (that.data.barObj.information_back){
        that.triggerEvent('topbarFunc');
      }else {
        wx.navigateBack({
          success: function () {
          },
          fail: function () {
            wx.switchTab({
              url: '/page/tabBar/index/index',
            })
          }
        });
      }
        
      // if (option) {
      //   wx.switchTab({
      //     url: '../index/index',
      //   })
      // } else {
      //   wx.navigateBack({
      //     success: function () {
      //     },
      //     fail: function () {
      //       wx.switchTab({
      //         url: '../index/index',
      //       })
      //     }
      //   });
      // }
    }
  }
})