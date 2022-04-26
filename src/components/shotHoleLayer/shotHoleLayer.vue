<template>
  <div>
    <Tree
      :data="treeData"
      :render="renderContent"
      @on-check-change="checkItem"
      @on-select-change="clickItem"
      show-checkbox
    ></Tree>
    <Modal
      v-model="showDialog"
      title="设备详情"
      width="600px"
      draggable
      :styles="{ left: '20px' }"
    >
      <!--       <Modelmodify
        v-if="showDialog"
        :xxxData="xxxData"
        :mineid="mineid"
        :iseditable="iseditable"
      ></Modelmodify> -->
      <div slot="footer"></div>
    </Modal>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
/* import Modelmodify from "../../views/modelModify.vue"; */
import { Point } from "@/utils/object.js";
export default {
  data() {
    return {
      treeData: [
        {
          id: "1",
          title: "炮眼设计",
          expand: false,
          disabled: true,
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
      maskedData: [],
      showDialog: false,
      scale: 30,
      moveLenFront: 120,
      moveLenLeft: 120,
      moveX: 40,
      moveLenOver: 120,
      TypeColor: {
        掏槽: "#0000FF", //蓝色
        辅助1: "#00FF00", //绿色
        辅助2: "#FFD700", //金色
        辅助3: "#FF0000", //红色
        周边眼: "#FFFF00", //黄色
        底眼: "#FF1493" //粉色
      },
      initalShotHoleData: [],
      xTranslate: 0,
      xLeftFirstCor: 0,
      yTranslate: 0,
      yOverFirstCor: 0,
      category2modelName: {
        备用主要通风机: "tongfengji",
        减速器: "jiansuqi",
        工作局部通风机: "tongfengji",
        架空人车: "chengrenzhuangzhi",
        配套电动机: "diandongji",
        提升绞车: "tishengji",
        乳化液泵: "yeyabeng",
        工作主要通风机: "tongfengji",
        减速机: "jiansuqi"
      },
      clickItemNums: 0,
      basicPoint: null,
      shotHolePosArray: [],
      scale3D: 5,
      shotHoleIdArr: []
    };
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
    ctx: {
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
    context: null,
    shotData: []
  },
  components: {
    /* Modelmodify */
  },
  created() {
    if (this.projectID != "") {
      //kk this.gettree();
    }
  },
  mounted() {
    //kk
    /*    EventBus.$on("addEquipTree", oneMasked => {
      oneMasked["modelName"] =
        this.category2modelName[oneMasked.category] || "jiansuqi";
      //将该项加入到viewer中
      try {
        this.addViewerEntities(oneMasked);
      } catch {}
      //将二级标题相同的push
      this.treeData[0].children.forEach(it => {
        if (it.title == oneMasked.category) {
          it.children.push({
            title: oneMasked.eqname,
            id: "e" + oneMasked.eqcode,
            disableCheckbox: true
          });
        }
      });
    }); */
  },
  watch: {
    projectID(val) {
      //this.gettree();

      this.treeData[0].disabled = false;
      this.basicPoint = new Cesium.Cartesian3(-2145490, 4398910, 200000);
    }
  },
  methods: {
    gettree() {
      this.$axios("api/company&equipment&risk-info/equipment-info", {
        params: {
          ORGANIZEID: this.mineid
        }
      }).then(res => {
        if (res.data.code == 500) {
          this.gettree();
        } else {
          this.equipmentData = res.data.data;
          console.log(this.equipmentData);

          this.$axios(`api/mineequipment`, {
            params: {
              mineTable: this.mineid + "mineequipment"
            }
          }).then(res => {
            this.maskedData = res.data.data;
            var deviceClass = [];
            this.treeData[0].children = [];
            this.equipmentData.forEach(a => {
              if (deviceClass.indexOf(a.CATEGORY) == -1) {
                deviceClass.push(a.CATEGORY);
                this.treeData[0].children.push({
                  title: a.CATEGORY,
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
              }
            });
            this.maskedData.forEach(item => {
              item["modelName"] =
                this.category2modelName[item.category] || "jiansuqi";
              this.addViewerEntities(item);
              // 增加三级标题
              this.treeData[0].children.forEach(item1 => {
                if (item.category == item1.title) {
                  item1.children.push({
                    title: item.eqname,
                    id: "e" + item.eqcode,
                    disableCheckbox: true
                  });
                }
              });
            });
          });
        }
      });
      this.treeData[0].disabled = false;
    },
    //初始化数据
    initData(data, basicPoint) {
      for (let i = 0; i < data.length; i++) {
        const shotObj = {};
        const pStart = new Cesium.Cartesian3(
          Number(data[i].PositionX),
          Number(data[i].PositionY),
          Number(data[i].PositionZ)
        );
        const pEnd = new Cesium.Cartesian3(
          Number(data[i].EndPositionX),
          Number(data[i].EndPositionY),
          Number(data[i].EndPositionZ)
        );
        const pStart3D = Cesium.Cartesian3.add(
          basicPoint,
          Cesium.Cartesian3.multiplyByScalar(
            pStart,
            this.scale3D,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );
        const pEnd3D = Cesium.Cartesian3.add(
          basicPoint,
          Cesium.Cartesian3.multiplyByScalar(
            pEnd,
            this.scale3D,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );
        shotObj.ProjectID = data[i].ProjectID;
        shotObj.HoleID = data[i].HoleID;
        shotObj.Type = data[i].Type;
        shotObj.BangOrder = data[i].BangOrder;
        shotObj.ZhuangyaoLength = Number(data[i].ZhuangyaoLength);
        shotObj.ShuipaoniLength = Number(data[i].ShuipaoniLength);
        shotObj.FengniLength = Number(data[i].FengniLength);
        shotObj.pStart = pStart;
        shotObj.pEnd = pEnd;
        shotObj.pStart3D = pStart3D;
        shotObj.pEnd3D = pEnd3D;
        this.initalShotHoleData.push(shotObj);
        //计算水泥、封孔坐标
        this.computeSealMud();
      }
    },
    //函数getmidCor定义
    getmidCor(start, end, distanceZ) {
      let scale = distanceZ / (end.z - start.z);
      let x = scale * (end.x - start.x) + start.x;
      let y = scale * (end.y - start.y) + start.y;
      let p = new Point(x, y, distanceZ);
      return p;
    },
    //计算封孔、水泥坐标
    computeSealMud() {
      for (let i = 0; i < this.initalShotHoleData.length; i++) {
        const p = this.getmidCor(
          this.initalShotHoleData[i].pStart,
          this.initalShotHoleData[i].pEnd,
          this.initalShotHoleData[i].FengniLength
        );
        this.initalShotHoleData[i].msealCor = p;

        const length =
          this.initalShotHoleData[i].FengniLength +
          this.initalShotHoleData[i].ShuipaoniLength;
        const p2 = this.getmidCor(
          this.initalShotHoleData[i].pStart,
          this.initalShotHoleData[i].pEnd,
          length
        );
        this.initalShotHoleData[i].mmudCor = p2;
      }
    },
    //绘制二维炮眼
    render2Dshothole() {
      var canvas = document.getElementById("can");
      this.context = canvas.getContext("2d");

      const diyanArr = this.initalShotHoleData.filter(item => {
        return item.Type === "底眼";
      });
      const taoCaoArr = this.initalShotHoleData.filter(item => {
        return item.Type === "掏槽";
      });
      const fuZhuFirArr = this.initalShotHoleData.filter(item => {
        return item.Type === "辅助1";
      });
      const fuZhuSecArr = this.initalShotHoleData.filter(item => {
        return item.Type === "辅助2";
      });
      const fuZhuThirdArr = this.initalShotHoleData.filter(item => {
        return item.Type === "辅助3";
      });
      const zhouBianYanArr = this.initalShotHoleData.filter(item => {
        return item.Type === "周边眼";
      });
      this.xTranslate = diyanArr[0].pEnd.z;
      this.xLeftFirstCor =
        diyanArr[diyanArr.length - 1].pStart.x + this.xTranslate;

      this.yTranslate = 2 * diyanArr[0].pEnd.z;
      this.yOverFirstCor =
        diyanArr[diyanArr.length - 1].pStart.y - this.yTranslate;
      //绘制正视图
      this.drawFrontLine();

      //绘制左视图
      this.drawLeftLine(diyanArr);
      this.drawLeftLine(taoCaoArr);
      this.drawLeftLine(fuZhuFirArr);
      this.drawLeftLine(fuZhuSecArr);
      this.drawLeftLine(fuZhuThirdArr);
      this.drawLeftLine(zhouBianYanArr);

      //绘制俯视图
      this.drawOverLine(diyanArr);
      this.drawOverLine(taoCaoArr);
      this.drawOverLine(fuZhuFirArr);
      this.drawOverLine(fuZhuSecArr);
      this.drawOverLine(fuZhuThirdArr);
      this.drawOverLine(zhouBianYanArr);

      const imgData = this.context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
    },
    //正视图
    drawFrontLine() {
      const { PI } = Math; //获取常量 PI ，绘制圆用
      //x y 圆心 半径 开始弧度 结束弧度 逆时针  (默认false 顺时针)
      for (let i = 0; i < this.initalShotHoleData.length; i++) {
        this.context.beginPath();
        this.context.arc(
          this.initalShotHoleData[i].pStart.x * this.scale + this.moveLenFront,
          -this.initalShotHoleData[i].pStart.y * this.scale + this.moveLenFront,
          2,
          0,
          2 * PI,
          true
        ); //窗口坐标系中y轴向下为正值
        this.context.closePath(); //创建从当前点到开始点的路径
        this.context.fillStyle = this.TypeColor[
          this.initalShotHoleData[i].Type
        ]; //设置填充样式
        this.context.fill(); //填充--默认黑色
      }
    },
    //左视图
    drawLeftLine(typeArr) {
      for (let i = 0; i < typeArr.length; i++) {
        let pfront = new Point(
          this.xLeftFirstCor * this.scale + this.moveLenLeft + this.moveX,
          -typeArr[0].pStart.y * this.scale + this.moveLenLeft,
          typeArr[0].pStart.z * this.scale + this.moveLenLeft
        );
        let pfront2 = new Point(
          (this.xLeftFirstCor - typeArr[0].msealCor.z) * this.scale +
            this.moveLenLeft +
            this.moveX,
          -typeArr[0].msealCor.y * this.scale + this.moveLenLeft,
          typeArr[0].pEnd.z * this.scale + this.moveLenLeft
        );
        let pfront3 = new Point(
          (this.xLeftFirstCor - typeArr[0].mmudCor.z) * this.scale +
            this.moveLenLeft +
            this.moveX,
          -typeArr[0].mmudCor.y * this.scale + this.moveLenLeft,
          typeArr[0].pEnd.z * this.scale + this.moveLenLeft
        );
        let pfront4 = new Point(
          (this.xLeftFirstCor - typeArr[0].pEnd.z) * this.scale +
            this.moveLenLeft +
            this.moveX,
          -typeArr[0].pEnd.y * this.scale + this.moveLenLeft,
          typeArr[0].pEnd.z * this.scale + this.moveLenLeft
        );
        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#0000FF";
        this.context.moveTo(pfront.x, pfront.y); //坐标起点
        this.context.lineTo(pfront2.x, pfront2.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#00FF00";
        this.context.moveTo(pfront2.x, pfront2.y); //坐标起点
        this.context.lineTo(pfront3.x, pfront3.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#FFD700";
        this.context.moveTo(pfront3.x, pfront3.y); //坐标起点
        this.context.lineTo(pfront4.x, pfront4.y); //终点,或者理解为下一个点
        this.context.stroke();

        let mid = Math.floor(typeArr.length / 2);
        let pmid = new Point(
          this.xLeftFirstCor * this.scale + this.moveLenLeft + this.moveX,
          -typeArr[mid].pStart.y * this.scale + this.moveLenLeft,
          typeArr[mid].pStart.z * this.scale + this.moveLenLeft
        );
        let pmid2 = new Point(
          (this.xLeftFirstCor - typeArr[0].msealCor.z) * this.scale +
            this.moveLenLeft +
            this.moveX,
          -typeArr[mid].msealCor.y * this.scale + this.moveLenLeft,
          typeArr[mid].pEnd.z * this.scale + this.moveLenLeft
        );
        let pmid3 = new Point(
          (this.xLeftFirstCor - typeArr[0].mmudCor.z) * this.scale +
            this.moveLenLeft +
            this.moveX,
          -typeArr[mid].mmudCor.y * this.scale + this.moveLenLeft,
          typeArr[mid].pEnd.z * this.scale + this.moveLenLeft
        );
        let pmid4 = new Point(
          (this.xLeftFirstCor - typeArr[0].pEnd.z) * this.scale +
            this.moveLenLeft +
            this.moveX,
          -typeArr[mid].pEnd.y * this.scale + this.moveLenLeft,
          typeArr[mid].pEnd.z * this.scale + this.moveLenLeft
        );

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#0000FF";
        this.context.moveTo(pmid.x, pmid.y); //坐标起点
        this.context.lineTo(pmid2.x, pmid2.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#00FF00";
        this.context.moveTo(pmid2.x, pmid2.y); //坐标起点
        this.context.lineTo(pmid3.x, pmid3.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#FFD700";
        this.context.moveTo(pmid3.x, pmid3.y); //坐标起点
        this.context.lineTo(pmid4.x, pmid4.y); //终点,或者理解为下一个点
        this.context.stroke();
      }
    },
    //俯视图
    drawOverLine(typeArr) {
      for (let i = 0; i < typeArr.length; i++) {
        let pfront = new Point(
          typeArr[0].pStart.x * this.scale + this.moveLenOver,
          -this.yOverFirstCor * this.scale + this.moveLenOver,
          typeArr[0].pStart.z * this.scale + this.moveLenOver
        );
        let pfront2 = new Point(
          typeArr[0].pStart.x * this.scale + this.moveLenOver,
          -(this.yOverFirstCor + typeArr[0].msealCor.z) * this.scale +
            this.moveLenOver,
          typeArr[0].msealCor.z * this.scale + this.moveLenOver
        );
        let pfront3 = new Point(
          typeArr[0].pStart.x * this.scale + this.moveLenOver,
          -(this.yOverFirstCor + typeArr[0].mmudCor.z) * this.scale +
            this.moveLenOver,
          typeArr[0].mmudCor.z * this.scale + this.moveLenOver
        );
        let pfront4 = new Point(
          typeArr[0].pStart.x * this.scale + this.moveLenOver,
          -(this.yOverFirstCor + typeArr[0].pEnd.z) * this.scale +
            this.moveLenOver,
          typeArr[0].pEnd.z * this.scale + this.moveLenOver
        );
        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#0000FF";
        this.context.moveTo(pfront.x, pfront.y); //坐标起点
        this.context.lineTo(pfront2.x, pfront2.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#00FF00";
        this.context.moveTo(pfront2.x, pfront2.y); //坐标起点
        this.context.lineTo(pfront3.x, pfront3.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#FFD700";
        this.context.moveTo(pfront3.x, pfront3.y); //坐标起点
        this.context.lineTo(pfront4.x, pfront4.y); //终点,或者理解为下一个点
        this.context.stroke();

        let back = typeArr.length - 1;
        let pmid = new Point(
          typeArr[back].pStart.x * this.scale + this.moveLenOver,
          -this.yOverFirstCor * this.scale + this.moveLenOver,
          typeArr[back].pStart.z * this.scale + this.moveLenOver
        );
        let pmid2 = new Point(
          typeArr[back].pStart.x * this.scale + this.moveLenOver,
          -(this.yOverFirstCor + typeArr[0].msealCor.z) * this.scale +
            this.moveLenOver,
          typeArr[back].msealCor.z * this.scale + this.moveLenOver
        );
        let pmid3 = new Point(
          typeArr[back].pStart.x * this.scale + this.moveLenOver,
          -(this.yOverFirstCor + typeArr[0].mmudCor.z) * this.scale +
            this.moveLenOver,
          typeArr[back].mmudCor.z * this.scale + this.moveLenOver
        );
        let pmid4 = new Point(
          typeArr[back].pStart.x * this.scale + this.moveLenOver,
          -(this.yOverFirstCor + typeArr[0].pEnd.z) * this.scale +
            this.moveLenOver,
          typeArr[back].pEnd.z * this.scale + this.moveLenOver
        );

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#0000FF";
        this.context.moveTo(pmid.x, pmid.y); //坐标起点
        this.context.lineTo(pmid2.x, pmid2.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#00FF00";
        this.context.moveTo(pmid2.x, pmid2.y); //坐标起点
        this.context.lineTo(pmid3.x, pmid3.y); //终点,或者理解为下一个点
        this.context.stroke();

        this.context.beginPath(); //开始绘制
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#FFD700";
        this.context.moveTo(pmid3.x, pmid3.y); //坐标起点
        this.context.lineTo(pmid4.x, pmid4.y); //终点,或者理解为下一个点
        this.context.stroke();
      }
    },
    addViewerEntities(item) {
      var position = Cesium.Cartesian3.fromDegrees(
        item.posY,
        item.posX,
        item.posZ
      );
      var heading = Cesium.Math.toRadians(0); //俯仰角
      var pitch = Cesium.Math.toRadians(0); //偏行角
      var roll = Cesium.Math.toRadians(0); //滚转角
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
      var s = {
        id: "e" + item.eqcode,
        name: item.eqname,
        position: position,
        orientation: orientation,
        label: {
          text: item.eqname,
          eyeOffset: new Cesium.Cartesian3(0, 0.3, 0),
          fillColor: Cesium.Color.ORANGE,
          font: "30px sans-serif",
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 70)
        },
        model: {
          uri: `model3D/CesiumBalloon/${item.modelName}.gltf`,
          scale: item.scale
        }
      };
      // console.log(s)
      this.viewer.entities.add(s);
    },
    /* 下面是三维绘制 */
    //计算圆柱体的半径位置坐标（shape）
    computeCircle(radius) {
      const positions = [];
      for (let i = 0; i < 360; i++) {
        const radians = Cesium.Math.toRadians(i);
        positions.push(
          new Cesium.Cartesian2(
            radius * Math.cos(radians),
            radius * Math.sin(radians)
          )
        );
      }
      return positions;
    },
    //笛卡尔坐标转经纬度
    cartesianTolngLatAlt(cartesianObj) {
      const cartesian3 = new Cesium.Cartesian3(
        cartesianObj.x,
        cartesianObj.y,
        cartesianObj.z
      );
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
      /*       const cartographic = Cesium.Scene.globe.ellipsoid.cartesianToCartographic(
        cartesian3
      ); */
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const alt = cartographic.height;
      return { lng, lat, alt };
    },
    //绘制三维polylineVolume,需要经纬度
    draw3DShothole() {
      const geoInstanceArr = [];
      for (let i = 0; i < this.initalShotHoleData.length; i++) {
        const pointDir = Cesium.Cartesian3.subtract(
          this.initalShotHoleData[i].pEnd3D,
          this.initalShotHoleData[i].pStart3D,
          new Cesium.Cartesian3()
        );
        const fengniLenth =
          this.initalShotHoleData[i].FengniLength * this.scale3D;
        const shuipaoniLenth =
          this.initalShotHoleData[i].ShuipaoniLength * this.scale3D;
        const zhuangyaoLenth =
          this.initalShotHoleData[i].ZhuangyaoLength * this.scale3D;
        if (fengniLenth < 0.001) {
          fengniLenth = 0.1 * this.scale3D;
        }
        if (shuipaoniLenth < 0.001) {
          shuipaoniLenth = 0.1 * this.scale3D;
        }
        if (zhuangyaoLenth < 0.001) {
          zhuangyaoLenth = 0.1 * this.scale3D;
        }

        const fengniPoint = Cesium.Cartesian3.add(
          this.initalShotHoleData[i].pStart3D,
          Cesium.Cartesian3.multiplyByScalar(
            pointDir,
            fengniLenth,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );
        const shuipaoniPoint = Cesium.Cartesian3.add(
          fengniPoint,
          Cesium.Cartesian3.multiplyByScalar(
            pointDir,
            shuipaoniLenth,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );
        const zhuangyaoPoint = Cesium.Cartesian3.add(
          shuipaoniPoint,
          Cesium.Cartesian3.multiplyByScalar(
            pointDir,
            zhuangyaoLenth,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );

        let shotArrayOne = [];
        shotArrayOne.push(
          this.cartesianTolngLatAlt(this.initalShotHoleData[i].pStart3D).lat
        );
        shotArrayOne.push(
          this.cartesianTolngLatAlt(this.initalShotHoleData[i].pStart3D).lng
        );
        shotArrayOne.push(
          this.cartesianTolngLatAlt(this.initalShotHoleData[i].pStart3D).alt
        );
        shotArrayOne.push(this.cartesianTolngLatAlt(fengniPoint).lat);
        shotArrayOne.push(this.cartesianTolngLatAlt(fengniPoint).lng);
        shotArrayOne.push(this.cartesianTolngLatAlt(fengniPoint).alt);

        let shotArrayTwo = [];
        shotArrayTwo = shotArrayTwo.concat(shotArrayOne.slice(3));
        shotArrayTwo.push(this.cartesianTolngLatAlt(shuipaoniPoint).lat);
        shotArrayTwo.push(this.cartesianTolngLatAlt(shuipaoniPoint).lng);
        shotArrayTwo.push(this.cartesianTolngLatAlt(shuipaoniPoint).alt);

        let shotArrayThree = [];
        shotArrayThree = shotArrayThree.concat(shotArrayTwo.slice(3));
        shotArrayThree.push(this.cartesianTolngLatAlt(zhuangyaoPoint).lat);
        shotArrayThree.push(this.cartesianTolngLatAlt(zhuangyaoPoint).lng);
        shotArrayThree.push(this.cartesianTolngLatAlt(zhuangyaoPoint).alt);
        viewer.entities.add({
          name: "Red tube with rounded corners",
          id: `shotID${i}-1`,
          polylineVolume: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(shotArrayOne),
            shape: this.computeCircle(1.0),
            material: new Cesium.Color(0.3, 0.2, 0.1, 1)
          }
        });
        this.shotHoleIdArr.push(`shotID${i}-1`);
        const fengniInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineVolumeGeometry({
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
            polylinePositions: Cesium.Cartesian3.fromDegreesArrayHeights(
              shotArrayOne
            ),
            shapePositions: this.computeCircle(1.0)
          })
        });
        geoInstanceArr.push(fengniInstance);

        viewer.entities.add({
          name: "Red tube with rounded corners",
          id: `shotID${i}-2`,
          polylineVolume: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(shotArrayTwo),
            shape: this.computeCircle(1.0),
            material: new Cesium.Color(0.1, 0.8, 0.8, 1)
          }
        });
        this.shotHoleIdArr.push(`shotID${i}-2`);
        const shuipaoniInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineVolumeGeometry({
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
            polylinePositions: Cesium.Cartesian3.fromDegreesArrayHeights(
              shotArrayTwo
            ),
            shapePositions: this.computeCircle(1.0)
          })
        });
        geoInstanceArr.push(shuipaoniInstance);

        viewer.entities.add({
          name: "Red tube with rounded corners",
          id: `shotID${i}-3`,
          polylineVolume: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(
              shotArrayThree
            ),
            shape: this.computeCircle(1.0),
            material: new Cesium.Color(0.8, 0.8, 0.1, 1)
          }
        });
        this.shotHoleIdArr.push(`shotID${i}-3`);
        const zhuangyaoInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineVolumeGeometry({
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
            polylinePositions: Cesium.Cartesian3.fromDegreesArrayHeights(
              shotArrayThree
            ),
            shapePositions: this.computeCircle(1.0)
          })
        });
        geoInstanceArr.push(zhuangyaoInstance);
      }
      console.log("geoInstance",viewer.scene.primitives);
/*       viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstance: geoInstanceArr,
          appearance: new Cesium.PerInstanceColorAppearance()
        })
      ); */

      this.viewer.zoomTo(this.viewer.entities);
      /*       viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(-2145490, 4398910, 200000)
      }); */
    },
    checkItem(selectedArr, selectedItem) {
      //关闭图层
      if (selectedItem.checked === false) {
        this.$store.commit("setShowCheck", {
          key: "shotChecked",
          checked: false
        });
        var canvas = document.getElementById("can");
        const context = canvas.getContext("2d");
        //先清空画布
        context.clearRect(0, 0, canvas.width, canvas.height);
        //检查是否其他图层打开
        if (this.$store.state.showListCheck.blastChecked) {
          this.$parent.$refs.blastOrderRef.render2DBoomOrder();
        }
        //清除三维图形
        for (var i = 0; i < this.shotHoleIdArr.length; i++) {
          this.viewer.entities.removeById(this.shotHoleIdArr[i]);
        }
        return;
      }
      if (this.clickItemNums < 1) {
        this.clickItemNums++;
        //初始化数据,只在第一次点击时初始化一次
        this.initData(this.shotData, this.basicPoint);
      }
      //打开视图
      this.$store.commit("setShowCheck", {
        key: "shotChecked",
        checked: true
      });
      setTimeout(() => {
        //开始渲染二维
        this.render2Dshothole();
        //开始渲染三维
        this.draw3DShothole();
      });
    },
    clickItem(clickedItem) {
      // console.log(clickedItem);
      var getByIdEntity = this.viewer.entities.getById(clickedItem.id);
      this.viewer.zoomTo(getByIdEntity);
    },
    modify(data) {
      this.showDialog = true;
      this.xxxData = data.id;
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
    }
  }
};
</script>
