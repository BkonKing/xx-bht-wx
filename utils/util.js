const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// module.exports = {
//   formatTime: formatTime
// }




import { base64_encode, base64_decode } from 'base64';
import md5 from 'md5';
var util = {};

/**
	场景值
*/
util.getScene = function (option) {
  var wx_scene = wx.getStorageSync('wx_scene');
  wx.removeStorageSync('wx_scene');
  return wx_scene;
}

/**
	返回
*/
util.goBack = function (option) {
  if (option) {
    wx.switchTab({
      url: '/page/tabBar/index/index',
    })
  } else {
    wx.navigateBack({
      success: function () {
      },
      fail: function () {
        wx.switchTab({
          url: '/page/tabBar/index/index',
        })
      }
    });
  }
}

/**
*解决连续点击多次冲出触发事件
*/
util.throttle = function (fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }
  let _lastTime = null
  // 返回新的函数
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)  //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}
/**
   * 截取地址的省市自治区
  */
util.getArea = function (str) {
  let area = { Province: '', City: '', Country: '' }
  let index11 = 0
  let index1 = str.indexOf("省")
  if (index1 == -1) {
    index11 = str.indexOf("自治区")
    if (index11 != -1) {
      area.Province = str.substring(0, index11 + 3)
    } else {
      area.Province = str.substring(0, 0)
    }
  } else {
    area.Province = str.substring(0, index1 + 1)
  }

  let index2 = str.indexOf("市")
  if (index11 == -1) {
    area.City = str.substring(index11 + 1, index2 + 1)
  } else {
    if (index11 == 0) {
      area.City = str.substring(index1 + 1, index2 + 1)
    } else {
      area.City = str.substring(index11 + 3, index2 + 1)
    }
  }

  let index3 = str.lastIndexOf("区")
  if (index3 == -1) {
    index3 = str.indexOf("县")
    area.Country = str.substring(index2 + 1, index3 + 1)
  } else {
    area.Country = str.substring(index2 + 1, index3 + 1)
  }
  return area.Province + area.City + area.Country;
}
/**
   * 数组对象重新排序
  */
util.sortBy = function (property, rev) {
  //第二个参数没有传递 默认升序排列
  if (rev == undefined) {
    rev = 1;
  } else {
    rev = (rev) ? 1 : -1;
  }
  return function (a, b) {
    a = parseFloat(a[property]);
    b = parseFloat(b[property]);
    if (a < b) {
      return rev * -1;
    }
    if (a > b) {
      return rev * 1;
    }
    return 0;
  }
}
/**
   * 参数转换
  */
util.getUrlQuery = function (scene) {
  var urlStr = scene;
  var urlArr = [];
  for (var i = 0; i < urlStr.split(",").length; i++) {
    urlArr.push(urlStr.split(",")[i].split("=")[0] ? urlStr.split(",")[i].split("=")[0] : "");
    urlArr.push(urlStr.split(",")[i].split("=")[1] ? urlStr.split(",")[i].split("=")[1] : "onlyKey")
  }
  if (urlStr == "") {
    return;
  } else {
    var urlObj = {}
    for (var i = 0; i < urlArr.length; i += 2) {
      if (urlArr[i] != "") {
        urlObj[urlArr[i]] = decodeURIComponent(urlArr[i + 1]);
      }
    }
    return urlObj;
  }
},

/**
 * 用户行为数据收集——按钮触发
*/
util.eventFunc = function (uid, event_id) {
  // util.request({
  //   'url': '/xcx/wxjson/event_tap',
  //   'cachetime': '0',
  //   showLoading: false,
  //   data: {
  //     uid: uid,
  //     event_id: event_id,
  //   }
  // });
}

util.orderRefresh = function (uid, event_id) {
  let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
  if (pages.length > 1) {
    let prevPage = pages[pages.length - 2];
    if (prevPage.route == 'page/product/pages/ordinary-order/ordinary-order') {
      // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      prevPage.data.is_refresh = false;
    }
  }
}


util.base64Encode = function (str) {
  return base64_encode(str)
};

util.base64Decode = function (str) {
  return base64_decode(str)
};

util.md5 = function (str) {
  return md5(str)
};



function getQuery(url) {
  var theRequest = [];
  if (url.indexOf("?") != -1) {
    var str = url.split('?')[1];
    var strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      if (strs[i].split("=")[0] && unescape(strs[i].split("=")[1])) {
        theRequest[i] = {
          'name': strs[i].split("=")[0],
          'value': unescape(strs[i].split("=")[1])
        }
      }
    }
  }
  return theRequest;
}
/*
* 获取链接某个参数
* url 链接地址
* name 参数名称
*/
function getUrlParam(url, name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象  
  var r = url.split('?')[1].match(reg);  //匹配目标参数  
  if (r != null) return unescape(r[2]); return null; //返回参数值  
}
/**
	二次封装微信wx.request函数、增加交互体全、配置缓存、以及配合微擎格式化返回数据

	@params option 弹出参数表，
	{
		url : 同微信,
		data : 同微信,
		header : 同微信,
		method : 同微信,
		success : 同微信,
		fail : 同微信,
		complete : 同微信,

		cachetime : 缓存周期，在此周期内不重复请求http，默认不缓存
	}
*/
util.request = function (option) {

  //判断是否有uid、没有则生成一个临时tid
  var app = getApp();
  var visitor_uid = wx.getStorageSync('visitor_uid') || '';
  var userInfo = wx.getStorageSync('userInfo') || '';
  if (userInfo) {
    if (userInfo.memberInfo.is_vip && !userInfo.memberInfo.address_id && userInfo.memberInfo.address_id == null) {
      let pages = getCurrentPages();
      let last_route = pages[pages.length - 1].route;
      if (last_route != 'page/my/pages/information/information' && last_route != 'page/my/pages/address/address' && last_route != 'page/my/pages/address-edit/address-edit') {
        if (last_route == 'page/my/pages/vip/vip'){
          // wx.navigateTo({
          //   url: '/page/my/pages/information/information?prev_page=vip',
          // })
        }else {
          wx.navigateTo({
            url: '/page/my/pages/information/information?prev_page=vip',
          })
        }
      }
    }
  }
  _request(option)
  // if (!visitor_uid && !userInfo) {
  //   wx.request({
  //     'url': app.siteInfo.siteroot + '/xcx/wxjson/tourists',
  //     'method': 'POST',
  //     'header': {
  //       'content-type': 'application/x-www-form-urlencoded'
  //     },
  //     'success': function (res) {
  //       if (res.data.code == '0000') {
  //         wx.setStorageSync('visitor_uid', res.data.data.tid);
  //       }
  //       _request(option)
  //     },
  //     'complete': function (response) {
        
  //     }
  //   })
  // }else {
  //   if (userInfo) {
  //     if (userInfo.memberInfo.is_vip && !userInfo.memberInfo.address_id && userInfo.memberInfo.address_id == null) {
  //       let pages = getCurrentPages();
  //       let last_route = pages[pages.length - 1].route;
  //       if (last_route != 'page/my/pages/information/information' && last_route != 'page/my/pages/address/address' && last_route != 'page/my/pages/address-edit/address-edit'){
  //         wx.navigateTo({
  //           url: '/page/my/pages/information/information?prev_page=my',
  //         })
  //       }
  //     }
  //   }
  //   _request(option)
  // }
}

//request 请求
function _request(option){
  var _ = require('underscore.js');
  var md5 = require('md5.js');
  var app = getApp();
  var option = option ? option : {};
  option.cachetime = option.cachetime ? option.cachetime : 0;
  option.showLoading = typeof option.showLoading != 'undefined' ? option.showLoading : true;
  var sessionid = wx.getStorageSync('userInfo').sessionid;

  if (typeof (wx.getStorageSync('userInfo').memberInfo) != 'undefined') {
    var userInfo = wx.getStorageSync('userInfo');
    var uid = userInfo.memberInfo.id;
    var openid = userInfo.memberInfo.openid;
    option.data.openid = openid;
    option.data.uid = uid;
    option.data.sessionid = sessionid;
  }
  option.data.tid = wx.getStorageSync('visitor_uid') || '';
  option.data.edition = '1.0.2';
  var url = option.url;
  if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {

    url = app.siteInfo.siteroot + url;
  } else {
    url = url;
    //url = app.siteInfo.siteroot + url + '?weid=' + app.siteInfo.uniacid
  }
  //console.log(url);
  wx.showNavigationBarLoading();
  if (option.showLoading) {
    util.showLoading();
  }
  if (option.cachetime) {
    var cachekey = md5(url);
    var cachedata = wx.getStorageSync(cachekey);
    var timestamp = Date.parse(new Date());

    if (cachedata && cachedata.data) {
      if (cachedata.expire > timestamp) {
        if (option.complete && typeof option.complete == 'function') {
          option.complete(cachedata);
        }
        if (option.success && typeof option.success == 'function') {
          option.success(cachedata);
        }
        console.log('cache:' + url);
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        return true;
      } else {
        wx.removeStorageSync(cachekey)
      }
    }
  }
  //console.log(url)
  wx.request({
    'url': url,
    'data': option.data ? option.data : {},
    'header': option.header ? option.header : {},
    'method': option.method ? option.method : 'POST',
    'header': {
      'content-type': 'application/x-www-form-urlencoded'
    },
    'success': function (response) {
      wx.hideNavigationBarLoading();
      if (option.showLoading) {
        wx.hideLoading();
      }
      if (response.data.code != '') {
        if (response.data.code == '0913') {
          wx.setStorageSync('userInfo', '');
          wx.switchTab({
            url: '/page/tabBar/index/index'
          })
          // util.getUserInfo(function () {
          //   util.request(option)
          // });
          return;
        } else {
          if (option.success && typeof option.success == 'function') {
            option.success(response);
          }
          //写入缓存，减少HTTP请求，并且如果网络异常可以读取缓存数据
          if (option.cachetime) {
            var cachedata = { 'data': response.data, 'expire': timestamp + option.cachetime * 1000 };
            wx.setStorageSync(cachekey, cachedata);
          }
        }
      } else {
        if (option.fail && typeof option.fail == 'function') {
          option.fail(response);
        } else {
          if (response.data.message) {
            if (response.data.data != null && response.data.data.redirect) {
              var redirect = response.data.data.redirect;
            } else {
              var redirect = '';
            }
            app.util.message(response.data.message, redirect, 'error');
          }
        }
        return;
      }
    },
    'fail': function (response) {
      wx.hideNavigationBarLoading();
      wx.hideLoading();

      //如果请求失败，尝试从缓存中读取数据
      var md5 = require('md5.js');
      var cachekey = md5(url);
      var cachedata = wx.getStorageSync(cachekey);
      if (cachedata && cachedata.data) {
        if (option.success && typeof option.success == 'function') {
          option.success(cachedata);
        }
        console.log('failreadcache:' + url);
        return true;
      } else {
        if (option.fail && typeof option.fail == 'function') {
          option.fail(response);
        }
      }
    },
    'complete': function (response) {
      // wx.hideNavigationBarLoading();
      // wx.hideLoading();
      if (option.complete && typeof option.complete == 'function') {
        option.complete(response);
      }
    }
  });
}
util.getWe7User = function (cb, code, wxInfo, source) {
  var infoDeatil = wxInfo.userInfo;
  var parent_id = 0;
  if (wx.getStorageSync('parent_id')) {
    var parent_id = wx.getStorageSync('parent_id');
  }

  var userInfo = wx.getStorageSync('userInfo') || {};
  var qb_data = wx.getStorageSync('qb_data') || '';
  var activity_share = wx.getStorageSync('activity_share') || '';
  util.request({
    url: '/xcx/wxjson/xcx_authorize_new',
    data: {
      xcx_code: code ? code : '',
      tag: JSON.stringify(infoDeatil),
      parent_id: parent_id,
      iv: wxInfo.iv,
      encryptedData: wxInfo.encryptedData,
      qb_data: JSON.stringify(qb_data),
      game_share_uid: activity_share,
      source: source || 0
    },
    cachetime: 0,
    showLoading: false,
    success: function (res) {
      console.log(res.data);
      if (res.data.code == '0000') {
        userInfo.sessionid = res.data.data.sessionid;
        userInfo.memberInfo = infoDeatil;
        userInfo.memberInfo.id = res.data.data.uid;
        userInfo.memberInfo.openid = res.data.data.openid;
        userInfo.memberInfo.uid = res.data.data.uid;
        userInfo.memberInfo.mobile = res.data.data.mobile;
        userInfo.memberInfo.address_id = res.data.data.address_id;
        userInfo.memberInfo.is_vip = res.data.data.is_vip;
        wx.setStorageSync('userInfo', userInfo)
      }
      typeof cb == "function" && cb(userInfo);
    }
  });
}
util.upadteUser = function (wxInfo, cb) {
  //console.log(111);
  var userInfo = wx.getStorageSync('userInfo');
  if (!wxInfo) {
    return typeof cb == "function" && cb(userInfo);;
  }
  userInfo.wxInfo = wxInfo.userInfo
  wx.setStorageSync('userInfo', userInfo);
  // util.request({
  //   url: 'auth/session/userinfo',
  //   data: {
  //     signature: wxInfo.signature,
  //     rawData: wxInfo.rawData,
  //     iv: wxInfo.iv,
  //     encryptedData: wxInfo.encryptedData
  //   },
  //   method: 'POST',
  //   header: {
  //     'content-type': 'application/x-www-form-urlencoded'
  //   },
  //   cachetime: 0,
  //   success: function (res) {
  //     console.log(res);
  //     if (!res.data.errno) {
  //       userInfo.memberInfo = res.data.data;
  //       wx.setStorageSync('userInfo', userInfo);
  //     }
  //     typeof cb == "function" && cb(userInfo);
  //   }
  // });
}

/*
* 获取用户信息
*/
util.getUserInfo = function (cb, source) {
  var login = function (wxInfo) {
    //console.log(wxInfo.userInfo);
    var userInfo = {
      'sessionid': '',
      'wxInfo': '',
      'memberInfo': '',
    };
    wx.login({
      success: function (res) {
        //console.log(userInfo);
        if (wxInfo.errMsg == 'getUserInfo:fail auth deny') {
          typeof cb == "function" && cb(userInfo);
        } else {
          util.getWe7User(function (userInfo) {
            // console.log(userInfo);
            if (wxInfo) {
              console.log(1111);
              typeof cb == "function" && cb(userInfo);
              util.upadteUser(wxInfo, function (userInfo) {

                typeof cb == "function" && cb(userInfo);
              })
            } else {
              if (wx.canIUse('getUserProfile')) {
                // 如果可用
                wx.getUserProfile({
                  lang: 'zh_CN',
                  desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                  success: function (wxInfo) {

                    util.upadteUser(wxInfo, function (userInfo) {
                      typeof cb == "function" && cb(userInfo);
                    })
                  },
                  fail: function () {
                    typeof cb == "function" && cb(userInfo);
                  }
                })
              } else {
                typeof cb == "function" && cb(userInfo);
              }
            }
          }, res.code, wxInfo, source)
        }
      },
      fail: function () {
        wx.showModal({
          title: '获取信息失败',
          content: '请允许授权以便为您提供给服务',
          success: function (res) {
            if (res.confirm) {
              util.getUserInfo();
            }
          }
        })
      }
    });
  };

  wx.getUserProfile({
    lang: 'zh_CN',
    desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    success: (res) => {
      wx.setStorageSync('loginTime',1);
      login(res);
    }
  })
  // var userInfo = wx.getStorageSync('userInfo') || {};
  // if (userInfo.sessionid) {
  //   util.checkSession({
  //     success: function () {
  //       if (wxInfo) {
  //         util.upadteUser(wxInfo, function (userInfo) {
  //           typeof cb == "function" && cb(userInfo);
  //         })
  //       } else {
  //         typeof cb == "function" && cb(userInfo);
  //       }
  //     },
  //     fail: function () {
  //       userInfo.sessionid = '';
  //       console.log('relogin');
  //       wx.removeStorageSync('userInfo');
  //       login();
  //     }
  //   })
  // } else {
  //   //调用登录接口
  //   login();
  // }
}

/*
* 手机号授权
*/
util.getMoblie = function (cb, e) {
  var iv_val = e.detail.iv;
  var encryptedData_val = e.detail.encryptedData;
  if (iv_val) {
    wx.login({
      success: function (res) {
        var code_val = res.code;
        util.request({
          'url': '/xcx/wxjson/xcx_mobile',
          'cachetime': '0',
          showLoading: false,
          data: {
            xcx_code: code_val,
            iv: iv_val,
            encryptedData: encryptedData_val
          },
          success(res) {
            if (res.data.code == '0000') {
              typeof cb == "function" && cb(res.data.mobile);
              var userInfo = wx.getStorageSync('userInfo');
              userInfo.memberInfo.mobile = res.data.mobile;
              wx.setStorageSync('userInfo', userInfo);
              wx.showToast({
                title: res.data.msg ? res.data.msg : '手机号授权成功',
                icon: 'none',
                duration: 1500,
                mask: true
              });
            } else {
              // util.getMoblie(cb, e);
              wx.showToast({
                title: res.data.msg ? res.data.msg : '手机号授权失败，请点击重试',
                icon: 'none',
                duration: 2000,
                mask: true
              });
            }
          }
        });
      }
    })
  }
}

/*
* 一次性订阅消息
*/
util.getMessage = function (fn, tmplIds) {
  wx.requestSubscribeMessage({
    tmplIds: tmplIds,
    success(res) {
      // console.log(res);
    }, complete(res) {
      console.log(res);
      typeof fn == "function" && fn();
    }
  })

}

util.navigateBack = function (obj) {
  let delta = obj.delta ? obj.delta : 1;
  if (obj.data) {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - (delta + 1)];
    if (curPage.pageForResult) {
      curPage.pageForResult(obj.data);
    } else {
      curPage.setData(obj.data);
    }
  }
  wx.navigateBack({
    delta: delta, // 回退前 delta(默认为1) 页面
    success: function (res) {
      // success
      typeof obj.success == "function" && obj.success(res);
    },
    fail: function (err) {
      // fail
      typeof obj.fail == "function" && obj.fail(err);
    },
    complete: function () {
      // complete
      typeof obj.complete == "function" && obj.complete();
    }
  })
};

util.footer = function ($this) {
  let app = getApp();
  let that = $this;
  let tabBar = app.tabBar;
  for (let i in tabBar['list']) {
    tabBar['list'][i]['pageUrl'] = tabBar['list'][i]['pagePath'].replace(/(\?|#)[^"]*/g, '')
  }
  that.setData({
    tabBar: tabBar,
    'tabBar.thisurl': that.__route__
  })
};
/*
 * 提示信息
 * type 为 success, error 当为 success,  时，为toast方式，否则为模态框的方式
 * redirect 为提示后的跳转地址, 跳转的时候可以加上 协议名称  
 * navigate:/we7/pages/detail/detail 以 navigateTo 的方法跳转，
 * redirect:/we7/pages/detail/detail 以 redirectTo 的方式跳转，默认为 redirect
*/
util.message = function (title, redirect, type) {
  if (!title) {
    return true;
  }
  if (typeof title == 'object') {
    redirect = title.redirect;
    type = title.type;
    title = title.title;
  }
  if (redirect) {
    var redirectType = redirect.substring(0, 9), url = '', redirectFunction = '';
    if (redirectType == 'navigate:') {
      redirectFunction = 'navigateTo';
      url = redirect.substring(9);
    } else if (redirectType == 'redirect:') {
      redirectFunction = 'redirectTo';
      url = redirect.substring(9);
    } else {
      url = redirect;
      redirectFunction = 'redirectTo';
    }
  }
  console.log(url)
  if (!type) {
    type = 'success';
  }

  if (type == 'success') {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000,
      mask: url ? true : false,
      complete: function () {
        if (url) {
          setTimeout(function () {
            wx[redirectFunction]({
              url: url,
            });
          }, 1800);
        }

      }
    });
  } else if (type == 'error') {
    wx.showModal({
      title: '系统信息',
      content: title,
      showCancel: false,
      complete: function () {
        if (url) {
          wx[redirectFunction]({
            url: url,
          });
        }
      }
    });
  }
}

util.user = util.getUserInfo;

//封装微信等待提示，防止ajax过多时，show多次
util.showLoading = function () {
  var isShowLoading = wx.getStorageSync('isShowLoading');
  if (isShowLoading) {
    wx.hideLoading();
    wx.setStorageSync('isShowLoading', false);
  }

  wx.showLoading({
    title: '加载中',
    complete: function () {
      wx.setStorageSync('isShowLoading', true);
    },
    fail: function () {
      wx.setStorageSync('isShowLoading', false);
    }
  });
}

util.showImage = function (event) {
  var url = event ? event.currentTarget.dataset.preview : '';
  if (!url) {
    return false;
  }
  wx.previewImage({
    urls: [url]
  });
}

/**
 * 转换内容中的emoji表情为 unicode 码点，在Php中使用utf8_bytes来转换输出
*/
util.parseContent = function (string) {
  if (!string) {
    return string;
  }

  var ranges = [
    '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
    '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
    '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
  ];
  var emoji = string.match(
    new RegExp(ranges.join('|'), 'g'));

  if (emoji) {
    for (var i in emoji) {
      string = string.replace(emoji[i], '[U+' + emoji[i].codePointAt(0).toString(16).toUpperCase() + ']');
    }
  }
  return string;
}

util.date = function () {
	/**
	 * 判断闰年
	 * @param date Date日期对象
	 * @return boolean true 或false
	 */
  this.isLeapYear = function (date) {
    return (0 == date.getYear() % 4 && ((date.getYear() % 100 != 0) || (date.getYear() % 400 == 0)));
  }

	/**
	 * 日期对象转换为指定格式的字符串
	 * @param f 日期格式,格式定义如下 yyyy-MM-dd HH:mm:ss
	 * @param date Date日期对象, 如果缺省，则为当前时间
	 *
	 * YYYY/yyyy/YY/yy 表示年份  
	 * MM/M 月份  
	 * W/w 星期  
	 * dd/DD/d/D 日期  
	 * hh/HH/h/H 时间  
	 * mm/m 分钟  
	 * ss/SS/s/S 秒  
	 * @return string 指定格式的时间字符串
	 */
  this.dateToStr = function (formatStr, date) {
    formatStr = arguments[0] || "yyyy-MM-dd HH:mm:ss";
    date = arguments[1] || new Date();
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, date.getFullYear());
    str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100));
    str = str.replace(/MM/, date.getMonth() > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1));
    str = str.replace(/M/g, date.getMonth());
    str = str.replace(/w|W/g, Week[date.getDay()]);

    str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
    str = str.replace(/d|D/g, date.getDate());

    str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
    str = str.replace(/h|H/g, date.getHours());
    str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
    str = str.replace(/m/g, date.getMinutes());

    str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
    str = str.replace(/s|S/g, date.getSeconds());

    return str;
  }


	/**
	* 日期计算  
	* @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒  
	* @param num int
	* @param date Date 日期对象
	* @return Date 返回日期对象
	*/
  this.dateAdd = function (strInterval, num, date) {
    date = arguments[2] || new Date();
    switch (strInterval) {
      case 's': return new Date(date.getTime() + (1000 * num));
      case 'n': return new Date(date.getTime() + (60000 * num));
      case 'h': return new Date(date.getTime() + (3600000 * num));
      case 'd': return new Date(date.getTime() + (86400000 * num));
      case 'w': return new Date(date.getTime() + ((86400000 * 7) * num));
      case 'm': return new Date(date.getFullYear(), (date.getMonth()) + num, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
      case 'y': return new Date((date.getFullYear() + num), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    }
  }

	/**
	* 比较日期差 dtEnd 格式为日期型或者有效日期格式字符串
	* @param strInterval string  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒  
	* @param dtStart Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒
	* @param dtEnd Date  可选值 y 年 m月 d日 w星期 ww周 h时 n分 s秒 
	*/
  this.dateDiff = function (strInterval, dtStart, dtEnd) {
    switch (strInterval) {
      case 's': return parseInt((dtEnd - dtStart) / 1000);
      case 'n': return parseInt((dtEnd - dtStart) / 60000);
      case 'h': return parseInt((dtEnd - dtStart) / 3600000);
      case 'd': return parseInt((dtEnd - dtStart) / 86400000);
      case 'w': return parseInt((dtEnd - dtStart) / (86400000 * 7));
      case 'm': return (dtEnd.getMonth() + 1) + ((dtEnd.getFullYear() - dtStart.getFullYear()) * 12) - (dtStart.getMonth() + 1);
      case 'y': return dtEnd.getFullYear() - dtStart.getFullYear();
    }
  }

	/**
	* 字符串转换为日期对象 // eval 不可用
	* @param date Date 格式为yyyy-MM-dd HH:mm:ss，必须按年月日时分秒的顺序，中间分隔符不限制
	*/
  this.strToDate = function (dateStr) {
    var data = dateStr;
    var reCat = /(\d{1,4})/gm;
    var t = data.match(reCat);
    t[1] = t[1] - 1;
    eval('var d = new Date(' + t.join(',') + ');');
    return d;
  }

	/**
	* 把指定格式的字符串转换为日期对象yyyy-MM-dd HH:mm:ss
	* 
	*/
  this.strFormatToDate = function (formatStr, dateStr) {
    var year = 0;
    var start = -1;
    var len = dateStr.length;
    if ((start = formatStr.indexOf('yyyy')) > -1 && start < len) {
      year = dateStr.substr(start, 4);
    }
    var month = 0;
    if ((start = formatStr.indexOf('MM')) > -1 && start < len) {
      month = parseInt(dateStr.substr(start, 2)) - 1;
    }
    var day = 0;
    if ((start = formatStr.indexOf('dd')) > -1 && start < len) {
      day = parseInt(dateStr.substr(start, 2));
    }
    var hour = 0;
    if (((start = formatStr.indexOf('HH')) > -1 || (start = formatStr.indexOf('hh')) > 1) && start < len) {
      hour = parseInt(dateStr.substr(start, 2));
    }
    var minute = 0;
    if ((start = formatStr.indexOf('mm')) > -1 && start < len) {
      minute = dateStr.substr(start, 2);
    }
    var second = 0;
    if ((start = formatStr.indexOf('ss')) > -1 && start < len) {
      second = dateStr.substr(start, 2);
    }
    return new Date(year, month, day, hour, minute, second);
  }


	/**
	* 日期对象转换为毫秒数
	*/
  this.dateToLong = function (date) {
    return date.getTime();
  }

	/**
	* 毫秒转换为日期对象
	* @param dateVal number 日期的毫秒数 
	*/
  this.longToDate = function (dateVal) {
    return new Date(dateVal);
  }

	/**
	* 判断字符串是否为日期格式
	* @param str string 字符串
	* @param formatStr string 日期格式， 如下 yyyy-MM-dd
	*/
  this.isDate = function (str, formatStr) {
    if (formatStr == null) {
      formatStr = "yyyyMMdd";
    }
    var yIndex = formatStr.indexOf("yyyy");
    if (yIndex == -1) {
      return false;
    }
    var year = str.substring(yIndex, yIndex + 4);
    var mIndex = formatStr.indexOf("MM");
    if (mIndex == -1) {
      return false;
    }
    var month = str.substring(mIndex, mIndex + 2);
    var dIndex = formatStr.indexOf("dd");
    if (dIndex == -1) {
      return false;
    }
    var day = str.substring(dIndex, dIndex + 2);
    if (!isNumber(year) || year > "2100" || year < "1900") {
      return false;
    }
    if (!isNumber(month) || month > "12" || month < "01") {
      return false;
    }
    if (day > getMaxDay(year, month) || day < "01") {
      return false;
    }
    return true;
  }

  this.getMaxDay = function (year, month) {
    if (month == 4 || month == 6 || month == 9 || month == 11)
      return "30";
    if (month == 2)
      if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0)
        return "29";
      else
        return "28";
    return "31";
  }
	/**
	*	变量是否为数字
	*/
  this.isNumber = function (str) {
    var regExp = /^\d+$/g;
    return regExp.test(str);
  }

	/**
	* 把日期分割成数组 [年、月、日、时、分、秒]
	*/
  this.toArray = function (myDate) {
    myDate = arguments[0] || new Date();
    var myArray = Array();
    myArray[0] = myDate.getFullYear();
    myArray[1] = myDate.getMonth();
    myArray[2] = myDate.getDate();
    myArray[3] = myDate.getHours();
    myArray[4] = myDate.getMinutes();
    myArray[5] = myDate.getSeconds();
    return myArray;
  }

	/**
	* 取得日期数据信息  
	* 参数 interval 表示数据类型  
	* y 年 M月 d日 w星期 ww周 h时 n分 s秒  
	*/
  this.datePart = function (interval, myDate) {
    myDate = arguments[1] || new Date();
    var partStr = '';
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    switch (interval) {
      case 'y': partStr = myDate.getFullYear(); break;
      case 'M': partStr = myDate.getMonth() + 1; break;
      case 'd': partStr = myDate.getDate(); break;
      case 'w': partStr = Week[myDate.getDay()]; break;
      case 'ww': partStr = myDate.WeekNumOfYear(); break;
      case 'h': partStr = myDate.getHours(); break;
      case 'm': partStr = myDate.getMinutes(); break;
      case 's': partStr = myDate.getSeconds(); break;
    }
    return partStr;
  }

	/**
	* 取得当前日期所在月的最大天数  
	*/
  this.maxDayOfDate = function (date) {
    date = arguments[0] || new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    var time = date.getTime() - 24 * 60 * 60 * 1000;
    var newDate = new Date(time);
    return newDate.getDate();
  }
};

module.exports = util;