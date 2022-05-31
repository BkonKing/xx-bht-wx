var app = getApp();
var scene_val = '';
var scroll_num = 0; //滚动次数
var qb_uid = '', qb_mobile = '', ptime = '', md5_sign = '';
Page({
  data: {
    //顶部标题栏数据
    barObj: {
      isBorder: false,
      titName: '不荒唐',
      // goback_pic: '../../image/goback4.png'
    },

    is_onload: 1,         //加载标识，onshow和onload只加载一次数据
    swiperList: [],       //轮播图
    swiperIndex: 0,       //主推商品轮播 当前轮播图选中项
    indexTab: 0,          //tab标签菜单切换选中 
    tags_id: '',          //标签id
    navList: [],          //标签菜单列表
    recommendList: [],    //推荐列表
    goodsList: [],         //商品列表
    scrollNavTop: '',     //标签菜单距离顶部的距离
    scrollNavFixed: false,//标签菜单是否吸顶
    page: 1,              //分页页码
    noMoreHidden: true,   //上拉加载更多，没有更多是否隐藏
    userId: '',           //用户uid
    noticeList: [],       //公告信息  
    is_refresh: true      //页面是否刷新
  },
  onShow: function () {
    const that = this;
    scroll_num = 0;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.data.userId = userInfo.memberInfo.uid
    }
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      console.log('is_refresh',that.data.is_refresh);
      if (that.data.is_refresh) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
        that.setData({
          indexTab: 0,
          goodsList: [],
          scrollNavFixed: false,
        })
        // that.data.scrollNavTop = '';
        that.data.tags_id = '';
        that.data.page = 1;
        scene_val = app.util.getScene();
        that.notionData();
      } else {
        that.data.is_refresh = true;
      }
    }
  },
  onHide: function () {
    const that = this;
    //清空滚动字幕定时器，避免锁屏或页面隐藏后移动速度越来越快
    clearInterval(this.data.time);
  },
  onLoad: function (options) {
    const that = this;
    if (options.qb_uid) {
      qb_uid = options.qb_uid;
      qb_mobile = options.mobile;
      ptime = options.ptime;
      md5_sign = options.md5_sign;
    }
    scene_val = app.util.getScene();
    var tags_id;
    var params;
    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      params = app.util.getUrlQuery(scene);
      tags_id = params.tags_id;
    } else {
      if (options.tags_id) {
        tags_id = options.tags_id;
      } else {
        tags_id = '';
      }
    }
    that.data.is_onload = 1;
    that.setData({
      'headerArr.height': app.globalData.height
    })
    that.data.tags_id = tags_id;
    that.notionData();
  },
  /**
   * 轮播图切换
  */
  swiperChange: function (e) {
    const that = this;
    if (e.detail.source) {
      that.setData({
        swiperIndex: e.detail.current
      })
    }
  },
  /**
   * 点击nav
  */
  navFun: function (e) {
    const that = this;
    console.log(e);
    let indexTab = e.currentTarget.dataset.index;
    let tags_id = e.currentTarget.dataset.id;
    that.setData({
      indexTab: indexTab,
      // recommendList: that.data.navList[indexTab].recommend_list,
      swiperIndex: 0
    })
    that.data.tags_id = tags_id;
    console.log(tags_id);
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    that.setData({
      goodsList: [],
      noMoreHidden: true
    })
    that.data.page = 1;
    that.listData();
  },
  /**
   * 上拉加载更多
  */
  onReachBottom: function () {
    const that = this;
    var page = that.data.page;
    if (that.data.noMoreHidden && (that.data.goodsList&&that.data.goodsList.length > 0)) {
      that.data.page = page + 1;
      that.listData();
    }
  },
  /**
   * 获取后台数据
  */
  listData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/store_list_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        page: that.data.page,
        tags_id: that.data.tags_id,
        cj_code: scene_val,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          if (that.data.page == 1){
            //判断菜单下是否有推荐商品
            if (result.data.recommend_list && result.data.recommend_list.length > 0) {
              //判断轮播图长度是否小于当前轮播图长度
              if (result.data.recommend_list.length < that.data.recommendList.length) {
                that.setData({
                  swiperIndex: 0,
                })
              }
              that.setData({
                recommendList: result.data.recommend_list
              })
            } else {
              that.setData({
                recommendList: []
              })
            }
          }
          that.setData({
            goodsList: that.data.page == 1 ? result.data.goods_list : that.data.goodsList.concat(result.data.goods_list)
          })
          if (that.data.page > 1 && result.data.goods_list.length == 0) {
            that.setData({
              noMoreHidden: false
            })
          }else {
            that.setData({
              noMoreHidden: true
            })
          }
          
        }
      }
    });
  },
  /**
   * 获取后台数据——公告/轮播/菜单/推荐商品
  */
  notionData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/store_json',
      'cachetime': '0',
      showLoading: false,
      data: {
        uid: that.data.userId,
        cj_code: scene_val,
        qb_uid: qb_uid,
        mobile: qb_mobile,
        ptime: ptime,
        md5_sign: md5_sign
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            noticeList: result.data.notice_list,
            swiperList: result.data.banner_list,
            navList: result.data.menu_list,
          })
          //判断菜单是否存在，存在则取对应的商品列表，有全部菜单时默认选中全部，并且全部菜单不显示
          const menuList = result.data.menu_list || []
          if (menuList && Array.isArray(menuList) && menuList.length) {
            const index = menuList.findIndex(menu => menu.x_name === '全部') || 0
            const indexTab = index > -1 ? index : 0
            that.setData({
              page: 1,
              tags_id: menuList[indexTab].id,
              indexTab: indexTab
            })
            that.listData();
          } else {
            that.setData({
              goodsList: []
            })
          }
          that.initClientRect();
          //清除钱包app数据
          if (that.data.userId) {
            qb_uid = '';
            qb_mobile = '';
            ptime = '';
            md5_sign = '';
          }
        }
      }
    });
  },
  /**
   * 滚动条监听
  */
  onPageScroll: function (res) {
    const that = this;
    // console.log(res.scrollTop, that.data.scrollNavTop)
    if (scroll_num) {
      if (res.scrollTop >= that.data.scrollNavTop) {
        if (!that.data.scrollNavFixed) {
          that.setData({
            scrollNavFixed: true,
          })
        }
      } else {
        if (that.data.scrollNavFixed) {
          that.setData({
            scrollNavFixed: false,
          })
        }
      }
    } else {
      scroll_num = 1;
    }
  },
  /**
   * 获取导航栏菜单距离顶部距离
  */
  initClientRect: function () {
    const that = this;
    var query = wx.createSelectorQuery()
    query.select('.nav-session').boundingClientRect()
    query.exec(function (res) {
      that.data.scrollNavTop = res[0].top + res[0].height - that.data.headerArr.height - 88;
    })
  },
  textInfo: function () {
    var that = this;
    var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    that.setData({
      windowWidth: windowWidth
    });
    wx.createSelectorQuery().select('#textBox').boundingClientRect(function (res) {
      that.setData({
        length: res.width
      })
      that.scrolltxt();// 第一个字消失后立即从右边出现
    }).exec()
  },
  /**
    * 滚动字幕
    */
  scrolltxt: function () {
    var that = this;
    var length = that.data.length;//滚动文字的宽度
    var windowWidth = that.data.windowWidth;//屏幕宽度
    var time = this.data.time
    if (length > windowWidth) {
      time = setInterval(function () {
        var maxscrollwidth = length + that.data.marquee_margin;//滚动的最大宽度，文字宽度+间距，如果需要一行文字滚完后再显示第二行可以修改marquee_margin值等于windowWidth即可
        var crentleft = that.data.marqueeDistance;
        if (crentleft < maxscrollwidth) {//判断是否滚动到最大宽度
          that.setData({
            marqueeDistance: crentleft + that.data.marqueePace
          })
        }
        else {
          that.setData({
            marqueeDistance: 0 // 直接重新滚动
          });
          clearInterval(time);
          that.scrolltxt();
        }
      }, 20);
    }
    else {
      that.setData({ marquee_margin: "1000" });//只显示一条不滚动右边间距加大，防止重复显示
    }
    that.setData({
      time: time
    })
  },
})