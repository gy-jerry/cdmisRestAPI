// var mongodb = require('../helpers/mongodb');
var config = require('../config'),
    MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto');
var request = require('request');
var mongoose = require('mongoose');
var wechatSchema = new mongoose.Schema({
  token: {
    type: String,
    require: true
  },
  expires_in: {
    type: Number
  },
  jsapi_ticket: {
    type: String,
  },
  api_ticket: {
    type: String,
  },
  type: {
    type: String,
    enum: ['access_token', 'web_access_token', 'web_refresh_Token']
  },
  createAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 55 * 2  // 默认1小时50分过期, 每隔60秒删除记录(还要加上查询的时间)
  }
});
// wechatSchema.index({ createAt: 1 }, { expireAfterSeconds: 7000 });
var wechatModel = mongoose.model('Wechat', wechatSchema);
function Wechat(token) {
  this.token = token;
};
Wechat.prototype.save = function (callback) {
  var token = this.token;
  
  var newToken = new wechatModel(token);
  newToken.save(function (err, newToken) {
    if (err) {
      return callback(err);
    }
      callback(null, newToken);
  });
};

Wechat.tokenManager = function (type) {
  // console.log(type || 'access_token');
  return function (req, res, next) {
    // console.log(req.headers);
    var query = {type: type || 'access_token'};
    var appid = 'wx427f444432aef6cc';
    var secret = 'dad0093ab530901daaab5e0162fef1a6';

    wechatModel
    .findOne(query, function (err, token) {
      if (err) {
        return res.status(401).send('服务器错误, 微信令牌查询失败!');
      }

      if (token) {
        req.wxToken = token;
        req.wxToken.appid = appid;
        req.wxToken.secret = secret;
        return next();
      }

      if (!type || type === 'access_token') {
        request.get({
          url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential' + 
          '&appid=' + appid +  
          '&secret=' + secret,
          json: true
        }, function (err1, response1, body1) {
          // console.log(body1);
          if (err1) return res.status(401).send('微信令牌获取失败!');

          request.get({
            url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?' + 
            'access_token=' + body1.access_token + 
            '&type=jsapi',
            json: true
          }, function (err2, response2, body2) {
            // console.log(body2);
            if (err2) return res.status(401).send('微信js票据获取失败!');

            request.get({
              url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?' + 
              'access_token=' + body1.access_token + 
              '&type=wx_card',
              json: true
            }, function (err3, response3, body3) {
              // console.log(body3);
              if (err3) return res.status(401).send('微信卡券票据获取失败!');

              // wechatModel.collection.insert({
              wechatModel.create({
                token: body1.access_token, 
                expires_in: body1.expires_in, 
                jsapi_ticket: body2.ticket,
                api_ticket: body3.ticket,
                type: type || 'access_token' 
              }, function(err, token) {
                if (err) return res.status(401).send('微信令牌保存失败!');
                req.wxToken = token;
                req.wxToken.appid = appid;
                req.wxToken.secret = secret;
                return next();
              });
            });
          });
        });
      }
    });
  };
};

module.exports = Wechat;