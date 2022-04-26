<template>
  <div>
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="获得事故点"
      @click="getpoint"
      >点击事故点</i-button
    >
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="线"
      @click="getline"
      >生成线</i-button
    >
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="坡度分析"
      @click="slopeAnalysis"
      >生成坡度分析图</i-button
    >
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="最优点"
      @click="getBestPoint"
      >获得最优点</i-button
    >
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="一键测量"
      @click="startDrilling"
      >开始钻探</i-button
    >

    <!-- <i-button
      type="primary"
      size="small"
      shape="circle"
      title="一键删除"
      @click="removeM(1)"
      >单个清除</i-button
    >
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="一键删除"
      @click="removeM(2)"
      >全部清除</i-button
    > -->
  </div>
</template>

<script>
import Cesium from "cesium/Cesium.js";
//import { viewer } from "../components/cesiumViewer/cesiumTunnel";

export default {
  data() {
    return {
      num: 0,
      viewer: {},
      temp: [],
      //定义巷道点的经纬度高度
      pointlng: 0,
      pointlat: 0,
      pointhgt: 0,
      //对应地面的高度
      dimianhgt: 0,
      //定义分析坡度圆的半径
      slopeR: 30,
      arrays: [], //小矩形的中心经纬度坐标和高度放到this.arrays
      //存放圆内每个小矩形的中心经纬度和高度
      circleRecArray: [],
      //存圆内符合距离要求的小矩形对角坐标
      recentity: [],

      //存放圆内符合坡度要求的小矩形个数
      countcolor: 0,
      //存放圆内符合坡度要求和小于半径小矩形数组坐标加高度
      fitPointSlope: [],

      //找到最合适点坐标
      bestFitPoint: {}
    };
  },
  props: {
    // API URL
    url: {
      type: String,
      default: ""
    },
    /* viewer: {
      type: Object,
      default: () => {},
    }, */
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
    }
  },
  mounted() {
    this.viewer = window.viewer;
  },
  methods: {
    //获取坐标的方法,只能选择一个事故点
    getpoint() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZDkwNTMxMC03OTZmLTRhYTQtOTc0Zi1jNjZjNTZmOGJlZWIiLCJpZCI6MzYxNjAsImlhdCI6MTYxNzc2MzUwMH0.XkQ0D3lLD1tG-hHfP_5fU19t-VblJ5qvp38cMBRrYsg";

      const viewer = window.viewer;
      window.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      window.handler.setInputAction(async e => {
        const pixel = e.position;
        var pickedObject = viewer.scene.pick(pixel);
        if (
          viewer.scene.pickPositionSupported &&
          Cesium.defined(pickedObject)
        ) {
          //判断是否拾取到模型
          const cartesian = viewer.scene.pickPosition(pixel); //若拾取到模型，则保存拾取点笛卡尔坐标

          let pointcartographic = Cesium.Cartographic.fromCartesian(cartesian);
          this.pointlng = Cesium.Math.toDegrees(pointcartographic.longitude);
          this.pointlat = Cesium.Math.toDegrees(pointcartographic.latitude);
          this.pointhgt = pointcartographic.height;
          var nums = "事故点";
          if (viewer.entities.getById("only")) {
            alert("只能选择一个事故点");
            return;
          } else {
            viewer.entities.add({
              id: "only",
              position: Cesium.Cartesian3.fromDegrees(
                this.pointlng,
                this.pointlat,
                this.pointhgt
              ),
              point: {
                show: true, // default
                color: Cesium.Color.RED,
                pixelSize: 10 // default: 1
              },
              label: {
                text: nums,
                pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
                font: "14px Helvetica",
                fillColor: Cesium.Color.SKYBLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE
              }
            });
          }
          // 根据经纬度获取高度
          var terrainProvider = new Cesium.createWorldTerrain({
            requestWaterMask: true,
            requestVertexNormals: true
          });
          //viewer.terrainProvider = terrainProvider;
          var positions = [
            Cesium.Cartographic.fromDegrees(this.pointlng, this.pointlat)
          ];
          console.log(positions);
          console.log("test");
          var promise = Cesium.sampleTerrain(terrainProvider, 11, positions);
          console.log("test2");
          //console.log(promise);
          var h;
          this.dimianhgt = await Cesium.when(promise, function(
            updatedPositions
          ) {
            //updatedPositions相当于更新后（有高度的positions）
            //console.log(updatedPositions[0].height);
            //this.dimianhgt = updatedPositions[0].height;
            h = updatedPositions[0].height;
            /* console.log(updatedPositions[0].height);
            console.log("123"); */
            //console.log(this.dimianhgt);
          });
          this.dimianhgt = h;
          console.log("h=" + h);
          console.log("dimianght=" + this.dimianhgt);
          //this.dimianhgt = viewer.scene.globe.getHeight(new Cesium.Cartographic(Cesium.Math.toRadians(this.pointlng),Cesium.Math.toRadians(this.pointlat)))
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //事故点与地面圆心点连线
    getline() {
      const viewer = window.viewer;
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            this.pointlng,
            this.pointlat,
            this.pointhgt,
            this.pointlng,
            this.pointlat,
            this.dimianhgt
          ]),
          width: 5,
          material: new Cesium.PolylineOutlineMaterialProperty({
            color: Cesium.Color.ORANGE,
            outlineWidth: 2,
            outlineColor: Cesium.Color.BLACK
          })
        }
      });
    },
    //生成圆的外接正方形经纬度，并调用生成坡度的函数
    /* slopeAnalysis() {
      var PI = 3.14159265;
      var latitude = this.pointlat;
      var longitude = this.pointlng;
      var degree = (24901 * 1609) / 360.0;
      var raidusMile = this.slopeR;
      var dpmLat = 1 / degree;
      var radiusLat = dpmLat * raidusMile;
      //alert('latitude:'+latitude);
      //alert('radiusLat:'+radiusLat);
      var lat1 = eval(latitude) - eval(radiusLat);
      var lat2 = eval(latitude) - eval(radiusLat);
      var lat3 = eval(latitude) + eval(radiusLat);
      var lat4 = eval(latitude) + eval(radiusLat);

      var mpdLng = degree * Math.cos(latitude * (PI / 180));
      var dpmLng = 1 / mpdLng;
      var radiusLng = dpmLng * raidusMile;

      var lng1 = eval(longitude) - eval(radiusLng);
      var lng2 = eval(longitude) + eval(radiusLng);
      var lng3 = eval(longitude) + eval(radiusLng);
      var lng4 = eval(longitude) - eval(radiusLng);

      const recArr = [];
      recArr.push(lng1);
      recArr.push(lat1);
      recArr.push(lng2);
      recArr.push(lat2);
      recArr.push(lng3);
      recArr.push(lat3);
      recArr.push(lng4);
      recArr.push(lat4);

      //生成坡度
     

      var startx1 = recArr[0];
      var starty1 = recArr[1];
      var startz1 = 0;
      var startx2 = recArr[2];
      var starty2 = recArr[3];
      var startz2 = 0;
      var startx3 = recArr[4];
      var starty3 = recArr[5];
      var startz3 = 0;
      var startx4 = recArr[6];
      var starty4 = recArr[7];
      var startz4 = 0;
     //const viewer = window.viewer;
      var slopecolor = " ";
      //高度z全为0
      var count = 100;
      var slopelineposition = [];
      var hireacys = []; //存的10000个小矩形，每一项又包括4个对象，每个小矩形的四角坐标存在里面
      //var hireacysdistance = []
      for (var j = 0; j < 100; j++) {
        for (var i = 0; i < 100; i++) {
          var hireacy = [];
          //分割成小面，切分经纬度,小矩形四个点坐标
          hireacy.push(
            new Cesium.Cartesian3(
              startx1 +
                ((startx2 - startx1) / count) * i +
                ((startx4 +
                  ((startx3 - startx4) / count) * i -
                  startx1 -
                  ((startx2 - startx1) / count) * i) /
                  count) *
                  j,
              starty1 +
                ((starty2 - starty1) / count) * i +
                ((starty4 +
                  ((starty3 - starty4) / count) * i -
                  starty1 -
                  ((starty2 - starty1) / count) * i) /
                  count) *
                  j,
              startz1 +
                ((startz2 - startz1) / count) * i +
                ((startz4 +
                  ((startz3 - startz4) / count) * i -
                  startz1 -
                  ((startz2 - startz1) / count) * i) /
                  count) *
                  j
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx1 +
                ((startx2 - startx1) / count) * (i + 1) +
                ((startx4 +
                  ((startx3 - startx4) / count) * (i + 1) -
                  startx1 -
                  ((startx2 - startx1) / count) * (i + 1)) /
                  count) *
                  j,
              starty1 +
                ((starty2 - starty1) / count) * (i + 1) +
                ((starty4 +
                  ((starty3 - starty4) / count) * (i + 1) -
                  starty1 -
                  ((starty2 - starty1) / count) * (i + 1)) /
                  count) *
                  j,
              startz1 +
                ((startz2 - startz1) / count) * (i + 1) +
                ((startz4 +
                  ((startz3 - startz4) / count) * (i + 1) -
                  startz1 -
                  ((startz2 - startz1) / count) * (i + 1)) /
                  count) *
                  j
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx4 +
                ((startx3 - startx4) / count) * (i + 1) -
                ((startx4 +
                  ((startx3 - startx4) / count) * (i + 1) -
                  startx1 -
                  ((startx2 - startx1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j),
              starty4 +
                ((starty3 - starty4) / count) * (i + 1) -
                ((starty4 +
                  ((starty3 - starty4) / count) * (i + 1) -
                  starty1 -
                  ((starty2 - starty1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j),
              startz4 +
                ((startz3 - startz4) / count) * (i + 1) -
                ((startz4 +
                  ((startz3 - startz4) / count) * (i + 1) -
                  startz1 -
                  ((startz2 - startz1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j)
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx4 +
                ((startx3 - startx4) / count) * i -
                ((startx4 +
                  ((startx3 - startx4) / count) * i -
                  startx1 -
                  ((startx2 - startx1) / count) * i) /
                  count) *
                  (count - 1 - j),
              starty4 +
                ((starty3 - starty4) / count) * i -
                ((starty4 +
                  ((starty3 - starty4) / count) * i -
                  starty1 -
                  ((starty2 - starty1) / count) * i) /
                  count) *
                  (count - 1 - j),
              startz4 +
                ((startz3 - startz4) / count) * i -
                ((startz4 +
                  ((startz3 - startz4) / count) * i -
                  startz1 -
                  ((startz2 - startz1) / count) * i) /
                  count) *
                  (count - 1 - j)
            )
          );
          hireacys.push(hireacy);
          //取出面的8个点坐标，拿点坐标去求高度值
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[0].x, hireacy[0].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[0].x + hireacy[1].x) / 2,
              (hireacy[0].y + hireacy[1].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[1].x, hireacy[1].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[1].x + hireacy[2].x) / 2,
              (hireacy[1].y + hireacy[2].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[2].x, hireacy[2].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[2].x + hireacy[3].x) / 2,
              (hireacy[2].y + hireacy[3].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[3].x, hireacy[3].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[3].x + hireacy[0].x) / 2,
              (hireacy[3].y + hireacy[0].y) / 2
            )
          );
        }
      }
      //计算每个小矩形的中心坐标放到this.arrays
      for (let i = 0; i < hireacys.length; i++) {
        var vote = {};
        vote.x =
          (hireacys[i][0].x +
            hireacys[i][1].x +
            hireacys[i][2].x +
            hireacys[i][3].x) /
          4;
        vote.y =
          (hireacys[i][0].y +
            hireacys[i][1].y +
            hireacys[i][2].y +
            hireacys[i][3].y) /
          4;
        //var position = {}
        this.arrays.push({ lng: vote.x, lat: vote.y });
      }

      var promise = Cesium.sampleTerrainMostDetailed(
        new Cesium.createWorldTerrain({
          requestWaterMask: true,
          requestVertexNormals: true,
        }),
        slopelineposition
      );

      Cesium.when(promise, function(updatedPositions) {
        //拿到所有的高度数据
        var m = 0;

        //updatedPositions.length=80000

        var num = 0; //存放已经放入this.recentity中的坐标数
        //圆形内小矩形的id
        var id = 0;
        for (var k = 0; k < updatedPositions.length / 8; k++) {
          //第一个点与第五个点的坡度,就是两个点高度除两点距离
          var slope1 =
            (updatedPositions[m].height - updatedPositions[m + 4].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m].latitude,
                updatedPositions[m].longitude,
                updatedPositions[m].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 4].latitude,
                updatedPositions[m + 4].longitude,
                updatedPositions[m + 4].height
              )
            );
          //第二个点与第六个点的坡度
          var slope2 =
            (updatedPositions[m + 1].height - updatedPositions[m + 5].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 1].latitude,
                updatedPositions[m + 1].longitude,
                updatedPositions[m + 1].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 5].latitude,
                updatedPositions[m + 5].longitude,
                updatedPositions[m + 5].height
              )
            );
          //第三个点与第七个点的坡度
          var slope3 =
            (updatedPositions[m + 2].height - updatedPositions[m + 6].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 2].latitude,
                updatedPositions[m + 2].longitude,
                updatedPositions[m + 2].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 6].latitude,
                updatedPositions[m + 6].longitude,
                updatedPositions[m + 6].height
              )
            );
          //第四个点与第八个点的坡度
          var slope4 =
            (updatedPositions[m + 3].height - updatedPositions[m + 7].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 3].latitude,
                updatedPositions[m + 3].longitude,
                updatedPositions[m + 3].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 7].latitude,
                updatedPositions[m + 7].longitude,
                updatedPositions[m + 7].height
              )
            );
          // console.log("slope1:"+slope1+";slope2:"+slope2+";slope3:"+slope3+";slope4:"+slope4);
          var arrposition = [
            Math.abs(slope1),
            Math.abs(slope2),
            Math.abs(slope3),
            Math.abs(slope4),
          ]; //取绝对值
          arrposition.sort();
          var slope = arrposition[3]; // 拿到最大的坡度值

          slope =
            (Math.abs(slope1) +
              Math.abs(slope2) +
              Math.abs(slope3) +
              Math.abs(slope4)) /
            4; //四个坡度值大小有的差值特别大，这里取的平均值用来配置颜色
          //tan(20度) = 0.363970234
          if (0 <= slope && slope < 0.363970234) {
            slopecolor = "LightBlue  ";
          } else if (0.363970234 <= slope && slope < 0.5) {
            slopecolor = "GreenYellow ";
          } else if (0.5 <= slope && slope < Math.sqrt(2) / 2) {
            slopecolor = "Green ";
          } else if (Math.sqrt(2) / 2 <= slope && slope < 0.87) {
            slopecolor = "Orange ";
          } else if (0.87 <= slope && slope < 0.91) {
            slopecolor = "Red ";
          } else if (0.91 <= slope && slope < 0.95) {
            slopecolor = "Purple ";
          } else {
            slopecolor = "SaddleBrown ";
          }

          //计算每个小矩形中心点高度
          //给this.arrays添加high属性

          this.arrays[k].high =
            (updatedPositions[m].height +
              updatedPositions[m + 1].height +
              updatedPositions[m + 2].height +
              updatedPositions[m + 3].height +
              updatedPositions[m + 4].height +
              updatedPositions[m + 5].height +
              updatedPositions[m + 6].height +
              updatedPositions[m + 7].height) /
            8;

          var distance = this.pointInsideCircle(
            this.arrays[k].lng,
            this.arrays[k].lat,
            this.arrays[k].high,
            this.pointlng,
            this.pointlat,
            this.dimianhgt
          );

          //判断小矩形中心点到圆心距离和筛选坡度
          if (distance < this.slopeR) {
            //存放圆内每个小矩形的中心经纬度和高度
            this.circleRecArray.push(this.arrays[k]);
            //圆内小矩形存放对角坐标
            this.recentity.push(updatedPositions[m]);
            this.recentity.push(updatedPositions[m + 4]);
            //圆内筛选坡度小于20度
            if (0 <= slope && slope < 0.363970234) {
              //0.363970234
              this.countcolor++; //计算符合坡度要求的坐标数
              this.fitPointSlope.push({
                lng: this.arrays[k].lng,
                lat: this.arrays[k].lat,
                high: this.arrays[k].high,
              });
            }

            this.viewer.entities.add({
              type: "drawSloperectange",
              id: id,
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(
                  Cesium.Math.toDegrees(this.recentity[num].longitude),
                  Cesium.Math.toDegrees(this.recentity[num].latitude),
                  Cesium.Math.toDegrees(this.recentity[num + 1].longitude),
                  Cesium.Math.toDegrees(this.recentity[num + 1].latitude)
                ),
                material: Cesium.Color.fromCssColorString(slopecolor),
              },
            });
            num += 2;

            //圆内小矩形id+1
            id++;
          }

          m += 8;
        }
      });
    }, */

    //坡度图
    /*  drawSlopePolygon(startx1,starty1,startz1,startx2,starty2,startz2,startx3,starty3,startz3,startx4,starty4,startz4) {
     //const viewer = window.viewer;
      var slopecolor = " ";
      //高度z全为0
      var count = 100;
      var slopelineposition = [];
      var hireacys = []; //存的10000个小矩形，每一项又包括4个对象，每个小矩形的四角坐标存在里面
      //var hireacysdistance = []
      for (var j = 0; j < 100; j++) {
        for (var i = 0; i < 100; i++) {
          var hireacy = [];
          //分割成小面，切分经纬度,小矩形四个点坐标
          hireacy.push(
            new Cesium.Cartesian3(
              startx1 +
                ((startx2 - startx1) / count) * i +
                ((startx4 +
                  ((startx3 - startx4) / count) * i -
                  startx1 -
                  ((startx2 - startx1) / count) * i) /
                  count) *
                  j,
              starty1 +
                ((starty2 - starty1) / count) * i +
                ((starty4 +
                  ((starty3 - starty4) / count) * i -
                  starty1 -
                  ((starty2 - starty1) / count) * i) /
                  count) *
                  j,
              startz1 +
                ((startz2 - startz1) / count) * i +
                ((startz4 +
                  ((startz3 - startz4) / count) * i -
                  startz1 -
                  ((startz2 - startz1) / count) * i) /
                  count) *
                  j
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx1 +
                ((startx2 - startx1) / count) * (i + 1) +
                ((startx4 +
                  ((startx3 - startx4) / count) * (i + 1) -
                  startx1 -
                  ((startx2 - startx1) / count) * (i + 1)) /
                  count) *
                  j,
              starty1 +
                ((starty2 - starty1) / count) * (i + 1) +
                ((starty4 +
                  ((starty3 - starty4) / count) * (i + 1) -
                  starty1 -
                  ((starty2 - starty1) / count) * (i + 1)) /
                  count) *
                  j,
              startz1 +
                ((startz2 - startz1) / count) * (i + 1) +
                ((startz4 +
                  ((startz3 - startz4) / count) * (i + 1) -
                  startz1 -
                  ((startz2 - startz1) / count) * (i + 1)) /
                  count) *
                  j
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx4 +
                ((startx3 - startx4) / count) * (i + 1) -
                ((startx4 +
                  ((startx3 - startx4) / count) * (i + 1) -
                  startx1 -
                  ((startx2 - startx1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j),
              starty4 +
                ((starty3 - starty4) / count) * (i + 1) -
                ((starty4 +
                  ((starty3 - starty4) / count) * (i + 1) -
                  starty1 -
                  ((starty2 - starty1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j),
              startz4 +
                ((startz3 - startz4) / count) * (i + 1) -
                ((startz4 +
                  ((startz3 - startz4) / count) * (i + 1) -
                  startz1 -
                  ((startz2 - startz1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j)
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx4 +
                ((startx3 - startx4) / count) * i -
                ((startx4 +
                  ((startx3 - startx4) / count) * i -
                  startx1 -
                  ((startx2 - startx1) / count) * i) /
                  count) *
                  (count - 1 - j),
              starty4 +
                ((starty3 - starty4) / count) * i -
                ((starty4 +
                  ((starty3 - starty4) / count) * i -
                  starty1 -
                  ((starty2 - starty1) / count) * i) /
                  count) *
                  (count - 1 - j),
              startz4 +
                ((startz3 - startz4) / count) * i -
                ((startz4 +
                  ((startz3 - startz4) / count) * i -
                  startz1 -
                  ((startz2 - startz1) / count) * i) /
                  count) *
                  (count - 1 - j)
            )
          );
          hireacys.push(hireacy);
          //取出面的8个点坐标，拿点坐标去求高度值
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[0].x, hireacy[0].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[0].x + hireacy[1].x) / 2,
              (hireacy[0].y + hireacy[1].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[1].x, hireacy[1].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[1].x + hireacy[2].x) / 2,
              (hireacy[1].y + hireacy[2].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[2].x, hireacy[2].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[2].x + hireacy[3].x) / 2,
              (hireacy[2].y + hireacy[3].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[3].x, hireacy[3].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[3].x + hireacy[0].x) / 2,
              (hireacy[3].y + hireacy[0].y) / 2
            )
          );
        }
      }
      //计算每个小矩形的中心坐标放到this.arrays
      for (let i = 0; i < hireacys.length; i++) {
        var vote = {};
        vote.x =
          (hireacys[i][0].x +
            hireacys[i][1].x +
            hireacys[i][2].x +
            hireacys[i][3].x) /
          4;
        vote.y =
          (hireacys[i][0].y +
            hireacys[i][1].y +
            hireacys[i][2].y +
            hireacys[i][3].y) /
          4;
        //var position = {}
        this.arrays.push({ lng: vote.x, lat: vote.y });
      }

      var promise = Cesium.sampleTerrainMostDetailed(
        new Cesium.createWorldTerrain({
          requestWaterMask: true,
          requestVertexNormals: true,
        }),
        slopelineposition
      );

      Cesium.when(promise, function(updatedPositions) {
        //拿到所有的高度数据
        var m = 0;

        //updatedPositions.length=80000

        var num = 0; //存放已经放入this.recentity中的坐标数
        //圆形内小矩形的id
        var id = 0;
        for (var k = 0; k < updatedPositions.length / 8; k++) {
          //第一个点与第五个点的坡度,就是两个点高度除两点距离
          var slope1 =
            (updatedPositions[m].height - updatedPositions[m + 4].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m].latitude,
                updatedPositions[m].longitude,
                updatedPositions[m].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 4].latitude,
                updatedPositions[m + 4].longitude,
                updatedPositions[m + 4].height
              )
            );
          //第二个点与第六个点的坡度
          var slope2 =
            (updatedPositions[m + 1].height - updatedPositions[m + 5].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 1].latitude,
                updatedPositions[m + 1].longitude,
                updatedPositions[m + 1].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 5].latitude,
                updatedPositions[m + 5].longitude,
                updatedPositions[m + 5].height
              )
            );
          //第三个点与第七个点的坡度
          var slope3 =
            (updatedPositions[m + 2].height - updatedPositions[m + 6].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 2].latitude,
                updatedPositions[m + 2].longitude,
                updatedPositions[m + 2].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 6].latitude,
                updatedPositions[m + 6].longitude,
                updatedPositions[m + 6].height
              )
            );
          //第四个点与第八个点的坡度
          var slope4 =
            (updatedPositions[m + 3].height - updatedPositions[m + 7].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 3].latitude,
                updatedPositions[m + 3].longitude,
                updatedPositions[m + 3].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 7].latitude,
                updatedPositions[m + 7].longitude,
                updatedPositions[m + 7].height
              )
            );
          // console.log("slope1:"+slope1+";slope2:"+slope2+";slope3:"+slope3+";slope4:"+slope4);
          var arrposition = [
            Math.abs(slope1),
            Math.abs(slope2),
            Math.abs(slope3),
            Math.abs(slope4),
          ]; //取绝对值
          arrposition.sort();
          var slope = arrposition[3]; // 拿到最大的坡度值

          slope =
            (Math.abs(slope1) +
              Math.abs(slope2) +
              Math.abs(slope3) +
              Math.abs(slope4)) /
            4; //四个坡度值大小有的差值特别大，这里取的平均值用来配置颜色
          //tan(20度) = 0.363970234
          if (0 <= slope && slope < 0.363970234) {
            slopecolor = "LightBlue  ";
          } else if (0.363970234 <= slope && slope < 0.5) {
            slopecolor = "GreenYellow ";
          } else if (0.5 <= slope && slope < Math.sqrt(2) / 2) {
            slopecolor = "Green ";
          } else if (Math.sqrt(2) / 2 <= slope && slope < 0.87) {
            slopecolor = "Orange ";
          } else if (0.87 <= slope && slope < 0.91) {
            slopecolor = "Red ";
          } else if (0.91 <= slope && slope < 0.95) {
            slopecolor = "Purple ";
          } else {
            slopecolor = "SaddleBrown ";
          }

          //计算每个小矩形中心点高度
          //给this.arrays添加high属性

          this.arrays[k].high =
            (updatedPositions[m].height +
              updatedPositions[m + 1].height +
              updatedPositions[m + 2].height +
              updatedPositions[m + 3].height +
              updatedPositions[m + 4].height +
              updatedPositions[m + 5].height +
              updatedPositions[m + 6].height +
              updatedPositions[m + 7].height) /
            8;

          var distance = this.pointInsideCircle(
            this.arrays[k].lng,
            this.arrays[k].lat,
            this.arrays[k].high,
            this.pointlng,
            this.pointlat,
            this.dimianhgt
          );

          //判断小矩形中心点到圆心距离和筛选坡度
          if (distance < this.slopeR) {
            //存放圆内每个小矩形的中心经纬度和高度
            this.circleRecArray.push(this.arrays[k]);
            //圆内小矩形存放对角坐标
            this.recentity.push(updatedPositions[m]);
            this.recentity.push(updatedPositions[m + 4]);
            //圆内筛选坡度小于20度
            if (0 <= slope && slope < 0.363970234) {
              //0.363970234
              this.countcolor++; //计算符合坡度要求的坐标数
              this.fitPointSlope.push({
                lng: this.arrays[k].lng,
                lat: this.arrays[k].lat,
                high: this.arrays[k].high,
              });
            }

            this.viewer.entities.add({
              type: "drawSloperectange",
              id: id,
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(
                  Cesium.Math.toDegrees(this.recentity[num].longitude),
                  Cesium.Math.toDegrees(this.recentity[num].latitude),
                  Cesium.Math.toDegrees(this.recentity[num + 1].longitude),
                  Cesium.Math.toDegrees(this.recentity[num + 1].latitude)
                ),
                material: Cesium.Color.fromCssColorString(slopecolor),
              },
            });
            num += 2;

            //圆内小矩形id+1
            id++;
          }

          m += 8;
        }
      });
    }, */

    slopeAnalysis() {
      var PI = 3.14159265;
      var latitude = this.pointlat;
      var longitude = this.pointlng;
      var degree = (24901 * 1609) / 360.0;
      var raidusMile = this.slopeR;
      var dpmLat = 1 / degree;
      var radiusLat = dpmLat * raidusMile;
      //alert('latitude:'+latitude);
      //alert('radiusLat:'+radiusLat);
      var lat1 = eval(latitude) - eval(radiusLat);
      var lat2 = eval(latitude) - eval(radiusLat);
      var lat3 = eval(latitude) + eval(radiusLat);
      var lat4 = eval(latitude) + eval(radiusLat);

      var mpdLng = degree * Math.cos(latitude * (PI / 180));
      var dpmLng = 1 / mpdLng;
      var radiusLng = dpmLng * raidusMile;

      var lng1 = eval(longitude) - eval(radiusLng);
      var lng2 = eval(longitude) + eval(radiusLng);
      var lng3 = eval(longitude) + eval(radiusLng);
      var lng4 = eval(longitude) - eval(radiusLng);
      //生成四个角的坐标
      const recArr = [];
      recArr.push(lng1);
      recArr.push(lat1);
      recArr.push(lng2);
      recArr.push(lat2);
      recArr.push(lng3);
      recArr.push(lat3);
      recArr.push(lng4);
      recArr.push(lat4);

      var startx1 = recArr[0];
      var starty1 = recArr[1];
      var startz1 = 0;
      var startx2 = recArr[2];
      var starty2 = recArr[3];
      var startz2 = 0;
      var startx3 = recArr[4];
      var starty3 = recArr[5];
      var startz3 = 0;
      var startx4 = recArr[6];
      var starty4 = recArr[7];
      var startz4 = 0;
      //const this.viewer = window.this.viewer;
      var slopecolor = " ";
      //高度z全为0
      var count = 100;
      var slopelineposition = [];
      var hireacys = []; //存的10000个小矩形，每一项又包括4个对象，每个小矩形的四角坐标存在里面
      //var hireacysdistance = []
      for (var j = 0; j < 100; j++) {
        for (var i = 0; i < 100; i++) {
          var hireacy = [];
          //分割成小面，切分经纬度,小矩形四个点坐标
          hireacy.push(
            new Cesium.Cartesian3(
              startx1 +
                ((startx2 - startx1) / count) * i +
                ((startx4 +
                  ((startx3 - startx4) / count) * i -
                  startx1 -
                  ((startx2 - startx1) / count) * i) /
                  count) *
                  j,
              starty1 +
                ((starty2 - starty1) / count) * i +
                ((starty4 +
                  ((starty3 - starty4) / count) * i -
                  starty1 -
                  ((starty2 - starty1) / count) * i) /
                  count) *
                  j,
              startz1 +
                ((startz2 - startz1) / count) * i +
                ((startz4 +
                  ((startz3 - startz4) / count) * i -
                  startz1 -
                  ((startz2 - startz1) / count) * i) /
                  count) *
                  j
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx1 +
                ((startx2 - startx1) / count) * (i + 1) +
                ((startx4 +
                  ((startx3 - startx4) / count) * (i + 1) -
                  startx1 -
                  ((startx2 - startx1) / count) * (i + 1)) /
                  count) *
                  j,
              starty1 +
                ((starty2 - starty1) / count) * (i + 1) +
                ((starty4 +
                  ((starty3 - starty4) / count) * (i + 1) -
                  starty1 -
                  ((starty2 - starty1) / count) * (i + 1)) /
                  count) *
                  j,
              startz1 +
                ((startz2 - startz1) / count) * (i + 1) +
                ((startz4 +
                  ((startz3 - startz4) / count) * (i + 1) -
                  startz1 -
                  ((startz2 - startz1) / count) * (i + 1)) /
                  count) *
                  j
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx4 +
                ((startx3 - startx4) / count) * (i + 1) -
                ((startx4 +
                  ((startx3 - startx4) / count) * (i + 1) -
                  startx1 -
                  ((startx2 - startx1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j),
              starty4 +
                ((starty3 - starty4) / count) * (i + 1) -
                ((starty4 +
                  ((starty3 - starty4) / count) * (i + 1) -
                  starty1 -
                  ((starty2 - starty1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j),
              startz4 +
                ((startz3 - startz4) / count) * (i + 1) -
                ((startz4 +
                  ((startz3 - startz4) / count) * (i + 1) -
                  startz1 -
                  ((startz2 - startz1) / count) * (i + 1)) /
                  count) *
                  (count - 1 - j)
            )
          );
          hireacy.push(
            new Cesium.Cartesian3(
              startx4 +
                ((startx3 - startx4) / count) * i -
                ((startx4 +
                  ((startx3 - startx4) / count) * i -
                  startx1 -
                  ((startx2 - startx1) / count) * i) /
                  count) *
                  (count - 1 - j),
              starty4 +
                ((starty3 - starty4) / count) * i -
                ((starty4 +
                  ((starty3 - starty4) / count) * i -
                  starty1 -
                  ((starty2 - starty1) / count) * i) /
                  count) *
                  (count - 1 - j),
              startz4 +
                ((startz3 - startz4) / count) * i -
                ((startz4 +
                  ((startz3 - startz4) / count) * i -
                  startz1 -
                  ((startz2 - startz1) / count) * i) /
                  count) *
                  (count - 1 - j)
            )
          );
          hireacys.push(hireacy);
          //取出面的8个点坐标，拿点坐标去求高度值
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[0].x, hireacy[0].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[0].x + hireacy[1].x) / 2,
              (hireacy[0].y + hireacy[1].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[1].x, hireacy[1].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[1].x + hireacy[2].x) / 2,
              (hireacy[1].y + hireacy[2].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[2].x, hireacy[2].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[2].x + hireacy[3].x) / 2,
              (hireacy[2].y + hireacy[3].y) / 2
            )
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(hireacy[3].x, hireacy[3].y)
          );
          slopelineposition.push(
            Cesium.Cartographic.fromDegrees(
              (hireacy[3].x + hireacy[0].x) / 2,
              (hireacy[3].y + hireacy[0].y) / 2
            )
          );
        }
      }
      //计算每个小矩形的中心坐标放到this.arrays
      for (let i = 0; i < hireacys.length; i++) {
        var vote = {};
        vote.x =
          (hireacys[i][0].x +
            hireacys[i][1].x +
            hireacys[i][2].x +
            hireacys[i][3].x) /
          4;
        vote.y =
          (hireacys[i][0].y +
            hireacys[i][1].y +
            hireacys[i][2].y +
            hireacys[i][3].y) /
          4;
        //var position = {}
        this.arrays.push({
          lng: vote.x,
          lat: vote.y
        });
      }
      //获得高度
      var promise = Cesium.sampleTerrain(
        new Cesium.createWorldTerrain({
          requestWaterMask: true,
          requestVertexNormals: true
        }),
        11,
        slopelineposition
      );

      promise.then(updatedPositions => {
        console.log("这是promise的数据" + updatedPositions[2000].height);
        console.log("updatedPositions长度" + updatedPositions.length);
        var m = 0;
        var num = 0; //存放已经放入this.recentity中的坐标数
        //圆形内小矩形的id
        var id = 0;
        for (var k = 0; k < updatedPositions.length / 8; k++) {
          //第一个点与第五个点的坡度,就是两个点高度除两点距离
          var slope1 =
            (updatedPositions[m].height - updatedPositions[m + 4].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m].latitude,
                updatedPositions[m].longitude,
                updatedPositions[m].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 4].latitude,
                updatedPositions[m + 4].longitude,
                updatedPositions[m + 4].height
              )
            );
          //第二个点与第六个点的坡度
          var slope2 =
            (updatedPositions[m + 1].height - updatedPositions[m + 5].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 1].latitude,
                updatedPositions[m + 1].longitude,
                updatedPositions[m + 1].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 5].latitude,
                updatedPositions[m + 5].longitude,
                updatedPositions[m + 5].height
              )
            );
          //第三个点与第七个点的坡度
          var slope3 =
            (updatedPositions[m + 2].height - updatedPositions[m + 6].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 2].latitude,
                updatedPositions[m + 2].longitude,
                updatedPositions[m + 2].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 6].latitude,
                updatedPositions[m + 6].longitude,
                updatedPositions[m + 6].height
              )
            );
          //第四个点与第八个点的坡度
          var slope4 =
            (updatedPositions[m + 3].height - updatedPositions[m + 7].height) /
            Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 3].latitude,
                updatedPositions[m + 3].longitude,
                updatedPositions[m + 3].height
              ),
              Cesium.Cartesian3.fromDegrees(
                updatedPositions[m + 7].latitude,
                updatedPositions[m + 7].longitude,
                updatedPositions[m + 7].height
              )
            );

          var slope =
            (Math.abs(slope1) +
              Math.abs(slope2) +
              Math.abs(slope3) +
              Math.abs(slope4)) /
            4; //四个坡度值大小有的差值特别大，这里取的平均值用来配置颜色
          //tan(20度) = 0.363970234
          if (0 <= slope && slope < 0.363970234) {
            slopecolor = "LightBlue  ";
          } else if (0.363970234 <= slope && slope < 0.5) {
            slopecolor = "GreenYellow ";
          } else if (0.5 <= slope && slope < Math.sqrt(2) / 2) {
            slopecolor = "Green ";
          } else if (Math.sqrt(2) / 2 <= slope && slope < 0.87) {
            slopecolor = "Orange ";
          } else if (0.87 <= slope && slope < 0.91) {
            slopecolor = "Red ";
          } else if (0.91 <= slope && slope < 0.95) {
            slopecolor = "Purple ";
          } else {
            slopecolor = "SaddleBrown ";
          }

          //计算每个小矩形中心点高度
          //给this.arrays添加high属性

          this.arrays[k].high =
            (updatedPositions[m].height +
              updatedPositions[m + 1].height +
              updatedPositions[m + 2].height +
              updatedPositions[m + 3].height +
              updatedPositions[m + 4].height +
              updatedPositions[m + 5].height +
              updatedPositions[m + 6].height +
              updatedPositions[m + 7].height) /
            8;

          var distance = this.pointInsideCircle(
            this.arrays[k].lng,
            this.arrays[k].lat,
            this.arrays[k].high,
            this.pointlng,
            this.pointlat,
            this.dimianhgt
          );
          //判断小矩形中心点到圆心距离和筛选坡度
          if (distance < this.slopeR) {
            console.log("符合");
            //存放圆内每个小矩形的中心经纬度和高度
            this.circleRecArray.push(this.arrays[k]);
            //圆内小矩形存放对角坐标
            this.recentity.push(updatedPositions[m]);
            this.recentity.push(updatedPositions[m + 4]);
            //圆内筛选坡度小于20度
            if (0 <= slope && slope < 0.8) {
              //0.363970234
              this.countcolor++; //计算符合坡度要求的坐标数
              this.fitPointSlope.push(this.arrays[k]);
            }
            //创建entity,这里出现问题
            /* this.viewer.entities.add({
                                    type: "drawSloperectange",
                                    id: id,
                                    rectangle: {
                                        coordinates: Cesium.Rectangle.fromDegrees(
                                            Cesium.Math.toDegrees(this.recentity[num]
                                                .longitude),
                                            Cesium.Math.toDegrees(this.recentity[num]
                                                .latitude),
                                            Cesium.Math.toDegrees(this.recentity[num +
                                                    1]
                                                .longitude),
                                            Cesium.Math.toDegrees(this.recentity[num +
                                                    1]
                                                .latitude)
                                        ),
                                        material: Cesium.Color.fromCssColorString(
                                            slopecolor),
                                    },
                                }); */
            num += 2;
            //圆内小矩形id+1
            id++;
          }
          m = m + 8;
        }
      });
    },
    //计算小矩形中心点到圆心距离,大地线距离
    pointInsideCircle(
      pointLongitude,
      pointLatitude,
      pointHeight,
      circleLongitude,
      circleLatitude,
      circleHeight
    ) {
      var startCartographic = Cesium.Cartographic.fromDegrees(
        pointLongitude,
        pointLatitude,
        pointHeight
      );
      var endCartographic = Cesium.Cartographic.fromDegrees(
        circleLongitude,
        circleLatitude,
        circleHeight
      );

      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic(); //测地线
      geodesic.setEndPoints(startCartographic, endCartographic); //设置起点终点

      var distance = geodesic.surfaceDistance; //获取起点和终点之间的表面距离
      return distance;
    },
    //根据经纬度和高度获取this.fitPointSlope中每个点和巷道点之间直线距离,并返回最短距离的经纬度和高度坐标
    getShortestDistance(
      fitPointSlopearray,
      pointLongitude,
      pointLatitude,
      pointHeight
    ) {
      var minlng = fitPointSlopearray[0].lng;
      var minlat = fitPointSlopearray[0].lat;
      var minhigh = fitPointSlopearray[0].high;
      var min = Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(
          fitPointSlopearray[0].lng,
          fitPointSlopearray[0].lat,
          fitPointSlopearray[0].high
        ),
        Cesium.Cartesian3.fromDegrees(
          pointLongitude,
          pointLatitude,
          pointHeight
        )
      );
      for (let i = 0; i < this.fitPointSlopearray.length; i++) {
        var dis = Cesium.Cartesian3.distance(
          Cesium.Cartesian3.fromDegrees(
            fitPointSlopearray[i].lng,
            fitPointSlopearray[i].lat,
            fitPointSlopearray[i].high
          ),
          Cesium.Cartesian3.fromDegrees(
            pointLongitude,
            pointLatitude,
            pointHeight
          )
        );
        if (dis < min) {
          min = dis;
          minlng = fitPointSlopearray[i].lng;
          minlat = fitPointSlopearray[i].lat;
          minhigh = fitPointSlopearray[i].high;
        }
      }
      return { lng: minlng, lat: minlat, high: minhigh };
    },
    //得到最佳点
    getBestPoint() {
      const viewer = window.viewer;
      if (this.countcolor == 0) {
        //自己选择一个最佳点
        alert("没有找到合适的点，请在圆内鼠标右键单击选择一个合适的点！");

        const viewer = window.viewer;
        window.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        window.handler.setInputAction(e => {
          const pixel = e.position;
          var pickedObject = viewer.scene.pick(pixel);
          if (
            viewer.scene.pickPositionSupported &&
            Cesium.defined(pickedObject)
          ) {
            //判断是否拾取到模型
            const cartesian = viewer.scene.pickPosition(pixel); //若拾取到模型，则保存拾取点笛卡尔坐标

            let pointcartographic = Cesium.Cartographic.fromCartesian(
              cartesian
            );
            var selectpointlng = Cesium.Math.toDegrees(
              pointcartographic.longitude
            );
            var seletctpointlat = Cesium.Math.toDegrees(
              pointcartographic.latitude
            );
            var selectpointhgt = pointcartographic.height;
            var nums = "目标点";

            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                selectpointlng,
                seletctpointlat,
                selectpointhgt
              ),
              point: {
                show: true, // default
                color: Cesium.Color.RED,
                pixelSize: 10 // default: 1
              },
              label: {
                text: nums,
                pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
                font: "14px Helvetica",
                fillColor: Cesium.Color.SKYBLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE
              }
            });
            this.bestFitPoint.lng = selectpointlng;
            this.bestFitPoint.lat = seletctpointlat;
            this.bestFitPoint.high = selectpointhgt;
          }
          console.log(
            "目标点的经度:" +
              selectpointlng +
              "纬度:" +
              seletctpointlat +
              "高度：" +
              selectpointhgt
          );
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); //右键选择点
      } else {
        //说明存在坡度小于20度的点，找到最短距离获得最佳点
        this.bestFitPoint = this.getShortestDistance(
          this.fitPointSlope,
          this.pointlng,
          this.pointlat,
          this.pointhgt
        );

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            this.bestFitPoint.lng,
            this.bestFitPoint.lat,
            this.bestFitPoint.high
          ),
          point: {
            show: true, // default
            color: Cesium.Color.RED,
            pixelSize: 10 // default: 1
          },
          label: {
            text: "目标点",
            pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
            font: "14px Helvetica",
            fillColor: Cesium.Color.SKYBLUE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE
          }
        });
        console.log(
          "目标点的经度:" +
            this.bestFitPoint.lng +
            "纬度:" +
            this.bestFitPoint.lat +
            "高度：" +
            this.bestFitPoint.high
        );
      }
    },
    //开始钻探动画
    startDrilling() {
      const viewer = window.viewer;
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            this.pointlng,
            this.pointlat,
            this.pointhgt,
            this.bestFitPoint.lng,
            this.bestFitPoint.lat,
            this.bestFitPoint.high
          ]),
          width: 2,
          material: new Cesium.PolylineOutlineMaterialProperty({
            color: Cesium.Color.RED,
            outlineWidth: 2,
            outlineColor: Cesium.Color.BLACK
          })
        }
      });
    }
  }
};
</script>
