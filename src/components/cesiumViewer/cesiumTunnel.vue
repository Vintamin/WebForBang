<template>
  <div id="cesiumContainer" class="fullSize">
    <div id="toolbar"></div>
    <Modal
      v-model="showDialog"
      title="设备详情"
      width="600px"
      draggable
      :styles="{ left: '20px' }"
    >
      <Modelmodify
        v-on:childByValue="childByValue(arguments)"
        v-if="showDialog"
        :xxxData="featureId"
        :mineid="mineid"
        :iseditable="iseditable"
      ></Modelmodify>
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
      <personPosition
        :mineid="mineid"
        :stationName="stationName"
        v-if="showModal"
      />
    </Modal>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
//import Cesium from "cesium/Cesium.js"; //from 中 cesium 指向的是vue.config.js中 alias对象中的别名
import CesiumNavigation from "cesium-navigation-es6";
import axios from "axios";
import Modelmodify from "../../views/modelModify";
import personPosition from "../person/personPosition.vue";
export default {
  data() {
    return {
      showDialog: false,
      // shower: false,
      featureId: 0,
      showModal: false,
    };
  },
  components: {
    Modelmodify,
    personPosition,
  },
  render: (mapcesium) => mapcesium(cesiumContainer),
  props: {
    // API URL
    url: {
      type: String,
      default: "",
    },
    // viewer: {
    //   type: Object,
    //   default: () => {}
    // },
    iseditable: {
      type: String,
      default: "",
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
    mineid: {
      type: String,
      default: "",
    },
  },
  mounted() {
    let that = this;
    /*    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMTE1NzAzZi0wYjZjLTQ2NGUtYWU1MS1iOWJkNDA1Mzg3MTgiLCJpZCI6MTYyOTUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzAxMDI2ODl9.FXBVovN5TZRrwtehWu-ACOQS05yxGa1tRRtBgxP6M9g";
 */
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZDkwNTMxMC03OTZmLTRhYTQtOTc0Zi1jNjZjNTZmOGJlZWIiLCJpZCI6MzYxNjAsImlhdCI6MTYxNzc2MzUwMH0.XkQ0D3lLD1tG-hHfP_5fU19t-VblJ5qvp38cMBRrYsg";
   
    //加载地形数据
    var worldTerrain = Cesium.createWorldTerrain({
      //设置水面效果
      requestWaterMask: true,
      requestVertexNormals: true,
    });

    //加载谷歌影像
    var guge = new Cesium.UrlTemplateImageryProvider({
      url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20,
    });

    // //设置视角为中国
    // var china = Cesium.Rectangle.fromDegrees(100, 10, 120, 70);
    // Cesium.Camera.DEFAULT_VIEW_RECTANGLE = china;

    //加载viewer（Cesium.Viewer类）实现基本框架的加载
    var viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain(),
      baseLayerPicker: false,
      // requestRenderMode: true, // 启用请求渲染模式
      sceneModePicker: false,
      shouldAnimate: true,
      animation: false,
      timeline: false,
      infoBox: false,
      selectionIndicator: false,
      // scene3DOnly: true, // 每个几何实例将只能以3D渲染以节省GPU内存
      //sceneMode: 3, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
      // sceneMode : Cesium.SceneMode.COLUMBUS_VIEW,
    });
    viewer.cesiumWidget.creditContainer.style.display = "none";
    viewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0);
    viewer.scene.globe.depthTestAgainstTerrain = true;

    //***************************地下模式**********************
    var scene = viewer.scene;
    var globe = scene.globe; //globe.undergroundColor = Cesium.Color.fromCssColorString("rgba(58, 130, 210, 1)")
    //修改地球内部的颜色
    scene.screenSpaceCameraController.enableCollisionDetection = false;

    var originalColor = Cesium.Color.fromCssColorString(
      "rgba(58, 130, 210, 1)"
    );
    var originalNearDistance = 1000.0;
    var originalFarDistance = 1000000.0;
    var originalNearAlpha = 0.5;
    var originalFarAlpha = 1.0;

    var color = originalColor;

    var viewModel = {
      enabled: true,
      nearDistance: originalNearDistance,
      farDistance: originalFarDistance,
      nearAlpha: originalNearAlpha,
      farAlpha: originalFarAlpha,
    };

    Cesium.knockout.track(viewModel);

    var toolbar = document.getElementById("toolbar");
    Cesium.knockout.applyBindings(viewModel, toolbar);

    for (var name in viewModel) {
      if (viewModel.hasOwnProperty(name)) {
        Cesium.knockout.getObservable(viewModel, name).subscribe(update);
      }
    }

    function update() {
      globe.undergroundColor = viewModel.enabled ? color : undefined;

      var nearDistance = Number(viewModel.nearDistance);
      nearDistance = isNaN(nearDistance) ? originalNearDistance : nearDistance;

      var farDistance = Number(viewModel.farDistance);
      farDistance = isNaN(farDistance) ? originalFarDistance : farDistance;

      if (nearDistance > farDistance) {
        nearDistance = farDistance;
      }

      var nearAlpha = Number(viewModel.nearAlpha);
      nearAlpha = isNaN(nearAlpha) ? 0.0 : nearAlpha;

      var farAlpha = Number(viewModel.farAlpha);
      farAlpha = isNaN(farAlpha) ? 1.0 : farAlpha;

      globe.undergroundColorAlphaByDistance.near = nearDistance;
      globe.undergroundColorAlphaByDistance.far = farDistance;
      globe.undergroundColorAlphaByDistance.nearValue = nearAlpha;
      globe.undergroundColorAlphaByDistance.farValue = farAlpha;
    }
    update();

    //***************************地下模式**********************
    //默认homebutton复位位置
    var originPosition = Cesium.Cartesian3.fromDegrees(
      112.885665,
      27.296894,
      1050000
    );
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true;
        //你要飞的位置
        viewer.camera.flyTo({
          destination: originPosition,
          // orientation : {
          // heading : Cesium.Math.toRadians(5.334271926441497),
          // pitch : Cesium.Math.toRadians(0.14800886470055508),
          // roll : 6.280998563545232
          // }
        });
      }
    );
    // 设置光照效果，默认false
    viewer.scene.globe.enableLighting = false;

    //设置清晰度
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      //判断是否支持图像渲染像素化处理
      viewer.resolutionScale = window.devicePixelRatio;
    }
    //是否开启抗锯齿
    viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;

    //改变鼠标操作
    // 将原来鼠标中键倾斜视图修改为鼠标左键拖动
    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
      Cesium.CameraEventType.RIGHT_DRAG,
    ];
    // 将原来鼠标右键拖动缩放修改为鼠标滚轮滚动
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
    ];

    //英文转中文
    if (viewer.homeButton) {
      viewer.homeButton.viewModel.tooltip = "初始位置";
    }
    if (viewer.geocoder) {
      viewer.geocoder._textBox.placeholder = "输入经纬度搜索位置...";
      console.log(viewer.geocoder);
    }

    if (viewer.sceneModePicker) {
      viewer.sceneModePicker.viewModel.tooltip3D = "三维";
      viewer.sceneModePicker.viewModel.tooltip2D = "二维";
      viewer.sceneModePicker.viewModel.tooltipColumbusView = "哥伦布视图";
    }
    if (viewer.navigationHelpButton) {
      viewer.navigationHelpButton.viewModel.tooltip = "操作指南";
      var clickHelper = viewer.navigationHelpButton.container.getElementsByClassName(
        "cesium-click-navigation-help"
      )[0];
      var touchHelper = viewer.navigationHelpButton.container.getElementsByClassName(
        "cesium-touch-navigation-help"
      )[0];

      var button = viewer.navigationHelpButton.container.getElementsByClassName(
        "cesium-navigation-button-right"
      )[0];
      button.innerHTML = button.innerHTML.replace(">Touch", ">手势");
      button = viewer.navigationHelpButton.container.getElementsByClassName(
        "cesium-navigation-button-left"
      )[0];
      button.innerHTML = button.innerHTML.replace(">Mouse", ">鼠标");

      var click_help_pan = clickHelper.getElementsByClassName(
        "cesium-navigation-help-pan"
      )[0];
      click_help_pan.innerHTML = "平移";
      var click_help_pan_details = click_help_pan.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0];
      click_help_pan_details.innerHTML = "按下左键 + 拖动";

      var click_help_zoom = clickHelper.getElementsByClassName(
        "cesium-navigation-help-zoom"
      )[0];
      click_help_zoom.innerHTML = "缩放";
      click_help_zoom.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "滑动鼠标滚轮";
      click_help_zoom.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[1].innerHTML = "";

      var click_help_rotate = clickHelper.getElementsByClassName(
        "cesium-navigation-help-rotate"
      )[0];
      click_help_rotate.innerHTML = "旋转";
      click_help_rotate.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "按住鼠标右键拖动";
      click_help_rotate.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[1].innerHTML = "";
      //触屏操作
      var touch_help_pan = touchHelper.getElementsByClassName(
        "cesium-navigation-help-pan"
      )[0];
      touch_help_pan.innerHTML = "平移";
      touch_help_pan.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "单指拖动";

      var touch_help_zoom = touchHelper.getElementsByClassName(
        "cesium-navigation-help-zoom"
      )[0];
      touch_help_zoom.innerHTML = "缩放";
      touch_help_zoom.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "双指捏合";

      var touch_help_tilt = touchHelper.getElementsByClassName(
        "cesium-navigation-help-rotate"
      )[0];
      touch_help_tilt.innerHTML = "俯仰";
      touch_help_tilt.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "双指同向拖动";

      var touch_help_rotate = touchHelper.getElementsByClassName(
        "cesium-navigation-help-tilt"
      )[0];
      touch_help_rotate.innerHTML = "旋转";
      touch_help_rotate.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "双指反向拖动";
    }

    this.$emit("viewer", viewer);
    window.viewer = viewer; //量测工具组件要用
    window.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        112.885665,
        27.296894,
        1050000
      ),
    });

    viewer.scene.debugShowFramesPerSecond = false;
    // 设置光照效果，默认false
    viewer.scene.globe.enableLighting = false;

    var options = {};

    ////湖南省界边框
    //Cesium.GeoJsonDataSource.load("/hunan.json").then(function (dataSource) {
    //  viewer.dataSources.add(
    //    Cesium.GeoJsonDataSource.load("/hunan.json", {
    //      stroke: Cesium.Color.YELLOW,
    //      fill: Cesium.Color.RED.withAlpha(0), //whithAlpha(0)设置填充色为透明
    //      strokeWidth: 3,
    //      markerSymbol: "?",
    //      height: 200,
    //    })
    //  );
    //  var entities = dataSource.entities.values;
    //  for (var i = 0; i < entities.length; i++) {
    //    var entity = entities[i];
    //    // 得到每块多边形的坐标集合
    //    var polyPositions = entity.polygon.hierarchy.getValue(
    //      Cesium.JulianDate.now()
    //    ).positions;
    //    // 根据坐标集合构造BoundingSphere获取中心点坐标
    //    var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
    //    // 将中心点拉回到地球表面
    //    polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
    //    viewer.entities.add({
    //      position: polyCenter,
    //    });
    //  }
    //});

    ////“长沙”注记
    //window.viewer.entities.add({
    //  position: Cesium.Cartesian3.fromDegrees(112.93, 28.23, 1000),
    //  point: {
    //    show: true, // default
    //    color: Cesium.Color.RED,
    //    pixelSize: 10, // default: 1
    //    outlineColor: Cesium.Color.YELLOW,
    //    outlineWidth: 3, // default: 0
    //  },
    //  label: {
    //    text: "长沙",
    //    pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
    //    font: "24px Helvetica",
    //    fillColor: Cesium.Color.SKYBLUE,
    //    outlineColor: Cesium.Color.BLACK,
    //    outlineWidth: 2,
    //    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //  },
    //});
    //省界内文字显示
    // window.viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(111.8, 27.5, 1000),
    //   label: {
    //     text: "矿山三维可视化系统",
    //     pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
    //     font: "28px Helvetica",
    //     fillColor: Cesium.Color.ORANGE,
    //     outlineColor: Cesium.Color.BLACK,
    //     outlineWidth: 2,
    //     style: Cesium.LabelStyle.FILL_AND_OUTLINE
    //   }
    // });

    // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和Cesium.Rectangle.
    options.defaultResetView = Cesium.Cartographic.fromDegrees(
      113.245096,
      27.60272,
      1500.0
    );
    // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
    options.enableCompass = true;
    // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件 将不会添加到地图中。
    options.enableZoomControls = true;
    // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
    options.enableDistanceLegend = false;
    // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
    options.enableCompassOuterRing = true;

    CesiumNavigation(viewer, options);

    // //设置视角定位到某个地点
    // viewer.camera.setView({
    //   //经纬度和高度
    //   destination: Cesium.Cartesian3.fromDegrees(113.245096, 27.60272, 0.0),
    //   orientation: {
    //     //左右摆头
    //     heading: Cesium.Math.toRadians(0.0),
    //     //上下抬头
    //     pitch: Cesium.Math.toRadians(0),
    //     //球的倾斜角度
    //     roll: 0.0
    //   }
    // });
    var selected = {
      feature: undefined,
      originalColor: new Cesium.Color(),
    };
    var selectedEntity = new Cesium.Entity();

    var clickHandler = viewer.screenSpaceEventHandler.getInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
    var clickDoubleHandler = viewer.screenSpaceEventHandler.getInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    //danjishijian
    viewer.screenSpaceEventHandler.setInputAction(function (movement) {
      // ToDo
      // _this.$emit('mapClick');
      if (Cesium.defined(selected.feature)) {
        selected.feature.color = selected.originalColor;
        selected.feature = undefined;
      }
      // console.log(movement);
      // console.log(movement.position);
      if (!Cesium.defined(viewer.scene.pick(movement.position))) {
        clickHandler(movement);
        return;
      }
      var pickedFeature = viewer.scene.pick(movement.position).id;
      if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
      }
      // Select the feature if it's not already selected
      if (selected.feature === pickedFeature) {
        return;
      }

      var featureName = pickedFeature.name;
      that.featureId = pickedFeature.id;

      if (that.featureId.toString().startsWith("3")) {
        // that.featureId = that.featureId - 3 * 100000;
        viewer.selectedEntity = selectedEntity;
        that.showDialog = true;
      } else if (that.featureId.toString().startsWith("4")) {
        // that.featureId = that.featureId - 4 * 100000;
        viewer.selectedEntity = selectedEntity;
        that.showDialog = true;
      } else if (that.featureId.toString().startsWith("1")) {
        // that.featureId = that.featureId - 1 * 100000;
        viewer.selectedEntity = selectedEntity;
        that.showDialog = true;
      } else if (that.featureId.toString().startsWith("9")) {
        viewer.selectedEntity = selectedEntity;
        that.showDialog = true;
      } else if (that.featureId.toString().startsWith("e")) {
        viewer.selectedEntity = selectedEntity;
        that.showDialog = true;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  },
  methods: {
    childByValue(childValue) {
      // childValue就是子组件传过来的值
      this.stationName = childValue[0];
      this.showDialog = !childValue[1];
      this.showModal = childValue[1];
    },
  },
};
</script>

<style scoped>
/* 加上scoped即表示只作用于该组件 */
@import url(../../../node_modules/cesium/Build/Cesium/Widgets/widgets.css);

.fullSize {
  top: 0;
  left: 0;
  border: none;
  height: 750px;
}
.cesium-viewer-animationContainer,  /* 左下角动画控件 */
.cesium-viewer-timelineContainer,   /* 时间线 */
.cesium-viewer-bottom               /* logo信息 */ {
    display: none;
}
</style>
