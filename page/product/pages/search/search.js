var app = getApp();
var scene_val = '';
var key_word = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '搜索',
      // goback_pic: '/resource/images/goback3.png',
    },

    shop_length: 0,
    search_val: '',    //搜索输入框值
    noneHidden: true,  //缺省页是否隐藏（搜索无结果）
    wordsShow: true,   //显示热搜词和历史搜索
    searchList: [],    //历史搜索词列表
    hotWordsList: [],  //热搜词列表
    resShopList: [],   //搜索结果列表

    page: 1,           //分页页码
    noMoreHidden: true,//上拉加载更多，没有更多是否隐藏
    userId: '',        //用户uid
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.data.userId = userInfo.memberInfo.uid;
    }
    that.getHotWords();
  },
  onReady: function () {
  },
  onLoad: function (options) {
    const that = this;
    that.setData({
      searchList: wx.getStorageSync('searchWords') || []
    })
    that.setData({
      'headerArr.height': app.globalData.height
    })
  },
  /**
   * 获取热门搜索词/request
  */
  getHotWords: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/hot_word',
      'cachetime': '0',
      'data': {
        uid: that.data.userId,
        cj_code: app.util.getScene()
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            hotWordsList: result.data.hot_word_list,
          })
        }
      }
    });
  },
  /**
   * 删除输入框内容
  */
  inputDel: function (e) {
    const that = this;
    that.setData({
      search_val: '',
      wordsShow: true
    });
    key_word = '';
  },
  /**
   * 获取焦点
  */
  focus: function (e) {
    const that = this;
    that.setData({
      // search_val: '',
      wordsShow: true
    });
  },
  /**
   * 失去焦点
  */
  blur: function (e) {
    const that = this;
    // that.setData({
    //   wordsShow: false
    // });
  },
  /**
   * 获取输入框值
  */
  getInputVal: function (e) {
    const that = this;
    key_word = e.detail.value;
    that.setData({
      search_val: key_word
    })
  },
  /**
   * 点击关键词搜索
  */
  wordsSearch: function (e) {
    const that = this;
    that.setData({
      wordsShow: false
    });
    key_word = e.currentTarget.dataset.words;

    that.setData({
      search_val: key_word,
      resShopList: [],
      noneHidden: true,
      noMoreHidden: true
    });
    that.data.page = 1;
    that.addSearch();
  },
  /**
   * 点击输入框搜索
  */
  compSearch: function (e) {
    const that = this;
    that.setData({
      wordsShow: false,
      search_val: key_word,
    });
    that.setData({
      resShopList: [],
      noneHidden: true,
      noMoreHidden: true
    });
    that.data.page = 1;
    that.addSearch();
  },
  /**
   * 加入历史搜索
  */
  addSearch: function (e) {
    const that = this;
    if (key_word) {
      that.setData({
        // searchVal: that.data.searchVal,
        resShopList: [],
      });
      for (var key in that.data.searchList) {
        if (key_word == that.data.searchList[key]) {
          that.data.searchList.splice(key, 1);
        }
      }
      let wordText = [];
      wordText[0] = key_word;
      that.setData({
        searchList: wordText.concat(that.data.searchList)
      });
      if (that.data.searchList.length > 30) {
        that.data.searchList.splice(30, 1);
        that.setData({
          searchList: that.data.searchList
        });
      }
      wx.setStorageSync('searchWords', that.data.searchList);
      that.goSearch();
    }
  },
  goSearch: function (e) {
    const that = this;
    if (that.data.noMoreHidden) {
      app.util.request({
        'url': '/xcx/wxjson/search_goods',
        'cachetime': '0',
        'data': {
          uid: that.data.userId,
          keyword: key_word,
          page: that.data.page,
          cj_code: app.util.getScene()
        },
        success(res) {
          let result = res.data;
          if (result.code == '0000') {
            if (result.data.goods_list.length && result.data.goods_list.length > 0) {
              that.setData({
                resShopList: that.data.page == 1 ? result.data.goods_list : that.data.resShopList.concat(result.data.goods_list),
                noneHidden: true,
              });
            } else {
              that.setData({
                noneHidden: false,
              });
            }
            if (result.data.goods_list.length == 0 && that.data.page > 1) {
              that.setData({
                noneHidden: true,
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
    }
  },
  /**
   * 删除历史搜索
  */
  delSearch: function (e) {
    const that = this;
    var addrId = e.currentTarget.dataset.id;
    that.setData({
      searchList: []
    });
    wx.removeStorageSync('searchWords');
    wx.showToast({
      title: '删除成功',
      duration: 2000
    });
  },
  /**
   * 上拉加载更多
  */
  onReachBottom: function () {
    const that = this;
    var page = that.data.page;
    if (that.data.noMoreHidden) {
      that.data.page = page + 1;
      that.goSearch();
    }
  },
})