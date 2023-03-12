import uCharts from '../../utils/u-charts.js';

const ff = wx.cloud.init()
const db = wx.cloud.database()
const envir = db.collection('test')
var _self;
var canvaColumn = null;
var canvaLineA = null;
var canvaCandle = null;

Page({

  data: {
    cWidth: '',
    cHeight: '',
    TabCur: 0,
    chartClass: ['温度','溶氧量','浑浊度','PH值'],
    pmax:40,
    pmin:-4,
  },
  onLoad: function () {
    _self=this;
    this.cWidth = wx.getSystemInfoSync().windowWidth;
    this.cHeight = 500 / 750 * wx.getSystemInfoSync().windowWidth;
    this.getServerData();
  },
  refresh(){

    this.getServerData()
  },
  tabSelect(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
        TabCur: e.currentTarget.dataset.id,
    })
    this.getServerData()
},
  getServerData: function() {
    let data = {
      zhuo: [],
      NH3: [],
      O2: [],
      temperature: [],
      pH: [],
     
  }
  let CanvaClass = {
    categories: [],
    series: []
};

envir.orderBy('date', 'asc').orderBy('hour','asc')
            .where({
             hour:new Date().getHours(),
             day:new Date().getDay()
            })
            .limit(10)
            .get()
            .then((res) => {
                console.log(res)
                res.data.forEach((elem, index) => {
                    data.NH3.push(elem.NH3)
                    data.zhuo.push(elem.zhuo)
                    data.O2.push(elem.O2)
                    data.temperature.push(elem.temperature)
                    data.pH.push(elem.pH)
                    CanvaClass.categories.push(elem.hour+':'+elem.minute+':'+elem.second)
                })
                var displayDate = []
                if (this.data.TabCur == 0) {
                    this.setData({
                      pmax:40,
                    pmin:-4
                  })
                    displayDate = [{
                            name: "温度",
                            data: data.temperature,
                            color: "#1892EF",
                        }
                    ]
                } else if (this.data.TabCur == 7) {
                  this.setData({
                    pmax:40,
                  pmin:-4
                })
                    displayDate = [{
                                name: "含氮量",
                                data: data.NH3,
                                color: "#1892EF",
                            }
                        ]
                } else if (this.data.TabCur == 1) {
                  this.setData({
                    pmax:25,
                  pmin:0
                })
                  displayDate = [{
                              name: "溶氧量",
                              data: data.O2,
                              color: "#1892EF",
                          }
                      ]
              } else if (this.data.TabCur == 2) {
                this.setData({
                  pmax:3000,
                pmin:0
              })
                  displayDate = [{
                              name: "浑浊度",
                              data: data.zhuo,
                              color: "#1892EF",
                          }
                      ]
              } else if (this.data.TabCur == 3) {
                this.setData({
                  pmax:14,
                pmin:0
              })
                    displayDate = [
                        {
                            name: "PH值",
                            data: data.pH,
                            color: "#FFCF10",
                        }
                    ]
                }
                console.log(displayDate)

                CanvaClass.series = displayDate
                console.log(CanvaClass)
                _self.showLineA("canvasLineA", CanvaClass);
            })
        // let Column = { categories: [], series: [] };
        // Column.categories = data3.visitTrend[0].date;
        // Column.series = data3.visitTrend[0].NH3;
        // //自定义标签颜色和字体大小
        // Column.series[1].textColor = 'red';
        // Column.series[1].textSize = 18;
        // let LineA = { categories: [], series: [] };
        // //这里我后台返回的是数组，所以用等于，如果您后台返回的是单条数据，需要push进去
        // LineA.categories = res.data.data.LineA.categories;
        // LineA.series = res.data.data.LineA.series;
        // let Candle = {categories: [],series: []};
        // //这里我后台返回的是数组，所以用等于，如果您后台返回的是单条数据，需要push进去
        // Candle.categories = res.data.data.Candle.categories;
        // Candle.series = res.data.data.Candle.series;
        // _self.showColumn("canvasColumn", Column);
        // _self.showLineA("canvasLineA", LineA);
        // _self.showCandle("canvasCandle", Candle);
     
  },
  showColumn(canvasId, chartData) {
    let ctx = wx.createCanvasContext(canvasId, this);
    canvaColumn = new uCharts({
      type: 'column',
      context: ctx,
      legend: true,
      fontSize: 11,
      background: '#FFFFFF',
      pixelRatio: 1,
      animation: true,
      categories: chartData.categories,
      series: chartData.series,
      xAxis: {
        disableGrid: true,
      },
      yAxis: {
        //disabled:true
      },
      dataLabel: true,
      width: _self.cWidth ,
      height: _self.cHeight ,
      extra: {
        column: {
          type: 'group',
          width: _self.cWidth * 0.45 / chartData.categories.length
        }
      }
    });

  },
  touchColumn(e) {
    canvaColumn.showToolTip(e, {
      formatter: function (item, category) {
        if (typeof item.data === 'object') {
          return category + ' ' + item.name + ':' + item.data.value
        } else {
          return category + ' ' + item.name + ':' + item.data
        }
      }
    });
  },
  showLineA(canvasId, chartData) {
    let ctx = wx.createCanvasContext(canvasId, this);
    canvaLineA = new uCharts({
      type: 'line',
      context: ctx,
      fontSize: 11,
      legend: true,
      dataLabel: true,
      dataPointShape: true,
      background: '#FFFFFF',
      pixelRatio: 1,
      categories: chartData.categories,
      series: chartData.series,
      animation: true,
      enableScroll: true,//开启图表拖拽功能
      xAxis: {
        disableGrid: false,
        type: 'grid',
        gridType: 'dash',
        itemCount: 4,
        scrollShow: true,
        scrollAlign: 'left',
        //scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
        //scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
      },
      yAxis: {
        //disabled:true
        gridType: 'dash',
        splitNumber: 8,
        min: this.data.pmin,
        max: this.data.pmax,
        formatter: (val) => { return val.toFixed(0) }//如不写此方法，Y轴刻度默认保留两位小数
      },
      width: _self.cWidth,
      height: _self.cHeight,
      extra: {
        line: {
          type: 'straight'
        }
      },
    });

  },
  touchLineA(e) {
    canvaLineA.scrollStart(e);
  },
  moveLineA(e) {
    canvaLineA.scroll(e);
  },
  touchEndLineA(e) {
    canvaLineA.scrollEnd(e);
    //下面是toolTip事件，如果滚动后不需要显示，可不填写
    canvaLineA.showToolTip(e, {
      formatter: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  showCandle(canvasId, chartData) {
    let ctx = wx.createCanvasContext(canvasId, this);
    canvaCandle = new uCharts({
      type: 'candle',
      context: ctx,
      fontSize: 11,
      legend: true,
      background: '#FFFFFF',
      pixelRatio: 1,
      categories: chartData.categories,
      series: chartData.series,
      animation: true,
      enableScroll: true,
      xAxis: {
        disableGrid: true,
        itemCount: 20,
        scrollShow: true,
        scrollAlign: 'right',
        labelCount:4,
      },
      yAxis: {
        //disabled:true
        gridType: 'dash',
        splitNumber: 5,
        formatter: (val) => {
          return val.toFixed(0)
        }
      },
      width: _self.cWidth,
      height: _self.cHeight,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        candle: {
          color: {
            upLine: '#f04864',
            upFill: '#f04864',
            downLine: '#2fc25b',
            downFill: '#2fc25b'
          },
          average: {
            show: true,
            name: ['MA5', 'MA10', 'MA30'],
            day: [5, 10, 30],
            color: ['#1890ff', '#2fc25b', '#facc14']
          }
        },
        tooltip: {
          bgColor: '#000000',
          bgOpacity: 0.7,
          gridType: 'dash',
          dashLength: 5,
          gridColor: '#1890ff',
          fontColor: '#FFFFFF',
          horizentalLine: true,
          xAxisLabel: true,
          yAxisLabel: true,
          labelBgColor: '#DFE8FF',
          labelBgOpacity: 0.95,
          labelAlign: 'left',
          labelFontColor: '#666666'
        }
      },
    });

  },
  touchCandle(e) {
    canvaCandle.scrollStart(e);
  },
  moveCandle(e) {
    canvaCandle.scroll(e);
  },
  touchEndCandle(e) {
    canvaCandle.scrollEnd(e);
    //下面是toolTip事件，如果滚动后不需要显示，可不填写
    canvaCandle.showToolTip(e, {
      formatter: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
})
