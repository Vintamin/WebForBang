<template>
  <div>
    <Checkbox
      @on-change="change"
      style="margin-top:8px"
      v-model="showwork"
      :disabled="isDisabled"
      >&#8197;避难路线</Checkbox
    >
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
//import TunnelShow from './TunnelShow';
// import top2 from "@/assets/pic2/top2.jpg";
// import top1 from "@/assets/pic2/16.jpg";
// import top3 from "@/assets/pic2/timg.jpg";
import shazhiniya from "@/assets//pic/shazhiniyan.jpg";
import xishayan from "@/assets//pic/xishayan.jpg";
import fenshayan from "@/assets/pic/fenshayan.jpg";
import guizhiniyan from "@/assets/pic/guizhiniyan.jpg";
import nizhihuiyan from "@/assets//pic/nizhihuiyan.jpg";
import shazhiniyan from "@/assets//pic/shazhiniyan.jpg";
import zhonglishayan from "@/assets//pic/zhonglishayan.jpg";
import nihuiyan from "@/assets/pic/nihuiyan.jpg";
import tanzhiniyan from "@/assets//pic/tanzhiniyan.jpg";
import huiyan from "@/assets/pic/fenshayan.jpg";
import hannihuiyan from "@/assets/pic/hannihuiyan.jpg";
import shiyingshayan from "@/assets//pic/shiyingshayan.jpg";
import niyan from "@/assets/pic/niyan.jpg";
export default {
  data() {
    return {
      drill: [],
      drillID: [],
      // workingsurfaceData: [],
      mineid: "",
      mineTable: "",
      showwork: false,
      labelEntity1: [],
      labelEntity2: [],
      labelID: [],
      isDisabled: true
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
    },
    //项目id
    projectID: "",
    lanwayData: []
  },
  mounted() {},
  watch: {
    projectID(val) {
      this.isDisabled = false;
    }
  },
  methods: {
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
    draw3DLanway() {
      const count = this.lanwayData.length;
      this.lanwayData.forEach((item, index) => {
        let lanwayDataArr = [];
        item.data.forEach(dataItem => {
          lanwayDataArr.push(dataItem.x);
          lanwayDataArr.push(dataItem.y);
          lanwayDataArr.push(dataItem.z);
        });
        viewer.entities.add({
          name: item.lanwayName,
          id: `shotID${index}-1`,
          polylineVolume: {
            positions: Cesium.Cartesian3.fromArray(lanwayDataArr),
            shape: this.computeCircle(1.0),
            material: new Cesium.Color(0.3, 0.2, 0.1, 1)
          }
        });
        console.log(lanwayDataArr);
      });
      this.viewer.zoomTo(this.viewer.entities);
      console.log("lanwayData是", this.lanwayData);
    },
    //点击按钮后移除钻孔
    change(checked) {
      if (checked == false) {
        this.$store.commit("setShowCheck", {
          key: "routeChecked",
          checked: false
        });
        return;
      } else {
        this.$store.commit("setShowCheck", {
          key: "routeChecked",
          checked: true
        });
        this.draw3DLanway();
      }
    }
  }
};
</script>
