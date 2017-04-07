var	config = require('../config');
var fs = require('fs');
//引入multer模块  
// var multer = require ('multer');
//设置上传的目录，  
//这里指定了一个临时目录（上传后的文件均保存到该目录下），  
//真正开发是一般加入path模块后使用path.join(__dirname,'temp');  

exports.upload = function(req, res) {
	var file = req.file;
	res.send({ret_code: '0',filepath:file.path});
}
// exports.download = function(req, res) {
// 	console.log("---------访问下载路径-------------");
// 	var pathname = "uploads\\photos\\tadashi.jpg";
// 	var realPath = "F:\\labwork\\CKDapp\\cdmisRestAPI\\"+pathname;
// 	fs.exists(realPath, function (exists) {
// 		if (!exists) {
// 			console.log("文件不存在");
// 			res.writeHead(404, {
// 				'Content-Type': 'text/plain'
// 			});
// 			res.write("This request URL " + pathname + " was not found on this server.");
// 			res.end();
// 		}
// 		else {
// 			console.log("文件存在");
// 			fs.readFile(realPath, "binary", function (err, file) {
// 				if (err) {
// 					res.writeHead(500, {
// 						'Content-Type': 'text/plain'
// 					});
// 					console.log("读取文件错误");
// 					res.end(err);
// 				}
// 				else {
// 					res.writeHead(200, {
// 						'Content-Type': 'text/html'
// 					});
// 					console.log("读取文件完毕，正在发送......");
// 					res.write(file, "binary");
// 					res.end();
// 					console.log("文件发送完毕");
// 				}
// 			});
// 		}
// 	});
// }