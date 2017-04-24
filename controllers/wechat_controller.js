var request = require('request'),
    xml2js = require('xml2js'),
    https = require('https');

var config = require('../config'),
    commonFunc = require('../middlewares/commonFunc')

// appid: wx8a6a43fb9585fb7c;secret: b23a4696c3b0c9b506891209d2856ab2

var wxApis = {
  // 获取用户信息的access_token
  oauth_access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token',
  // 统一下单
  unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  // 请求调用微信接口 需要的access_token
  baseToken: 'https://api.weixin.qq.com/cgi-bin/token',
  // 请求调用微信接口 需要的ticket
  getticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
  getusercode:'https://open.weixin.qq.com/connect/oauth2/authorize',
  refresh_token:'https://api.weixin.qq.com/sns/oauth2/refresh_token',
  getuserinfo:'https://api.weixin.qq.com/sns/userinfo',
  verifyaccess_token:'https://api.weixin.qq.com/sns/auth',
  // 查询订单
  orderquery:'https://api.mch.weixin.qq.com/pay/orderquery',
  // 关闭订单
  closeorder:'https://api.mch.weixin.qq.com/pay/closeorder',
  // 申请退款
  refund:'https://api.mch.weixin.qq.com/secapi/pay/refund',
  // 查询退款
  refundquery:'https://api.mch.weixin.qq.com/pay/refundquery'

};

var wxApiUserObject = config.wxDeveloperConfig.zdyyszbzx;


// exports.getAccessToken = function (req, res) {
//     // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

//     request.get({
//         url: 'https://api.weixin.qq.com/cgi-bin/token?' + 
//         'grant_type=client_credential' +  
//         '&appid=' + wxApiUserObject.appid + 
//         '&secret=' + wxApiUserObject.appsecret,
//         json: true
//     }, function (err, response, body) {
//         if(err){
//             return res.status(403).send('获取授权失败' + err.errmsg);
//         }
//         res.json({results:body});
        
//     });
// };



// exports.getAccessTokenMid = function (req, res, next) {
//     // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

//     request.get({
//         url: 'https://api.weixin.qq.com/cgi-bin/token?' + 
//         'grant_type=client_credential' +  
//         '&appid=' + wxApiUserObject.appid + 
//         '&secret=' + wxApiUserObject.appsecret,
//         json: true
//     }, function (err, response, body) {
//         if(err){
//             return res.status(403).send('获取授权失败' + err.errmsg);
//         }
//         req.wxTokenObj = body;
//         next();
//     });
// };


// exports.wxJsApiTicket = function(req, res, next) {

//   var api_url = wxApis.getticket + '?access_token=' + req.wxTokenObj.access_token + '&type=jsapi';

//   request({
//     method: 'GET',
//     url: api_url,
//     json: true
//   }, function(err, response, body) {

//     req.ticketObject = {
//       errcode: body.errcode,
//       errmsg: body.errmsg,
//       jsapi_ticket: body.ticket,
//       expires_in: body.expires_in
//     };
//    next();
//   });
// }



exports.settingConfig = function(req, res) {
  var ticketObject = req.wxToken || {};
  var request_url = req.query.url;

  var paramData = {
    url: request_url,
    timestamp: commonFunc.createTimestamp(),
    noncestr: commonFunc.createNonceStr(),
    jsapi_ticket: ticketObject.jsapi_ticket
  };

  var signstr = commonFunc.rawSort(paramData);
  var signature = commonFunc.convertToSha1(signstr, false);


  res.json({results: {
    debug: false,
    appId: wxApiUserObject.appid,
    timestamp: paramData.timestamp,
    nonceStr: paramData.noncestr,
    signature: signature,
    jsApiList: []
  }});
}


exports.gettokenbycode = function(req,res,next) {//获取用户信息的access_token
    var paramObject = req.query || {};

    var code = paramObject.code;
    var state = paramObject.state;

    var url = wxApis.oauth_access_token + '?appid=' + wxApiUserObject.appid
            + '&secret=' + wxApiUserObject.appsecret
            + '&code=' + code
            + '&grant_type=authorization_code';

    request.get({
    url: url,
    json: true
    }, function (err, response, body) {
        if (err) return res.status(401).send('换取网页授权access_token失败!');
        
        var wechatData = {
            access_token: body.access_token, //获取用户信息的access_token
            expires_in: body.expires_in,
            refresh_token: body.refresh_token,
            openid: body.openid,
            scope: body.scope//,
            // unionid: body.unionid,
            // api_type: 1
        }
        if(wechatData.scope == 'snsapi_base')
        {
            return res.json({results:wechatData})
        }
        else if (wechatData.scope == 'snsapi_userinfo')
        {
            req.wechatData = wechatData;
            req.state = state;

            next();
        }
      });
};

exports.refresh_token = function(req,res,next) {
    var refresh_Token = req.query.refresh_token;

    var api_url = wxApis.refresh_token + '?appid=' + paramData.appid + '&grant_type=refresh_token' + '&refresh_token=' + refresh_Token;

    request({
        method: 'GET',
        url: api_url,
        json: true
    }, function(err, response, body) {
        var wechatData = {
            access_token: body.access_token, //获取用户信息的access_token
            expires_in: body.expires_in,
            refresh_token: body.refresh_token,
            openid: body.openid,
            scope: body.scope//,
            // unionid: body.unionid,
            // api_type: 1
        }
        res.json(wechatData);
        next();
    });
};

exports.verifyaccess_token = function(req,res,next) {//获取用户信息的access_token
    var openid = req.query.openid;
    var access_token = req.query.access_token;//获取用户信息的access_token

    var api_url = wxApis.verifyaccess_token + '?access_token=' + access_token + '&openid=' + openid;

    request({
        method: 'GET',
        url: api_url,
        json: true
    }, function(err, response, body) {
        var wechatData = {
            access_token: body.access_token, //获取用户信息的access_token
            expires_in: body.expires_in,
            refresh_token: body.refresh_token,
            openid: body.openid,
            scope: body.scope
        }
        if (body.errcode == 0) 
        {
            res.json(wechatData)
            next()
        }
        else{
            return res.status(401).send('验证access_token失败!');
        }
    });
};

exports.getuserinfo = function(req,res) {
    var openid = req.wechatData.openid;
    var access_token = req.wechatData.access_token;//获取用户信息的access_token

    var api_url = wxApis.getuserinfo + '?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN';

    request({
        method: 'GET',
        url: api_url,
        json: true
    }, function(err, response, body) {
        var wechatData = {
            openid: body.openid,
            nickname: body.nickname,
            sex: body.sex,
            province: body.province,
            city: body.city,
            country: body.country,
            headimgurl: body.headimgurl,
            privilege:body.privilege,
            unionid:body.unionid
        }
        res.json({results:wechatData})
    });
};


// 订单相关方法
// 获取系统订单信息
exports.getPaymentOrder = function(req, res, next) {
  var query = {
    orderNo: req.query.orderNo
  };

  Order.getOne(query, function(err, item) {
    if (err) {
      return res.status(500).send(err.errmsg);
    }
    if(item){
      var orderObject = {};
      orderObject['orderNo'] = orderNo;
      orderObject['goodsInfo'] = item.goodsInfo;
      orderObject['money'] = item.money;
      orderObject['attach'] = req.status;
      req.orderObject = orderObject;
      next();
    }
    else{
      return res.status(422).send('订单不存在');
    }
    
  });
}


// 统一下单   请求api获取prepay_id的值
exports.addOrder = function(req, res, next) {
  var orderObject = req.orderObject || {};
  console.log('orderObject', orderObject);

  var currentDate = new Date();
  var ymdhms = moment(currentDate).format('YYYYMMDDhhmmss');
  var out_trade_no = orderObject.orderNo; 
  var total_fee = parseInt(orderObject.money); 
  

  var detail = '<![CDATA[{"goods_detail":' + JSON.stringify(orderObject.goodsInfo) + '}]]>';

  var paramData = {
    appid: wxApiUserObject.appid,   // 公众账号ID
    mch_id: wxApiUserObject.merchantid,   // 商户号
    
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    
    
    body: 'order-' + out_trade_no,    // 商品描述
    attach: orderObject.attach,    // 附加数据   state
    
    out_trade_no: out_trade_no + '-' + commonFunc.getRandomSn(4),   // 商户订单号
    
    total_fee: total_fee,   // 标价金额
    spbill_create_ip: req.ip,   // 终端IP
    time_start: ymdhms,     // 交易起始时间
    // 异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数。
    notify_url: 'http://app.xiaoyangbao.net/wxmp/paynotifyurl',   // 通知地址
    trade_type: 'JSAPI',    // 交易类型
    openid: req.wechatData.openid    // 用户标识
  };

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.sign = commonFunc.convertToMD5(signStr, true);    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  var xmlString = xmlBuilder.buildObject(paramData);

  request({
    url: wxApis.unifiedorder,
    method: 'POST',
    body: xmlString
  }, function(err, response, body){
    var prepay_id = '';

    if (!err && response.statusCode == 200) {       
      var parser = new xml2js.Parser();
      var data = {};
      parser.parseString(body, function(err, result) {        
        data = result || {};
      });

      // 微信生成的预支付会话标识，用于后续接口调用中使用，该值有效期为2小时
      prepay_id = data.xml.prepay_id;
      req.prepay_id = prepay_id;
      next();

      // res.redirect('/zbtong/?#/shopping/wxpay/'+ orderObject.oid +'/' + data.xml.prepay_id);
    }
    else{
      return res.status(500).send('Error');
    }
  });
}

// 生成微信PaySign，用于发起微信支付请求
exports.getPaySign = function(req, res, next) {
  prepay_id = req.prepay_id;

  var wcPayParams = {
    "appId" : wxApiUserObject.appid,     //公众号名称，由商户传入
    "timeStamp" : commonFunc.createTimestamp,         //时间戳，自1970年以来的秒数
    "nonceStr" : commonFunc.createNonceStr, //随机串
    // 通过统一下单接口获取
    "package" : "prepay_id="+prepay_id,
    "signType" : "MD5"        //微信签名方式
  };

  var signStr = commonFunc.rawSort(wcPayParams);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  wcPayParams.paySign = commonFunc.convertToMD5(signStr, true);  //微信支付签名

  res.json({ results: {
    timestamp: paramData.timeStamp,
    nonceStr: paramData.nonceStr,
    package: paramData.package,
    signType: paramData.signType,
    paySign: paramData.paySign
  }});
}


// 查询订单
exports.getWechatOrder = function(req, res) {
  
  var paramData = {
    appid: wxApiUserObject.appid,   // 公众账号ID
    mch_id: wxApiUserObject.merchantid,   // 商户号
    out_trade_no : req.query.orderNo,     // 商户订单号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type : 'MD5'
  };

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.sign = commonFunc.convertToMD5(signStr, true);    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  var xmlString = xmlBuilder.buildObject(paramData);

  request({
    url: wxApis.orderquery,
    method: 'POST',
    body: xmlString
  }, function(err, response, body){
    if (!err && response.statusCode == 200) {       
      res.json({results:body});
    }
    else{
      return res.status(500).send('Error');
    }
  });
}

// 关闭订单
exports.closeWechatOrder = function(req, res) {
  
  var paramData = {
    appid: wxApiUserObject.appid,   // 公众账号ID
    mch_id: wxApiUserObject.merchantid,   // 商户号
    out_trade_no : req.query.orderNo,     // 商户订单号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type : 'MD5'
  };

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.sign = commonFunc.convertToMD5(signStr, true);    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  var xmlString = xmlBuilder.buildObject(paramData);

  request({
    url: wxApis.closeorder,
    method: 'POST',
    body: xmlString
  }, function(err, response, body){
    if (!err && response.statusCode == 200) {       
      res.json({results:body});
    }
    else{
      return res.status(500).send('Error');
    }
  });
}

// 申请退款
exports.refund = function(req, res) {
  
  // 请求参数
  var paramData = {
    appid: wxApiUserObject.appid,   // 公众账号ID
    mch_id: wxApiUserObject.merchantid,   // 商户号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type : 'MD5',
    out_trade_no : req.query.orderNo,     // 商户订单号
    out_refund_no : req.query.out_refund_no,
    total_fee: total_fee,
    refund_fee: refund_fee,
    op_user_id: wxApiUserObject.merchantid // 默认为商户号
  };

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.sign = commonFunc.convertToMD5(signStr, true);    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  var xmlString = xmlBuilder.buildObject(paramData);


  // https请求  //  refund:'/secapi/pay/refund',
  var options = {
    hostname: 'api.mch.weixin.qq.com',
    port: 443,
    path: '/secapi/pay/refund',
    method: 'POST',
    // key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
    cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
  };

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      // process.stdout.write(d);
      res.json({results:d});
    });
  });
  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
}


// 查询退款
exports.refundquery = function(req, res) {
  
  var paramData = {
    appid: wxApiUserObject.appid,   // 公众账号ID
    mch_id: wxApiUserObject.merchantid,   // 商户号
    nonce_str: commonFunc.randomString(32),   // 随机字符串
    sign_type : 'MD5',
    out_trade_no : req.orderNo,     // 商户订单号
  };

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.sign = commonFunc.convertToMD5(signStr, true);    // 签名
  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  var xmlString = xmlBuilder.buildObject(paramData);

  request({
    url: wxApis.refundquery,
    method: 'POST',
    body: xmlString
  }, function(err, response, body){
    if (!err && response.statusCode == 200) {       
      res.json({results:body});
    }
    else{
      return res.status(500).send('Error');
    }
  });
}





// 需要修改？？？
exports.checkWxPaySign = function(req, res, next) {

  var rawString = req.rawString;  

  var parser = new xml2js.Parser({explicitArray: false});
  var data = {};

  parser.parseString(rawString, function(err, result) {        
    if (err) {
      return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
    }
    data = (result && result.xml) || {};
  });


  if (data.result_code == 'SUCCESS' && data.return_code == 'SUCCESS') {
    var sign = data.sign;
    delete data.sign;
    var signStr = commonFunc.rawSort(data);
    signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
    var genSign = commonFunc.convertToMD5(signStr, true);

    if ( sign == genSign) {   
      data.sign = sign;
      req.payDataObject = data;   
      next();
    } else {
      return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
    }
  } else {
    return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
  }

}

// 需要修改
exports.operatorPayResult = function(req, res) {
  var payDataObject = req.payDataObject;
  var ordersn = payDataObject.out_trade_no.split('-')[0];
  var currentDate = new Date();

  var query = {
    consType: 'selfshopping',
    outRecptNum: ordersn,
    'orderStatus': 1
  }

  var upObj = {
    '$set': {
      orderStatus: 2,
    },
    '$push': {
      orderPayment: {
        payType: 3,
        payName: '微信支付-公众号支付-' + wxApiUserObject.appid,
        payPrice: payDataObject.total_fee,
        payNo: payDataObject.transaction_id,
        payInceAmountType: payDataObject.trade_type,
        payInceIdNo: payDataObject.openid,
        payInceID: payDataObject.mch_id,
        payInceAmountText: payDataObject.out_trade_no
      }
    }
  }


  Consumption.updateOne(query, upObj, function(err, upCons) {
    
    if (err || !upCons) {
      return res.status(422).send('<xml><return_code><![CDATA[error]]></return_code><return_msg><![CDATA[error]]></return_msg></xml>');
    } else {
      return res.status(422).send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
    }    
  });

  
}












































exports.wxTestApi = function (req, res) {
    // console.log(req.query);

    var ts = req.query.timestamp,
        sig = req.query.signature,
        nonce = req.query.nonce,
        echostr = req.query.echostr;

    var token = 'qbtest';

    // var sa = _.sortBy([ts, nonce, token], function(t){ return t; });  // 字典排序
    // console.log(sa);

    var sha1Gen = crypto.createHash('sha1');
    var input = [ts, nonce, token].sort().join('');  // .sort()对数组元素进行字典排序, .join('')必须加参数空字符''
    // console.log(input);
    var sha1 = sha1Gen.update(input).digest('hex');
    // console.log(sha1 + '\n' + sig);

    if (sha1 === sig) {
        res.status(200).send(echostr);  // 必须返回echostr, 不是true
    }
    else {
        res.sendStatus(400);
    }
};

exports.wxTestApiP = function (req, res) {
    console.log(req.body);

    
};

// https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbeefa0d0e1830e92&redirect_uri=http%3A%2F%2Fweb.go5le.net/wx/getUserInfo&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect
// https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbeefa0d0e1830e92&redirect_uri=http%3A%2F%2F7jxklkd7dv.proxy.qqbrowser.cc/v1/wx/getUserInfo&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect
exports.wxGetUserInfo = function (req, res) {
    // console.log(req.query);
    if (!req.query.code) {
        return res.status(400).send('用户未授权!');
    }

    // 这里可以查询appid=wxbeefa0d0e1830e92是否存在有效期内的access_token, 有的话就直接使用, 
    // 没有的话就用refresh_token重新获取(同样要检查refresh_token是否过期, 没有或过期的话就用下面的完整代码重新获取)

    request.get({
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token?' + 
        'appid=' + req.wxToken.appid + 
        '&secret=' + req.wxToken.secret + 
        '&code=' + req.query.code + 
        '&grant_type=authorization_code',
        json: true
    }, function (err, res1, body) {
        // console.log(body);
        if (!body.access_token || !body.openid) {
            return res.status(400).send('未获取令牌!');
        }

        // 这里可以保存body.access_token/body.expires_in/body.refresh_token, 以备重复调用

        request.get({
            url: 'https://api.weixin.qq.com/sns/userinfo?' + 
            'access_token=' + body.access_token + '&' + 
            'openid=' + body.openid + '&' + 
            'lang=zh_CN',
            json: true
        }, function (err, res2, body) {
            // console.log(body);
            if (!body.nickname) {
                return res.status(400).send('用户信息获取错误!');
            }

            // 这里可以根据获取的用户信息生成新的账号并登陆或直接登陆(unionid或openid在本地系统已经存在则直接登陆, 否则生成新账号并登陆)
            // var emuToken = '这里要被替换成真正的token, 可以根据openid查询本地系统中是否已经有该用户, 有的话就新生成一个token, 没有就新建一个用户并返回token, 下面带token参数访问/zh页面, 可以进行自动登录';
            // console.log('http://web.go5le.net/zh?token=' + emuToken);
            res.redirect(301, 'http://web.go5le.net/zh/#/login?token=token');  // 这里不能用中文? 
        });
    });
};

// 服务器端返回wx.config的所有参数
exports.wxJsSdkConfig = function (req, res) {
    // console.log(req.query);
    if (!req.wxToken) {
        return res.status(404).send('微信令牌不存在!');
    }

    var noncestr = randomstring.generate(16),
        jsapi_ticket = req.wxToken.jsapi_ticket,
        timestamp = Math.floor(Date.now() / 1000),
        // origin = req.get('origin') && 
        //          req.get('origin').match(/^https?:\/\/.*/) && 
        //          req.get('origin') || 
        //          (req.get('referer') && req.get('referer').match(/^https?:\/\/.*/) && req.get('referer')) ||
        //          req.get('host'),
        // host = origin.replace(/^https?:\/\/([^\/]*)\/?.*?\/?$/, '$1'),
        // domain = host.replace(/^.*?\./, '')
        // url = origin + req.originalUrl.substr(1)
        url = req.query.url
        ;

    // return res.send(url);

    var lookup = {};
    // lookup[noncestr] = 'noncestr';
    // lookup[jsapi_ticket] = 'jsapi_ticket';
    // lookup[timestamp] = 'timestamp';
    // lookup[url] = 'url';
    lookup['noncestr'] = noncestr;
    lookup['jsapi_ticket'] = jsapi_ticket;
    lookup['timestamp'] = timestamp;
    lookup['url'] = url;

    var sha1Gen = crypto.createHash('sha1');
    var sortedParams = ['jsapi_ticket', 'noncestr', 'timestamp', 'url'].sort();  // .sort()对数组元素进行字典排序
    var input = sortedParams[0] + '=' + lookup[sortedParams[0]] + '&' + sortedParams[1] + '=' + lookup[sortedParams[1]] + '&' + sortedParams[2] + '=' + lookup[sortedParams[2]] + '&' + sortedParams[3] + '=' + lookup[sortedParams[3]];
    // console.log(input);
    var sha1 = sha1Gen.update(input).digest('hex');

    res.json({
        // lookup: lookup,
        // input: input,
        results: {
            // debug: true, // 开启调试模式 调用的所有api的返回值会在客户端alert出来, 若要查看传入的参数, 可以在pc端打开, 参数信息会通过log打出, 仅在pc端时才会打印.
            appId: req.wxToken.appid, // 必填, 公众号的唯一标识
            timestamp: timestamp, // 必填, 生成签名的时间戳
            nonceStr: noncestr, // 必填, 生成签名的随机串
            signature: sha1,// 必填, 签名, 见附录1
            // jsApiList: ['chooseImage', 'previewImage', 'uploadImage'] // 必填, 需要使用的JS接口列表, 所有JS接口列表见附录2
        }
    });
};

// 服务器端获取微信临时素材
exports.wxJsSdkReqMedia = function (req, res, next) {
    // console.log(req.query);
    if (!req.wxToken) {
        return res.status(404).send('微信令牌不存在!');
    }

    var img = req.body.img;
    var d = new Date();
    var yyyy = moment(d).format('YYYY');
    var mm = moment(d).format('MM');
    var dd = moment(d).format('DD');
    var dest = path.join(__dirname, '../public/upload/sinokorea', yyyy, mm, dd);
    fs.ensureDirSync(dest);
    var name = 'sk_' + req.body.fileName.replace(/\s+/g, '-').toLowerCase().replace(/\.jpg/, '') + '_' + Date.now() + '.jpg';
    var filePath = dest + '/' + name;
    // console.log(dest);

    request
        .get('https://api.weixin.qq.com/cgi-bin/media/get?access_token=' + req.wxToken.token + '&media_id=' + img)
        .on('response', function (res) {
            // console.log(res.statusCode) // 200
            // console.log(res.headers['content-type']) // 'image/jpeg'
        })
        .on('error', function (err) {
            console.log(err)
        })
        .pipe(fs.createWriteStream(filePath))
        .on('close', function () {  // 没有参数传入
            // return res.json({results: img});
            req.body.file = {
                path: filePath,
                name: name
            };
            next()
        });
};