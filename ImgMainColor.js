/**
 * Created by bigZ on 2017/3/22.
 */

/*
*---------------ImgMainColor识别图片中主色调的方法-------------
*options={
 *   src: String,              必传，图片地址
 *   size: Number,             非必传，单位色块的大小（像素个数，默认40）。以单位色块的平均像素值为作为统计单位
 *   level: Number,            非必传，颜色分区参数（1-255，默认32）,以level为单位分割256个色级，默认每个通道分为8段，所以一共有8*4=32个色区
 *   exclude: Array<String>,   非必传，排除颜色数组，统计时，需要排除掉的颜色，支持格式有#FFF,#FFFFFF,rgb(0,0,0),rgba(0,0,0,0),(#FFF0第四位为alpha值,#FFFFFF00后面两位为alpha值)
 *}
*
* callback:Function,        必传，获取完成后的回掉函数，返回result包含四种颜色值
*
*   result:{
*       hex:'#ffffff',            十六位值
*       hexa:'#ffffff00',         十六位值带alpha值
*       rgb:'rgb(0,0,0)',         RGB值
*       rgba:'rgba(0,0,0,0)'      RGB值带alpha值
*   }
*
*/


;(function(window, undefined){
    "use strict";

    var ImgMainColor = function(options, callback){

        this.COLOR_SIZE = 40;//色块，默认40个像素
        this.EXCLUDE_COLOR = [];//排除的颜色
        this.LEVEL = 32;//默认色值分级256/32，每个8级，共8*4个等级
        this.EXCLUDE_COLOR_LEVEL = [];//排除颜色的分级
        this.RGBA_REG = /^rgba*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*\d*\.*\d+\s*)*\)$/;//rgba颜色正则

        this.options = options || {src: ''};
        this.callback = callback || function(){};

        this.getImgData = function(img){
            try{
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                return context.getImageData(0, 0, img.width, img.height).data
            }catch (e){
                return []
            }
        };

        this.initImg = function(src, callback){
            var img = new Image();
            img.src = src;
            var self = this;
            img.onload = function(){
                var imageData = self.getImgData(img)
                callback(imageData)
            }
            img.onerror = function(){
                callback([])
                console.log('图片加载失败！')
            }
        };

        this.getAverageColor = function(colorArr){
            var len = colorArr.length;
            var sr = 0, sg = 0, sb = 0, sa = 0;
            colorArr.map(function(item){
                sr += item.r;
                sg += item.g;
                sb += item.b;
                sa += item.a;
            });
            return {
                r: Math.round(sr/len),
                g: Math.round(sg/len),
                b: Math.round(sb/len),
                a: Math.round(sa/len)
            }
        };

        this.getMostColor = function(colorData){
            var rst = null, len = 0;
            for(var key in colorData){
                !this.isKeyExclude(key) && colorData[key].length > len && (
                    rst = colorData[key],
                    len = colorData[key].length
                )
            }
            return rst;
        };

        this.isKeyExclude = function(key){
            for(var i=0; i<this.EXCLUDE_COLOR_LEVEL.length; i++){
                if(this.EXCLUDE_COLOR_LEVEL[i] == key){
                    return true
                }
            }
            return false;
        };

        this.getColorLevel = function(color){
            return this.getLevel(color.r)+'_'+this.getLevel(color.g)+'_'+this.getLevel(color.b)+'_'+this.getLevel(color.a)
        };

        this.getLevel = function(value){
            return Math.round(value/this.LEVEL)
        };

        this.getBlockColor = function(imageData, start){
            var data = [],
                count = this.COLOR_SIZE,
                len = this.COLOR_SIZE*4;
            imageData.length <= start+len && (count = Math.floor((imageData.length-start-1)/4));
            for(var i=0; i<count; i+=4){
                data.push({
                    r: imageData[start+i+0],
                    g: imageData[start+i+1],
                    b: imageData[start+i+2],
                    a: imageData[start+i+3]
                })
            }
            return this.getAverageColor(data)
        };

        this.Hex2Rgba = function(hex){
            if(hex.length != 4 && hex.length != 5 && hex.length != 7 && hex.length != 9){
                return { r: 0, g: 0, b: 0, a: 255 }
            }
            var len = 2;
            (hex.length == 4 || hex.length == 5) && ( len = 1);
            var r = hex.substr(1+len*0, len);
            var g = hex.substr(1+len*1, len);
            var b = hex.substr(1+len*2, len);
            var a = 'f';
            if(hex.length == 5){
                a = hex.substr(4, 1)
            }else if(hex.length == 9){
                a = hex.substr(7, 2)
            }
            if(len == 1){
                r += r; g += g; b += b; a += a;
            }
            return {
                r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16), a: parseInt(a, 16)
            }
        };

        this.rgbaStr2Rgba = function(rgba){
            rgba = rgba.replace(/rgba*|\(|\)|\s/ig, '');
            var arr = rgba.split(',');
            var alp = arr[3] ? arr[3]*255 : 255;
            alp = (alp > 255 || alp < 0) ? 255 : alp;
            return {
                r: arr[0]*1,
                g: arr[1]*1,
                b: arr[2]*1,
                a: alp
            }
        };

        this.initExcludeLevel = function(){
            for(var i=0; i<this.EXCLUDE_COLOR.length; i++){
                var color = this.EXCLUDE_COLOR[i]+'';
                if(color.indexOf('#') == 0){
                    color = this.Hex2Rgba(color);
                }else{
                    if(this.RGBA_REG.test(color)){
                        color = this.rgbaStr2Rgba(color)
                    }else{
                        color = null;
                    }
                }
                if(color){
                    var lvl = this.getColorLevel(color);
                    this.EXCLUDE_COLOR_LEVEL.push(lvl)
                }
            }
        };

        this.getLevelData = function(imageData){
            var len = imageData.length;
            var mapData = {};
            for(var i=0; i<len; i+=this.COLOR_SIZE*4){
                var blockColor = this.getBlockColor(imageData, i);
                var key = this.getColorLevel(blockColor);
                !mapData[key] && (mapData[key]=[]);
                mapData[key].push(blockColor)
            }
            return mapData;
        };

        this.getResult = function(color){
            var rgba = 'rgba('+color.r+','+color.g+','+color.b+','+(color.a/255).toFixed(4)+')';
            var rgb = 'rgb('+color.r+','+color.g+','+color.b+')';
            var hex = '#'+this.Num2Hex(color.r)+this.Num2Hex(color.g)+this.Num2Hex(color.b);
            var hexa = hex+this.Num2Hex(color.a);
            return {
                rgba: rgba,
                rgb: rgb,
                hex: hex,
                hexa: hexa
            }
        };

        this.Num2Hex = function(num){
            var hex = num.toString(16)+'';
            if(hex.length < 2){
                return '0'+hex
            }else{
                return hex
            }
        }

        this.init =  function(){
            try{
                var src = this.options.src || '';
                if(!src){
                    console.log('图片地址不能为空')
                }
                typeof this.options.size == 'number' && this.options.size > 0 && (this.COLOR_SIZE = this.options.size);
                typeof this.options.level == 'number' && this.options.level > 0 && this.options.level < 255 && (this.LEVEL = this.options.level);
                Object.prototype.toString.call(this.options.exclude) === '[object Array]' && (this.EXCLUDE_COLOR = this.options.exclude);
            }catch (e){
                console.log('出现了一些问题', e)
                return false;
            }
            var self = this;
            this.initImg(src, function(imageData){
                var defRst = {
                    rgb: '',
                    rgba: '',
                    hex: '',
                    hexa: ''
                }
                if(imageData.length < 4){
                    self.callback(defRst)
                }else{
                    self.initExcludeLevel();
                    var mapData = self.getLevelData(imageData);
                    var colors = self.getMostColor(mapData);
                    if(!colors){
                        self.callback(defRst)
                    }else{
                        var color = self.getAverageColor(colors);
                        self.callback(self.getResult(color))
                    }
                }
            })
        };

        this.init();
    };

    window.ImgMainColor = window.ImgMainColor || ImgMainColor;

})(window);
