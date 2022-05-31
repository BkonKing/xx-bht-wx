var app = getApp();
var session_info = '';  //验证信息
var scene_val = '';
Page({
  data: {
    barObj: {
      isBorder: false,
      titName: '申请退款',
      // goback_pic: '../../image/goback4.png'
    },

    //弹窗
    modalShow: false,
    modalArr: [],

    //弹窗
    pickerShow: false,
    pickerObj: {},
    selectVal: [0, 0],
    
    page_type: '',         //类型 2申请退款 3申请退款换货
    refund_money: 0,       //最高退款金额
    money_val: 0,          //用户输入退款金额
    nowIndex: '',           //换货原因选中index
    explain_val: '',       //退款说明
    other_explain: '',     //其他说明
    m_days_id: '',         //揽件时间(日期年月日)
    m_days_val: '',        //揽件时间(日期月日)
    m_time_id: '',         //揽件时间（时间段id）
    m_time_val: '',        //揽件时间（时间段值）
    ordinary_id: '',       //订单id
    goodsList: [],         //商品列表
    is_onload: 1,          //加载标识，onshow和onload只加载一次数据
    userId: '',            //用户uid
    isSelectAddress: false,//是否选择地址
    userAddId: '',         //选中的地址id
    uname: '',             //选中地址-收货人姓名
    utel: '',              //选中地址-收货人电话
    userAddress: '',       //选中的地址详情
    pic_arr: [],           //凭证
    img_arr: [],           //凭证
    is_link: false,        //判断页面是否跳转到下个页面
    tmplIds_str: '',
  },
  onShow: function () {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    session_info = userInfo;
    if (userInfo) {
      that.data.userId = userInfo.memberInfo.uid
    }
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
    if (that.data.is_link) {
      wx.navigateBack({
        delta: 2
      })
    }
  },
  onLoad: function (options) {
    const that = this;
    that.data.is_onload = 1;
    that.data.ordinary_id = options.ordinary_id;
    that.setData({
      page_type: options.type
    })
    that.setData({
      'barObj.titName': options.type == 2 ? '申请退款' : '申请退货退款'
    })
    that.getData();
  },
  /**
   * 获取后台数据
   */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/ordinary_refund_goods_json',
      'cachetime': '0',
      'data': {
        uid: that.data.userId,
        cj_code: app.util.getScene(),
        common_id: that.data.ordinary_id,
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.data.tmplIds_str= result.data.tmplIds_str;
          let goods_arr = wx.getStorageSync('goods_arr');
          let refund_money = 0;
          for (let i = 0; i < goods_arr.length; i++) {
            refund_money += parseFloat(goods_arr[i].z_price)
          }
          console.log(goods_arr, refund_money)
          that.setData({
            goodsList: goods_arr,
            pickerObj: result.data.pickerObj,
            modalArr: result.data.reason_list,
            refund_money: refund_money.toFixed(2),
            money_val: that.data.money_val ? that.data.money_val : refund_money.toFixed(2),
          })
          if (that.data.isSelectAddress) {
            console.log(that.data.isSelectAddress);
            that.setData({
              "uname": that.data.uname,
              "utel": that.data.utel,
              "userAddress": that.data.userAddress
            })
            that.data.isSelectAddress = false;
          }
        }
      }
    });
  },
  /**
   * 换货说明
   */
  getExplain: function (e) {
    const that = this;
    that.data.explain_val = e.detail.value.trim();
  },
  /**
   * 退款金额
   */
  getMoney: function (e) {
    const that = this;
    that.setData({
      money_val: e.detail.value.trim()
    })
  },
  /**
   * 退款金额失去焦点
   */
  moneyBlur: function (e) {
    const that = this;
    let money_val = parseFloat(that.data.money_val) ? parseFloat(that.data.money_val) : 0;
    if (money_val > parseFloat(that.data.refund_money)){
      wx.showToast({
        title: '退款金额不能大于' + that.data.refund_money,
        icon: 'none'
      })
      that.setData({
        money_val: that.data.refund_money
      })
    }
    console.log();
  },
  /**
   * 其他说明
   */
  getOther: function (e) {
    const that = this;
    that.data.other_explain = e.detail.value.trim();
  },
  /**
   * 换货原因
   */
  // bindReason: function (e) {
  //   const that = this;
  //   that.setData({
  //     shareMenuHidden: !that.data.shareMenuHidden
  //   })
  // },
  // getReason: function (e) {
  //   const that = this;
  //   let tapText = e.currentTarget.dataset.text;
  //   that.setData({
  //     reasonVal: tapText
  //   })
  //   that.isAble();
  //   that.bindReason();
  // },
  /**
   * 上传图片
   */
  uploadPic: function () {
    const that = this;
    that.data.pic_arr = [];
    var pic_arr
    if (that.data.img_arr.length < 5) {
      let count = 5 - that.data.img_arr.length;
      wx.chooseImage({
        count: count, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          // success
          that.setData({
            img_arr: that.data.img_arr.concat(res.tempFilePaths)
          })
          if (that.data.img_arr.length > 0) {
            for (var i = 0; i < that.data.img_arr.length; i++) {
              wx.uploadFile({
                url: app.siteInfo.siteroot + '/xcx/wxvipjson/upload_barter_pic',
                filePath: that.data.img_arr[i],
                name: 'pjimg',
                formData: {
                  num: i,
                  uid: that.data.userId,
                  sessionid: session_info.sessionid,
                  openid: session_info.memberInfo.uid
                },
                header: {
                  "Content-Type": "multipart/form-data",
                  'accept': 'application/json',
                  'Authorization': 'Bearer ..'    //若有token，此处换上你的token，没有的话省略
                },
                success: function (res) {

                  var jsonStr = res.data;
                  jsonStr = jsonStr.replace(" ", "");

                  if (typeof jsonStr != 'object') {
                    jsonStr = jsonStr.replace(/\ufeff/g, "");//重点
                    var jj = JSON.parse(jsonStr);
                    res.data = jj;
                  }
                  that.data.pic_arr = that.data.pic_arr.concat(res.data.data);
                  // that.isAble();
                  console.log(that.data.pic_arr);
                }
              })
            }
          }
        }
      })
    } else {
      wx.showToast({
        title: '最多上传五张图片',
        icon: 'none',
        duration: 2000
      });
    }
  },
  deleteImg: function (e) {
    const that = this;
    const imgs = that.data.img_arr;
    const urls = that.data.pic_arr;
    const index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    urls.splice(index, 1);
    that.setData({
      img_arr: imgs,
    });
    that.data.pic_arr = urls;
    // that.isAble();
  },
  submitFunc: function (e) {
    const that = this;
    if (that.data.nowIndex === '' || that.data.nowIndex == undefined) {
      wx.showToast({
        title: '请选择换货原因',
        icon: 'none'
      })
      return;
    }
    let goodsList = that.data.goodsList;
    let id_arr = [];
    for (let i = 0; i < goodsList.length; i++) {
      id_arr.push(goodsList[i].id);
    }
    if (that.data.page_type==2){  //只退款不退货
      
      app.util.request({
        'url': '/xcx/wxvipjson/common_refund_askfor',
        'cachetime': '0',
        'data': {
          uid: that.data.userId,
          common_id: that.data.ordinary_id,
          common_goods_ids: id_arr.join(','),
          reason_type: that.data.modalArr[that.data.nowIndex].id,
          refund_price: that.data.money_val,
          reason_text: that.data.explain_val,
          pic: that.data.pic_arr.join(','),
        },
        success(res) {
          if (res.data.code == '0000') {
            that.data.is_link = true;
            wx.removeStorageSync('goods_arr');
            wx.navigateTo({
              url: '/page/product/pages/ordinary-refund-details/ordinary-refund-details?refund_id=' + res.data.refund_id + '&common_id=' + that.data.ordinary_id,
            })
          } else {
            wx.showToast({
              title: result.msg,
              icon: 'none',
              duration: 1500
            })
            setTimeout(function () {
              wx.navigateBack({
                delta: 2
              })
            }, 1500)
          }
        }
      });
    }else{//退款并退货
      if (!that.data.m_days_id) {
        wx.showToast({
          title: '请选选择上门揽件时间',
          icon: 'none'
        })
        return;
      }
      if (!that.data.userAddId) {
        wx.showToast({
          title: '请选选择取件地址',
          icon: 'none'
        })
        return;
      }
      app.util.getMessage(function () {
        app.util.request({
          'url': '/xcx/wxvipjson/common_returnrefund_askfor',
          'cachetime': '0',
          'data': {
            uid: that.data.userId,
            common_id: that.data.ordinary_id,
            common_goods_ids: id_arr.join(','),
            reason_type: that.data.modalArr[that.data.nowIndex].id,
            refund_price: that.data.money_val,
            reason_text: that.data.explain_val,
            pic: that.data.pic_arr.join(','),
            m_days: that.data.m_days_id,
            m_time: that.data.m_time_id,
            userAddId: that.data.userAddId,
            take_name: that.data.uname,
            take_mobile: that.data.utel,
            take_address: that.data.userAddress,
            other_explain: that.data.other_explain,
          },
          success(res) {
            if (res.data.code == '0000') {
              that.data.is_link = true;
              wx.removeStorageSync('goods_arr');
              wx.navigateTo({
                url: '/page/product/pages/ordinary-refund-details/ordinary-refund-details?returnrefund_id=' + res.data.returnrefund_id + '&common_id=' + that.data.ordinary_id,
              })
            } else {
              wx.showToast({
                title: result.msg,
                icon: 'none',
                duration: 1500
              })
              setTimeout(function () {
                wx.navigateBack({
                  delta: 2
                })
              }, 1500)
            }
          }
        });
      }, that.data.tmplIds_str);
    }
  },
  /**
   * 判断提交按钮是否能够点击
  */
  // isAble: function (e) {
  //   const that = this;
  //   if (that.data.reasonVal == '请选择' || that.data.reasonVal == '' || that.data.img_arr.length < 1 || that.data.textVal == '') {
  //     that.setData({
  //       btnDisabled: true
  //     })
  //   } else {
  //     that.setData({
  //       btnDisabled: false
  //     })
  //   }
  // },
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
      urls: that.data.img_arr // 需要预览的图片http链接列表
    })
  },
  /**
   * 不太满意原因展开/隐藏
  */
  modalFunc: function (e) {
    const that = this;
    console.log(that.data.modalShow);
    that.data.nowIndex = e.currentTarget.dataset.index;
    that.setData({
      modalShow: true
    })
  },
  /**
   * 模态框数据回调
  */
  modalCall: function (e) {
    console.log(e.detail)
    const that = this;
    that.setData({
      modalShow: false,
      nowIndex: e.detail.index
    })
    console.log(that.data.nowIndex);
  },
  /**
   * 时间选择器
  */
  pickerTime: function (e) {
    this.setData({
      pickerShow: true
    })
  },
  /**
   * picker自定义组件回调
  */
  pickerCall: function (e) {
    const that = this;
    // that.data.pickerShow = false;
    console.log(e.detail[0], e.detail[1])
    let col1_key = e.detail[0];
    let col2_key = e.detail[1];
    let col1 = that.data.pickerObj['col1'];
    let col2 = that.data.pickerObj['col2'];
    console.log(col2);
    let m_days_id = col1[col1_key].id;
    let m_days_val = col1[col1_key].value;
    let m_time_id = col2[col2_key].id;
    let m_time_val = col2[col2_key].value;
    that.data.m_time_id = m_time_id;
    that.data.m_days_id = m_days_id;
    that.setData({
      m_days_val: m_days_val,
      m_time_val: m_time_val
    })
  },
  /**
   * 跳转
  */
  linkFunc: app.util.throttle(function (e) {
    const that = this;
    console.log(e);
    let _href = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: _href,
    })
  }, 1000),
})