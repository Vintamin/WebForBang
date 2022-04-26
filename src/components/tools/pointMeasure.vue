<template>
  <div>
    <i-button
      type="primary"
      size="small"
      shape="circle"
      title="一键测量"
      @click="startM"
      >开始测量</i-button
    >
    <i-button
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
    >
  </div>
</template>

<script>
import Cesium from "cesium/Cesium.js";

export default {
  data() {
    return {
      num: 0,
      temp: []
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

  methods: {
    startM() {
      var _this = this;
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
          ++this.num;
          this.temp[this.num] = this.num;

          let pointcartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var pointlng = Cesium.Math.toDegrees(pointcartographic.longitude);
          var pointlat = Cesium.Math.toDegrees(pointcartographic.latitude);
          var pointhgt = pointcartographic.height;
          var nums = "点位" + this.num.toString();
          var str =
            nums +
            "坐标为：" +
            "   " +
            "X:" +
            parseFloat(pointlng) +
            "\n" +
            "Y:" +
            parseFloat(pointlat) +
            "\n" +
            "Z:" +
            parseFloat(pointhgt) +
            "\n";
          this.$store.dispatch("setCMsg", str);

          viewer.entities.add({
            id: this.num,
            position: Cesium.Cartesian3.fromDegrees(
              pointlng,
              pointlat,
              pointhgt
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
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    //清除实体
    removeM(count) {
      if (count == 1) {
        window.viewer.entities.removeById(this.temp[this.num]);
        this.num--;
        window.handler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        ); //移除事件
      } else {
        for (var i = 0; i < this.temp.length; i++) {
          window.viewer.entities.removeById(this.temp[this.num]);
          this.num--;
        }
        this.num = 0;
        window.handler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        ); //移除事件
      }
    }
  }
};
</script>
