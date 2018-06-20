# ImgMainColor
> 获取图片主色调的插件

## demo
```
* [ImgMainColor Demos](https://whoiam2007s.github.io/ImgMainColor/demos.html)
```

## 传入参数
```
options
callback
```

## options: Object 
> 必传，识别配置
```
options={
  src: String,              必传，图片地址
  size: Number,             非必传，单位色块的大小（像素个数，默认40）。以单位色块的平均像素值为作为统计单位
  level: Number,            非必传，颜色分区参数（1-255，默认32）,以level为单位分割256个色级，默认每个通道分为8段，所以一共有8*4=32个色区
  exclude: Array<String>,   非必传，排除颜色数组，统计时，需要排除掉的颜色，支持格式有#FFF,#FFFFFF,rgb(0,0,0),rgba(0,0,0,0),(#FFF0第四位为alpha值,#FFFFFF00后面两位为alpha值)
}
```

## callback: Function 
> 必传，识别完成后的回调函数，返回result包含四种颜色值
```
result:{
  hex:'#ffffff',            十六位值
  hexa:'#ffffff00',         十六位值带alpha值
  rgb:'rgb(0,0,0)',         RGB值
  rgba:'rgba(0,0,0,0)'      RGB值带alpha值
}
```

# 全参数示例
```
new ImgMainColor({
  src: './demo_1.png',
  size: 100,
  level: 16,
  exclude: ['#000', '#FFFFFF', 'rgb(255,0,0)', 'rgba(255,0,0,.5)']      
}, function(color){
  console.log(color);
});

```
