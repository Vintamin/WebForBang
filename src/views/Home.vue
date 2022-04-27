<style scoped>
.layout {
  /* height: 100vh; */
  overflow-x: hidden;
  overflow-y: hidden;
}
/* 顶部导航 */
.header-nav {
  background-color: #2940bc;
  width: 100%;
  height: 70px;
  position: relative;
}
.header-nav-letf img {
  position: absolute;
  top: 15px;
  left: 0;
  margin-left: 0.5vw;
  width: 218px;
  height: 46px;
}
.header-nav-letf h1 {
  position: absolute;
  color: white;
  top: 15px;
  left: 0;
  margin-left: 0.5vw;
  width: 218px;
  height: 46px;
}
.header-nav-right {
  position: absolute;
  top: 15px;
  right: 35px;
  height: 100%;
  /* width:70vw; */
  margin-bottom: 0;
}
.header-nav-right ul {
  float: left;
  position: relative;
  height: 100%;
  margin-right: 2px;
  color: #fff;
  min-width: 60px;
  width: 6vw;
  height: 100%;
  text-align: center;
}
.header-nav-right ul img {
  width: 25px;
  height: 25px;
}
.header-nav-right ul span {
  display: block;
  list-style: none;
  color: #fff;
  font-size: 0.8vw;
  font-family: 微软雅黑;
  /* text-align: center;
  line-height: 50px; */
  /* margin-top:15px; */
  /* margin-right:1.5vw; */
  /* margin-left:1.2vw; */
  /* margin-bottom:10px; */
  font-style: normal;
  top: 0;
  left: 0;
  cursor: pointer;
}
.header-nav-right ul .subnav {
  background-color: #fff;
  border: 1px solid grey;
  border-radius: 5%;
  display: none;
  width: 100px;
  text-align: center;
  position: absolute;
  left: 16px;
  z-index: 900;
  /* margin-left:0.5vw; */
  /* margin-top:5px; */
}
.header-nav-right ul li {
  color: #515a6e;
  /* width: 100px; */
  /* height: 30px; */
  text-align: center;
  list-style: none;
  margin-top: 5px;
  padding: 0 8px;
  font-size: 10px;
  line-height: 30px;
  cursor: pointer;
}
.header-nav-right ul li:hover {
  color: #2d8cf0;
}
.header-nav-right ul:hover .subnav {
  display: block;
  transition: 0.5s ease;
  margin-top: 0px;
  margin-left: -1vw;
  /* padding-top: -20px; */
  /* padding-bottom: 20px; */
}
/* 左侧导航 */
.left-nav-outter {
  margin-top: 0;
  position: absolute;
  left: 0;
  top: 70px;
  background-color: #ebf1fa;
  overflow-y: scroll;
  /* overflow-x: hidden; */
  height: calc(100vh - 80px);
}
.left-nav-outter::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.left-nav-max {
  width: 212px;
  background-color: #ebf1fa;
  height: calc(100vh - 70px);
}
.left-nav-max span {
  display: inline-block;
  width: 212px;
  margin-left: 0;
  background-color: #dce6f6;
  height: 40px;
  line-height: 40px;
}
.left-nav-max span img {
  margin-left: 10px;
}
.left-nav-min {
  width: 30px;
  background-color: #ebf1fa;
}
.left-nav-button {
  position: fixed;
  bottom: 45%;
  left: 216px;
  cursor: pointer;
  /* float: left; */
  z-index: 999;
  width: 20px;
  height: 100px;
  line-height: 100px;
  background: rgba(144, 152, 168, 0.8);
  margin-top: 0;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
.left-nav-button.min {
  left: 0;
}
/* 右侧地图 */
.right-map-view {
  display: flex;
  width: calc(100vw - 216px);
  float: right;
  /* height: calc(100vw - 52px); */
  /* height:400px; */
  height: calc(100vh - 78px);
  /* background-color: pink; */
  overflow-x: hidden;
  /* z-index: auto; */
  z-index: -1;
}
.right-map-view.min {
  width: calc(100vw - 29px);
}
.canvasMax{
  width: calc(40%);
}
.canvasMin{
   width: calc(40% - 187px);
}
.multi-view {
}
.cesium-single-view {
  background-color: "#fff";
  width: "100%";
}
</style>
<template>
  <div class="layout">
    <div class="header-nav">
      <div class="header-nav-letf">
        <!-- <img src="@/assets/images/logo3d.png" alt="" /> -->
        <h1>爆破三维可视化系统</h1>
      </div>
      <div class="header-nav-right">
        <ul>
          <img src="@/assets/images/矿山选择.png" alt="" />
          <span>项目选择</span>
          <div class="subnav">
            <li @click="showMasseage1('mineselect')">项目选择</li>
            <Modal
              width="375px"
              v-model="mineselect"
              title="选择项目"
              draggable
              scrollable
              footer-hide
            >
              <mineSelect
                @func="getmineid"
                :viewer="viewer"
                :authorized="authorized"
                :projectDataList="projectDataList"
              />
            </Modal>
          </div>
        </ul>
        <ul>
          <img src="@/assets/images/人员定位.png" alt="" />
          <span>人员定位</span>
          <div class="subnav">
            <li @click="showMasseage('showModal')">全部分站</li>
            <Modal
              v-model="showModal"
              title="人员定位"
              draggable
              scrollable
              footer-hide
              width="1000px"
            >
              <personPosition
                :mineid="mineid"
                :viewer="viewer"
                v-if="showModal"
              />
            </Modal>
            <li @click="showMasseage('showHistoricalData')">历史数据查询</li>
            <Modal
              v-model="showHistoricalData"
              title="历史数据查询"
              draggable
              scrollable
              footer-hide
              width="1000px"
            >
              <historicalData
                :mineid="mineid"
                :viewer="viewer"
                v-if="showHistoricalData"
              />
            </Modal>
            <li @click="showMasseage('showPersonAlarm')">人员定位报警</li>
            <Modal
              v-model="showPersonAlarm"
              title="人员定位报警"
              draggable
              scrollable
              footer-hide
              width="1000px"
            >
              <personAlarm :mineid="mineid" v-if="showPersonAlarm" />
            </Modal>
          </div>
        </ul>
        <ul>
          <img src="@/assets/images/监测监控.png" alt="" />
          <span>监测监控</span>
          <div class="subnav">
            <li @click="showMasseage('showCurrent')">实时监测数据</li>
            <Modal
              width="900px"
              height="500px"
              v-model="showCurrent"
              title="实时监测数据"
              draggable
              scrollable
            >
              <showmoniData
                v-if="showCurrent"
                :mineid="mineid"
                :viewer="viewer"
              />
            </Modal>
            <li @click="showMasseage('showAlarm')">实时报警数据</li>
            <Modal
              width="900px"
              v-model="showAlarm"
              title="实时报警数据"
              draggable
              scrollable
            >
              <showbaojingData
                :mineid="mineid"
                v-if="showAlarm"
                :viewer="viewer"
              />
            </Modal>
            <li @click="showMasseage('showET')">分类监测数据</li>
            <Modal
              width="900px"
              v-model="showET"
              title="分类监测数据"
              draggable
              scrollable
            >
              <showfenleiData :mineid="mineid" v-if="showET" :viewer="viewer" />
            </Modal>
          </div>
        </ul>
        <ul>
          <img src="@/assets/images/应急救援.png" alt="" />
          <span>应急救援</span>
          <div class="subnav">
            <li @click="showWindDriction = true">井下通风系统</li>
            <Modal
              v-model="showWindDriction"
              title="井下通风系统"
              draggable
              scrollable
              footer-hide
              width="250px"
              :z-index="1"
            >
              <showWindDriction @closeWDS="close_WDS" :viewer="viewer" />
            </Modal>
            <li @click="inundation = true">淹没分析</li>
            <Modal
              v-model="inundation"
              title="淹没分析"
              draggable
              scrollable
              footer-hide
              width="420px"
              :z-index="1"
            >
              <inundation @closeWIA="close_WIA" :viewer="viewer" />
            </Modal>
            <li @click="drillingRescue = true">钻探救援</li>
            <Modal
              v-model="drillingRescue"
              title="钻探救援"
              draggable
              scrollable
              footer-hide
              width="420px"
              :z-index="1"
            >
              <drillingRescue />
            </Modal>
            <!-- <li @click="SPAnalysis = true">避灾路径</li>
            <Modal
              width="400px"
              v-model="SPAnalysis"
              title="最短路径分析"
              draggable 
              scrollable 
              footer-hide                                             
              >
              <shortestPath  :mineid="mineid"/>                  
            </Modal> -->
          </div>
        </ul>
        <ul v-if="showtag">
          <img src="@/assets/images/风险分析.jpg" alt="" v-if="showtag" />
          <span>风险分析</span>
          <div class="subnav">
            <li @click="showMasseage('showRisk')">风险点标定</li>
            <Modal
              v-model="showRisk"
              title="风险点标定"
              draggable
              scrollable
              footer-hide
              width="1050px"
            >
              <addRisk v-if="showRisk" :viewer="viewer" :mineid="mineid" />
            </Modal>
          </div>
        </ul>
        <ul>
          <img src="@/assets/images/设备管理.png" alt="" />
          <span>设备管理</span>
          <div class="subnav">
            <li @click="showMasseage('showEuipmentModal')">矿用设备管理</li>
            <Modal
              v-model="showEuipmentModal"
              title="矿用设备管理"
              draggable
              scrollable
              footer-hide
              width="800px"
              :z-index="9999"
            >
              <euipmentModal
                :viewer="viewer"
                v-if="showEuipmentModal"
                :iseditable="iseditable"
                :mineid="mineid"
              />
            </Modal>
            <li @click="showMasseage('showPhoneModal')">井下电话管理</li>
            <Modal
              v-model="showPhoneModal"
              title="井下电话管理"
              draggable
              scrollable
              footer-hide
              width="800px"
            >
              <phoneModal
                :mineid="mineid"
                :viewer="viewer"
                v-if="showPhoneModal"
              />
            </Modal>
            <li @click="showMasseage('showmonitorModal')">工业视频联网</li>
            <Modal
              v-model="showmonitorModal"
              title="工业视频管理"
              draggable
              scrollable
              footer-hide
              width="800px"
            >
              <industryVedio
                :mineid="mineid"
                :viewer="viewer"
                v-if="showmonitorModal"
              />
            </Modal>
          </div>
        </ul>
        <ul>
          <img src="@/assets/images/工具.png" alt="" />
          <span>工具</span>
          <div class="subnav">
            <!-- <li>浏览录制</li> -->
            <li>坐标转换</li>
            <li @click="pointMeasure = true">点位量测</li>
            <Modal
              width="400px"
              v-model="pointMeasure"
              title="点位量测"
              draggable
              scrollable
              footer-hide
            >
              <pointMeasure />
            </Modal>
            <li @click="measureTool = true">地面量测</li>
            <Modal
              width="400px"
              v-model="measureTool"
              title="量测工具"
              draggable
              scrollable
              footer-hide
            >
              <measurePanel />
            </Modal>

            <li @click="coorquery = true">坐标查询</li>
            <Modal
              width="400px"
              v-model="coorquery"
              title="坐标查询"
              draggable
              scrollable
              footer-hide
            >
              <coordinateQuery />
            </Modal>
            <li @click="namequery = true">名称查询</li>
            <Modal
              width="400px"
              v-model="namequery"
              title="名称查询"
              draggable
              scrollable
              footer-hide
            >
              <nameQuery :mineid="mineid" :viewer="viewer" v-if="namequery" />
            </Modal>
            <li @click="tunnelMeasure = true">巷道距离量测</li>
            <Modal
              width="400px"
              v-model="tunnelMeasure"
              title="巷道距离量测"
              draggable
              scrollable
              footer-hide
            >
              <tunnelMeasure />
            </Modal>
            <li @click="showTunnelInfo = true">巷道属性查询</li>
            <Modal
              width="400px"
              v-model="showTunnelInfo"
              title="巷道属性查询"
              draggable
              scrollable
              footer-hide
            >
              <showTunnelInfo @closeWTP="close_WTP" :viewer="viewer" />
            </Modal>
            <li @click="saveView">保存视角</li>
            <!-- <Modal
                  width="400px"
                  v-model="tunnelMeasure"
                  title="保存视角"
                  draggable
                  scrollable
                  footer-hide
                >
                  <tunnelMeasure />
                </Modal>
                <Button
                  size="large"
                  style="text-align:left;border:none;"
                  long
                  @click="saveView"
                >保存视角
                </Button> -->
          </div>
        </ul>
        <ul>
          <img src="@/assets/images/系统帮助.png" alt="" />
          <span>系统帮助</span>
          <div class="subnav">
            <li>快捷方式</li>
            <li @click="openHelpView()">帮助</li>
          </div>
        </ul>
      </div>
    </div>
    <div class="left-nav-outter">
      <div class="left-nav-max" v-show="showMaxNav">
        <span style="font-size: 15px" v-if="showlayer">
          <img src="@/assets/images/定位(2).png" alt="" />
          {{ minevalue }}</span
        >
        <LayerManger
          style="margin-top: 5px"
          :projectID="projectID"
          :viewer="viewer"
          :iseditable="iseditable"
          :ctx="ctx"
          ref="layerMangerRef"
        />
      </div>
      <div class="left-nav-min" v-show="!showMaxNav"></div>
      <div
        class="left-nav-button"
        :class="!showMaxNav ? 'min' : ''"
        @click="exchange"
      >
        <Icon type="md-arrow-dropleft" size="30" v-show="showMaxNav" />
        <Icon type="md-arrow-dropright" size="30" v-show="!showMaxNav" />
      </div>
    </div>
    <div class="right-map-view" :class="!showMaxNav ? 'min' : ''" id="content">
      <div
        id="mapcontent2D"
        :style="{ height: '100%' }"
        :class="showMaxNav?'canvasMax':'canvasMin'"
        v-show="ifshow2D"
        ref="mapcontent2DRef"
      >
        <!-- width2D  height2D-->
        <canvas
          id="can"
          :width="width2D"
          :height="height2D"
          style="background:black"
        ></canvas>
      </div>
      <div
        id="mapcontent3D"
        :class="showMaxNav?'canvasMax':'canvasMin'"
        :style="{
          background: '#fff',
          width : width3D
        }"
      >
        <cesiumContainer
          @viewer="showViewer"
          :projectID="projectID"
          :iseditable="iseditable"
          style="height: calc(100vh - 98px)"
        />
      </div>
    </div>
    <!-- 输出狂框 -->
    <div>
      <showMsgBox
        msgHtml=""
        :plusMsgHtml="consoleMsg"
        :isShow="
          showTunnelInfo ||
            tunnelMeasure ||
            measureTool ||
            pointMeasure ||
            inundation
        "
      ></showMsgBox>
    </div>
  </div>
</template>

<script>
import showManage from "../views/admin/manager.vue";
import cesiumContainer from "../components/cesiumViewer/cesiumTunnel.vue";
import mineSelect from "../components/mineSelect/mineSelect.vue";
import personPosition from "../components/person/personPosition.vue";
import personAlarm from "../components/person/personAlarm.vue";
import historicalData from "../components/person/historicalData.vue";
import euipmentModal from "../components/Equipment/Euipment.vue";
import phoneModal from "../components/Equipment/phone.vue";
import monitor from "../components/Equipment/monitor.vue";
import measurePanel from "../components/tools/measurePanel.vue";
import pointMeasure from "../components/tools/pointMeasure.vue";
import tunnelMeasure from "../components/tools/tunnelMeasure.vue";
import showmoniData from "../components/monitorData/moniData.vue";
import showfenleiData from "../components/monitorData/fenleiData.vue";
import showbaojingData from "../components/monitorData/alarmData.vue";
import coordinateQuery from "../components/tools/coordinateQuery.vue";
import nameQuery from "../components/tools/nameQuery.vue";
import LayerManger from "@/components/layermanger.vue";
import showWindDriction from "./windDrectionShow.vue";
import showTunnelInfo from "../views/showTunnelProperty.vue";
// import cesiumContainer from "../components/cesiumViewer/czml.vue";
import showMsgBox from "../components/showMsgBox.vue";
import inundation from "../views/inundationAnalysis";
import addRisk from "./addRisk.vue";
//import shortestPath from "../components/shortestPath.vue";
import industryVedio from "./industryVedio.vue";
import drillingRescue from "./drillingRescue.vue";
import Cesium from "cesium/Cesium.js";
import { EventBus } from "@/utils/bus.js";
export default {
  data() {
    return {
      showlayer: false,
      showManage: false,
      showTunnelInfo: false,
      mineselect: false,
      showModal: false,
      showmonitorModal: false,
      showPersonAlarm: false,
      showHistoricalData: false,
      showEuipmentModal: false,
      showPhoneModal: false,
      showCurrent: false,
      showAlarm: false,
      showET: false,
      showF: false,
      showFY: false,
      showJW: false,
      showSW: false,
      showWD: false,
      showYT: false,
      showRisk: false,
      pointMeasure: false,
      measureTool: false,
      tunnelMeasure: false,
      showWindDriction: false,
      namequery: false,
      coorquery: false,
      inundation: false,
      viewer: null,
      ctx: null,
      authorized: "",
      mineid: "",
      projectID: "",
      projectName: "",
      test: [],
      mineName: "",
      mineId: [],
      temple: [],
      allMineId: [],
      iseditable: "",
      bool: "false",
      minevalue: "请选择一个矿山",
      showMaxNav: true,
      showtag: false,
      SPAnalysis: false,
      drillingRescue: false,
      projectDataList: []
    };
  },
  components: {
    showManage,
    showWindDriction,
    cesiumContainer,
    mineSelect,
    personPosition,
    personAlarm,
    historicalData,
    euipmentModal,
    showTunnelInfo,
    phoneModal,
    showmoniData,
    showbaojingData,
    showfenleiData,
    pointMeasure,
    measurePanel,
    tunnelMeasure,
    coordinateQuery,
    nameQuery,
    LayerManger,
    showMsgBox,
    inundation,
    addRisk,
    //shortestPath,
    monitor,
    industryVedio,
    drillingRescue
  },
  mounted() {},
  created() {
    //获取用户参数，通过判断参数来进行用户认证
    this.authorized = this.$utils.getUrlKey("authorized");
    if (this.authorized == "admin") {
      this.iseditable = "yes";
      this.showtag = true;
      //管理员
      // alert("您好，管理员");
    } else if (this.authorized == "user") {
      //普通用户，继而获取其他参数
      this.mineid = this.$utils.getUrlKey("mineid");
      this.iseditable = this.$utils.getUrlKey("iseditable");
      if (this.iseditable == "yes") {
        this.showtag = true;
      } else {
        this.showtag = false;
      }
      //获取所有的煤矿ID
      this.$axios
        .get("api/mineId")
        .then(res => {
          this.temple = res.data.data;

          for (var i = 0; i < this.temple.length; i++) {
            this.allMineId[i] = this.temple[i].mineId;
          }
        })
        .then(() => {
          for (var i = 0; i < this.allMineId.length; i++) {
            //判断传入的mineid参数
            if (this.mineid == this.allMineId[i]) {
              this.bool = true;
              this.mineName = this.temple[i].mineName;
              this.showlayer = true;
              this.minevalue = "当前矿山: " + this.mineName;
            }
          }
          if (this.bool == true) {
            //如果包含传入的mineid，则进入系统
            var originPosition = Cesium.Cartesian3.fromDegrees(
              112.885665,
              26.296894,
              10000
            );
            //如果包含传入的mineid，则进入系统
            //复位
            var that = this;
            that.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
              function(e) {
                // debugger
                e.cancel = true;
                that.$axios
                  .get("api/mineName")
                  .then(res => {
                    that.test = res.data.data;
                    for (var i = 0; i < that.test.length; i++) {
                      if (that.mineid == that.test[i].mineId) {
                        that.minename = that.test[i].mineName;
                        that.minelongitude = that.test[i].mineLongitude;
                        that.minelatitude = that.test[i].mineLatitude;
                        that.height = that.test[i].height;
                        that.heading = that.test[i].heading;
                        that.pitch = that.test[i].pitch;
                        that.roll = that.test[i].roll;
                      }
                    }

                    //视角设为该煤矿
                    originPosition = Cesium.Cartesian3.fromDegrees(
                      that.minelongitude,
                      that.minelatitude,
                      that.height
                    );
                  })

                  //你要飞的位置
                  .then(() => {
                    viewer.camera.flyTo({
                      destination: originPosition,
                      orientation: {
                        heading: that.heading,
                        pitch: that.pitch,
                        roll: that.roll
                      }
                    });
                  });
              }
            );
          } else {
            //若没有传入的mineid，则提示mineid参数错误
            this.$router.replace({ path: "/paramError" });
          }
        })
        .catch(error => {});
    } else {
      //参数错误，拒绝访问
      this.$router.replace({ path: "/404" });
    }
  },
  watch: {
    projectID(val) {
      if (val == "") {
        this.showlayer = false;
      } else {
        if (this.projectName == "") {
          (this.minevalue = ""), (this.showlayer = false);
        } else {
          this.showlayer = true;
          this.minevalue = "当前项目: " + this.projectName;
        }
      }
    },
  },
  computed: {
    consoleMsg() {
      return this.$store.state.consoleMsg;
    },
/*     //炮眼二维是否显示
    ifShotShow() {
      return this.$store.state.showListCheck["shotChecked"];
    },
    //起爆顺序二维是否显示
    ifBlastShow() {
      return this.$store.state.showListCheck["blastChecked"];
    }, */
    //是否显示二维图层
    ifshow2D() {
      return (
        this.$store.state.showListCheck["sectionChecked"] ||
        this.$store.state.showListCheck["shotChecked"] ||
        this.$store.state.showListCheck["blastChecked"]
      );
    },
    width3D(){
      if (!this.ifshow2D || !this.projectID) {
        return 'calc(100%)'
      }else if(this.ifshow2D && !this.showMaxNav){//侧边栏收起来
        return 'calc(60% + 187px)'
      }else{
        return 'calc(60%)'
      }
    },
    width2D() {
      return this.ifshow2D
        ? document.getElementById("content").clientWidth * 0.4
        : 500;
    },
    height2D() {
      return this.ifshow2D
        ? document.getElementById("content").clientHeight
        : 600;
    }
  },
  methods: {
    exchange() {
      // console.log(this.showMaxNav)
      this.showMaxNav = !this.showMaxNav;
      // console.log(this.showMaxNav)
    },
    //接收煤矿选择子组件传的值
    getmineid(data1, data2, data3, data4) {
      this.projectID = data1;
      this.iseditable = data2;
      this.mineselect = data3;
      this.projectName = data4;
    },
    close_WDS(data) {
      this.showWindDriction = data;
    },
    close_WIA(data) {
      this.inundation = data;
    },
    close_WTP(data) {
      this.showTunnelInfo = data;
    },
    //显示弹出框
    showMasseage(name) {
      if (this.mineid == "") {
        alert("请先选择一个煤矿");
      } else {
        this[name] = true;
      }
    },
    showMasseage1(name1) {
      console.log("执行了");
      this.$axios
        .get("/projectName")
        .then(res => {
          this.projectDataList = res.data.data;
          console.log("res是", res);
        })
        .catch(error => {
          console.log(error);
        });
      if (this.authorized == "admin") {
        this[name1] = true;
      } else {
        alert("您没有选择煤矿的权限");
      }
    },

    measureCancel() {
      this.$Message.info("退出");
    },

    showViewer(viewer) {
      this.viewer = viewer;
    },
    openHelpView() {
      let routeUrl = this.$router.resolve({ path: "/help" });
      window.open(routeUrl.href, "_blank");
    },
    saveView() {
      this.$axios({
        url: "api/mine/mineId",
        method: "post",
        data: {
          mineLongitude: Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.longitude
          ),
          mineLatitude: Cesium.Math.toDegrees(
            this.viewer.camera.positionCartographic.latitude
          ),
          height: this.viewer.camera.positionCartographic.height,
          heading: this.viewer.scene.camera.heading,
          pitch: this.viewer.scene.camera.pitch,
          roll: this.viewer.scene.camera.roll,
          mineId: this.mineid
        }
      }).then(res => {
        // console.log(res)
        if (res.data.code == 200) {
          this.$Message.success("更新成功");
        } else {
          this.$Message.error("更新失败");
        }
      });
      //console.log(data)
    }
  }
};
</script>
