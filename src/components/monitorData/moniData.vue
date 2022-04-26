<style scoped>
.demo-split {
  height: 600px;
  border: 1px solid #dcdee2;
}
.demo-split-pane {
  height: 500px;
  padding: 10px;
}
.demo-split-pane.no-padding {
  height: 600px;
  padding: 0;
}
.paging1 {
  float: right;
  margin-top: 10px;
  margin-bottom: 10px;
}
.paging2 {
  float: right;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>



<template>
  <div>
    <Table :columns="columns1" :data="data1" :loading="loading" highlight-row @on-row-dblclick="rowClick">
      <template slot-scope="{row}" slot="action">
        <Button type="primary" @click="ShowModal(row)">历史监测数据</Button>
        <Modal
          v-model="showModal"
          width="1000px"
          height="500px"  
          footer-hide
          scrollable 
          :transfer="false"
        >
          <p slot="header" style="text-align:center">
            <span>{{sensorName}}</span>
          </p>
          <div class="demo-split">
            <Split v-model="split3">
              <div slot="right" class="demo-split-pane no-padding">
                <Split v-model="split4" mode="vertical">
                  <div slot="top" class="demo-split-pane">
                    <div style="width:600px;height:500px" ref="myChart"></div>
                  </div>
                  <div slot="bottom" class="demo-split-pane">
                    <Tag type="border" style="margin-top:10px">自定义查询：</Tag> 
                    <Date-picker              
                      type="datetimerange"
                      confirm placement="bottom-end"                                      
                      :value= "time"                            
                      placeholder="选择日期和时间"
                      format="yyyy-MM-dd HH:mm"
                      style="width: 300px;margin-top:10px;margin-left:20px"
                      @on-change="handleChange"
                    ></Date-picker>                                                               
                    <br />
                    <Tag type="border" style="margin-left:85px;margin-top:10px" >固定时间查询：</Tag>
                    <Button @click="cuttotime(1)" style="margin-left:30px;margin-top:10px">时</Button>
                    <Button @click="cuttotime(2)" style="margin-left:50px;margin-top:10px">天</Button>
                    <!-- <Button @click="cuttotime(3)" style="margin-left:20px;margin-top:10px">周</Button>                                    -->
                    <Button @click="dataAnddraw()" style="margin-left:160px;margin-top:10px" size="large">查询</Button>
                  </div>
                </Split>
              </div>
              <div slot="left" class="demo-split-pane">
                <Table border :columns="columns2" :data="data2" :loading="loading1" @on-row-dblclick="rowClick"></Table>
                <!-- 分页 -->
                <Page
                  :total="dataCount3"
                  :page-size="pageSize2"
                  show-total
                  class="paging2"
                  @on-change="changepage2"
                ></Page>
              </div>
            </Split>
          </div>
        </Modal>
      </template>
    </Table>
    <!-- 分页 -->
    <Page
      :total="dataCount1"
      :page-size="pageSize1"
      show-total
      class="paging1"
      @on-change="changepage1"
    ></Page>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      loading1: true,
      showModal: false,
      split3: 0.35,
      split4: 0.8,
      sensorid:'',//传感器id  
      measureid:'' ,//测量id   
      time:[],//时间选择器显示的时间
      Params:[],//调接口的参数     
      test1: [],
      dataCount1: 0,
      pageSize1: 8,
      test2: [],
      test3:[],
      dataCount2: 0,
      dataCount3:0,
      pageSize2: 10,
      chartTime:[],
      chartValue:[],
      shijianduan:"",
      sensorName:"",
     
    

      columns1: [
        {
          title: "传感器ID",
          key: "SENSOR_ID",
          width: 100,
          align: "center",
        },
        {
          title: "位置",
          key: "LOCATION",
          width: 150,
          align: "center"
        },
        {
          title: "传感器类型",
          key: "SENSOR_NAME",
          width: 150,
          align: "center"
        },
        {
          title: "当前值",
          key: "DATA_VALUE",
          width: 80,
          align: "center"
        },
        {
          title: "数据获取时间",
          key: "UPDATE_TIME",
          width: 250,
          align: "center"
        },
        {
          title: "操作",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      data1: [],

      columns2: [
        {
          title: "序号",
          type: "index",
          align: "center",
          fixed: 'left',   
        },
        {
          title: "时间",
          key: "TIME",
          align: "center"
        },
        {
          title: "检测值",
          key: "STR_DATA_VALUE",
          width: 100,
          align: "center"
        }
      ],
      data2: [], 
    };
  },
  props: {   
    mineid: {
        type: String,
        default: ""
      },
       viewer: {
        type: Object,
        default: () => { }
      },   
  },

  mounted() {
     this.cuttotime(1);//获取默认时间
    
  },

  created() {
     
    this.getSCRTdata(); //获取实时数据    
  },
  
  watch: {//监听表格数据，一旦数据变化，刷新图表
    chartValue(val, newval) {
        this.drawchart();     
    },
    
              
  },       

  methods: {
       
    //显示默认弹窗
    ShowModal(row) {     
        
        this.sensorid=row.SENSOR_ID;//获取当前传感器id
        this.measureid=row.MEASURE_ID;//获取当前传感器id 
        
        this.getSSdaydata();//获取历史数据              
        this.drawchart(); //画图表  
          
         this.showModal = true;      
        
    },
        
    rowClick(row) {//点击行数据跳转模型
      //  console.log(row)
       var id=4*100000+row.SENSOR_ID;
       //console.log(id)
       var getByIdEntity = this.viewer.entities.getById(id);
       //console.log(getByIdEntity)
       this.viewer.zoomTo(getByIdEntity);
      },

    ////////调单煤矿实时监控接口数据
    getSCRTdata() {     
      //单煤矿实时数据
     
           axios
        .get("/api/sensor&person-info/sensorCurrentList-info", {
        params: {
          MINE_ID: this.mineid
        }
      })
        .then(res => {
          this.test1 = res.data.rows;               
          this.dataCount1 = this.test1.length;                  
          // 初始化显示，小于每页显示条数，全显，大于每页显示条数，取前每页条数显示
          if (this.test1.length < this.pageSize1) {
            this.data1 = this.test1;
            this.loading = false
          } else {
            this.data1 = this.test1.slice(0, this.pageSize1);
            this.loading = false
          }
        })
        .catch(error => {});
              
    },
    //表格切换页面
    changepage1(index) {
      var _start = (index - 1) * this.pageSize1;
      var _end = index * this.pageSize1;
      this.data1 = this.test1.slice(_start, _end);
    },

   
    ///////调某一传感器历史数据接口
    getSSdaydata() { 
      this.loading1 = true;
      axios
         .get("/api/sensor&person-info/sensorDataList-info",{   
           params:{
                start_TIME: this.time[0],
                end_TIME: this.time[1],
                SENSOR_ID: this.sensorid,
                MINE_ID: this.mineid                     
           }      
        })       
        .then(res => {        
          this.test2=[];
          this.test2 = res.data.rows;
          this.sensorName=this.test2[0].SENSOR_NAME+"历史监测数据";
          this.dataCount2 = this.test2.length; 
          this.test3=[];          
          if(this.shijianduan=="小时"){ //每10条数据取一条
              var n=0;
              for(var i=0;i<this.dataCount2;i+=10){
              this.test3[n]=this.test2[i];
              n++;                     
              }
              this.loading1 = false                                      
          }else if(this.shijianduan=="天"){//每200条数据取一条
              var n=0;
              for(var i=0;i<this.dataCount2;i+=200){
              this.test3[n]=this.test2[i];
              n++;
              }
              this.loading1 = false
          }else if(this.shijianduan=="周"){//每1500条数据取一条
              var n=0;
              for(var i=0;i<this.dataCount2;i+=1500){
              this.test3[n]=this.test2[i];
              n++;
              }
              this.loading1 = false
          }else{
              this.test3=this.test2;
              this.loading1 = false
          }
            //console.log(this.test3);///////             
          this.dataCount3=this.test3.length;//表格显示的数据条数 
        
          //Echarts图表显示的数据
          this.chartValue=[];
          for(var i=0;i<this.dataCount3;i++){              
              this.chartValue[this.dataCount3-1-i] = this.test3[i].STR_DATA_VALUE;
          } 
          this.chartTime=[];
          for(var i=0;i<this.dataCount3;i++){
              this.chartTime[this.dataCount3-1-i] = this.test3[i].TIME;             
          } 
                                      
          // 初始化显示，小于每页显示条数，全显；大于每页显示条数，取前每页条数显示
          if (this.test3.length < this.pageSize2) {
            this.data2 = this.test3;
            
          } else {
            this.data2 = this.test3.slice(0, this.pageSize2);
          }
        })
        .catch(error => {});
    },
    //表格切换页面
    changepage2(index) {
      this.pageNum2=index;
      var _start = (index - 1) * this.pageSize2;
      var _end = index * this.pageSize2;
      this.data2 = this.test3.slice(_start, _end);
    },
   
   

 ///点击查询更新data和图表
    dataAnddraw(){                   
      this.getSSdaydata();//获取数据
      this.drawchart(); //画图表 
                   
    },

    //切换时间
    cuttotime(n) {
      var end = new Date();     
      var y = end.getFullYear(); // 获取当前年份
      var m = end.getMonth() + 1; // 获取当前月份(0-11,0代表1月所以要加1);
      m = m < 10 ? ('0' + m) : m;
      var d = end.getDate(); // 获取当前日（1-31）
      d = d < 10 ? ('0' + d) : d;       
      var h = end.getHours();
      h = h < 10 ? ('0' + h) : h;
      var minute = end.getMinutes();
      minute = minute < 10 ? ('0' + minute) : minute;      
      this.time[1] =  y + '-' + m + '-' + d + ' ' + h + ':' + minute;

      switch (n) {
        case 1:
          var start0 = new Date();
          start0.setTime(start0.getTime() - 3600 * 1000 );     
          var y = start0.getFullYear(); // 获取当前年份
          var m = start0.getMonth() + 1; // 获取当前月份(0-11,0代表1月所以要加1);
          m = m < 10 ? ('0' + m) : m;
          var d = start0.getDate(); // 获取当前日（1-31）
          d = d < 10 ? ('0' + d) : d;       
          var h = start0.getHours();
          h = h < 10 ? ('0' + h) : h;
          var minute = start0.getMinutes();
          minute = minute < 10 ? ('0' + minute) : minute;              
          this.time[0] =  y + '-' + m + '-' + d + ' ' + h + ':' + minute;
          this.shijianduan = "小时"                                                
          break;
         
        case 2:
          var start0 = new Date();
          start0.setTime(start0.getTime() - 3600 * 1000 * 24);     
          var y = start0.getFullYear(); // 获取当前年份
          var m = start0.getMonth() + 1; // 获取当前月份(0-11,0代表1月所以要加1);
          m = m < 10 ? ('0' + m) : m;
          var d = start0.getDate(); // 获取当前日（1-31）
          d = d < 10 ? ('0' + d) : d;       
          var h = start0.getHours();
          h = h < 10 ? ('0' + h) : h;
          var minute = start0.getMinutes();
          minute = minute < 10 ? ('0' + minute) : minute;                
          this.time[0] =  y + '-' + m + '-' + d + ' ' + h + ':' + minute;                                                   
          this.shijianduan = "天" 
          break;
          
        case 3:         
          var start0 = new Date();
          start0.setTime(start0.getTime() - 3600 * 1000 * 24 * 7);     
          var y = start0.getFullYear(); // 获取当前年份
          var m = start0.getMonth() + 1; // 获取当前月份(0-11,0代表1月所以要加1);
          m = m < 10 ? ('0' + m) : m;
          var d = start0.getDate(); // 获取当前日（1-31）
          d = d < 10 ? ('0' + d) : d;       
          var h = start0.getHours();
          h = h < 10 ? ('0' + h) : h;
          var minute = start0.getMinutes();
          minute = minute < 10 ? ('0' + minute) : minute;             
          this.time[0] =  y + '-' + m + '-' + d + ' ' + h + ':' + minute;          
          this.shijianduan = "周"
          break;
          
        default:
      }
      
    },

    handleChange(time){
      this.time = time;     
    },
    
   

    //显示不同时间范围对应图表
    drawchart() {
     
      //初始化echarts实例
      var myChart = this.$echarts.init(this.$refs.myChart);
       myChart.clear();//清除之前数据  
               
     
        //图表的设置
      var option = {
        textStyle: {
          color: "rgba(0,0,0,1)"
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            saveAsImage: {
              type: "png", //	设置图片格式 png或者'jpeg
              name: "监测数据图表",
              backgroundColor: "#FFF",
              excludeComponents: ["toolbox"],
              show: true,
              title: "保存图片"
            },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] }
          }
        },
        xAxis: {
          name: '时间',
          type: 'category',
          boundaryGap: false,
          data: this.chartTime,
          splitLine: {
              show: true,
              lineStyle: {
                  color: '#999',
                  type: 'dashed',

              }
          },
        },
        yAxis: {
          name: '数值',
          type: 'value',
          scale:true
        },

        series: [{
            data: this.chartValue,
            type: 'line',
            // 显示数值
            itemStyle : { normal: {label : {show: true}}}
        }]
      
      };

     setTimeout(()=>{  
          myChart.hideLoading();
          myChart.setOption(option,true);; 
          }, 5000);
         
               
      myChart.showLoading({ 
        text: 'loading',
        color: '#c23531',      
        textColor: '#000',     
        maskColor: 'rgba(255, 255, 255, 0.2)',      
        zlevel: 0,    
      });


    }
  }
};
</script>

