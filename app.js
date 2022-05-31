//app.js
/*App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})*/

const ald = require('./utils/ald-stat.js');
//app.js
App({
  onLaunch: function (options) {
    //临时 设置用户缓存
    // let userInfo = { memberInfo: ''};
    // let memberInfo = { 
    //   id: 1, 
    //   uid: 1,
    //   avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIdxe1K06QfnicyKGsjaicu75xbvWC2QzfHGJzyvyZn31M4fTKtDlO6LrtA3eibHGPoO2ickbzd2GQ9Xg/132',
    //   nickName : '旅途',
    //   mobile: '15860066666'
    // };
    // userInfo.memberInfo = memberInfo;
    // wx.setStorageSync('userInfo', userInfo);
    // wx.removeStorageSync('userInfo');


    //判断是否授权登录、是否有游客id
    // var visitor_uid = wx.getStorageSync('visitor_uid') || '';
    // var userInfo = wx.getStorageSync('userInfo') || '';
    // if (!visitor_uid && !userInfo) {
    //   this.util.request({
    //     'url': this.siteInfo.siteroot + '/xcx/wxjson/tourists',
    //     'cachetime': '0',
    //     data: {
    //     },
    //     success(res) {
    //       if (res.data.code == '0000') {
    //         wx.setStorageSync('visitor_uid', res.data.data.tid);
    //       }
    //     }
    //   });
    // }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) { // 请求完新版本信息的回调
        updateManager.onUpdateReady(function () {
          updateManager.applyUpdate()
          // wx.showModal({
          //   title: '更新提示',
          //   content: '新版本已经准备好，是否重启应用？',
          //   success: function (res) {
          //     if (res.confirm) {// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          //       updateManager.applyUpdate()
          //     }
          //   }
          // })
        });
        updateManager.onUpdateFailed(function () {
          wx.showModal({// 新的版本下载失败
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索进入哟~',
          })
        })
      }
    })

    // 判断是否由分享进入小程序
    // if (options.scene == 1007 || options.scene == 1008) {
    //   this.globalData.share = true
    // } else {
    //   this.globalData.share = false
    // };
    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    //这个最初我是在组件中获取，但是出现了一个问题，当第一次进入小程序时导航栏会把
    //页面内容盖住一部分,当打开调试重新进入时就没有问题，这个问题弄得我是莫名其妙
    //虽然最后解决了，但是花费了不少时间
    wx.getSystemInfo({
      success: (res) => {
        console.log(res);
        this.globalData.height = res.statusBarHeight
      }
    })
  },
  //判断是否授权登录、是否有游客id
  getAuthKey: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      // 调用游客id生成接口
      that.util.request({
        'url': that.siteInfo.siteroot + '/xcx/wxjson/tourists',
        'cachetime': '0',
        showLoading: false,
        data: {
        },
        success(res) {
          if (res.data.code == '0000') {
            wx.setStorageSync('visitor_uid', res.data.data.tid);
          }
          resolve();
        }
      });
    });
  },
  onShow: function (options) {
    console.log(options)
    // wx.getUserInfo({
    //   success: res => {
    //     console.log(res);
    //     console.log('已经授权登录了！更新用户信息成功了！')
    //   },
    //   fail: res => {
    //     console.log(res);
    //     console.log('失败')
    //   },
    // })
    wx.setStorageSync('wx_scene', options.scene);

    //钱包用户进来
    var qb_data = wx.getStorageSync('qb_data') || '';
    if (!qb_data && typeof (options.query.qb_uid) != 'undefined') {
      var qb_list = {};
      qb_list.md5_sign = options.query.md5_sign;
      qb_list.mobile = options.query.mobile;
      qb_list.ptime = options.query.ptime;
      qb_list.qb_uid = options.query.qb_uid;
      wx.setStorageSync('qb_data', qb_list);
    }
  },
  onHide: function () {
    // this.util.request({
    //   'url': '/xcx/wxjson/xcx_tc',
    //   'cachetime': '0',
    //   data: {
    //   },
    //   success(res) {
    //     console.log(res)
    //   }
    // });
  },
  onError: function (msg) {
    console.log(msg)
  },
  util: require('utils/util.js'),

  globalData: {
    userInfo: null,
    //share: false,  // 分享默认为false
    height: 0,
    is_again: 0
  },
  siteInfo: require('siteinfo.js')


});