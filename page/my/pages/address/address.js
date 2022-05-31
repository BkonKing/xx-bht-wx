var app = getApp();
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '我的地址',
      // goback_pic: '../../image/goback4.png'
    },
    is_onload: 1,          //加载标识，onshow和onload只加载一次数据
    userId: '',            //用户uid   
    page: 1,               //分页页码
    noneHidden: true,      //数据是否为空
    noMoreHidden: true,    //上拉加载更多，没有更多是否隐藏
    defaultId: '',         //默认地址id
    listData: [],          //数据列表
    isSelectAddress: false,//是否选择地址
    userAddId: '',         //选中的地址id
    uname: '',             //选中地址-收货人姓名
    utel: '',              //选中地址-收货人电话
    userAddress: '',       //选中的地址详情
    is_default: false      //是否默认地址
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.data.userId = userInfo.memberInfo.uid
    }
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    if (typeof (options.page_type) != 'undefined') {
      that.setData({
        isSelectAddress: true
      })
    }
    that.data.is_onload = 1;
    that.getData();
  },
  onUnload: function (options) {
    const that = this;
    if (that.data.isSelectAddress && that.data.userAddId){  //判断上个页面是否是进来选择地址并且选中了地址
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      if (pages.length > 1) {
        let prevPage = pages[pages.length - 2];
        //将选中的地址传回上个页面
        prevPage.data.userAddress = that.data.userAddress  
        prevPage.data.userAddId = that.data.userAddId;
        prevPage.data.uname = that.data.uname;
        prevPage.data.utel = that.data.utel;
        prevPage.data.ulabel = that.data.ulabel;
        prevPage.data.isSelectAddress = that.data.isSelectAddress;
        prevPage.data.is_default = that.data.is_default;
      }
    }
  },
  /**
   * 获取后台数据
  */
  getData: function () {
    const that = this;
    that.setData({
      addressList: []
    })
    app.util.request({
      'url': '/xcx/wxjson/address_json',
      'cachetime': '0',
      'data': {
        page: that.data.page,
        uid: that.data.userId,
        cj_code: app.util.getScene()
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            listData: that.data.page == 1 ? result.data.address_list : that.data.listData.concat(result.data.address_list)
          })
          if (result.data.address_list.length == 0 && that.data.page == 1) {
            that.setData({
              noneHidden: false
            })
          }else {
            that.setData({
              noneHidden: true
            })
          }
          if (result.data.address_list.length == 0 && that.data.page > 1) {
            that.setData({
              noMoreHidden: false
            })
          }else {
            that.setData({
              noMoreHidden: true
            })
          }
          let address_arr = that.data.listData;
          console.log(address_arr);
          let address_prev = '';
          for (let j = 0; j < address_arr.length; j++) {
            address_prev = app.util.getArea(address_arr[j].uaddress_detail);
            if (address_arr[j].uaddress_name){
              address_arr[j].address_cont = address_prev + address_arr[j].uaddress_name + address_arr[j].uaddress_house
            }else {
              address_arr[j].address_cont = address_arr[j].uaddress_detail + address_arr[j].uaddress_house
            }
            // address_arr[j].address_prev = app.util.getArea(address_arr[j].uaddress_detail);
          }
          that.setData({
            listData: address_arr
          })
        }
      }
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
      that.listData();
    }
  },
  /**
   * 选择地址
  */
  selectAddress: function (e) {
    const that = this;
    let tabIndex = e.currentTarget.dataset.index;
    let userAddId = that.data.listData[tabIndex].id;
    let uname = that.data.listData[tabIndex].uname;
    let is_default = that.data.listData[tabIndex].is_default;
    let utel = that.data.listData[tabIndex].utel;
    let userAddress = e.currentTarget.dataset.address;
    let ulabel = that.data.listData[tabIndex].ulabel;
    that.data.userAddId = userAddId;
    that.data.userAddress = userAddress;
    that.data.uname = uname;
    that.data.utel = utel;
    that.data.is_default = is_default;
    that.data.ulabel = ulabel;
    wx.navigateBack({})
  },
  /**
   * 跳转
  */
  linkFunc: function (e) {
    const that = this;
    let href_v = e.currentTarget.dataset.url; //跳转地址
    let event_id = e.currentTarget.dataset.eventid; //事件触发id
    app.util.eventFunc(that.data.userId, event_id);
    wx.navigateTo({
      url: href_v,
      success: function () {
      },fail:function(){
        wx.switchTab({
          url: href_v,
        })
      }
    })
  },
  /**
   * 选择收货地址
  */
  selectAdd: function (e) {
    const that = this;
    let select_id = e.currentTarget.dataset.id;
    if (that.data.prev_page == 'index') {
      wx.setStorageSync('index_select_addid', select_id);
    }
    if (that.data.giftbag_id) {
      wx.setStorageSync('giftbag_select_addid', select_id);
    }
    wx.navigateBack();
  },
})