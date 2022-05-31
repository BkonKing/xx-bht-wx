var app = getApp();
var scene_val = '';   //场景值
// 引入SDK核心类
// var QQMapWX = require('../../resource/js/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk;

Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '添加/编辑地址',
      // goback_pic: '../../image/goback4.png'
    },
    switchChecked: false,    //设置默认是否选择 false
    swalHidden: true,        //自定义标签弹窗是否隐藏 true
    labelIndex: 0,           //标签选择 0、自定义 1、家 2、公司 3、学校(提交后台)
    swalIndex: 0,            //弹窗标签选择 0、自定义 1、家 2、公司 3、学校
    customVal: '',           //自定义标签值
    labelVal: '',            //标签值
    labelValPost:'',         //标签值(提交后台)
    isLabel: 0,              //已经选择了地址标签

    userId: '',              //用户uid
    btnDisabled: true,       //保存按钮是否能点击
    uname: '',               //用户名
    utel: '',                //手机号
    uaddress_name: '',       //收货地址名称
    uaddress_detail: '',     //收货地址详情
    uaddress_house: '',      //收货地址门牌号
    lat: '',                 //经度
    lng: '',                 //纬度
    addrId: '',              //上个页面传的地址id
    // addHide: true,
    // mapHide: false,
    // addressList: [],
    ulatitude: '',            //经度
    ulongitude: '',           //纬度
    key_word: '附近',
    qqmapkey: '',
    markHidden: true,
  },
  onShow: function () {
    const that = this;
    scene_val = app.util.getScene();
    if (scene_val > 0) {
      that.getData(0);
    }
  },
  onLoad: function (options) {
    const that = this;
    scene_val = app.util.getScene();
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.data.userId = userInfo.memberInfo.uid;
    }
    if (typeof (options.addrId) != 'undefined') {
      that.setData({
        addrId: options.addrId
      })
    }
    that.getData(1);

    // that.GetSetting();
    // var userInfo = wx.getStorageSync('userInfo');
    // if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
    //   that.data.userId = userInfo.memberInfo.uid;
    // } else {
    //   wx.getSetting({
    //     success: (res) => {
    //       if (res.authSetting['scope.userInfo'] == false) {
    //         wx.showModal({
    //           title: '提示',
    //           content: '允许小程序获取您的用户信息后才可使用小程序',
    //           showCancel: false,
    //           success: function (res2) {
    //             if (res2.confirm) {
    //               wx.openSetting({
    //                 success: function (res3) {
    //                   if (res3.authSetting["scope.userInfo"] == true) {
    //                     that.setData({
    //                       loginModelHidden: false,
    //                     })
    //                     wx.removeStorageSync('userInfo');

    //                   }
    //                 }
    //               })
    //             }
    //           }
    //         })
    //       } else {
    //         wx.removeStorageSync('userInfo');
    //         that.setData({
    //           loginModelHidden: false,
    //         })
    //       }
    //     }
    //   })
    // }
    
    if (typeof (options.addcity) != 'undefined') {
      that.setData({
        ucity: options.addcity + ' ' + options.addinfo,
        // ucity: options.addrId,
      });
    }
  },
  
  // onShareAppMessage: function () {
  //   return {
  //     title: app.siteInfo.name,
  //     path: 'ypuk_lwsj/pages/index/index',
  //     imageUrl: 'https://www.liwushijian.com/library/img/share_img.png',
  //     success: function (res) {
  //       wx.showToast({
  //         title: '转发成功',
  //         icon: 'success',
  //         duration: 1000,
  //         mask: true
  //       })
  //     }
  //   }
  // },
  /**
   * 获取微信地址
  */
  GetWechatAdr: function () {
    const that = this;
    wx.chooseAddress({
      success: function (res) {
        console.log(res);
        that.setData({
          uname: res.userName,
          utel: res.telNumber,
          uaddress_name: '',
          uaddress_detail: res.provinceName + res.cityName + res.countyName + res.detailInfo,
          uaddress_house: '',
        })
        that.data.lat = '';
        that.data.lng = '';
        that.isAble();
        // that.atuoGetLocation();
      }, fail: function (res) {
        wx.authorize({
          scope: 'scope.address',
          success() {
          }, fail() {
            wx.showModal({
              title: '"不荒唐"需要获取您的通讯地址',
              content: '不荒唐希望获得您的通讯地址，以为您提供更好的服务！',
              showCancel: false,
              success: function (res2) {
                if (res2.confirm) {
                  wx.openSetting({
                    success: function (data) {
                      console.log("openSetting success");
                    },
                    fail: function (data) {
                      console.log("openSetting fail");
                    }
                  });
                }
              }
            })
          }
        })
      }
    })
  },
  /**
   * 获取姓名
  */
  nameFunc: function (e) {
    const that = this;
    console.log(that.data.uname);
    that.setData({
      uname: e.detail.value
    })
    that.isAble();
  },
  /**
   * 获取电话号码
  */
  telFunc: function (e) {
    const that = this;
    that.setData({
      utel: e.detail.value
    })
    that.isAble();
  },
  /**
   * 门牌号
  */
  houseFunc: function (e) {
    const that = this;
    that.setData({
      uaddress_house: e.detail.value
    })
    that.isAble();
  },
  /**
   * 提交
  */
  formSubmit: function (e) {
    const that = this;
    //console.log(adds);return;
    //判断是否有漏填
    // if (adds.name == '' || that.data.utel == '' || adds.uaddress_city == '' || adds.address == '') {
    //   wx.showModal({
    //     title: '提示',
    //     content: '所有项均为必填项，请检查填写完整信息',
    //     showCancel: false
    //   })
    //   return false;
    // }
    that.setData({
      btnDisabled: true
    })
    app.util.request({
      'url': '/xcx/wxjson/edit_address',
      'cachetime': '0',
      'data': {
        add_id: that.data.addrId,
        uname: that.data.uname,
        utel: that.data.utel,
        uaddress_name: that.data.uaddress_name,
        uaddress_detail: that.data.uaddress_detail,
        uaddress_house: that.data.uaddress_house,
        ulabel_id: that.data.labelValPost ? that.data.labelIndex : '',
        ulabel: that.data.labelValPost,
        is_default: that.data.switchChecked ? 1 : 0,
        lat: that.data.lat,
        lng: that.data.lng,
        uid: that.data.userId,
      },
      success(res) {
        that.setData({
          btnDisabled: false
        })
        var status = res.data.code;
        if (status == '0000') {
          wx.showToast({
            title: '保存成功！',
            duration: 2000
          });
          wx.navigateBack();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },
  /**
   * 获取修改地址信息
  */
  getData: function (is_refresh) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/address_info_json',
      'cachetime': '0',
      'data': {
        uid: that.data.userId,
        add_id: that.data.addrId,
        is_refresh: is_refresh,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        if (result.code = "0000" && is_refresh){
          if (result.data.address_info){
            let info = result.data.address_info;
            console.log(info);
            that.setData({
              btnDisabled: false,
              uname: info.uname,
              utel: info.utel,
              uaddress_name: info.uaddress_name,
              uaddress_detail: info.uaddress_detail,
              uaddress_house: info.uaddress_house,
              labelIndex: info.ulabel_id,
              swalIndex: info.ulabel_id,
              switchChecked: info.is_default==1 ? true : false,
              labelVal: info.ulabel,
              labelValPost: info.ulabel,
              lat: info.lat,
              lng: info.lng
            })
            if (result.data.address_info.ulabel_id === 0){
              that.data.customVal = result.data.address_info.ulabel;
            }
            if (result.data.address_info.ulabel_id !== "" && result.data.address_info.ulabel !== ""){
              that.setData({
                isLabel: 1
              })
            }
          }
        }
      }
    });
  },
  /**
   * 定位
  */
  // addmap: function (e) {
  //   var that = this;
  //   that.setData({
  //     addHide: false,
  //     mapHide: true,
  //   })
  // },
  /**
   * 腾讯地图接口
  */
  // GetLocation: function () {
  //   const that = this;
  //   wx.getLocation({
  //     type: 'gcj02',
  //     success: function (res) {
  //       that.data.ulatitude = res.latitude;
  //       that.data.ulongitude = res.longitude;
  //       const ulatitude = that.data.ulatitude;
  //       const ulongitude = that.data.ulongitude;

  //       // 调用接口
  //       qqmapsdk.search({
  //         keyword: that.data.key_word,  //搜索关键词
  //         location: {
  //           latitude: ulatitude,
  //           longitude: ulongitude
  //         },  //设置周边搜索中心点
  //         success: function (res) { //搜索成功后的回调
  //           var mks = []
  //           for (var i = 0; i < res.data.length; i++) {
  //             mks.push({ // 获取返回结果，放到mks数组中
  //               title: res.data[i].title,
  //               id: res.data[i].id,
  //               latitude: res.data[i].location.latitude,
  //               longitude: res.data[i].location.longitude,
  //               iconPath: "/resources/my_marker.png", //图标路径
  //               width: 20,
  //               height: 20
  //             })
  //           }
  //           that.setData({ //设置markers属性，将搜索结果显示在地图中
  //             // markers: mks
  //           })
  //         },
  //         fail: function (res) {
  //           console.log(res);
  //         },
  //         complete: function (res) {
  //           console.log(res.data);
  //           that.setData({
  //             addressList: res.data
  //           })
  //           console.log(res);
  //         }
  //       });
  //     }, fail: function (res) {
  //       that.setData({
  //         markHidden: false
  //       })
  //     }, complete: function (res) {
  //       // that.GetBusinessList();
  //     }
  //   })
  // },
  inputTxet: function (e) {
    var value = e.detail.value;
    this.setData({
      key_word: value,
    })
    if (e.currentTarget.dataset.key_word == "") {
      wx.showToast({
        title: '请输入内容',
        icon: 'success',
        duration: 1000
      })
    } else {
      var that = this;
      that.GetLocation();
    }
  },
  getadd: function (e) {
    var that = this;
    var addid = e.currentTarget.dataset.addkey;
    var resadd = that.data.addressList[addid];
    that.setData({
      ucity: resadd.ad_info.province + resadd.ad_info.city + resadd.ad_info.district + resadd.title,
      addHide: true,
      mapHide: false,
    })
    that.data.lat = resadd.location.lat;
    that.data.lng = resadd.location.lng;
    that.isAble();
  },
  /**
   * 腾讯地图key
  */
  // GetSetting: function () {
  //   const that = this;
  //   app.util.request({
  //     'url': '/xcx/wxjson/setting',
  //     'cachetime': '0',
  //     'data': {
  //       uid: that.data.userId
  //     },
  //     success(res) {
  //       if (res.data.code == '0000') {
  //         qqmapsdk = new QQMapWX({
  //           key: res.data.data.qqmapkey // 必填
  //         });
  //         that.GetLocation();
  //       }
  //     }
  //   });
  // },
  atuoGetLocation(e) {
    const that = this;
    qqmapsdk.geocoder({
      address: that.data.ucity + that.data.uaddress_city,   //用户输入的地址（注：地址中请包含城市名称，否则会影响解析效果），如：'北京市海淀区彩和坊路海淀西大街74号'
      success: res => {
        that.data.lng = res.result.location.lng;
        that.data.lat = res.result.location.lat;
      },
      fail: res => {
        console.log(1111);
      },
    })
  },
  /**
   * 判断提交按钮是否能够点击
  */
  isAble: function (e) {
    const that = this;
    if (that.data.uname.trim() == '' || that.data.utel.trim() == '' || that.data.uaddress_detail == '' || that.data.uaddress_house == '') {
      that.setData({
        btnDisabled: true
      })
    } else {
      that.setData({
        btnDisabled: false
      })
    }
  },
  /**
   * 隐藏设置弹窗
  */
  // maskFunc: function (e) {
  //   const that = this;
  //   that.setData({
  //     markHidden: true
  //   })
  //   wx.navigateBack();
  // },
  /**
   * 设置结果
  */
  handler: function (e) {
    const that = this;
    if (e.detail.authSetting["scope.userLocation"]) {
      that.setData({
        markHidden: true
      })
      // that.GetLocation();
    }
  },
  /**
   * 设置默认
  */
  defaultFunc: function (e) {
    const that = this;
    that.setData({
      switchChecked: !that.data.switchChecked
    })
  },
  /**
   * 删除地址
  */
  delAddress: function (e) {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除吗？',
      success: function (res) {
        if (res.confirm) {
          app.util.request({
            'url': '/xcx/wxjson/del_address',
            'cachetime': '0',
            'data': {
              add_id: that.data.addrId,
              uid: that.data.userId
            },
            success(res) {
              var result = res.data;
              if (result.code == '0000') {
                wx.navigateBack({})
              } else {
                wx.showToast({
                  title: result.msg,
                  duration: 2000
                });
              }
            }
          });
        }
      }
    });
  },
  /**
   * 地址选择
  */
  chooseAddress: function (e) {
    const that = this;
    wx.chooseLocation({
      success(res) {
        console.log(res);
        that.setData({
          uaddress_name: res.name,
          uaddress_detail: res.address,
          uaddress_house: '',
        })
        that.data.lat = res.latitude;
        that.data.lng = res.longitude;
        that.isAble();
      },fail(res){
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              wx.authorize({
                scope: 'scope.userLocation',
                success() {
                }, fail() {
                  wx.showModal({
                    title: '"不荒唐"需要获取您的地理位置',
                    content: '不荒唐希望获得您的地理位置，以为您提供更好的服务！',
                    showCancel: false,
                    success: function (res2) {
                      if (res2.confirm) {
                        wx.openSetting({
                          success: function (data) {
                            console.log("openSetting success");
                          },
                          fail: function (data) {
                            console.log("openSetting fail");
                          }
                        });
                      }
                    }
                  })
                }
              })
            }
          }
        })
        // wx.authorize({
        //   scope: 'scope.address',
        //   success() {
        //   }, fail() {
        //     wx.showModal({
        //       title: '"礼物时间"需要获取您的微信地址信息',
        //       content: '礼物时间希望获得您的微信地址信息，以为您提供更好的服务3333！',
        //       showCancel: false,
        //       success: function (res2) {
        //         if (res2.confirm) {
        //           wx.openSetting({
        //             success: function (data) {
        //               console.log("openSetting success");
        //             },
        //             fail: function (data) {
        //               console.log("openSetting fail");
        //             }
        //           });
        //         }
        //       }
        //     })
        //   }
        // })
      }
    })
  },
  /**
   * 自定义标签弹窗
  */
  swalFunc: function (e) {
    const that = this;
    if (typeof e.currentTarget.dataset.nohide !== "undefined" && e.currentTarget.dataset.nohide) {
      that.setData({
        swalHidden: false
      })
    } else {
      that.setData({
        swalHidden: !that.data.swalHidden
      })
    }

  },
  /**
   * 勾选标签（弹窗）
  */
  selectLabel: function (e) {
    const that = this;
    console.log(e);
    let swalIndex = e.currentTarget.dataset.index;
    that.setData({
      swalIndex: swalIndex
    })
    if (swalIndex!=0){
      // that.setData({
      //   customVal: ''
      // })
    }
  },
  /**
   * 标签选择
  */
  labelSelect: function (e) {
    const that = this;
    console.log(e.currentTarget.dataset.index)
    let labelIndex = e.currentTarget.dataset.index;
    that.setData({
      labelIndex: labelIndex,
    })
    that.data.labelVal = e.currentTarget.dataset.val;
    that.data.labelValPost = e.currentTarget.dataset.val;
  },
  /**
   * 获取自定义标签值
  */
  getCustomVal: function (e) {
    const that = this;
    that.data.customVal = e.detail.value.trim()
    that.data.labelVal = e.detail.value.trim();
  },
  /**
   * 标签选择确定
  */
  sureFunc: function (e) {
    const that = this;
    if (that.data.swalIndex == 0 && that.data.customVal == '') {
      wx.showToast({
        title: '请填写自定义值',
        icon: 'none',
        duration: 1000,
        mask: true
      })
    } else {
      let labelArr = [that.data.customVal, '家', '公司', '学校'];
      that.setData({
        labelVal: labelArr[that.data.swalIndex],
        swalHidden: !that.data.swalHidden,
        isLabel: 1,
        labelValPost: labelArr[that.data.swalIndex],
        labelIndex: that.data.swalIndex
      })
    }
  },
})