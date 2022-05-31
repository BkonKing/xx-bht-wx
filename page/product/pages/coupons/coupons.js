var app = getApp();
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '优惠券',
      // goback_pic: '../../image/goback4.png'
    },

    page: 1, //分页
    noMoreHidden: true, //是否还有更多
    userId: '', //用户uid
    userVip: 0, //用户vip
    loginModelHidden: false, // 授权弹窗是否隐藏

    link_flag: 1, //页面跳转标识
    typeVal: 1, //1、未使用 2、已使用 3、已过期
    couponList: [], //优惠券列表数据
    noneHidden: true,
    bannerSrc: ''
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({
        loginModelHidden: true
      })
      that.setData({
        userId: userInfo.memberInfo.uid
      })
    } else {
      that.setData({
        loginModelHidden: false
      })
    }
    that.setData({
      link_flag: 1
    })
    scene_val = app.util.getScene();
    console.log(scene_val);
    that.setData({
      noMoreHidden: true,
      noneHidden: true,
    });
    that.data.page = 1;
    that.data.is_flag = 1;
    that.getMyData();
    that.getList();
  },
  onLoad: function (options) {
    const that = this;
    that.setData({
      'headerArr.height': app.globalData.height
    })
  },
  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    const that = this;
    var page = that.data.page;
    if (that.data.noMoreHidden) {
      that.data.page = page + 1;
      that.getList();
    }
  },
  getMyData: function () {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/my_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        console.log('vip信息', res)
        if (result.code == '0000') {
          that.setData({
            userVip: result.data.is_vip,
          })
          // 会员获取分销banner
          if (result.data.is_vip) {
            that.getBanner()
          }
        }
      }
    });
  },
  updateUserInfo(result) {
    const that = this;
    //拿到用户数据时，通过app.util.getUserinfo将加密串传递给服务端
    //服务端会解密，并保存用户数据，生成sessionid返回
    app.util.getUserInfo(function (userInfo) {
      //这回userInfo为用户信息
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.memberInfo.nickName) {
        that.setData({
          userData: userInfo.memberInfo,
          loginModelHidden: true,
          userId: userInfo.memberInfo.uid,
          userVip: userInfo.memberInfo.is_vip
        });
      } else {
        that.setData({
          loginModelHidden: true,
        });
      }
      that.getList();
    })
  },
  /**
   * 获取后台数据
   */
  getList: function (is_nav = '') {
    const that = this;
    app.util.request({
      'url': '/xcx/wxvipjson/coupon_list',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        page: that.data.page,
        c_type: that.data.typeVal,
        cj_code: scene_val
      },
      success(res) {
        // return;
        let result = res.data;
        if (result.code == '0000') {
          if (is_nav) { //如果是nav切换，直接将优惠券数据替换
            that.setData({
              couponList: result.data,
            })
          }
          that.data.is_flag = 2;
          if (result.data && result.data.length > 0) {
            that.setData({
              couponList: that.data.page == 1 ? result.data : that.data.couponList.concat(result.data),
            })
          } else {
            that.setData({
              noneHidden: that.data.couponList.length == 0 ? false : true,
            })
          }
          if (result.data.length == 0 && that.data.page > 1) {
            that.setData({
              noneHidden: true,
              noMoreHidden: false
            })
          }
        }
      }
    });
  },
  /**
   * nav切换
   */
  navFun: function (e) {
    const that = this;
    if (that.data.is_flag == 2) {
      const type_val = e.target.dataset.typeval;
      that.setData({
        noMoreHidden: true,
        noneHidden: true,
        typeVal: type_val,
        couponList: [],
      })
      that.data.page = 1;
      that.data.is_flag = 1;
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
      that.getList(true);
    }
  },
  /**
   * 详情显示/隐藏
   */
  contToggle: function (e) {
    const that = this;
    const toggleIndex = e.currentTarget.dataset.id;
    console.log(that.data.couponList[toggleIndex].is_down);
    var up = "couponList[" + toggleIndex + "].is_down";
    that.setData({
      [up]: !that.data.couponList[toggleIndex].is_down
    })
  },
  /**
   * 跳转
   */
  linkFunc: app.util.throttle(function (e) {
    // 优惠券类型，4：会员 1：通用
    var type = e.currentTarget.dataset.type
    if (+type === 4) {
      wx.navigateTo({
        url: '/page/my/pages/vip/vip',
      })
    } else {
      wx.switchTab({
        url: '/page/tabBar/store/index',
      })
    }
  }, 1000),

  // 获取分销-优惠券banner
  getBanner() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/getCopy',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
      },
      success(res) {
        var result = res.data
        if (result.code == '0000') {
          that.setData({
            bannerSrc: result.info.is_open ? result.info.discount_banner : ''
          })
        }
      }
    });
  }
})