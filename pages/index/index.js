import mqtt from'../../utils/mqtt.js';
const aliyunOpt = require('../../utils/aliyun/aliyun_connect.js');
const ff = wx.cloud.init()
const db = wx.cloud.database()
const test = db.collection('test')
var util=require('../../utils/util.js')
var date1 =util.formatTime(new Date())

var timestamp = Date.parse(new Date());
var date = new Date(timestamp);
//获取年份  
var year =new Date().getFullYear();
//获取月份  
var month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
//获取当日日期 
var day = new Date().getDate(); 
let that = null;
let n=0;
Page({
    data:{
      hi:true,
      nohi:false,
      year:year,
      day:day,
      
      //设置值 
     

      client:null,//记录重连的次数
      reconnectCounts:0,//MQTT连接的配置
      options:{
        protocolVersion: 4, //MQTT连接协议版本
        clean: false,
        reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
        connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
        resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
        clientId: '',
        password: 'CF14A5D42D03D590A884B0D1B001C136',
        username: '',
      },

      aliyunInfo: {
        productKey: 'a1JxeNZEN5p', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
        deviceName: 'WeChat', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
        deviceSecret: 'ae309d43712805992872cd1a4209bc19', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
        regionId: 'cn-shanghai', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
        pubTopic: '', //发布消息的主题
        subTopic: '/sys/a1JxeNZEN5p/WeChat/thing/service/property/set', //订阅消息的主题
      },
    },
  
   
  onLoad:function(){
    setInterval(function(){
      that.setData({
          date1: util.formatTime(new Date())
      });    
  },1000);  
    that = this;
    let clientOpt = aliyunOpt.getAliyunIotMqttClient({
      productKey: that.data.aliyunInfo.productKey,
      deviceName: that.data.aliyunInfo.deviceName,
      deviceSecret: that.data.aliyunInfo.deviceSecret,
      regionId: that.data.aliyunInfo.regionId,
      port: that.data.aliyunInfo.port,
    });

    console.log("get data:" + JSON.stringify(clientOpt));
    let host = 'wxs://' + clientOpt.host;
    
    this.setData({
      'options.clientId': clientOpt.clientId,
      'options.password': clientOpt.password,
      'options.username': clientOpt.username,
    })
    console.log("this.data.options host:" + host);
    console.log("this.data.options data:" + JSON.stringify(this.data.options));

    //访问服务器
    this.data.client = mqtt.connect(host, this.data.options);

    this.data.client.on('connect', function (connack) {
      wx.showToast({
        title: '连接成功'
      })
      console.log("连接成功");
    })

    //接收消息监听
    this.data.client.on("message", function (topic, payload) {
      console.log(" 收到 topic:" + topic + " , payload :" + payload);
      that.setData({
        //转换成JSON格式的数据进行读取
        zhuo:JSON.parse(payload).zhuo,
        temperature:JSON.parse(payload).temperature,
        NH3:JSON.parse(payload).NH3,
        O2:JSON.parse(payload).O2,
        pH:JSON.parse(payload).pH,
        
      })
      test.add({
        // data 字段表示需新增的 JSON 数据
        data: {
          // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
          zhuo:JSON.parse(payload).zhuo,
          temperature:JSON.parse(payload).temperature,
          NH3:JSON.parse(payload).NH3,
          O2:JSON.parse(payload).O2,
          pH: JSON.parse(payload).pH,
          date:util.formatTime(new Date()),
          hour:new Date().getHours(),
          minute:new Date().getMinutes(),
          second:new Date().getSeconds(),
          day:new Date().getDay()
        },
        success: function(res) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          console.log(res)
        }
      })
  /*     wx.showModal({
        content: " 收到topic:[" + topic + "], payload :[" + payload + "]",
        showCancel: false,
      }); */
    })
    
    //服务器连接异常的回调
    that.data.client.on("error", function (error) {
      console.log(" 服务器 error 的回调" + error)

    })
    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function () {
      console.log(" 服务器 reconnect的回调")

    })
    //服务器连接异常的回调
    that.data.client.on("offline", function (errr) {
      console.log(" 服务器offline的回调")
    })
  },
  
  Link() {
   
//此函数是订阅的函数，因为放在访问服务器的函数后面没法成功订阅topic，因此把他放在这个确保订阅topic的时候已成功连接服务器
//订阅消息函数，订阅一次即可 如果云端没有订阅的话，需要取消注释，等待成功连接服务器之后，在随便点击（开灯）或（关灯）就可以订阅函数
    this.data.client.subscribe(this.data.aliyunInfo.subTopic,function(err){
      if(!err){
        console.log("订阅成功");
      };
      wx.showModal({
        content: "订阅成功",
        showCancel: false,
      })
    }) 
    //数据库操作
    /* db.collection('test').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        zhuo: that.zhuo,
        temperature:temperature,
        NH3:NH3,
        O2: O2,
        pH: pH
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      }
    }) */

   /*  //发布消息
    if (this.data.client && this.data.client.connected) {
      this.data.client.publish(this.data.aliyunInfo.pubTopic, JSON.stringify(sendData));
      console.log("************************")
      console.log(this.data.aliyunInfo.pubTopic)
      console.log(JSON.stringify(sendData))
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }*/

    var a = this.data.hi;
    this.setData({ 
        hi:!a,
        nohi:a
       })
       
  },
  hidden(){
    var a = this.data.hi;
    this.setData({ 
        hi:!a,
        nohi:a
       })
  },
})