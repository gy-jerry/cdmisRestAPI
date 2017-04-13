
var commonFunc = {
	getClientIp: function (req) {
		return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	},
	stringToBytes: function( str ){
		var ch, st, re = [];
		for (var i = 0; i < str.length; i++ ){
			ch = str.charCodeAt(i);		// get char
			st = [];					// set up "stack"
			do {
				st.push( ch & 0xFF );	// push byte to stack
				ch = ch >> 8;			// shift value down by 1 byte
			}
			while ( ch );
			// add stack contents to result
			// done because chars have "wrong" endianness
			re = re.concat( st.reverse() );
		}
  		// return an array of bytes
		return re;
	},
	getNowFormatDate:function() {
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
	},
	paddNum:function(num){
		num += "";
		return num.replace(/^(\d)$/,"0$1");
	},
	ConvAlphameric:function(Seq){
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
}

module.exports = commonFunc;