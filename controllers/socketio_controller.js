// var config = require('../config');
var request = require('request');

var userServer = {};
var userList = {};
var count = 0;


function Arrayremove(array,name){
    var len = array.length;
    for(var i=0; i<len; i++){
        if(array[i] == name){
            array.splice(i,1)
            break
        }
    }
}

function messageSaveSend(data, url){

    var targetType = data.msg.targetType;
    var messageType;
    if(targetType == 'single'){         // 单聊
        messageType = 1;
    }
    else{       // 群聊
        messageType = 2;
    }
    var sendBy = data.msg.fromID;
    var receiver = data.to;

    var url = url;
    data.msg.content['src'] = url;
    data.msg.status = 'send_success';

    // save data
    var url = 'http://121.43.107.106:4050/communication/postCommunication';
    var jsondata = {
        messageType: messageType,
        sendBy:sendBy,
        receiver:receiver,
        sendDateTime:data.msg.createTimeInMillis,
        content:data.msg
    }
    request({
        url: url,
        method: 'POST',
        body: jsondata,
        json:true
    }, function(err, response){
        if(err) {
            // do-something
        }
        else{
            console.log('success 6');
            // send message
            /// send to sendBy
            if(userServer.hasOwnProperty(sendBy)){         // 用户在线
                userServer[sendBy].emit('messageRes',{msg:data.msg});
            }
            else{           // 用户不在线
                // socket.emit("err",{msg:"对方已经下线或者断开连接"})
            }
            // userServer[sendBy].emit('messageRes',{msg:data.msg});
            /// send to receiver

            if(messageType == 1){       // 单聊
                if(userServer.hasOwnProperty(receiver)){         // 用户在线
                    userServer[receiver].emit('getMsg',{msg:data.msg});
                }
                else{           // 用户不在线
                    // socket.emit("err",{msg:"对方已经下线或者断开连接"})
                }
            }
            else{           // 群聊
                console.log(receiver);
                request({
                    url: 'http://121.43.107.106:4050/communication/getTeam?teamId=' + data.msg.teamId,
                    method: 'GET',
                    json:true
                }, function(err, response){
                    // if (!err && response.statusCode == 200) {       
                    //     console.log(response.body);
                    //     var members = response.body.results.members;
                    //     for(var member in members){
                    //         if(userServer.hasOwnProperty(member.userId)){         // 用户在线
                    //             userServer[member.userId].emit('getMsg',{msg:data.msg});
                    //         }
                    //     }
                    // }
                    // else{
                    //     console.log("123");
                    //     // return res.status(500).send('Error');
                    // }
                    if(err) {
                        // do-something
                        console.log(err.errmsg);
                    }
                    else{
                        console.log(response.body);
                        var sponsorId = response.body.results.sponsorId;
                        var members = response.body.results.members;
                        members.push({"userId":sponsorId});

                        // console.log(members);
                        for(var idx in members){
                            // console.log(member);
                            if(userServer.hasOwnProperty(members[idx].userId)){         // 用户在线
                                  // console.log(member.userId);
                                if(members[idx].userId != sendBy){
                                    // console.log(member.userId);
                                    userServer[members[idx].userId].emit('getMsg',{msg:data.msg});
                                }                            
                            }
                        }                      
                    }
                })
            }
            
        }
    });

   
}

// namespace chat
exports.chat = function (io, socket) {
    count += 1;
    socket.on('newUser',function(data){
        console.log('newUser: ' +data.user_id);
        var nickname = data.user_name,
            user_id = data.user_id;
        socket.id = user_id;
        userServer[user_id] = socket;
        userList[user_id] = nickname
        // io.emit('onlineCount',freeList)
        // io.emit('addCount', count)
        // if(freeList.length > 1){
        //     var from = user_id;
        //     Arrayremove(freeList,from)
        //     if(freeList.length == 1){
        //         n = 0
        //     }else{
        //         n = Math.floor(Math.random() * freeList.length)
        //     }
        //     var to = freeList[n]
        //     Arrayremove(freeList,to)
        //     io.emit("getChat",{p1:from,p2:to},userList)
        // }
    })
    socket.on('disconnect',function(){ //用户注销登陆执行内容
        console.log('disconnect');
        count -= 1; 
        var id = socket.id
        delete userServer[id]
        delete userList[id]
        // io.emit('onlineCount',freeList)
        // io.emit('offline',{id:id})
        // io.emit('addCount', count)
    })
    socket.on('message',function(data){
        var contentType = data.msg.contentType;
        // var toUserId = data.to;
        
        var url = 'http://121.43.107.106:4050/wechat/download';

        if(contentType == 'image' || contentType == 'voice'){           // image voice
            var mediaId = data.msg.content.mediaId;
            var name;
            if(contentType == 'image' ){
                name = data.to + data.msg.createTimeInMillis + '.jpg';
            }
            else{
                name = data.to + data.msg.createTimeInMillis + '.mp3';
            }
        
            // download
            request({
                url: url + '?serverId=' + mediaId + '&name=' + name,
                method: 'GET',
                json: true
            }, function(err, response){
                if(err) {
                    // do-something
                }
                else{
                    var resUrl = "uploads/photos/" + name;
                    data.msg.content['src_thumb'] = resUrl;
                    messageSaveSend(data, resUrl);
                }
            });
        }else{          // text custom
            messageSaveSend(data, '');
        }

     
    })
    socket.on('sendImg',function(data){
        if(userServer.hasOwnProperty(data.to)){
            userServer[data.to].emit('getImg',{msg:data.msg})
        }else{
            socket.emit("err",{msg:"对方已经下线或者断开连接"})
        }
    })
};



// namespace counsel
exports.counsel = function (io, socket) {
   
   socket.emit('open');  //通知客户端已连接
};
exports.otherEvent = function (io) {
};
exports.otherRoom = function (io) {
};