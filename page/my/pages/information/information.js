var app = getApp();
var scene_val  = '';   //场景值
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '个人信息',
      // goback_pic: '../../image/goback4.png',
      information_back: true
    },
    //弹窗
    modalShow: false,
    modalArr: [
      {
        id: 1,
        modalStr: '男',
        index: 0,
      },
      {
        id: 2,
        modalStr: '女'
      }
    ],

    //弹窗
    pickerShow: false,
    pickerTit: '出生年月',
    pickerObj: {
      
    },
    selectVal: [100, 0],
    is_onload: 1,       //加载标识，onshow和onload只加载一次数据

    userName: '',       //姓名
    userSexVal: 0,      //性别 0/1/2
    userSex: '',        //性别 未知/男/女
    userBirthday: '',   //生日（年月）
    userYear: '',       //生日（年）
    userMonth: '',      //生日（月）
    userTel: '',        //手机号
    userAddress: '',    //收货地址
    userAddId: '',      //收货地址id
    userId: '',         //用户uid
    isSelectAddress: false, //地址页面是否已经选择了地址
    page_status: 0,     //父页面 1、vip 2、my
  },

  onShow: function () {
    const that = this;
    if (that.data.is_onload == 1) {
      that.data.is_onload = 2;
    } else {
      that.getData();
    }
    if (that.data.isSelectAddress){
      that.setData({
        userAddress: that.data.userAddress
      })
      that.formSubmit("address", that.data.userAddId);
    }
    // let userAddId = that.data
  },
  onLoad: function (options) {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.data.userId = userInfo.memberInfo.uid;
    }
    if (typeof options.prev_page != 'undefined') {
      if (options.prev_page=="my"){
        that.setData({
          "barObj.information_back": false,
          page_status: 2
        })
      } else if (options.prev_page == "vip"){
        that.setData({
          "barObj.information_back": true,
          page_status: 1
        })
      }
    }
    that.data.is_onload = 1;
    that.getData();
  },

  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/information_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: app.util.getScene()
      },
      success(res) {
        let result = res.data;
        console.log(result.data.user_info);
        if (result.code == '0000') {
          let user_info = result.data.user_info;
          let sexVal = "";
          if (user_info.gender == 1) {
            sexVal = "男";
          } else if (user_info.gender == 2) {
            sexVal = "女";
          }
          that.setData({
            userName: user_info.realname,  
            userSex: sexVal,    
            userTel: user_info.mobile,     
            userAddId: user_info.address_id,   
            pickerObj: result.data.pickerObj
          })
          var userInfo = wx.getStorageSync('userInfo');
          userInfo.memberInfo.address_id = user_info.address_id;
          wx.setStorageSync('userInfo', userInfo);
          if (user_info.year){
            let selectVal = [];
            selectVal[0] = user_info.year - 1900;
            selectVal[1] = user_info.month - 1;
            that.setData({
              userBirthday: user_info.year + "年" + user_info.month + "月",
              selectVal: selectVal
            })
          }
          let userAddress = "";
          if (user_info.user_address){  //判断是否有收货地址
            if (user_info.user_address.uaddress_name){
              userAddress = app.util.getArea(user_info.user_address.uaddress_detail) + user_info.user_address.uaddress_name + user_info.user_address.uaddress_house
            }else {
              userAddress = user_info.user_address.uaddress_detail + user_info.user_address.uaddress_house;
            }
            that.setData({
              userAddress: userAddress
            })
          }else {
            that.setData({
              userAddress: ''
            })
          }
        }
      }
    });
  },

  /**
   * 姓名输入框失去焦点
  */
  nameSubmit: function (e) {
    const that = this;
    console.log(e.detail.value);
    if (e.detail.value.trim() !== ''){
      that.formSubmit("name", e.detail.value);
    }
  },
  /**
   * 性别展开/隐藏
  */
  modalFunc: function (e) {
    const that = this;
    that.setData({
      modalShow: !that.data.modalShow
    })
  },
  /**
   * 模态框数据回调
  */
  modalCall: function (e) {
    console.log(e.detail)
    const that = this;
    that.data.modalShow = false;
    that.data.userSexVal = e.detail.id;
    that.setData({
      userSex: e.detail.modalStr
    })
    that.formSubmit("sex", that.data.userSexVal);
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
    console.log(e.detail);
    that.setData({
      selectVal: e.detail,
      userBirthday: that.data.pickerObj['col1'][e.detail[0]].value + that.data.pickerObj['col2'][e.detail[1]].value,
    })
    that.data.userYear  = that.data.pickerObj['col1'][e.detail[0]].id;
    that.data.userMonth = that.data.pickerObj['col2'][e.detail[1]].id;
    that.formSubmit("birthday", [that.data.userYear, that.data.userMonth]);
  },
  /**
   * 获取用户手机号
  */
  getPhoneNumber(e) {
    const that = this;
    app.util.getMoblie(function (telNum) {
      //返回telNum为用户手机号
      that.setData({
        userTel: telNum
      })
    }, e);
  },
  /**
   * 提交
  */
  formSubmit: function (data_name = "", edit_val = "") {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/information_edit',
      'cachetime': '0',
      'data': {
        data_name: data_name,
        edit_val: edit_val,
      },
      success(res) {
        if (that.data.isSelectAddress ){
          var userInfo = wx.getStorageSync('userInfo');
          userInfo.memberInfo.address_id = that.data.userAddId;
          wx.setStorageSync('userInfo', userInfo);
        }
        that.data.isSelectAddress = false
      }
    });
  },
  /**
   * 标题栏返回按钮回调
  */
  topbarCall(e) {
    const that = this;
    // app.util.eventFunc(that.data.userId, );
    if (that.data.userTel && that.data.userAddId){
      app.util.goBack();
    }else{
      console.log(that.data.page_status);
      if (that.data.page_status == 1) {
        wx.showToast({
          title: '请选择收货地址',
          icon: 'none'
        })
      } else if (that.data.page_status == 2){
        app.util.goBack();
      }
    }
  }
})