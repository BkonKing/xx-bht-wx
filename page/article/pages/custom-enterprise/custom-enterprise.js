var app = getApp();
var scene_val = '';   //场景值
var WxParse = require('../../../../resource/wxParse/wxParse.js');
Page({
  data: {
    barObj: {
      isBorder: true,
      titName: '企业定制',
      // goback_pic: '../../image/goback4.png'
    },

    //图片列表
    pageData: '',       //页面数据
    userId: '',         //用户uid
  },
  onShow: function () {
    const that = this;
    scene_val = app.util.getScene();
    if (scene_val > 0) {
      that.getData();
    }
  },
  onLoad: function (options) {
    const that = this;
    scene_val = app.util.getScene();
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.memberInfo.uid != 0 && userInfo.memberInfo != '') {
      that.data.userId = userInfo.memberInfo.uid;
    }
    that.getData();
  },
  // },
  /**
   * 获取后台数据
  */
  getData: function (e) {
    const that = this;
    app.util.request({
      'url': '/xcx/wxjson/custom_json',
      'cachetime': '0',
      data: {
        uid: that.data.userId,
        cj_code: scene_val
      },
      success(res) {
        let result = res.data;
        console.log(result.data.article_info.content);
        if (result.code == '0000') {
          WxParse.wxParse('articleContent', 'html', result.data.article_info.content, that, 10);
          that.data.pageData = result.data.article_info;
        }
      }
    });
  },
  /**
   * 下载需求清单
  */
  downloadFunc: function (e) {
    const that = this;
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: ['https://bht.liwushijian.com/library/img/xcx_img/listing_pic.jpg'] // 需要预览的图片http链接列表
    })
    return;
    wx.downloadFile({
      url: 'https://bht.liwushijian.com/library/img/xcx_img/bht.docx', 
      success(res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          console.log(res);
          const filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            success: function (res) {
              console.log('打开文档成功')
            }
          })
        }
      }, fail(res) {
        console.log(res);
      }
    })
  },

  /**
   * 插入商品跳转
  */
  wxParseTagATap: function (e) {
    var href = e.currentTarget.dataset.src;
    console.log(href);
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
})