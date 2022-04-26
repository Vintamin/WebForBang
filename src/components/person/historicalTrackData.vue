<style scoped>
.demo {
  height: 550px;
  width: 100%;
  border: 1px solid #dcdee2;
}
.demo-top {
  height: 50px;
  padding: 10px;
  width: 100%;
}
</style>
<template>
  <div class="demo">
    <div class="demo-top">
      <div style="float: left; width: 200px">
        <Input v-model="inputName" placeholder="请输入姓名">
          <span slot="prepend">关键字：</span>
        </Input>
      </div>
      <Col span="6" style="margin-left: 10px">
        <DatePicker
          type="daterange"
          placement="bottom-end"
          placeholder="Select date"
          style="width: 200px"
          :value="date"
          @on-change="handleChange"
        ></DatePicker>
      </Col>
      <Button type="primary" @click="searchData()" icon="ios-search"
        >查询</Button
      >
      <Button type="primary" style="float: right" @click="clear()"
        >关闭动画回放</Button
      >
      <Button type="primary" style="float: right" @click="show()"
        >历史轨迹动画回放</Button
      >
    </div>
    <div class="demo-table">
      <Table
        height="450"
        :loading="loading"
        :data="tableData"
        :columns="columns1"
        border
        @on-row-dblclick="rowClick"
      ></Table>
      <div style="margin: 10px; overflow: hidden">
        <div style="float: right">
          <Page
            :total="dataCount"
            :page-size="pageSize"
            show-total
            @on-change="changePage"
            show-elevator
          ></Page>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
export default {
  data() {
    return {
      date: [],
      inputName: "",
      personMonitorList: {},
      loading: true,
      pageSize: 10,
      dataCount: 0,
      tableData: [],
      paramData: {},
      stationData: [],
      temp: [],
      peopleTravel: [],
      index: 0,
      fir: "",
      sec: "",
      firTunnel: "",
      secTunnel: "",
      firpoint: [],
      secpoint: [],
      lastRes: [],

      columns1: [
        {
          title: "序号",
          type: "index",
          align: "center",
          width: 70,
        },
        {
          title: "员工编号",
          key: "STAFF_CODE",
          align: "center",
          width: 100,
        },
        {
          title: "姓名",
          key: "STAFF_NAME",
          align: "center",
          width: 100,
        },
        {
          title: "部门",
          key: "DEPARTMENT",
          align: "center",
          width: 100,
        },
        {
          title: "工种",
          key: "WORK_TYPE",
          align: "center",
          width: 100,
        },
        {
          title: "职务",
          key: "DUTY",
          align: "center",
          width: 100,
        },
        {
          title: "工作区域",
          key: "BS_LOC_AREA",
          align: "center",
          width: 100,
        },
        {
          title: "所在分站位置",
          key: "STATION_NAME",
          align: "center",
          width: 110,
        },
        {
          title: "所在分站时间",
          key: "IN_TIME",
          align: "center",
          width: 170,
        },
        {
          title: "入矿时间",
          key: "ENTER_WELL_TIME",
          align: "center",
          width: 170,
        },
        {
          title: "状态",
          key: "PERSONNEL_STATUS",
          align: "center",
          width: 100,
        },
      ],
      list: [],
    };
  },
  props: {
    mineid: {
      type: String,
      default: "",
    },
    // API URL
    xxxData: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: "",
    },
    viewer: {
      type: Object,
      default: () => {},
    },
    // URL路径中的参数，如：/posts/#{id}/comments
    pathParams: {
      type: Object,
      default: () => {},
    },
    // Query参数
    options: {
      type: Object,
      default: function () {
        return { params: {} };
      },
    },
  },
  created() {
    this.addDate();
    this.paramData = {
      name: this.xxxData,
      start: this.date[0],
      end: this.date[1],
      mine: this.mineid,
    };

    // console.log(this.paramData);
    this.getpersonMonitorList(this.paramData);
  },

  methods: {
    addDate() {
      var nowDate = new Date();
      var year = nowDate.getFullYear();
      var month = nowDate.getMonth() + 1;
      month = month < 10 ? "0" + month : month;
      var date = nowDate.getDate();
      date = date < 10 ? "0" + date : date;
      var systemDate = year + "-" + month + "-" + date;
      this.date = [systemDate, systemDate];
    },
    searchData() {
      this.loading = true;
      var name = this.inputName;
      var start = this.date[0];
      var end = this.date[1];
      this.paramData = {
        name: name,
        start: start,
        end: end,
        mine: this.mineid,
      };
      // console.log(this.paramData);
      this.getpersonMonitorList(this.paramData);
    },

    getpersonMonitorList(paramData) {
      this.$axios({
        url: "api/sensor&person-info/personMonitorList-info",
        method: "get",
        params: paramData,
      })
        .then((res) => {
          this.personMonitorList = res.data.rows;
          //console.log(this.personMonitorList);
          this.dataCount = res.data.rows.length;
          if (this.dataCount < this.pageSize) {
            this.tableData = this.personMonitorList;
          } else {
            this.tableData = this.personMonitorList.slice(0, this.pageSize);
          }
          this.loading = false;
        })
        .catch((error) => {});
    },
    show() {
      viewer.dataSources.removeAll();
      var mineTable = this.mineid + "tunneldata"; //巷道表名
      this.$axios({
        url: "api/persorientatio",
        method: "get",
        params: {
          mineTable: this.mineid + "persorientatio",
        },
      })
        .then((res) => {
          this.stationData = res.data.data;

          for (var i = 0; i < this.personMonitorList.length; i++) {
            this.temp[i] = this.personMonitorList[i].STATION_NAME;
          }
          for (
            var i = 0, j = 1;
            i < this.temp.length - 1, j < this.temp.length;
            i++, j++
          ) {
            this.fir = this.temp[i];
            this.sec = this.temp[j];
            if (this.fir == this.sec) {
              console.log("相同");
            } else {
              this.firTunnel = "";
              // //查找两个分站的信息当做参数传给最短路径接口
              for (let k = 0; k < this.stationData.length; k++) {
                if (this.fir == this.stationData[k].installationsite) {
                  console.log(this.fir + "-->");
                  this.firTunnel = this.stationData[k].tunnelName;
                  this.firpoint[0] = this.stationData[k].posY;
                  this.firpoint[1] = this.stationData[k].posX;
                  this.firpoint[2] = this.stationData[k].posZ;
                }
              }
              this.secTunnel = "";
              for (let k = 0; k < this.stationData.length; k++) {
                if (this.sec == this.stationData[k].installationsite) {
                  console.log(this.sec);
                  this.secTunnel = this.stationData[k].tunnelName;
                  this.secpoint[0] = this.stationData[k].posY;
                  this.secpoint[1] = this.stationData[k].posX;
                  this.secpoint[2] = this.stationData[k].posZ;
                }
              }

              if (this.firTunnel == "") {
                ////跳过查找不到的分站，规避掉实时数据对应不到数据库数据的错误
                for (var t = 0; t < j - i - 1; t++) {
                  --j;
                }
                continue;
              }
              if (this.secTunnel == "") {
                --i;
                continue;
              }
              this.list.push([
                //////参数列表
                mineTable,
                this.firTunnel,
                this.secTunnel,
                this.firpoint[0],
                this.firpoint[1],
                this.firpoint[2],
                this.secpoint[0],
                this.secpoint[1],
                this.secpoint[2],
              ]);
            }
          }
          this.getByList();
          //console.log(this.list)
        })
        .then((res) => {
          var that = this;
          setTimeout(() => {
            // console.log(that.peopleTravel);
            ////调整相机到起点
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                that.peopleTravel[1],
                that.peopleTravel[2],
                that.peopleTravel[3]+50
              ),
            });
            //   //添加czml路径
            var czml = [
              {
                id: "document",
                name: "CZML Path",
                version: "1.0",
                clock: {
                  interval: "2012-08-04T10:00:00Z/2012-08-04T15:00:00Z",
                  currentTime: "2012-08-04T10:00:00Z",
                  multiplier: 10,
                },
              },
              {
                id: "path",
                name: "path with GPS flight data",
                description:
                  "<p>Hang gliding flight log data from Daniel H. Friedman.<br>Icon created by Larisa Skosyrska from the Noun Project</p>",
                availability: "2012-08-04T10:00:00Z/2012-08-04T15:00:00Z",
                path: {
                  material: {
                    polylineOutline: {
                      color: {
                        rgba: [255, 0, 255, 255],
                      },
                      outlineColor: {
                        rgba: [0, 255, 255, 255],
                      },
                      outlineWidth: 5,
                    },
                  },
                  width: 8,
                  leadTime: 20,
                  trailTime: 1000,
                  resolution: 5,
                },
                model: {
                  gltf: "model3D/CesiumBalloon/Cesium_Man.glb",
                  scale: 1.0,
                  eyeOffset: {
                    cartesian: [0.0, 0.0, 100],
                  },
                },
                position: {
                  epoch: "2012-08-04T10:00:00Z",
                  cartographicDegrees: that.peopleTravel,
                },
              },
            ];
            viewer.dataSources
              .add(Cesium.CzmlDataSource.load(czml))
              .then(function (ds) {
                //viewer.trackedEntity = ds.entities.getById("path");

                viewer.trackedEntity.orientation = new Cesium.VelocityOrientationProperty(
                  viewer.trackedEntity.position
                ); //自动转向
              });
            this.peopleTravel = [];
          }, 500);
        })
        .catch((error) => {});
    },
    async getByList() {
      ////获取参数，调用最短路径函数
      var _this = this;
      for (let i = 0; i < this.list.length; i++) {
        //debugger
        var e = this.list[i];
        await this.getShortestData(
          e[0],
          e[1],
          e[2],
          e[3],
          e[4],
          e[5],
          e[6],
          e[7],
          e[8],
          _this
        );
      }
    },
    clear() {
      viewer.dataSources.removeAll();
    },
    rowClick(row) {
      this.$axios("api/persorientatio/Installationsite/" + row.STATION_NAME, {
        params: {
          mineTable: this.mineid + "persorientatio",
        },
      })
        .then((res) => {
          this.personId = res.data.data;
          // console.log(this.personId.id);
          // console.log(3 * 100000 + this.personId.id);
          var getByIdEntity = this.viewer.entities.getById(
            3 * 100000 + this.personId.sid
          ); //tableType*100000
          // console.log(getByIdEntity);
          this.viewer.zoomTo(getByIdEntity);
        })
        .catch((error) => {});
    },
    changePage(index) {
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.tableData = this.personMonitorList.slice(_start, _end);
    },
    handleChange(date) {
      this.date = date;
    },
    ///////调用最短路径函数
    getShortestData(
      mineTable,
      firstTunnel,
      secondTunnel,
      firstPointx,
      firstPointy,
      firstPointz,
      secondPointx,
      secondPointy,
      secondPointz,
      _this
    ) {
      // var _this = this;
      return new Promise(function (resolve, reject) {
        _this
          .$axios({
            url: "api/shortestpath",
            params: {
              mineTable: mineTable,
              firstTunnel: firstTunnel,
              secondTunnel: secondTunnel,
              firstPointx: firstPointx,
              firstPointy: firstPointy,
              firstPointz: firstPointz,
              secondPointx: secondPointx,
              secondPointy: secondPointy,
              secondPointz: secondPointz,
            },
          })
          .then((res) => {
            // debugger
            _this.lastRes = res.data.data;
            _this.lastRes.pop(); ///////////去掉最短路径结果中的距离值

            for (var i = 0; i < _this.lastRes.length; i++) {
              if (++i % 3 == 0) {
                var t = --i;
                _this.lastRes[t] += 4;
                // console.log(i+""+_this.temp[i]);
              } else {
                --i;
              }
            }
            //console.log("_this.lastRes1:" + "  " + _this.lastRes);
            //给数据加上时间属性，0,10,20，....
            for (var i = 0; i < _this.lastRes.length; i++) {
              if (_this.peopleTravel.length != 0 && i % 3 == 0) {
                _this.peopleTravel.push((_this.peopleTravel.length / 4) * 20);
                _this.peopleTravel.push(_this.lastRes[i]);
              } else {
                if (i != 0) {
                  _this.peopleTravel.push(_this.lastRes[i]);
                }
              }
              if (_this.peopleTravel.length == 0 && i == 0) {
                _this.peopleTravel.push(i);
                _this.peopleTravel.push(_this.lastRes[i]);
              }
            }
            _this.lastRes = [];
            resolve();
          })
          .catch((error) => {});
      });
    },
  },
};
</script>

