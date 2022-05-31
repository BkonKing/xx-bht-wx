var app = getApp();
var WxParse = require('../../../../resource/wxParse/wxParse.js');
var share_uid = '';
var share_tid = '';
var scene_val = '';
var qb_uid = '', qb_mobile = '', ptime = '', md5_sign = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '商品详情',
      // goback_pic: '../../image/goback4.png'
    },
    is_onload: 1,         //加载标识，onshow和onload只加载一次数据

    goods_id: '',            //商品id
    swiperList: [],          //商品轮播图
    goodsData: '',           //商品信息
    isShow: false,           //是否显示规格弹窗
    btnStatus: 0,            //商品状态 0正常 1售罄 2下架
    notAdd: false,           //不能增加商品数量，默认否（限购）
    typeIndex: 0,            //选中规格index
    isSmall: false,          //是否改变价格显示大小（页面）
    isSmall2: false,         //是否改变价格显示大小(规格)
    btn_type: '',            //cart点击了加入购物 buy点击了立即购买
    goods: {                 //购物车
      goods_id: '',          //商品id
      goods_name: '',        //商品名称
      sign_url: '',          //图标
      y_price: '',           //原价
      s_price: '',           //售价    
      vip_price: '',         //vip价格   
      e_price: '',           //vip优享价
      pay_price: '',         //实际支付价格
      specs_name: '',        //商品规格名称
      specs_img: '',         //商品规格图片
      specs_id: '',          //商品规格id
      count: 1,              //购物车商品数量
      vip_status: '',        //会员状态 0非会员 1会员 2会员优享
      is_checked: true,      //是否选中（购物车中）
      stock: 0,              // 库存
      limit_num: 0,          // 限购数量
      is_limit: false,       // 限购数量
      max_buy: 0             // 限制最大购买数
    },
    skuList: [],           // 商品规格
    cart_counts: 0,        //购物车中这个商品的总数量
    cartNum: 0,             //购物车商品数
    userId: '',            //用户uid
    is_vip: false,         //是否是vip用户
    isBack: false,         //如果父页面是购物车，则点击购物车-返回
    isDestruction: true,   //是否跳转到tabbar的购物车
  },
  onShow: function (options) {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      console.log(userInfo.memberInfo);
      that.setData({
        userId: userInfo.memberInfo.uid,
        'headerArr.height': app.globalData.height
      })
    }
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
    that.getCartsNum();
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      if (prevPage.route == 'page/product/pages/carts/carts') {  //父页面是订单详情页
        // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        that.setData({
          isBack: true
        })
      }
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route == 'page/tabBar/store/index'){
          that.setData({
            isDestruction: false
          })
        }
        if (pages[i].route == 'page/product/pages/settlement/settlement'){
          that.setData({
            isDestruction: true
          })
        }
      }
    }
  },
  onUnload: function (options) {
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      if (prevPage.route == 'page/tabBar/store/index') {
        // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
        prevPage.data.is_refresh = false;
      }
    }

  },
  onLoad: function (options) {
    console.log(getCurrentPages());
    const that = this;
    if (options.qb_uid) {
      qb_uid = options.qb_uid;
      qb_mobile = options.mobile;
      ptime = options.ptime;
      md5_sign = options.md5_sign;
    }
    var goods_id;
    var params;
    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      params = app.util.getUrlQuery(scene);
      goods_id = params.goods_id;
    } else {
      goods_id = options.goods_id;
    }
    if (options.share_uid || options.share_tid) {
      share_uid = options.share_uid;
      share_tid = options.share_tid;
    }
    that.setData({
      goods_id: goods_id,
    })
    that.data.is_onload = 1;
    that.getData();
  },
  onShareAppMessage: function () {
    const that = this;
    var visitor_uid = wx.getStorageSync('visitor_uid') || '';
    let image_url = that.data.goodsData.share_pic;
    return {
      // title: that.data.goodsData.title,
      title: that.data.goodsData.share_text,
      imageUrl: image_url,
      path: 'page/product/pages/goods-details/goods-details?goods_id=' + that.data.goods_id + '&share_uid=' + that.data.userId + '&share_tid=' + visitor_uid,
      success: function (res) {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })
      }
    }
  },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    var scene_1 = 0;
    scene_1 = app.util.getScene();
    app.util.request({
      'url': '/xcx/wxjson/goods_one_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        goods_id: that.data.goods_id,
        share_uid: share_uid,
        share_tid: share_tid,
        cj_code: scene_1,
        qb_uid: qb_uid,
        mobile: qb_mobile,
        ptime: ptime,
        md5_sign: md5_sign
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          if (that.data.userId) {
            share_uid = '';
            share_tid = '';
            qb_uid = '';
            qb_mobile = '';
            ptime = '';
            md5_sign = '';
          }
          var goods_info = result.data.goods_info;
          that.setData({
            swiperList: goods_info.pic_url_arr,
            goodsData: goods_info,
            btnStatus: goods_info.is_sell_out
          })
          if (goods_info.is_quota == 0) {
            that.setData({
              'goodsData.quota_num': 10000,
            })
          }
          WxParse.wxParse('goodsContent', 'html', goods_info.content, that, 10);
          let listArr = goods_info.specs;
          that.setData({
            skuList: listArr
          })
          that.setData({
            'goods.goods_id': goods_info.id,
            'goods.goods_name': goods_info.goods_name,
            'goods.sign_url': goods_info.sign_url,
            'goods.vip_status': goods_info.vip_status,
            'goods.is_limit': goods_info.is_quota == 0 ? false : true,
            'goods.limit_num': goods_info.is_quota == 0 ? 0 : goods_info.quota_num,
          })
          if (!that.data.goods.s_price) {
            that.setData({
              'goods.goods_id': goods_info.id,
              'goods.goods_name': goods_info.goods_name,
              'goods.sign_url': goods_info.sign_url,
              'goods.vip_status': goods_info.vip_status,
              'goods.y_price': listArr[0].y_price,
              'goods.s_price': listArr[0].s_price,
              'goods.vip_price': listArr[0].vip_price,
              'goods.e_price': listArr[0].e_price,
              'goods.specs_name': listArr[0].specs_name,
              'goods.specs_img': listArr[0].specs_img,
              'goods.specs_id': listArr[0].id,
            })
          }
          that.typeFunc(e, 0);
          var quota_num = goods_info.quota_num ? parseInt(goods_info.quota_num) : 10001;
          // that.limitNum(quota_num, that.data.goods.count, goods_info.id);

          if (goods_info.vip_status != 1) {   //判断商品价格长度，是否改变商品价格样式
            let num_length = 0;
            if (goods_info.vip_status == 0) {
              num_length = goods_info.vip_price.toString().length + goods_info.sell_price.toString().length + goods_info.original_price.toString().length;
              if (num_length > 18) {
                that.setData({
                  isSmall: true
                })
              }else {
                that.setData({
                  isSmall: false
                })
              }
            } else if (goods_info.vip_status == 2) {
              num_length = goods_info.enjoy_price.toString().length + goods_info.vip_price.toString().length + goods_info.sell_price.toString().length;
              if (num_length > 16) {
                that.setData({
                  isSmall: true
                })
              } else {
                that.setData({
                  isSmall: false
                })
              }
            }
          }
        }
      }
    });
  },
  /*
  * 计算价格长度，判断是否要调整价格样式
  */
  priceStyle: function (e) {
    const that = this;
    let _index = that.data.typeIndex;
    if (that.data.goodsData.vip_status != 1) {
      let num_length = 0;
      if (that.data.goodsData.vip_status == 0) {
        num_length = that.data.skuList[_index].vip_price.toString().length + that.data.skuList[_index].s_price.toString().length + that.data.skuList[_index].y_price.toString().length;
        if (num_length > 18) {
          that.setData({
            isSmall2: true
          })
        }else {
          that.setData({
            isSmall2: false
          })
        }
      } else if (that.data.goodsData.vip_status == 2) {
        num_length = that.data.skuList[_index].e_price.toString().length + that.data.skuList[_index].vip_price.toString().length + that.data.skuList[_index].s_price.toString().length;
        if (num_length > 16) {
          that.setData({
            isSmall2: true
          })
        } else {
          that.setData({
            isSmall2: false
          })
        }
      }
    }
  },
  /*
  *查看大图
  */
  bigPic: function (e) {
    const that = this;
    var src = e.currentTarget.dataset.src;//获取data-src
    var index = e.currentTarget.dataset.index;//获取data-src
    var imgList = e.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: that.data.swiperList // 需要预览的图片http链接列表
    })
  },
  /*
  *查看大图
  */
  bigPic2: function (e) {
    const that = this;
    var src = e.currentTarget.dataset.src;//获取data-src
    // var index = e.currentTarget.dataset.index;//获取data-src
    // var imgList = e.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src] // 需要预览的图片http链接列表
    })
  },
  /*
  *显示/隐藏弹窗
  */
  showFunc: function (e) {
    const that = this;
    if (!that.data.isShow){  //点击加入购物车和点击立即购买
      let _type = e.currentTarget.dataset.type;
      that.setData({
        btn_type: _type
      })
    }
    that.setData({
      isShow: !that.data.isShow
    })
  },
  /*
  *选中规格
  */
  typeFunc: function (e,index) {
    const that = this;
    let type_val = 0
    if (typeof index != 'undefined') {
      type_val = index
    } else {
      type_val = e.currentTarget.dataset.index
    }
    let gcount = 'skuList['+type_val+'].count'
    let gcount2 = 'skuList['+type_val+'].count2'
    let notadd = 'skuList['+type_val+'].notAdd'
    let notadd2 = 'skuList['+type_val+'].notAdd2'
    let max = 'skuList['+type_val+'].max_buy'
    let max2 = 'skuList['+type_val+'].max_buy2'
    that.setData({
      typeIndex: type_val,
      [gcount]: that.data.skuList[type_val].count ? that.data.skuList[type_val].count : 1,
      [notadd]: that.data.skuList[type_val].notAdd ? that.data.skuList[type_val].notAdd : false,
      [gcount2]: that.data.skuList[type_val].count2 ? that.data.skuList[type_val].count2 : 1,
      [notadd2]: that.data.skuList[type_val].notAdd2 ? that.data.skuList[type_val].notAdd2 : false,
      [max]: that.data.skuList[type_val].max_buy ? that.data.skuList[type_val].max_buy : 1,
      [max2]: that.data.skuList[type_val].max_buy2 ? that.data.skuList[type_val].max_buy2 : 1,
      'goods.y_price': that.data.skuList[type_val].y_price,
      'goods.s_price': that.data.skuList[type_val].s_price,
      'goods.vip_price': that.data.skuList[type_val].vip_price,
      'goods.e_price': that.data.skuList[type_val].e_price,
      'goods.specs_name': that.data.skuList[type_val].specs_name,
      'goods.specs_img': that.data.skuList[type_val].specs_img,
      'goods.specs_id': that.data.skuList[type_val].id,
    })
    that.limitNum()
    that.priceStyle();
  },
  /*
  *商品数量加减
  */
  countTab: function (e) {
    const that = this;
    let types = parseInt(e.currentTarget.dataset.types);
    const typeVal = that.data.typeIndex
    const nowSku = that.data.skuList[typeVal]
    const goods = that.data.goods
    const u = 'skuList['+typeVal+'].notAdd'
    const u2 = 'skuList['+typeVal+'].notAdd2'
    const x = 'skuList['+typeVal+'].count'
    const x2 = 'skuList['+typeVal+'].count2'
    nowSku.stock = parseInt(nowSku.stock)
    console.log(that.data.btn_type, nowSku)
    if (that.data.btn_type == 'cart') {
      if (nowSku.notAdd && types == 1){
        wx.showToast({
          icon: 'none',
          title: '抱歉，数量有限，您最多只能购买'+nowSku.max_buy+'件',
        })
        return
      } 
      if (nowSku.max_buy <= 0 && types == -1) {
        that.setData({
          [x]: 1
        })
        return
      }
      if (nowSku.count + types >= nowSku.max_buy) {
        if (nowSku.count + types == nowSku.max_buy) {
          that.setData({
            [x]: parseInt(nowSku.count) + types
          })
        }
        that.setData({
          [u]: true
        })
        return
      }
      if (nowSku.count + types > 0) {
        that.setData({
          [u]: false,
          [x]: parseInt(nowSku.count) + types
        })
      }
    } else {
      if (nowSku.notAdd2 && types == 1){
        wx.showToast({
          icon: 'none',
          title: '抱歉，数量有限，您最多只能购买'+nowSku.max_buy2+'件',
        })
        return
      } 
      if (nowSku.max_buy2 <= 0 && types == -1) {
        that.setData({
          [x2]: 1
        })
        return
      }
      if (nowSku.count2 + types >= nowSku.max_buy2) {
        if (nowSku.count2 + types == nowSku.max_buy2) {
          that.setData({
            [x2]: parseInt(nowSku.count2) + types
          })
        }
        that.setData({
          [u2]: true
        })
        return
      }
      if (nowSku.count2 + types > 0) {
        that.setData({
          [u2]: false,
          [x2]: parseInt(nowSku.count2) + types
        })
      }
    }
  },
  /**
   * 加入购物车
   */
  addCar: function (e) {
    const that = this;
    var goods = that.data.goods;
    const typeVal = that.data.typeIndex
    const nowSku = that.data.skuList[typeVal]
    that.setData({
      'goods.count': that.data.btn_type == 'buy' ? that.data.skuList[that.data.typeIndex].count2 : that.data.skuList[that.data.typeIndex].count
    })
    //判断购物车中的商品实付金额
    if (goods.vip_status === 0){
      goods.pay_price = goods.s_price;
    } else if (goods.vip_status === 1){
      goods.pay_price = goods.vip_price;
    } else if (goods.vip_status === 2){
      goods.pay_price = goods.e_price;
    }
    //goods.isSelect = false;
    var count = that.data.goods.count;
    var title = that.data.goods.goods_name;
    // 获取购物车的缓存数组（没有数据，则赋予一个空数组）  
    var arr = [];
    if (that.data.btn_type == 'buy'){
      arr.push(goods);
      wx.setStorageSync('cart2', arr);
      console.log(arr);
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      if (pages.length > 1) {
        let prevPage = pages[pages.length - 2];
        if (prevPage.route == 'page/product/pages/settlement/settlement') {
          prevPage.data.prev_page = 1;
          wx.navigateBack({});
        }else {
          wx.navigateTo({
            url: '/page/product/pages/settlement/settlement?page_type=1'
          })
        }
      }else {
        wx.navigateTo({
          url: '/page/product/pages/settlement/settlement?page_type=1'
        })
      }
      return;
    }else {
      arr = wx.getStorageSync('cart') || [];
      if (arr.length > 0) {
        // 遍历购物车数组  
        for (var j in arr) {
          // 判断购物车内的item的id，和事件传递过来的id，是否相等  
          if (arr[j].goods_id == goods.goods_id && arr[j].specs_name == goods.specs_name) {
            // 相等的话，给count+1（即再次添加入购物车，数量+1）  
            // console.log(that.data.cart_counts >= that.data.goodsData.quota_num);return;
            // if (that.data.cart_counts >= that.data.goodsData.quota_num) {   //判断是否已经达到限购
            //   arr[j].count = parseInt(arr[j].count) + goods.count - 1;
            // } else {
            //   arr[j].count = parseInt(arr[j].count) + goods.count;
            // }
            if (nowSku.max_buy > 0 && goods.count <= nowSku.max_buy) {
              const z = 'skuList['+typeVal+'].max_buy'
              that.setData({
                'goods.max_buy': nowSku.max_buy - goods.count,
                [z]: nowSku.max_buy - goods.count
              })
              arr[j].count = parseInt(arr[j].count) + goods.count;
            }

            // 最后，把购物车数据，存放入缓存（此处不用再给购物车数组push元素进去，因为这个是购物车有的，直接更新当前数组即可）  
            try {
              wx.setStorageSync('cart', arr);
              that.getCartsNum();
              // var timestamp = Date.parse(new Date());
              // timestamp = timestamp / 1000;
              // wx.setStorageSync('cartTime', timestamp);
            } catch (e) {
              console.log(e)
            }
            //关闭窗口
            that.setData({
              isShow: false
            })
            // app.util.eventFunc(that.data.userId, event_id);
            // wx.removeStorageSync('user_coupon_id');

            // 返回（在if内使用return，跳出循环节约运算，节约性能） 
            return;
          }
        }
        // 遍历完购物车后，没有对应的item项，把goodslist的当前项放入购物车数组  
        if (that.data.cart_counts < that.data.goodsData.quota_num) {
          arr.push(goods);
        }
      } else {
        arr.push(goods);
      }
    }
    
    // 最后，把购物车数据，存放入缓存  
    try {
      wx.setStorageSync('cart', arr);
      that.getCartsNum();
      // 返回（在if内使用return，跳出循环节约运算，节约性能） 
      //关闭窗口
      that.setData({
        isShow: false
      })
      // app.util.eventFunc(that.data.userId, event_id);
      // wx.removeStorageSync('user_coupon_id');
      if (that.data.btn_type == 'buy') {
        wx.switchTab({
          url: '/page/tabBar/cart/index'
        })
      }
      return;
    } catch (e) {
      console.log(e)
    }
  },
  /**
   * 插入商品跳转
  */
  wxParseTagATap: function (e) {
    var href = e.currentTarget.dataset.src;
    //我们可以在这里进行一些路由处理
    wx.navigateTo({
      url: href,
      fail: function () {
        wx.switchTab({
          url: href,
        })
      }
    })
  },
  /**
   * 计算购物车商品数量
  */
  getCartsNum: function(e) {
    const that = this;
    let carts_arr = wx.getStorageSync('cart');
    let num = 0;
    if (carts_arr) {
      carts_arr.forEach(function (val, index) {
        num += parseInt(val.count);
      })
      that.setData({
        cartNum: num
      })
    }else {
      that.setData({
        cartNum: 0
      })
    }
  },
  /**
   * 判断限购数量是否大于购物车数量
  */
  limitNum: function (quota_num, input_num, goods_id) {
    const that = this;
    const skuList = that.data.skuList
    const typeVal = that.data.typeIndex
    const goodsData = that.data.goodsData
    let carts_goods_num = 0 // 购物车当前商品数量
    let carts_sku_num = 0 // 购物车当前商品规格数量
    let max_buy = 0 // 当前规格能购买的最大数
    let max_buy2 = 0 // 当前规格能购买的最大数
    const carts_arr = wx.getStorageSync('cart') || [];
    if (carts_arr.length > 0) {
      carts_arr.forEach(function (val, index) {
        if (val.goods_id == goodsData.id) {
          carts_goods_num += parseInt(val.count)
          if (val.specs_id == skuList[typeVal].id) {
            carts_sku_num += parseInt(val.count)
          }
        }
      })
      // this.cart_counts = cart_counts;
    }
    max_buy = skuList[typeVal].stock - carts_sku_num
    max_buy2 = skuList[typeVal].stock
    if (goodsData.is_quota == 1) {
      goodsData.quota_num = parseInt(goodsData.quota_num)
      console.log(goodsData.quota_num)
      if (skuList[typeVal].stock - carts_sku_num <= goodsData.quota_num - carts_goods_num) {
        max_buy = skuList[typeVal].stock - carts_sku_num
      } else {
        max_buy = goodsData.quota_num - carts_goods_num
      }
      if (goodsData.quota_num <= skuList[typeVal].stock) {
        console.log(goodsData.quota_num, skuList[typeVal].stock)
        max_buy2 = goodsData.quota_num
      }
    }
    let notAdd = false
    let notAdd2 = false
    if (max_buy <= skuList[typeVal].count) {
      notAdd = true
    }
    if (max_buy2 <= skuList[typeVal].count) {
      notAdd2 = true
    }
    const u = 'skuList['+typeVal+'].notAdd'
    const u2 = 'skuList['+typeVal+'].notAdd2'
    const z = 'skuList['+typeVal+'].max_buy'
    const z2 = 'skuList['+typeVal+'].max_buy2'
    that.setData({
      [u]: notAdd,
      [u2]: notAdd2,
      [z]: max_buy,
      [z2]: max_buy2
    })
    console.log(skuList, that.data.goods)
  },
})