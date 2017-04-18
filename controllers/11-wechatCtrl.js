var config = require('../config'),
    request = require('request'),
    xml2js = require('xml2js'),
    moment = require('moment'),
    commonFunc = require('../middlewares/commonFunc'),
    Consumption = require('../models/consumption'),
    Wechat = require('../models/wechat')
;

var wxApis = {
	oauth_access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token',
  unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  baseToken: 'https://api.weixin.qq.com/cgi-bin/token',
  getticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'
};



var wxApiUserObject = config.wxDeveloperConfig.ybt;

exports.getCode = function(req, res, next) {
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
  		access_token: body.access_token,
  		expires_in: body.expires_in,
  		refresh_token: body.refresh_token,
  		openid: body.openid,
  		scope: body.scope,
  		unionid: body.unionid,
  		api_type: 1
  	}

  	var wechat = new Wechat(wechatData);
  	wechat.save(function(err, newWechat) {
  		
      
      req.orderObject = {
        openid: newWechat.openid,
        oid: state
      };
      next();
  	});

  });
}


exports.getPaymentOrder = function(req, res, next) {
  var query = {
    _id: req.orderObject.oid,
    orderStatus: 1
  };

  Consumption.getOne(query, function(err, consItem) {
    if (consItem) {
      req.orderObject['order'] = {
        orderSn: consItem.outRecptNum,
        payAmount: parseFloat(consItem.money || 0),
        goods_detail: []
      };

      for(var i =0; i < consItem.items.length; i++) {
        req.orderObject['order'].goods_detail.push({
          goods_id: consItem.items[i].pdId,
          wxpay_goods_id: consItem.items[i].pdSn,
          goods_name: consItem.items[i].pdSn,
          quantity: consItem.items[i].pdQuantity,
          price: consItem.items[i].pdPrice
        });
      }    

      next();
    } else {
      return res.status(422).send('订单不存在');
    }
    
  })
}


exports.addOrder = function(req, res) {
  var orderObject = req.orderObject || {};
  
  
  

  console.log('orderObject', orderObject);
  var currentDate = new Date();
  var ymdhms = moment(currentDate).format('YYYYMMDDhhmmss');
  var out_trade_no = orderObject.order.orderSn;
  var total_fee = parseInt(orderObject.order.payAmount * 100);
  

  var detail = '<![CDATA[{"goods_detail":' + JSON.stringify(orderObject.order.goods_detail) + '}]]>';

  var paramData = {
    appid: wxApiUserObject.appid,
    mch_id: wxApiUserObject.merchantid,
    
    nonce_str: commonFunc.randomString(32),
    
    
    
    
    body: 'order-' + out_trade_no,
    attach: orderObject.oid,
    
    out_trade_no: out_trade_no + '-' + commonFunc.getRandomSn(4),
    
    total_fee: total_fee,
    spbill_create_ip: req.ip,
    time_start: ymdhms,
    
    
    notify_url: 'http://app.xiaoyangbao.net/wxmp/paynotifyurl',
    trade_type: 'JSAPI',
    
    openid: orderObject.openid
  };

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.sign = commonFunc.convertToMD5(signStr, true);

  /*var xmlString = '<xml>';
  for(var key in paramData) {
    xmlString += '<'+ key +'>'+ paramData[key] +'</'+ key +'>';
  }
  xmlString += '</xml>';*/

  var xmlBuilder = new xml2js.Builder({rootName: 'xml', headless: true});
  
  
  var xmlString = xmlBuilder.buildObject(paramData);
  
  

  request({
    url: wxApis.unifiedorder,
    method: 'POST',
    body: xmlString
  }, function(err, response, body){
    
    if (!err && response.statusCode == 200) {       
      var parser = new xml2js.Parser();
      var data = {};
      parser.parseString(body, function(err, result) {        
        data = result || {};
      });

      

        
        res.redirect('/zbtong/?#/shopping/wxpay/'+ orderObject.oid +'/' + data.xml.prepay_id);
      
      
    }

    

  });


}


exports.wxpayRawParams = function(req, res, next) {
  var rawData = [];
  var rawString = [];
  var size = 0;
  req.on('data', function (data) {
    rawString.push(data.toString('utf-8'));
    rawData.push(data);
    size += data.length;
  });

  req.on('end', function () {
    req.rawString = rawString.join('');
    req.rawData = Buffer.concat(rawData, size);
    next();
  });
  
}

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


exports.testResult = function(req, res) {
  var paramData = { appid: 'wxae84ab761b5ee65b',
     attach: 'zbtong',
     bank_type: 'CFT',
     cash_fee: '1',
     fee_type: 'CNY',
     is_subscribe: 'Y',
     mch_id: '1389918702',
     nonce_str: 'TfDPx84K4m0RjzlsGT1bNfSBmHbZtoA5',
     openid: 'o71oKwnagg2PRuZGkb1SBveDXPqc',
     out_trade_no: '201612060416501929-9756',
     result_code: 'SUCCESS',
     return_code: 'SUCCESS',
     sign: '2481D6AC05E338AFDA83E8797204DF28',
     time_end: '20161210194313',
     total_fee: '1',
     trade_type: 'JSAPI',
     transaction_id: '4002832001201612102389975166' };

  var sign = paramData.sign;
  delete paramData.sign;

  var signStr = commonFunc.rawSort(paramData);
  signStr = signStr + '&key=' + wxApiUserObject.merchantkey;
  
  var genSign = commonFunc.convertToMD5(signStr, true);
  console.log(genSign, '=', sign);

  return res.status(200).send('okkkk');
}


exports.wxSendPayment = function(req, res) {
  

  var paramData = {
    appId: wxApiUserObject.appid, 
    timeStamp: commonFunc.createTimestamp(), 
    nonceStr: commonFunc.createNonceStr(), 
    package: 'prepay_id=' + req.body.pid, 
    signType: 'MD5'
  };

  var paySignStr = commonFunc.rawSort(paramData);
  
  paySignStr = paySignStr + '&key=' + wxApiUserObject.merchantkey;
  
  paramData.paySign = commonFunc.convertToMD5(paySignStr, true);
  
  
  res.json({ results: {
    
    timestamp: paramData.timeStamp,
    nonceStr: paramData.nonceStr,
    package: paramData.package,
    signType: paramData.signType,
    paySign: paramData.paySign
  }});
}