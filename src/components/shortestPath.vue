<template>
  <div>
    <span>请选择路径分析类型：</span>
    <br />
    <br />
    <RadioGroup v-model="type">
      <Radio label="bhs">
        <span>最近庇护所</span>
      </Radio>
      <br />
      <Radio label="jk">
        <span>最近井口</span>
      </Radio>
      <br />
      <Radio label="zdy">
        <span>自定义</span>
      </Radio>
    </RadioGroup>
    <br />
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="选起始点"
      @click="select(type)"
      >选择起点</i-button
    >

    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="最短路径"
      @click="generatePath(type)"
      >生成最短路径</i-button
    >

    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="清除"
      @click="remove()"
      >清除</i-button
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "zdy",
      pointNum: 0,
      positions: [],
      firstTunnel: "",
      secondTunnel: "",
      mineTable: "",
      firstPoint: [],
      secondPoint: [],
      temp: [],
      firtemp: [],
      bhstemp: [],
      jktemp: [],
      distemp: [],
      shortestdis: 0,
      bool: false,
      bhs: [],
      jk: [],
      bhsdis: 0,
      jkdis: [],
      shortestbhs: "",
      shortestjk: "",
      bhsDis: 0,
      jkDis: 0,
      handler: [],
      bhsAlldata: [],
      bhstt: [],
      minindex: 0,
      bhsdata: [],
      bhsname: "",
    };
  },
  props: {
    // API URL
    xxxData: {
      type: String,
      default: null,
    },
    viewer: {
      type: Object,
      default: () => {},
    },
    // URL路径中的参数，如：/posts/#{id}/comments
    mineid: {
      type: String,
      default: "",
    },
  },

  methods: {
    /////////////////////////选择起始点
    select(type) {
      switch (type) {
        case "bhs": //庇护所
          var body = document.querySelector("body");
          body.style.cursor = "pointer";
          this.toggleClick1();
          break;
        case "jk": //井口
          var body = document.querySelector("body");
          body.style.cursor = "pointer";
          this.toggleClick1();
          break;
        case "zdy": //自定义
          var body = document.querySelector("body");
          body.style.cursor = "pointer";
          this.toggleClick2();
          break;
      }
    },
    //庇护所、井口类型
    toggleClick1() {
      var self = this;
      self.bool = true;
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      //定义左击事件
      this.handler.setInputAction(function (movement) {
        if (self.bool) {
          var pickedObject = viewer.scene.pick(movement.position);
          if (
            viewer.scene.pickPositionSupported &&
            Cesium.defined(pickedObject)
          ) {
            //判断是否拾取到模型
            var cartesian = viewer.scene.pickPosition(movement.position); //若拾取到模型，则保存拾取点笛卡尔坐标
          }
          //选择起始点
          if (self.pointNum == 0) {
            self.positions.push(cartesian);
            self.firstTunnel = pickedObject.id.id.split("_");
            self.firstTunnel = self.firstTunnel[1];
            var pinBuilder = new Cesium.PinBuilder();
            var redPin = viewer.entities.add({
              id: ++self.pointNum,
              name: "Blank blue pin",
              position: cartesian,
              billboard: {
                image: pinBuilder.fromColor(Cesium.Color.RED, 48).toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              },
            });
            console.log(self.pointNum);
          } else {
            alert("只能选一个点");
          }
        } else {
          return;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //自定义类型
    toggleClick2() {
      var self = this;
      self.bool = true;
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      //定义左击事件
      this.handler.setInputAction(function (movement) {
        if (self.bool) {
          var pickedObject = viewer.scene.pick(movement.position);
          if (
            viewer.scene.pickPositionSupported &&
            Cesium.defined(pickedObject)
          ) {
            //判断是否拾取到模型
            var cartesian = viewer.scene.pickPosition(movement.position); //若拾取到模型，则保存拾取点笛卡尔坐标
          }
          //判断是起始点还是终点
          if (self.pointNum == 0) {
            self.positions.push(cartesian);
            self.firstTunnel = pickedObject.id.id.split("_");
            self.firstTunnel = self.firstTunnel[1];
            console.log(self.firstTunnel);
            var pinBuilder = new Cesium.PinBuilder();
            var redPin = viewer.entities.add({
              id: ++self.pointNum,
              name: "Blank blue pin",
              position: cartesian,
              billboard: {
                image: pinBuilder.fromColor(Cesium.Color.RED, 48).toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              },
            });
          } else if (self.pointNum == 1) {
            self.positions.push(cartesian);
            self.secondTunnel = pickedObject.id.id.split("_");
            self.secondTunnel = self.secondTunnel[1];
            console.log(self.secondTunnel);
            var pinBuilder2 = new Cesium.PinBuilder();
            var greenPin = viewer.entities.add({
              id: ++self.pointNum,
              name: "Blank blue pin",
              position: cartesian,
              billboard: {
                image: pinBuilder2
                  .fromColor(Cesium.Color.GREEN, 48)
                  .toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              },
            });
          } else {
            alert("只能选两个点");
          }
        } else {
          return;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    ///////////////////////////////生成最短路径
    generatePath(type) {
      switch (type) {
        case "bhs": //庇护所
          this.getPath1();
          break;
        case "jk": //井口
          this.getPath2();
          break;
        case "zdy": //自定义
          this.getPath3();
          break;
      }
    },
    //庇护所
    getPath1() {
      //得到庇护所信息
      this.mineTable = this.mineid + "sensordata";
      this.$axios({
        url: "api/sensor",
        params: {
          mineTable: this.mineTable,
        },
      })
        .then((res) => {
          this.temp = res.data.data;
          for (var i = 0; i < this.temp.length; i++) {
            if (this.temp[i].deviceName == "避灾硐室") {
              this.bhstemp.push(this.temp[i]);
            }
          }
          //console.log(this.bhstemp);
          if (this.bhstemp.length == 0) {
            alert("没有找到避灾硐室！");
            return;
          }
          for (var i = 0; i < this.bhstemp.length; i++) {
            this.bhs[i] = new Array();
            this.bhs[i][0] = this.bhstemp[i].sensorName; //庇护所名称
            this.bhs[i][1] = this.bhstemp[i].posY;
            this.bhs[i][2] = this.bhstemp[i].posX;
            this.bhs[i][3] = this.bhstemp[i].posZ;
            this.bhs[i][4] = this.bhstemp[i].position; //庇护所所在巷道名
          }
          //计算起始点的经纬度
          let point1cartographic = Cesium.Cartographic.fromCartesian(
            this.positions[0]
          );
          var point1lng = Cesium.Math.toDegrees(point1cartographic.longitude);
          var point1lat = Cesium.Math.toDegrees(point1cartographic.latitude);
          this.firstPoint[0] = point1lng;
          this.firstPoint[1] = point1lat;
          this.firstPoint[2] = point1cartographic.height;
        })

        .then(() => {
          this.mineTable = this.mineid + "tunneldata";
          this.$axios({
            url: "api/shortestpath",
            params: {
              mineTable: this.mineTable,
              firstTunnel: this.firstTunnel,
              secondTunnel: this.bhs[0][4],
              firstPointx: this.firstPoint[0],
              firstPointy: this.firstPoint[1],
              firstPointz: this.firstPoint[2],
              secondPointx: this.bhs[0][1],
              secondPointy: this.bhs[0][2],
              secondPointz: this.bhs[0][3],
            },
          })
            .then((res) => {
              this.bhsdata = res.data.data;
              this.bhsdis = this.bhsdata.pop();
              for (var i = 1; i < this.bhstemp.length; i++) {
                //请求最短路径数据
                this.$axios({
                  url: "api/shortestpath",
                  params: {
                    mineTable: this.mineTable,
                    firstTunnel: this.firstTunnel,
                    secondTunnel: this.bhs[i][4],
                    firstPointx: this.firstPoint[0],
                    firstPointy: this.firstPoint[1],
                    firstPointz: this.firstPoint[2],
                    secondPointx: this.bhs[i][1],
                    secondPointy: this.bhs[i][2],
                    secondPointz: this.bhs[i][3],
                  },
                })
                  .then((res) => {
                    this.temp = res.data.data;
                    var tempdis = this.temp.pop();
                    if (tempdis < this.bhsdis) {
                      this.bhsdis = tempdis;
                      this.bhsdata = [];
                      for (var i = 0; i < this.temp.length; i++) {
                        this.bhsdata.push(this.temp[i]);
                      }
                    }
                  })
                  .catch((error) => {});
              }
            })
            .catch((error) => {});

          var that = this;
          setTimeout(() => {
            for (var i = 0; i < that.bhsdata.length; i++) {
              //高程处理
              if (i == 2) {
                that.bhsdata[i] += 0.5;
              } else if (++i % 3 == 0) {
                var t = --i;
                that.bhsdata[t] += 5.5;
              } else {
                --i;
              }
            }

            var orangeOutlined = viewer.entities.add({
              id: 555,
              name:
                "Orange line with black outline at height and following the surface",
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                  that.bhsdata
                ),
                width: 5,
                material: new Cesium.PolylineOutlineMaterialProperty({
                  color: Cesium.Color.RED,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.BLACK,
                }),
              },
            });
            // that.shortestbhs = that.bhs[minindex][0];/////
            that.$store.dispatch(
              "setCMsg",
              // "最近庇护所：" +
              //   that.shortestbhs +
              //   "||" +
              "距离：" + that.bhsdis + "米"
            );
          }, 4000);
        })
        .catch((error) => {});
    },
    //井口
    getPath2() {
      //得到井口信息
      this.mineTable = this.mineid + "sensordata";
      this.$axios({
        url: "api/sensor",
        params: {
          mineTable: this.mineTable,
        },
      })
        .then((res) => {
          this.temp = res.data.data;
          for (var i = 0; i < this.temp.length; i++) {
            if (this.temp[i].sensorName == "主斜井井口") {
              this.jktemp.push(this.temp[i]);
              console.log(this.jktemp);
            }
          }
          if (this.jktemp.length == 0) {
            alert("没有找到井口！");
            return;
          }

          this.jk[0] = this.jktemp[0].sensorName; //井口名称
          this.jk[1] = this.jktemp[0].posY;
          this.jk[2] = this.jktemp[0].posX;
          this.jk[3] = this.jktemp[0].posZ;
          this.jk[4] = this.jktemp[0].position; //井口所在巷道名

          console.log("jk:" + this.jk);
          //计算起始点的经纬度
          let point1cartographic = Cesium.Cartographic.fromCartesian(
            this.positions[0]
          );
          var point1lng = Cesium.Math.toDegrees(point1cartographic.longitude);
          var point1lat = Cesium.Math.toDegrees(point1cartographic.latitude);
          this.firstPoint[0] = point1lng;
          this.firstPoint[1] = point1lat;
          this.firstPoint[2] = point1cartographic.height;
        })
        .then(() => {
          //求出最近的井口
          this.mineTable = this.mineid + "tunneldata";

          //请求最短路径数据
          this.$axios({
            url: "api/shortestpath",
            params: {
              mineTable: this.mineTable,
              firstTunnel: this.firstTunnel,
              secondTunnel: this.jk[4],
              firstPointx: this.firstPoint[0],
              firstPointy: this.firstPoint[1],
              firstPointz: this.firstPoint[2],
              secondPointx: this.jk[1],
              secondPointy: this.jk[2],
              secondPointz: this.jk[3],
            },
          })
            .then((res) => {
              this.temp = res.data.data;
              for (var i = 0; i < this.temp.length; i++) {
                if (i == 2) {
                  this.temp[i] = this.temp[i] + 0.5;
                  //console.log(i+""+this.temp[i]);
                } else if (++i % 3 == 0) {
                  var t = --i;
                  this.temp[t] = this.temp[t] + 5.5;
                  // console.log(i+""+this.temp[i]);
                } else {
                  --i;
                }
              }
              this.jkDis = this.temp.pop(); //到主井口距离
              this.shortestjk = this.jk[0]; //主井口名称
              //console.log(this.temp);
              
             
              var orangeOutlined = viewer.entities.add({
                id: 555,
                name:
                  "Orange line with black outline at height and following the surface",
                polyline: {
                  positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                    this.temp
                  ),
                  width: 5,
                  material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.RED,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.BLACK,
                  }),
                },
              });
              this.$store.dispatch(
                "setCMsg",
                "最近井口：" +
                  this.shortestjk +
                  "||" +
                  "距离：" +
                  this.jkDis +
                  "米"
              );
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    },
    //自定义类型
    getPath3() {
      //获取煤矿id
      this.mineTable = this.mineid + "tunneldata";
      if (this.pointNum == 0) {
        alert("请选择起始点和终点");
      } else if (this.pointNum == 1) {
        alert("请选择终点");
      } else {
        //计算两个插入点的经纬度
        let point1cartographic = Cesium.Cartographic.fromCartesian(
          this.positions[0]
        );
        let point2cartographic = Cesium.Cartographic.fromCartesian(
          this.positions[1]
        );
        var point1lng = Cesium.Math.toDegrees(point1cartographic.longitude);
        var point1lat = Cesium.Math.toDegrees(point1cartographic.latitude);
        var point2lng = Cesium.Math.toDegrees(point2cartographic.longitude);
        var point2lat = Cesium.Math.toDegrees(point2cartographic.latitude);
        this.firstPoint[0] = point1lng;
        this.firstPoint[1] = point1lat;
        this.firstPoint[2] = point1cartographic.height;
        this.secondPoint[0] = point2lng;
        this.secondPoint[1] = point2lat;
        this.secondPoint[2] = point2cartographic.height;

        //请求最短路径数据
        this.$axios({
          url: "api/shortestpath",
          params: {
            mineTable: this.mineTable,
            firstTunnel: this.firstTunnel,
            secondTunnel: this.secondTunnel,
            firstPointx: this.firstPoint[0],
            firstPointy: this.firstPoint[1],
            firstPointz: this.firstPoint[2],
            secondPointx: this.secondPoint[0],
            secondPointy: this.secondPoint[1],
            secondPointz: this.secondPoint[2],
          },
        })
          .then((res) => {
            this.temp = res.data.data;
            this.shortestdis=this.temp.pop();
            for (var i = 0; i < this.temp.length; i++) {
              if (i == 2) {
                this.temp[i] = this.temp[i] + 0.5;
                //console.log(i+""+this.temp[i]);
              } else if (i == this.temp.length - 1) {
                this.temp[i] = this.temp[i] + 0.5;
                //console.log(i+""+this.temp[i]);
              } else if (++i % 3 == 0) {
                var t = --i;
                this.temp[t] = this.temp[t] + 5.5;
                // console.log(i+""+this.temp[i]);
              } else {
                --i;
              }
            }
            

            ///创建最短路径线实体
            var orangeOutlined = viewer.entities.add({
              id: 555,
              name:
                "Orange line with black outline at height and following the surface",
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.temp),
                width: 5,
                material: new Cesium.PolylineOutlineMaterialProperty({
                  color: Cesium.Color.RED,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.BLACK,
                }),
              },
            });
            this.$store.dispatch(
              "setCMsg",
              "最短距离：" + this.shortestdis + "米"
            );
          })
          .catch((error) => {});
      }
    },

    remove() {
      var body = document.querySelector("body");
      body.style.cursor = "default";
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
      viewer.entities.removeById(1);
      viewer.entities.removeById(2);
      //删除点路径实体
      viewer.entities.removeById(555);
      //将所有变量清空
      this.pointNum = 0;
      this.firstTunnel = "";
      this.secondTunnel = "";
      this.firPoint = [];
      this.secPoint = [];
      this.positions = [];
      this.temp = [];
      this.shortestPath = [];
      this.bool = false;
      console.log(this.pointNum);
      console.log(this.firstTunnel);
      console.log(this.secondTunnel);
      console.log(this.positions);
    },
  },
};
</script>>


<style scoped>
.ivu-modal-body {
  display: flex;
  justify-content: flex-end;
}
.ivu-btn {
  /* flex-direction: row-reverse; */
  float: right;
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>