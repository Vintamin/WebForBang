<style lang="less" scoped>
.slect {
  display: flex;
  justify-content: center;
  text-align: center;
}
.info {
  margin-right: 30px;
}
</style>
<template>
  <div class="slect">
    <Button class="info" type="info" @click="show">开启</Button>
    <Button class="success" type="success" @click="close">关闭</Button>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
import { EventBus } from "@/utils/bus.js";
import Texture1 from "@/assets/pic2/16.jpg";
import Texture2 from "@/assets/pic2/top2.jpg";
import Texture3 from "@/assets/pic2/color4_1.png";
import Texture4 from "@/assets/pic2/color4_2.png";
import { concat } from "./help/doc/help.js";
import TrailMaterial from "./PolylineTrailMaterialProperty.js";
import TrailMaterial_1 from "./PolylineTrailMaterialProperty_1.js";

export default {
  data() {
    return {
      fromComponentAMsg: [],
      b: [],
      dest: [],
      straightWay_2: [],
      count1: [],
      meshID: 0,
      windowState:false
    };
  },
  components: {
    TrailMaterial
  },
  mounted() {
    // 这个时候组件 B 知道组件 A 给它传了一条数据过来了,于是赶紧叫 Bus 这个传话员把数据告诉它
    // bus 就告诉组件 B, 组件 A 那边通过inceptMessage传过来一条数据叫 a
    var that = this;
    EventBus.$on("change", function(val) {
      that.dest = val;
      //console.log(that.dest);
    });
    // EventBus.$on("change2", function(val) {
    //   that.dest = val;
    //   console.log(that.dest);
    // });
  },
  props: {
    viewer: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    show() {
      this.$emit("closeWDS", this.windowState);
      // console.log(this.dest);
      for (var m = 0; m < this.dest.length; m++) {
        var point = this.dest[m].data4.length / 3; //先求出有多少个点，然后依次两两相减
        // console.log(this.dest[m].data4);
       // console.log(point);
        this.count1 = [];
        for (var i = 0; i < point - 1; i++) {
          this.straightWay_2.push(this.dest[m].data4[3 * i]);
          this.straightWay_2.push(this.dest[m].data4[3 * i + 1]);
          this.straightWay_2.push(this.dest[m].data4[3 * i + 2]);

          this.straightWay_2.push(this.dest[m].data4[3 * i + 3]);
          this.straightWay_2.push(this.dest[m].data4[3 * i + 4]);
          this.straightWay_2.push(this.dest[m].data4[3 * i + 5]);

          var redTube = this.viewer.entities.add({
            name: this.dest[m].data4,
            id: this.meshID,
            polylineVolume: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                this.straightWay_2
              ),
              shape: this.computeCircle(
                this.dest[m].data5 - 1 / 100,
                this.dest[m].data5
              )
            }
          });
          // console.log(this.straightWay_2);
          redTube.length = this.carculateDistance(this.straightWay_2);

          // console.log("管道长度：" + redTube.length);
          this.count1.push(Math.ceil(redTube.length / 10));
          console.log(redTube.length);
          console.log(this.count1[i]);

          if (this.dest[m].data3 == "进风风流") {
            redTube.polylineVolume.material = new Cesium.PolylineTrailMaterialProperty(    //动态纹理
              {
                // 尾迹线材质

                // color: Cesium.Color.fromCssColorString("rgba(255,255,255,0)"),
                color: Cesium.Color.BLUE,

                // color: Cesium.Color.fromCssColorString("rgba(0,255,0, 0.3)"),

                duration: 800
              }
            );
          } else {
            redTube.polylineVolume.material = new Cesium.PolylineTrailMaterialProperty_1(
              {
                // 尾迹线材质

                // color: Cesium.Color.fromCssColorString("rgba(255,0,0,0)"),
                color: Cesium.Color.RED,

                // color: Cesium.Color.fromCssColorString("rgba(0,255,0, 0.3)"),

                duration: 800
              }
            );
          }
          this.straightWay_2 = [];
          this.meshID = this.meshID + 1;
        }
      }

   
    },
    close() {
      this.$emit("closeWDS", this.windowState);
      for (var m = 0; m < this.meshID; m++) {
        viewer.entities.removeById(m);
      }
    },
    //计算距离的函数，positions是传入的位置数组，包含经度纬度和高度
    carculateDistance(positions) {
      // console.log(positions);
      var points = positions.length / 3; //先求出有多少个点，然后依次两两相减
      // console.log(points);
      var distance = 0.0;
      for (var i = 0; i < points - 1; i++) {
        //计算经纬度相减的代码，得出长度，单位是米
        var lat1 = positions[3 * i];
        var lat2 = positions[3 * (i + 1)];
        var lng1 = positions[3 * i + 1];
        var lng2 = positions[3 * (i + 1) + 1];
        const PI = Math.PI;
        const EARTH_RADIUS = 6378137.0;
        function getRad(d) {
          return (d * PI) / 180.0;
        }
        let f = getRad((lat1 + lat2) / 2);
        let g = getRad((lat1 - lat2) / 2);
        let l = getRad((lng1 - lng2) / 2);
        let sg = Math.sin(g);
        let sl = Math.sin(l);
        let sf = Math.sin(f);

        let s, c, w, r, d, h1, h2;
        let a = EARTH_RADIUS;
        let fl = 1 / 298.257;

        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;

        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;

        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;

        d = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg)); //两个节点间的长度
        distance += d; //单条巷道长度
      }
      // console.log(distance);
      return distance;
    },
    // getRepeat(a, redTube) {
    //   console.log(a);
    // },
    computeCircle(radius1, radius2) {
      var positions = [];
      for (var i = 0; i <= 180; i++) {
        var radians1 = Cesium.Math.toRadians(i);
        positions.push(
          new Cesium.Cartesian2(
            radius1 * Math.cos(radians1),
            radius1 * Math.sin(radians1)
          )
        );
      }
      for (var i = 180; i >= 0; i--) {
        var radians2 = Cesium.Math.toRadians(i);
        positions.push(
          new Cesium.Cartesian2(
            radius2 * Math.cos(radians2),
            radius2 * Math.sin(radians2)
          )
        );
      }
      return positions;
    }
  }
};
</script>