
var	config = require('../config'),
		User = require('../models/user'),
		DictNumber = require('../models/dictNumber'),
		Numbering = require('../models/numbering'),
		Sms = require('../models/sms'),
		crypto = require('crypto'),
		https = require('https'),
        jwt = require('jsonwebtoken');


var Base64 = {  
    // 转码表  
    table : [  
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',  
            'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',  
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',  
            'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',  
            'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',  
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v',  
            'w', 'x', 'y', 'z', '0', '1', '2', '3',  
            '4', '5', '6', '7', '8', '9', '+', '/' 
    ],  
    UTF16ToUTF8 : function(str) {  
        var res = [], len = str.length;  
        for (var i = 0; i < len; i++) {  
            var code = str.charCodeAt(i);  
            if (code > 0x0000 && code <= 0x007F) {  
                // 单字节，这里并不考虑0x0000，因为它是空字节  
                // U+00000000 – U+0000007F  0xxxxxxx  
                res.push(str.charAt(i));  
            } else if (code >= 0x0080 && code <= 0x07FF) {  
                // 双字节  
                // U+00000080 – U+000007FF  110xxxxx 10xxxxxx  
                // 110xxxxx  
                var byte1 = 0xC0 | ((code >> 6) & 0x1F);  
                // 10xxxxxx  
                var byte2 = 0x80 | (code & 0x3F);  
                res.push(  
                    String.fromCharCode(byte1),   
                    String.fromCharCode(byte2)  
                );  
            } else if (code >= 0x0800 && code <= 0xFFFF) {  
                // 三字节  
                // U+00000800 – U+0000FFFF  1110xxxx 10xxxxxx 10xxxxxx  
                // 1110xxxx  
                var byte1 = 0xE0 | ((code >> 12) & 0x0F);  
                // 10xxxxxx  
                var byte2 = 0x80 | ((code >> 6) & 0x3F);  
                // 10xxxxxx  
                var byte3 = 0x80 | (code & 0x3F);  
                res.push(  
                    String.fromCharCode(byte1),   
                    String.fromCharCode(byte2),   
                    String.fromCharCode(byte3)  
                );  
            } else if (code >= 0x00010000 && code <= 0x001FFFFF) {  
                // 四字节  
                // U+00010000 – U+001FFFFF  11110xxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else if (code >= 0x00200000 && code <= 0x03FFFFFF) {  
                // 五字节  
                // U+00200000 – U+03FFFFFF  111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/ {  
                // 六字节  
                // U+04000000 – U+7FFFFFFF  1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            }  
        }  
 
        return res.join('');  
    },  
    UTF8ToUTF16 : function(str) {  
        var res = [], len = str.length;  
        var i = 0;  
        for (var i = 0; i < len; i++) {  
            var code = str.charCodeAt(i);  
            // 对第一个字节进行判断  
            if (((code >> 7) & 0xFF) == 0x0) {  
                // 单字节  
                // 0xxxxxxx  
                res.push(str.charAt(i));  
            } else if (((code >> 5) & 0xFF) == 0x6) {  
                // 双字节  
                // 110xxxxx 10xxxxxx  
                var code2 = str.charCodeAt(++i);  
                var byte1 = (code & 0x1F) << 6;  
                var byte2 = code2 & 0x3F;  
                var utf16 = byte1 | byte2;  
                res.push(Sting.fromCharCode(utf16));  
            } else if (((code >> 4) & 0xFF) == 0xE) {  
                // 三字节  
                // 1110xxxx 10xxxxxx 10xxxxxx  
                var code2 = str.charCodeAt(++i);  
                var code3 = str.charCodeAt(++i);  
                var byte1 = (code << 4) | ((code2 >> 2) & 0x0F);  
                var byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F);  
                utf16 = ((byte1 & 0x00FF) << 8) | byte2  
                res.push(String.fromCharCode(utf16));  
            } else if (((code >> 3) & 0xFF) == 0x1E) {  
                // 四字节  
                // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else if (((code >> 2) & 0xFF) == 0x3E) {  
                // 五字节  
                // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            } else /** if (((code >> 1) & 0xFF) == 0x7E)*/ {  
                // 六字节  
                // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx  
            }  
        }  
 
        return res.join('');  
    },  
    encode : function(str) {  
        if (!str) {  
            return '';  
        }  
        var utf8    = this.UTF16ToUTF8(str); // 转成UTF8  
        var i = 0; // 遍历索引  
        var len = utf8.length;  
        var res = [];  
        while (i < len) {  
            var c1 = utf8.charCodeAt(i++) & 0xFF;  
            res.push(this.table[c1 >> 2]);  
            // 需要补2个=  
            if (i == len) {  
                res.push(this.table[(c1 & 0x3) << 4]);  
                res.push('==');  
                break;  
            }  
            var c2 = utf8.charCodeAt(i++);  
            // 需要补1个=  
            if (i == len) {  
                res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);  
                res.push(this.table[(c2 & 0x0F) << 2]);  
                res.push('=');  
                break;  
            }  
            var c3 = utf8.charCodeAt(i++);  
            res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);  
            res.push(this.table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);  
            res.push(this.table[c3 & 0x3F]);  
        }  
 
        return res.join('');  
    },  
    decode : function(str) {  
        if (!str) {  
            return '';  
        }  
 
        var len = str.length;  
        var i   = 0;  
        var res = [];  
 
        while (i < len) {  
            code1 = this.table.indexOf(str.charAt(i++));  
            code2 = this.table.indexOf(str.charAt(i++));  
            code3 = this.table.indexOf(str.charAt(i++));  
            code4 = this.table.indexOf(str.charAt(i++));  
 
            c1 = (code1 << 2) | (code2 >> 4);  
            c2 = ((code2 & 0xF) << 4) | (code3 >> 2);  
            c3 = ((code3 & 0x3) << 6) | code4;  
 
            res.push(String.fromCharCode(c1));  
 
            if (code3 != 64) {  
                res.push(String.fromCharCode(c2));  
            }  
            if (code4 != 64) {  
                res.push(String.fromCharCode(c3));  
            }  
 
        }  
 
        return this.UTF8ToUTF16(res.join(''));  
    }  
};
function stringToBytes ( str ) {  
  var ch, st, re = [];  
  for (var i = 0; i < str.length; i++ ) {  
    ch = str.charCodeAt(i);  // get char   
    st = [];                 // set up "stack"  
    do {  
      st.push( ch & 0xFF );  // push byte to stack  
      ch = ch >> 8;          // shift value down by 1 byte  
    }    
    while ( ch );  
    // add stack contents to result  
    // done because chars have "wrong" endianness  
    re = re.concat( st.reverse() );  
  }  
  // return an array of bytes  
  return re;  
}

function getNowFormatDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear()+month+strDate;
    return currentdate;
    // YYYYMMDD
}
function paddNum(num){
    num += "";
    return num.replace(/^(\d)$/,"0$1");
}
function ConvAlphameric(Seq)
{
    var Ret = ""
    var Char = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; //"I","O"除外，容易与1,0混淆
    var lenChar = Char.length
    var idx
    while(Seq >= 1){
        idx = Seq%lenChar
        Ret = Char.substr(idx, idx)+Ret
        Seq = Seq / lenChar
    }

    return Ret;
}

exports.getUser = function(req, res) {
    var _userId = req.query.userId
    var query = {userId:_userId};

    User.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        res.json({results: item});
    });
}
exports.getUserList = function(req, res) {
    var query = {};

    User.getSome(query, function(err, userlist) {
        if (err) {
      return res.status(500).send(err.errmsg);
    }

    res.json({results: userlist});
    });
}
exports.insertUser = function(req, res) {
    var userData = {
        userId: "whoareyou",                        
        userName: "chi",                    
        openId: "qwe",                      
        phoneNo: "135",                 
        password:"123456",
        photoUrl:"url",
        role:["pt"],
        loginStatus:1,
        lastLogin:new Date(),
        jpush:{
            registrationID:"reg",
            alias:"String",
            tags:["String"]
        },
        revisionInfo:{
            operationTime:new Date(),
            userId:"a123",
            userName:"chi",
            terminalIP:"1234"
        }
    };

    var newUser = new User(userData);
    newUser.save(function(err, userInfo) {
        if (err) {
      return res.status(500).send(err.errmsg);
    }
    res.json({results: userInfo});
    });
}
exports.register = function(req, res) {
    var _phoneNo = req.query.phoneNo
    var _password = req.query.password
    var _role = req.query.role
    var query = {phoneNo:_phoneNo};
    var _userNo
    User.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            var _numberingType = 1
            var _targetDate = null
            // var promise = new mongoose.Promise();
            //var UserNo=CreateNo(_numberingType,_targetDate);
            if (_numberingType==null){
                _userNo = ""
                res.json({results: 1,userNo:_userNo,mesg:"Create userNo failure!"});
            }
            else{
                if (_targetDate==null){
                    _targetDate= getNowFormatDate();
                }
                var query = {type:_numberingType};
                var Data
                DictNumber.getOne(query, function(err, item) {
                    if (err) {
                        return res.status(500).send(err.errmsg);
                    }
                    Data=item;
                    if(Data==null){
                        _userNo = ""
                        res.json({results: 1,userNo:_userNo,mesg:"Create userNo failure!"});
                    }
                    else{
                        var _Initial=Data.initStr
                        var _DateFormat=Data.dateFormat
                        var _SeqLength=Data.seqLength
                        var _AlphamericFlag=Data.alphamericFlag
                        var _Date
                        var _KeyDate
                        var _TrnNumberingData
                        var _TrnNumberingNo
                        if(_DateFormat == "YYMMDD"){
                            _Date=_targetDate.substring(2,8);
                        }
                        else if(_DateFormat == "YYYYMMDD"){
                            _Date=_targetDate
                        }
                        if(_Date==null){
                            _KeyDate="99999999"
                        }
                        else{
                            _KeyDate=_targetDate
                        }
                        var query1 = {type:_numberingType,date:_KeyDate};
                        Numbering.getOne(query1, function(err, item1) {
                            if (err) {
                                return res.status(500).send(err.errmsg);
                            }
                            _TrnNumberingData=item1;
                            if(_TrnNumberingData==null){
                                _TrnNumberingNo=0
                            }
                            else{
                                _TrnNumberingNo=_TrnNumberingData.number
                            }
                            _TrnNumberingNo=_TrnNumberingNo+1
                            var _Seq = _TrnNumberingNo
                            if(_AlphamericFlag==1){
                                _Seq=ConvAlphameric(_Seq)
                            }
                            if(_Seq.toString().length>_SeqLength){
                                _TrnNumberingNo=1
                                _Seq=1
                            }
                            if(_TrnNumberingNo==1){
                                var numberingData = {
                                    type:_numberingType,
                                    date:_KeyDate,
                                    number: _TrnNumberingNo
                                };

                                var newNumbering = new Numbering(numberingData);
                                newNumbering.save(function(err, Info) {
                                    if (err) {
                                        return res.status(500).send(err.errmsg);
                                    }
                                    // res.json({results: Info});
                                });
                            }
                            else{
                                Numbering.updateOne(query1,{ $set: { number: _TrnNumberingNo } },function(err, item1){
                                    if (err) {
                                        return res.status(500).send(err.errmsg);
                                    }
                                });
                            }
                            // console.log("_Seq:"+_Seq)
                            // console.log("_Seq.length:"+_Seq.toString().length)
                            // console.log(_SeqLength)
                            if(_Seq.toString().length<_SeqLength){
                                var n=_SeqLength-_Seq.toString().length
                                while(n){
                                    _Seq="0"+_Seq
                                    n=n-1
                                }
                                // console.log(_Seq)
                            }
                            var _Ret=_Initial+_Date+_Seq
                            // console.log(_Ret)
                            _userNo =  _Ret
                            var userData = {
                                phoneNo:_phoneNo,
                                password:_password,
                                role: _role,
                                userId:_userNo
                            };
                            var newUser = new User(userData);
                            newUser.save(function(err, Info) {
                                if (err) {
                                    return res.status(500).send(err.errmsg);
                                }
                                res.json({results: 0,userNo:_userNo,mesg:"User Register Success!"});
                            });
                        });
                    }
                });
            }
        }
        else{
            res.json({results: 1,userNo:"",mesg:"User Already Exist!"});
        }
    });
}
exports.reset = function(req, res) {
    var _phoneNo = req.query.phoneNo
    var _password = req.query.password
    var query = {phoneNo:_phoneNo};
    User.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            res.json({results: 1,mesg:"User doesn't Exist!"});
        }
        else{
            User.updateOne(query,{ $set: { password: _password } },function(err, item1){
                if (err) {
                    return res.status(500).send(err.errmsg);
                }
                res.json({results: 0,mesg:"password reset success!"});
            });
        }
    });
}
exports.login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    if (username === '' || password === '') {
        return res.status(422).send('请输入用户名和密码!'); 
    }


    // var query = {phoneNo:_phoneNo};
    var query = {
        $or: [
            {phoneNo: username},
            {openId: username}
        ]
    };

    User.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            res.json({results: 1,mesg:"User doesn't Exist!"});
        }
        else{
            if(password!=item.password){
                res.json({results: 1,mesg:"User password isn't correct!"});
            }
            else if(item.role.indexOf(role) == -1)
            {
                res.json({results: 1,mesg:"No authority!"});
            }
            else
            {
                var _lastlogindate=item.lastLogin
                // console.log(Date())
                User.updateOne(query,{ $set: { loginStatus: 0 ,lastLogin:Date()} },function(err, user){
                    if (err) {
                        return res.status(500).send(err.errmsg);
                    }

                    // csq 返回token信息
                    //console.log(user);
                    userPayload = {
                        _id: user._id,
                        userId: user.userId,
                        role:role
                    };
                    var token = jwt.sign(userPayload, config.tokenSecret, {algorithm:'HS256'},{expiresIn: config.TOKEN_EXPIRATION});
                    
                    var results = {
                        status:0,
                        userId:item.userId,
                        lastlogin:_lastlogindate,
                        PhotoUrl:item.photoUrl,
                        mesg:"login success!",
                        token:token
                    };

                    res.json({results: results});
                });
            }
        }
    });
}

exports.logout = function(req, res) {
    var _userId = req.query.userId
    var query = {userId:_userId};
    User.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            res.json({results: 1,mesg:"User doesn't Exist!"});
        }
        else{
            User.updateOne(query,{ $set: { loginStatus: 1} },function(err, item1){
                if (err) {
                    return res.status(500).send(err.errmsg);
                }
                res.json({results: 0,mesg:"logout success!"});
            });

        }
    });
}
exports.getUserID = function(req, res) {
    var _phoneNo = req.query.phoneNo
    var query = {phoneNo:_phoneNo};
    User.getOne(query, function(err, item) {
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        if(item==null){
            res.json({results: 1,mesg:"User doesn't Exist!"});
        }
        else{
            res.json({results: 0,UserId:item.userId,mesg:"Get UserId Success!"});
        }
    });
}
exports.sendSMS = function(req, res) {
    var now = new Date()
    var _mobile = req.query.mobile;
    var _smsType = req.query.smsType;
    var token = "849407bfab0cf4c1a998d3d6088d957b";
    var appId = "38b50013289b417f9ce474c8210aebcf";
    var accountSid = "b839794e66174938828d1b8ea9c58412";
    var tplId = "40860";
    var Jsonstring1 = "templateSMS";
    var Jsonstring2 = "appId";
    var Jsonstring3 = "param";
    var Jsonstring4 = "templateId";
    var Jsonstring5 = "to";
    var J6 = "{";


    var rand = Math.random();
    var min = 100000;
    var max = 1000000;
    var _randNum =Math.floor(min+(max-min)*rand);
    var param = _randNum + "," + 3;
    var JSONData = J6 + '"' + Jsonstring1 + '"' + ':' + '{' + '"' + Jsonstring2 + '"' + ':' + '"' + appId + '"' + ',' + '"' + Jsonstring3 + '"' + ':' + '"' + param + '"' + ',' + '"' + Jsonstring4 + '"' + ':' + '"' + tplId + '"' + ',' + '"' + Jsonstring5 + '"' + ':' + '"' + _mobile + '"' + '}' + '}';
    //delete all expired smss

    var query={"Expire":{"$lte":now.getTime()}}
    Sms.remove(query, function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        // res.json({results: 0});
            //query by _mobile and _smsType
        if (_mobile != null && _mobile != "" && _mobile != undefined && _smsType != null && _smsType != "" && _smsType != undefined){
            var query1 = {mobile:_mobile,smsType:_smsType};
            Sms.getOne(query1, function(err, item) {
                if (err) {
                    return res.status(500).send(err.errmsg);
                }
                if(item==null){
                    //not exist
                    var _expire=60*3
                    
                    //insert a sms
                    var smsData = {
                        mobile: _mobile,
                        smsType: _smsType,
                        randNum: _randNum,
                        Expire: _expire*1000+now.getTime(),
                        insertTime: now
                    };
                    var newSms = new Sms(smsData);
                    newSms.save(function(err, Info){
                        if (err) {
                            return res.status(500).send(err.errmsg);
                        }
                        // res.json({results: Info});
                        var timestamp=now.getFullYear()+paddNum(now.getMonth()+1)+paddNum(now.getDate())+now.getHours()+now.getMinutes()+now.getSeconds()
                        var md5=crypto.createHash('md5').update(accountSid + token + timestamp).digest('hex').toUpperCase();
                        //byte[] bytedata = encode.GetBytes(accountSid + ":" + timestamp);
                        var authorization = Base64.encode(accountSid + ":" + timestamp);
                        // console.log(md5)
                        // console.log(authorization)
                        var bytes=stringToBytes(JSONData)
                        var Url = "https://api.ucpaas.com/2014-06-30/Accounts/" + accountSid + "/Messages/templateSMS?sig=" + md5;
                        var options={
                            hostname:"api.ucpaas.com",
                            // port:80,
                            path:"/2014-06-30/Accounts/"+ accountSid + "/Messages/templateSMS?sig=" + md5,
                            method:"POST",
                            headers:{
                                "Accept":"application/json",
                                // "Accept-Encoding":"gzip, deflate",
                                // "Accept-Language":"zh-CN,zh;q=0.8",
                                // "Connection":"keep-alive",
                                "Content-Length":bytes.length,
                                "Content-Type":"application/json;charset=utf-8",
                                // "Cookie":"imooc_uuid=6cc9e8d5-424a-4861-9f7d-9cbcfbe4c6ae; imooc_isnew_ct=1460873157; loginstate=1; apsid=IzZDJiMGU0OTMyNTE0ZGFhZDAzZDNhZTAyZDg2ZmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjkyOTk0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGNmNmFhMmVhMTYwNzRmMjczNjdmZWUyNDg1ZTZkMGM1BwhXVwcIV1c%3DMD; PHPSESSID=thh4bfrl1t7qre9tr56m32tbv0; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1467635471,1467653719,1467654690,1467654957; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1467655022; imooc_isnew=2; cvde=577a9e57ce250-34",
                                // "Host":"www.imooc.com",
                                // "Origin":"http://www.imooc.com",
                                // "Referer":"http://www.imooc.com/video/8837",
                                // "User-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2763.0 Safari/537.36",
                                // "X-Requested-With":"XMLHttpRequest",
                                "Authorization": authorization
                            }
                        }
                        var req=https.request(options,function(res){
                            res.on("data",function(chunk){
                                console.log(chunk);
                            });
                            res.on("end",function(){
                                console.log("### end ##");
                            });
                            console.log(res.statusCode);
                        });

                        req.on("error",function(err){
                            console.log(err.message);
                        })
                        req.write(JSONData);
                        req.end();

                    });

                    res.json({results: 0,mesg:"User doesn't Exist!"});
                }
                else{
                    var ttl=(item.Expire-now.getTime())/1000
                    //sms exist
                    res.json({results: 0,mesg:"您的邀请码已发送，请等待"+Math.floor(ttl)+ "s后重新获取"});
                }
            });
        }
        else{
            res.json({results: 1,mesg:"mobile and smsType input Error!"});
        }
    });
}
exports.verifySMS = function(req, res) {
    var now = new Date()
    var _mobile = req.query.mobile;
    var _smsType = req.query.smsType;
    var _smsCode = req.query.smsCode;


    var query={"Expire":{"$gte":now.getTime()},"mobile":_mobile,"smsType":_smsType}
    Sms.getOne(query, function(err, item){
        if (err) {
            return res.status(500).send(err.errmsg);
        }
        // res.json({results: 0});
            //query by _mobile and _smsType
        if (item != null ){
            if(item.randNum==_smsCode){
                res.json({results: 0,mesg:"验证码正确!"});
            }
            else{
                res.json({results: 1,mesg:"验证码错误"});
            }
        }
        else{
            res.json({results: 2,mesg:"没有验证码或验证码已过期!"});
        }
    });
}

// var commonFunc = require('../middlewares/commonFunc');
// exports.getIp = function(req, res) {
//     var _ip = commonFunc.getClientIp(req)
//     res.json({results: 0,Ip:_ip});
// }