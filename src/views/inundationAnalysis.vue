<style lang="less" scoped>
//巷道研淹没分析，2020.9.25，伍军豪

.slect {
  display: flex;
  // width: 500px;
}
.info {
  margin-right: 10px;
}
.success {
  margin-right: 10px;
}
</style>
<template>
  <div class="slect">
    <Button class="success" type="info" @click="getTunnelInfo">显示水面</Button>
    <input
      class="success"
      type="text"
      ref="num"
      @keyup.enter="onSubmit()"
      placeholder="输入水位"
    />
    <Button class="success" type="success" @click="onSubmit">确定</Button>
    <Button class="success" type="success" @click="close">关闭</Button>

    <p>{{ waterPosiyion }}</p>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
import { EventBus } from "@/utils/bus.js"; //中央事件总线
import waterTextuer from "@/assets/img/water.jpg"; //水的图片

export default {
  data() {
    return {
      mineId: "",
      originPosition,
      Tunneldata,
      TunnelName,
      TunnelHeight,
      SubmergedTunnel: [],
      windowState: false, //关闭窗口
      longitude,
      latitude,
      height,
      waterPosiyion,
    };
  },
  mounted() {
    // this.$refs.num.value = -500;
    var that = this;
    EventBus.$on("getMineId", function (val) {
      //获取
      that.mineId = null;
      that.mineId = val;
      console.log(that.mineId);
      console.log(typeof that.mineId);
    });
    EventBus.$on("change", function (val) {
      that.Tunneldata = [];
      that.Tunneldata = val;
      console.log(that.Tunneldata);
    });

    EventBus.$on("positions", function (minelongitude, minelatitude, height) {
      that.longitude = minelongitude;
      that.latitude = minelatitude;
      that.height = height;
    });
    console.log("asdasdasdasdasd--------------------");
  },
  props: {
    viewer: {
      //父组件传过来的viewer
      type: Object,
      default: () => {},
    },
  },
  methods: {
    onSubmit() {
      //输入框输入完成点击确定
          this.SubmergedTunnel=[];

      this.getLowestTunnelPoint();

      if (
        isNaN(this.$refs.num.value) ||
        this.$refs.num.value == " " ||
        this.$refs.num.value == null
      ) {
        this.$refs.num.value = "";
        alert("请输入合法的数字，-800至800之间");
        return;
      }

      this.waterPosiyion = this.$refs.num.value;
      this.originPosition = Cesium.Cartesian3.fromDegrees(
        this.longitude,
        this.latitude,
        this.waterPosiyion
      );

      if (viewer.entities.getById("waterPlane") != undefined) {
        viewer.entities.getById("waterPlane").position = this.originPosition;
      }

      console.log(this.TunnelName.length);
      for (var i = 0; i < this.TunnelName.length; i++) {
        if (this.waterPosiyion > this.TunnelHeight[i]) {
          this.SubmergedTunnel.push(this.TunnelName[i]);
        }
      }
      var tunnelname = this.SubmergedTunnel.join("，");
      console.log("当前水位是：" + this.waterPosiyion + "米");
      that.$store.dispatch("setCMsg", "");
      that.$nextTick(() => {
        that.$store.dispatch(
          "setCMsg",
          "当前水位是：" +
            that.waterPosiyion +
            "米" +
            "</br>被淹巷道有：" +
            "</br>" +
            tunnelname
        );
      });
    },
    getTunnelInfo() {
      this.getLowestTunnelPoint();

      //显示水面的函数
      if (this.$refs.num.value == "") {
        this.waterPosiyion = -600;
        // console.log(this.TunnelHeight)
        // console.log(typeof(this.TunnelHeight[0]))

        // console.log(Math.min(this.TunnelHeight))
        // let WaterDeep =
        //   this.TunnelHeight == undefined ? -600 : Math.min(this.TunnelHeight);
        // this.waterPosiyion = WaterDeep;
        this.$refs.num.value = this.waterPosiyion;
      } else {
        this.waterPosiyion = this.$refs.num.value;
      }
      this.originPosition = Cesium.Cartesian3.fromDegrees(
        this.longitude,
        this.latitude,
        this.waterPosiyion
      );
      var waterPlane = viewer.entities.add({
        //创建水面
        id: "waterPlane",
        name: "Red box with black outline",
        position: this.originPosition,
        box: {
          dimensions: new Cesium.Cartesian3(8000.0, 8000.0, 5.0),
          material: new Cesium.ImageMaterialProperty({
            image: waterTextuer,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(1, 1),
          }),
        },
      });
      var a = -500; //水面高度（暂时）
      // waterPlane.position = Cesium.Cartesian3.fromDegrees(
      //   this.longitude,
      //   this.latitude,
      //   this.waterPosiyion + 1
      // );

      // this.getLowestTunnelPoint();
      this.SubmergedTunnel = [];
      var that = this; //替换this
      document.onkeydown = function (e) {
          that.SubmergedTunnel=[];

        var e = event || window.event || arguments.callee.caller.arguments[0];
        if ((e && e.keyCode == 38) || (e && e.keyCode == 87)) {
          // //w和↑
          that.waterPosiyion = parseInt(that.waterPosiyion) + 1;
          that.$refs.num.value = that.waterPosiyion;

          // console.log(that.waterPosiyion);
          console.log("当前水位是：" + that.waterPosiyion + "米"); //可以打印出多少米

          for (var i = 0; i < that.TunnelName.length; i++) {
            if (that.waterPosiyion > that.TunnelHeight[i]) {
              that.SubmergedTunnel.push(that.TunnelName[i]);
            }
          }
          console.log(that.SubmergedTunnel);

          var tunnelname = that.SubmergedTunnel.join("，");
          that.$store.dispatch("setCMsg", "");
          that.$nextTick(() => {
            that.$store.dispatch(
              "setCMsg",
              "当前水位是：" +
                that.waterPosiyion +
                "米" +
                "</br>被淹巷道有：" +
                "</br>" +
                tunnelname
            );
          });

          that.SubmergedTunnel = [];

          waterPlane.position = new Cesium.CallbackProperty(function () {
            return Cesium.Cartesian3.fromDegrees(
              that.longitude,
              that.latitude,
              that.waterPosiyion
            ); //此处修改为：经度纬度和高度（都是从数据库获取的）
          }, false); //防止闪烁，在移动的过程
        }
        if ((e && e.keyCode == 40) || (e && e.keyCode == 83)) {
          // //w和↑
          that.SubmergedTunnel=[];
          that.waterPosiyion = that.waterPosiyion - 1;
          that.$refs.num.value = that.waterPosiyion;

          console.log(that.waterPosiyion);
          for (var i = 0; i < that.TunnelName.length; i++) {
            if (that.waterPosiyion > that.TunnelHeight[i]) {
              that.SubmergedTunnel.push(that.TunnelName[i]);
            }
          }
          console.log(that.SubmergedTunnel);
          var tunnelname = that.SubmergedTunnel.join("，");
          console.log("当前水位是：" + that.waterPosiyion + "米");
          that.$store.dispatch("setCMsg", "");
          that.$nextTick(() => {
            that.$store.dispatch(
              "setCMsg",
              "当前水位是：" +
                that.waterPosiyion +
                "米" +
                "</br>被淹巷道有：" +
                "</br>" +
                tunnelname
            );
          });
          // console.log(that.SubmergedTunnel);

          that.SubmergedTunnel = [];
          waterPlane.position = new Cesium.CallbackProperty(function () {
            return Cesium.Cartesian3.fromDegrees(
              that.longitude,
              that.latitude,
              that.waterPosiyion
            );
          }, false); //防止闪烁，在移动的过程
        }
      };
    },
    close() {
      //关闭淹没分析，重置设置
      this.TunnelName=[];
      this.TunnelHeight=[];
      viewer.entities.remove(viewer.entities.getById(`waterPlane`)); //消除水面
      this.waterPosiyion = -500;
      this.$refs.num.value = "";
      document.onkeydown = function (e) {
        //消除事件
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if ((e && e.keyCode == 38) || (e && e.keyCode == 87)) {
          // //w和
        }
        if ((e && e.keyCode == 40) || (e && e.keyCode == 83)) {
        }
      };
      this.$emit("closeWIA", this.windowState);
    },
    getLowestTunnelPoint() {
      this.TunnelName = [];
      this.TunnelHeight = [];
      //求取巷道最低点的函数
      for (var i = 0; i < this.Tunneldata.length; i++) {
        var temp = 10000;
        for (var j = 0; j < this.Tunneldata[i].data1.length / 3; j++) {
          if (temp > this.Tunneldata[i].data1[3 * j + 2]) {
            temp = this.Tunneldata[i].data1[3 * j + 2];
          }
        }
        this.Tunneldata[i].data11 = temp;
        this.TunnelName.push(this.Tunneldata[i].data6);
        this.TunnelHeight.push(this.Tunneldata[i].data11);
      }
    },
  },
};
</script>