function UTF8(binaryStr){
    var res = "";
    var count = 0;
    var i = 0;
    var space = 6;
    if(binaryStr.length <= 7)
       return "0" + binaryStr

    for(i = binaryStr.length - 1; i >= 0; i--) {
        count++;
        res+=binaryStr[i];
       
        if(count % 6 == 0){
            res += "01";
            space--;
        }
       
        if(binaryStr.length-count <= space && res.length % 8 == 0)
           break;        
    }
    
    res += binaryStr.substring(binaryStr.length-count-i, i).split("").reverse().join("");
    
    var numOfOnes = (res.length/8 + 1) & 15 ;
    var numOfZeroes = 8 - res.length % 8 - numOfOnes - 1;

    for(i = 0; i < numOfZeroes; i++)
        res += "0";
    
    res+="0";

    for(i = 0; i < numOfOnes; i++)
        res += "1";
    
    return res.split("").reverse().join("");
}

function DecimalToBinary(DecimalValue){
    var BinaryValue = '';
    for (var i = 64; i >= 1; i--){
        if(DecimalValue >= Math.pow(2,i)/2){
            BinaryValue = BinaryValue+'1';
            DecimalValue = DecimalValue - (Math.pow(2,i)/2);
        }
        else if(BinaryValue.indexOf("1") != -1){
            BinaryValue = BinaryValue + '0';
        }
    }
    return BinaryValue;
}

function UTF8BinaryString(char){
    var binaryStr = DecimalToBinary(char.charCodeAt(0));
    var res = UTF8(binaryStr);
    return res;
}

function decimalToHex(charCode){
    var hexChars = "0123456789ABCDEF";
    var result = [];

    result.push(hexChars.charAt(charCode >> 4));
    result.push(hexChars.charAt(charCode & 15));

    var res = "";
    for(var  i = 0; i < result.length; i++)
	    res += result[i];
    return res;
}

function unreserved(charCode){
    if((charCode >= 48 && charCode <= 57) ||
       (charCode >= 65 && charCode <= 90) ||
       (charCode >= 97 && charCode <= 122) ||
       charCode == 45 || charCode == 95 ||
       charCode == 46 || charCode == 126)
        return true;
    return false; 	        
}

function percentEncode(char){
    var res = "";
    
    if(unreserved(char.charCodeAt(0)))
        return char;
    
    var binStr = UTF8BinaryString(char);
    var numOfBytes = binStr.length / 8;
    for(var i = 0; i < numOfBytes*8; i+=8){
        var decimal = parseInt(binStr.substring(i, i+8),2);
        var hex = decimalToHex(decimal);   
        res += "%" + hex; 
    }
    return res;
}

function encodeString(data){
    string = data.toString();
    res = "";
    for(var i = 0; i < string.length; i++){
        res += percentEncode(string[i]);
    }
    return res;
}

function encodeInp(data){
    
    if(typeof(data) == "string" || typeof(data) == "number"){
        return encodeString(data);
    }else if(data instanceof Array){
        var res = [];
        for(var i = 0; i < data.length; i++){
            res.push(encodeString(data[i]));
        }
        return res;
    }else if(typeof(data) == "object"){
        var res = "";
        for(var key in data) {
            var value = data[key];
            res+= key + "=" +  encodeString(value) + "&";   
        }
        return res.substring(0, res.length-1 );
    }
}

function UTF8ToChar(binStr, index, len){
   
    var footer = binStr.substring(binStr.length - (len * (index - 1)), binStr.length);
  
    var header = binStr.substring(index + 1,binStr.length - (len * (index - 1)));
 
    var bin = "";
    bin += header;
    
    var count = footer.length / len;
    for (var i = 0; i < count; i++){
        bin += footer.substring(i*len + 2, (i+1)*len);
    }
    return String.fromCharCode(parseInt(bin,2));
}

function isHex(str) {
    str = str.toUpperCase();
    var res = true;
    if(str.length == 1) return false;
    for(var i = 0; i < str.length; i++){
        if((str[i].charCodeAt(0) >= 48 && str[i].charCodeAt(0) <= 57) ||
            (str[i].charCodeAt(0) >= 65 && str[i].charCodeAt(0) <= 70))
            res = true;
        else{
            res = false;
            break;
        }
    }
    return res;
} 

function decodeString(data){
    var array = data.split("%");
    var res = "";
    if(array[0] == "") array = array.slice(1, array.length);
    for(var i = 1; i < array.length; i++){
        if(array[i].length != 2){
            var h = array[i].substring(0,2);
            var f = array[i].substring(2,array[i].length);
            array[i] = h;            
            array.splice(i+1, 0, f);
            i++; 
        }
    }
    for(var i = 0; i < array.length; i++){
        
        if(!isHex(array[i])){
            res += array[i];
            continue;        
        }
        var bin = DecimalToBinary(parseInt(array[i], 16));
        
        var index = 0;
        while(bin.length % 8 != 0) bin = "0" + bin;
        while(bin[index] != "0"){
            index++;        
        }
        if(i+index > array.length){
            res += array[i];
            continue;  
        }
        if(index == 0){
             res += String.fromCharCode(parseInt(bin,2));
             continue;
        }
        var temp = "";
        for(var j = 0; j < index; j++){
            temp += DecimalToBinary(parseInt(array[i+j], 16));
           
        }
        var char = UTF8ToChar(temp, index, bin.length);
        i+=index-1;
        res += char;
        
    }
    return res;
}

function decodeInp(data){
    
   if(data instanceof Array){
        var res = [];
        for(var i = 0; i < data.length; i++){
            res.push(decodeString(data[i]));
        }
        return res;
    }else if(data.indexOf("&") != -1 || data.indexOf("=") != -1){
        var res = {};
        var arr = data.split("&");
        var keys = [];
        
        for(var i = 0; i < arr.length; i++){
            res[arr[i].split("=")[0]] = decodeString(arr[i].split("=")[1]);
        }
        return res;
    }else{
        return decodeString(data);
    }
}

var URLEncoder = (function(exportCallBack) {
    return {
	
        encode:function(input) {
			console.log("Input encoder: ");
			console.log(encodeInp(input));
            return null;
        },
        decode:function(input) {
			console.log("Input decoder: ");
			console.log(decodeInp(input));
            return null;   
        }  
    }   
}());
(function(URLEncoder) {
    if(typeof module !== "undefined") {
        module.exports = URLEncoder;
    } else if (typeof window !== "undefined"){
        window.URLEncoder = URLEncoder;
    }
}); 

URLEncoder.encode("1 test ტესტი");
URLEncoder.encode({ key: '###', key1: 'value1' });
URLEncoder.encode(['###','value1' ]);

URLEncoder.decode(["%23%23", "%23%23"]);
URLEncoder.decode("key=%23%23-%23&key1=value1");
URLEncoder.decode("%23%23%23");

/*console.log(decode(encode("1 test ტესტი")));
console.log(encode(decode("1%20test%20%E1%83%A2%E1%83%94%E1%83%A1%E1%83%A2%E1%83%98")));
console.log(decode(encode([1, "test", "ტესტი"])));
console.log(encode(decode(["%23%23", "%23%23"])));
console.log(decode("key=%23%23%23&key1=value1"));*/



