<template>
  <div class="layer">
    <!--     <Scroll height="750"> -->
    <!-- 岩层参数 -->
    <RockLayer :viewer="viewer" :projectID="projectID" />
    <div style="position:relative; left:20px;">
      <!-- 断面参数 -->
      <SectionLayer :viewer="viewer" :projectID="projectID" />
    </div>

    <!-- 炮眼设计 -->
    <ShotHoleLayer
      :viewer="viewer"
      :projectID="projectID"
      :iseditable="iseditable"
      :shotData="shotData"
      ref="shotholeRef"
    />
    <!-- 起爆顺序 -->
    <BlastOrderLayer
      :viewer="viewer"
      :projectID="projectID"
      :iseditable="iseditable"
      :shotData="shotData"
      ref="blastOrderRef"
    />
    <div style="position:relative; left:20px;">
      <!-- 避难路线 -->
      <RouteLayer
        :viewer="viewer"
        :projectID="projectID"
        :lanwayData="lanwayData"
      />
      <!-- 施工组织 -->
      <OrganizationLayer :viewer="viewer" :projectID="projectID" />
      <!-- 施工进度 -->
      <ProcessLayer :viewer="viewer" :projectID="projectID" />
    </div>
    <!--     </Scroll> -->

    <Modal
      v-model="showDialog"
      title="设备详情"
      width="600px"
      draggable
      :styles="{ left: '20px' }"
    >
      <!--       <Modelmodify
        v-on:childByValue="childByValue(arguments)"
        v-if="showDialog"
        :xxxData="xxxData"
        :mineid="mineid"
        :iseditable="iseditable"
      ></Modelmodify> -->
      <div slot="footer"></div>
    </Modal>
    <Modal
      v-model="showModal"
      title="人员定位"
      draggable
      scrollable
      footer-hide
      width="1000px"
    >
    </Modal>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
// import Cesium from "cesium/Cesium.js";
import RockLayer from "./rockLayer/rockLayer.vue";
import SectionLayer from "./sectionLayer/sectionLayer.vue";
import ShotHoleLayer from "./shotHoleLayer/shotHoleLayer.vue";
import BlastOrderLayer from "./blastOrderLayer/blastOrderLayer.vue";
import RouteLayer from "./routeLayer/routeLayer.vue";
import OrganizationLayer from "./organizationLayer/organizationLayer.vue";
import ProcessLayer from "./processLayer/processLayer.vue";

/* import Modelmodify from "../views/modelModify.vue";
import UndergroundMode from "../views/UndergroundMode.vue";
import personPosition from "./person/personPosition.vue"; */

// import { Color } from 'cesium';
export default {
  data() {
    return {
      treeData: [
        {
          id: "1",
          title: "人员定位",
          expand: false,
          render: (h, { root, node, data }) => {
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%"
                }
              },
              [h("span", [h("span", data.title)])]
            );
          },
          children: []
        },
        {
          id: "2",
          title: "监控模型",
          expand: false,
          render: (h, { root, node, data }) => {
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%"
                }
              },
              [h("span", [h("span", data.title)])]
            );
          },
          children: []
        }
      ],
      equipmentData: [],
      persorientatioData: [],
      sensorData: [],
      showDialog: false,
      xxxData: {},
      iseditable: "",
      stationName: "",
      showModal: false,
      persontime: {},
      sernortime: {},
      shotData: [],
      lanwayData: []
    };
  },
  components: {
    RockLayer,
    SectionLayer,
    ShotHoleLayer,
    BlastOrderLayer,
    RouteLayer,
    OrganizationLayer,
    ProcessLayer
    /*     Modelmodify,
    UndergroundMode,
    personPosition, */
  },
  props: {
    // API URL
    url: {
      type: String,
      default: ""
    },
    viewer: {
      type: Object,
      default: () => {}
    },
    // URL路径中的参数，如：/posts/#{id}/comments
    pathParams: {
      type: Object,
      default: () => {}
    },
    // Query参数
    options: {
      type: Object,
      default: function() {
        return { params: {} };
      }
    },
    //项目id
    projectID: "",
    iseditable: {
      type: String,
      default: ""
    },
    ctx: {
      type: Object,
      default: () => {}
    }
  },
  created() {
    if (this.projectID != "") {
      this.gettree();
    }
  },

  watch: {
    projectID(val) {
      this.gettree();
      this.getShotholeData();
      this.getLanwayData();
    }
  },

  methods: {
    gettree() {
      this.persorientatioData = [];
      this.sensorData = [];
      this.equipmentData = [];
      this.treeData.forEach(it => {
        it.checked = false;
        it.expand = false;
        it.children = [];
        if (it.title == "人员定位") {
          this.$axios("api/persorientatio", {
            params: {
              mineTable: this.mineid + "persorientatio"
            }
          })
            .then(res => {
              this.persorientatioData = res.data.data;
              this.persorientatioData.forEach(a => {
                it.children.push({
                  title: a.installationsite,
                  id: a.tableType * 100000 + a.sid,
                  disableCheckbox: true
                });
              });
            })
            .catch(error => {});
        } else if (it.title == "监控模型") {
          this.$axios("api/sensor", {
            params: {
              mineTable: this.mineid + "sensordata"
            }
          })
            .then(res => {
              var sensor = res.data.data;
              // console.log(sensor)
              var deviceClass = []; //保存二级标题的数组
              sensor.forEach(a => {
                if (a.sensorType == 1) {
                  this.sensorData.push(a);
                  if (deviceClass.indexOf(a.deviceName) == -1) {
                    //如果不存在就存入二级菜单的数组
                    deviceClass.push(a.deviceName);
                    it.children.push({
                      title: a.deviceName,
                      children: [],
                      render: (h, { root, node, data }) => {
                        return h(
                          "span",
                          {
                            style: {
                              display: "inline-block",
                              width: "100%"
                            }
                          },
                          [h("span", [h("span", data.title)])]
                        );
                      },
                      expand: false,
                      checked: false,
                      disableCheckbox: true
                    });
                    it.children.forEach(item => {
                      if (item.title == a.deviceName) {
                        item.children.push({
                          title: a.position,
                          id: a.tableType * 100000 + a.sid,
                          disableCheckbox: true
                        });
                      }
                    });
                  } else {
                    it.children.forEach(item => {
                      if (item.title == a.deviceName) {
                        item.children.push({
                          title: a.position,
                          id: a.tableType * 100000 + a.sid,
                          disableCheckbox: true
                        });
                      }
                    });
                  }
                }
              });
            })
            .catch(error => {});
        } else if (it.title == "矿用设备") {
          this.$axios("api/equipment", {
            params: {
              mineTable: this.mineid + "equipmentdata"
            }
          })
            .then(res => {
              this.equipmentData = res.data.data;
              var deviceClass = []; //保存二级标题的数组
              this.equipmentData.forEach(a => {
                if (deviceClass.indexOf(a.equipmentType) == -1) {
                  //如果不存在就存入二级菜单的数组
                  deviceClass.push(a.equipmentType);
                  it.children.push({
                    title: a.equipmentType,
                    children: [],
                    render: (h, { root, node, data }) => {
                      return h(
                        "span",
                        {
                          style: {
                            display: "inline-block",
                            width: "100%"
                          }
                        },
                        [h("span", [h("span", data.title)])]
                      );
                    },
                    expand: false,
                    checked: false,
                    disableCheckbox: true
                  });
                  it.children.forEach(item => {
                    if (item.title == a.equipmentType) {
                      item.children.push({
                        title: a.equipmentName,
                        id: a.tableType * 100000 + a.sid,
                        disableCheckbox: true
                      });
                    }
                  });
                } else {
                  it.children.forEach(item => {
                    if (item.title == a.equipmentType) {
                      item.children.push({
                        title: a.equipmentName,
                        id: a.tableType * 100000 + a.sid,
                        disableCheckbox: true
                      });
                    }
                  });
                }
              });
            })
            .catch(error => {});
          this.$axios("api/sensor", {
            params: {
              mineTable: this.mineid + "sensordata"
            }
          })
            .then(res => {
              var sensor = res.data.data;
              var deviceClass = [];
              sensor.forEach(a => {
                if (a.sensorType == 0) {
                  this.equipmentData.push(a);
                  if (deviceClass.indexOf(a.deviceName) == -1) {
                    //如果不存在就存入二级菜单的数组
                    deviceClass.push(a.deviceName);
                    it.children.push({
                      title: a.deviceName,
                      expand: false,
                      children: [],
                      render: (h, { root, node, data }) => {
                        return h(
                          "span",
                          {
                            style: {
                              display: "inline-block",
                              width: "100%"
                            }
                          },
                          [h("span", [h("span", data.title)])]
                        );
                      },
                      disableCheckbox: true
                    });
                    it.children.forEach(item => {
                      if (item.title == a.deviceName) {
                        item.children.push({
                          title: a.sensorName,
                          id: a.tableType * 100000 + a.sid,
                          disableCheckbox: true
                        });
                      }
                    });
                  } else {
                    it.children.forEach(item => {
                      if (item.title == a.deviceName) {
                        item.children.push({
                          title: a.sensorName,
                          id: a.tableType * 100000 + a.sid,
                          disableCheckbox: true
                        });
                      }
                    });
                  }
                }
              });
            })
            .catch(error => {});
        }
      });
    },
    //异步获取炮眼数据
    getShotholeData() {
      this.$axios("shothole", {
        params: {
          id: 1
        }
      })
        .then(res => {
          if (res.data.code == 0) {
            this.shotData = res.data.data.shotData;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //异步获取巷道数据
    getLanwayData() {
      this.$axios("lanway")
        .then(res => {
          if (res.data.code == 0) {
            this.lanwayData = res.data.data;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    renderContent(h, { root, node, data }) {
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            width: "100%"
          }
        },
        [
          h(
            "span",
            {
              style: {
                color: "#666",
                cursor: "pointer"
              },
              domProps: {
                className: "btn"
              },
              on: {
                click: () => {
                  this.clickItem(data);
                }
              }
            },
            data.title
          ),
          h(
            "span",
            {
              style: {
                display: "inline-block",
                float: "right",
                marginRight: "35px"
              }
            },
            [
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "ios-create-outline",
                  size: "small"
                }),
                style: {
                  marginRight: "8px"
                },
                on: {
                  click: () => {
                    this.modify(data);
                  }
                }
              })
            ]
          )
        ]
      );
    },
    modify(data) {
      console.log(data.id);
      this.showDialog = true;
      this.xxxData = data.id;
    },
    checkItem(selectedArr, selectedItem) {
      // console.log("===selectedItem.checked===" + selectedItem.checked);
      if (selectedItem.checked == false) {
        if (selectedItem.title == "人员定位") {
          clearInterval(this.persontime);
          selectedItem.children.forEach(it => {
            this.viewer.entities.removeById(it.id);
          });
          return;
        } else if (selectedItem.title == "监控模型") {
          clearInterval(this.sernortime);
        }
        selectedItem.children.forEach(it => {
          it.children.forEach(item => {
            this.viewer.entities.removeById(item.id);
          });
        });

        return;
      }

      var modelData = [];
      if (selectedItem.title == "矿用设备") {
        modelData = this.equipmentData;
        // console.log("===equipmentData" + modelData);
      } else if (selectedItem.title == "人员定位") {
        modelData = this.persorientatioData;
        // console.log("===persorientatioData" + modelData);
      } else if (selectedItem.title == "监控模型") {
        modelData = this.sensorData;
        // console.log("===sensorData" );
      }
      modelData.forEach(it => {
        var position = Cesium.Cartesian3.fromDegrees(
          it.posY,
          it.posX,
          it.posZ + 1.5
        );
        var heading = Cesium.Math.toRadians(it.rotationY); //俯仰角
        var pitch = Cesium.Math.toRadians(it.rotationX); //偏行角
        var roll = Cesium.Math.toRadians(it.rotationZ); //滚转角
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(
          position,
          hpr
        );
        this.viewer.entities.add({
          id: it.tableType * 100000 + it.sid,
          name: it.installationsite || it.equipmentName,
          position: position,
          orientation: orientation,
          label: {
            text: it.name || it.sensorName || it.equipmentName,
            eyeOffset: new Cesium.Cartesian3(0, 0.3, 0),
            fillColor: Cesium.Color.ORANGE,
            font: "30px sans-serif",
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 70)
          },
          model: {
            uri: "model3D/CesiumBalloon/" + it.modelName,
            scale: it.scale
          }
        });
      });
      let that = this;
      if (selectedItem.title == "人员定位") {
        that.getpersontime(modelData, that);
        that.persontime = setInterval(
          that.getpersontime(modelData, that),
          300000
        );
      } else if (selectedItem.title == "监控模型") {
        that.getSernorTime(modelData, that);
        that.sernortime = setInterval(
          that.getSernorTime(modelData, that),
          300000
        );
      }
    },
    getpersontime(modelData, that) {
      for (let i = 0; i < modelData.length; i++) {
        console.log(modelData[i]);
        let idtime = modelData[i].tableType * 100000 + modelData[i].sid;
        that
          .$axios({
            url: "api/sensor&person-info/personRealTimeList-info",
            method: "get",
            params: {
              stationName: modelData[i].installationsite,
              mine: that.mineid
            }
          })
          .then(res => {
            let dataCount = res.data.rows.length;
            that.treeData[0].children[i].title =
              modelData[i].installationsite + "(" + dataCount + "人)";
            that.viewer.entities.getById(
              idtime
            ).label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
              0,
              70
            );
            that.viewer.entities.getById(idtime).label.text =
              modelData[i].installationsite + "\n" + dataCount + "人";
          });
      }
    },
    getSernorTime(modelData, that) {
      var measureType = {
        一氧化碳: 2004,
        主扇开停: 1003,
        二氧化碳: 2063,
        二级断电: 1503,
        低浓度甲烷: 2001,
        其它: 1005,
        压差: 2008,
        压风机开停: 1018,
        局扇开停: 1002,
        氧气: 2062,
        水位: 2023,
        水泵开停: 1009,
        流量: 2009,
        温度: 2005,
        烟雾: 2028,
        甲烷: 2002,
        负压: 2039,
        风筒: 1007,
        风速: 2003,
        风门: 1006,
        馈电开停: 1004
      };
      modelData.forEach(i => {
        let idtime = i.tableType * 100000 + i.sid;
        that
          .$axios({
            url: "api/sensor&person-info/sensorCurrentList-info",
            method: "get",
            params: {
              // SENSOR_ID: i.sensorID,
              // LOCATION: i.position,
              MINE_ID: that.mineid,
              MEASURE_TYPE: measureType.deviceName
            }
          })
          .then(res => {
            // console.log(res.data)
            let sersortime = res.data.rows;
            // console.log(typeof sersortime[0].STATUS)
            that.viewer.entities.getById(
              idtime
            ).label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
              0,
              70
            );
            if (sersortime[0].STATUS == 2) {
              that.viewer.entities.getById(idtime).label.fillColor =
                Cesium.Color.RED;
            }
            that.viewer.entities.getById(idtime).label.text =
              i.position +
              "\n" +
              sersortime[0].STR_DATA_VALUE +
              sersortime[0].UNIT;
          })
          .catch(error => {
            that.viewer.entities.getById(idtime).label.text =
              i.position + "\n" + "暂无数据";
          });
      });
    },
    clickItem(clickedItem) {
      // console.log(clickedItem);
      var getByIdEntity = this.viewer.entities.getById(clickedItem.id);
      // console.log(getByIdEntity)
      // this.viewer.zoomTo(getByIdEntity);
      this.viewer.zoomTo(
        getByIdEntity,
        new Cesium.HeadingPitchRange(0, -0.8, 20)
      );
    },
    childByValue(childValue) {
      // childValue就是子组件传过来的值
      this.stationName = childValue[0];
      this.showDialog = !childValue[1];
      this.showModal = childValue[1];
    }
  }
};
</script>
<style scoped>
.layer >>> .ivu-scroll-container {
  overflow-x: hidden;
}
.layer >>> .ivu-scroll-container::-webkit-scrollbar {
  width: 0 !important;
}
</style>
