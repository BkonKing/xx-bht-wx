var app = getApp();

Page({
  data: {
    barObj: {
      isBorder: false,
      goback_pic: '/resource/images/goback3.png',
      goindex_pic: '/resource/images/goback5.png'
    },
    userId: '',
    info: {},
    record: [],
    invite_total: '',
    reward: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userId: userInfo.memberInfo.uid
    })
    this.getData()
    this.getRecord()
    this.getAchievement()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: this.data.info.share_link,
      path: 'page/product/pages/new-gift/new-gift?uid=' + this.data.userId,
      imageUrl: this.data.info.share_pic,
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

  // 获取文案信息
  getData() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/getCopy',
      'cachetime': '0',
      data: {
        uid: this.data.userId
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            info: result.info,
          })
        }
      }
    });
  },
  
  // 获取邀请记录
  getRecord() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/getInviteRecord',
      'cachetime': '0',
      data: {
        uid: this.data.userId
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            record: result.info,
          })
        }
      }
    });
  },

    
  // 获取我的成就
  getAchievement() {
    var that = this
    app.util.request({
      'url': '/xcx/invite/getAchievement',
      'cachetime': '0',
      data: {
        invited_uid: this.data.userId
      },
      success(res) {
        let result = res.data;
        if (result.code == '0000') {
          that.setData({
            invite_total: result.invite_total,
            reward: result.reward,
          })
        }
      }
    });
  },
  // 跳转生成海报
  goInvitaionPoster() {
    wx.navigateTo({
      url: '/page/product/pages/invitation-poster/invitation-poster',
    })
  }
})