<style lang="less" scoped>
//巷道属性显示，2020.9014，伍军豪
</style>
<template>
  <div class="slect">
    <Button class="info" type="info" @click="getTunnelInfo">点选巷道</Button>
    <Button class="success" type="success" @click=close()>关闭选择</Button>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
import { EventBus } from "@/utils/bus.js"; //中央事件总线
import { concat } from "./help/doc/help.js";
import Texture1 from "@/assets/pic2/16.jpg";
import Texture2 from "@/assets/pic2/top2.jpg";

var tempTunnel = []; //存放临时巷道

export default {
  data() {
    return {
      topShape: [], //存储巷道顶底面
      bottomShape: [],
      tempTunnel: [],
      handler,
      windowState: false,
      originTextral,
      showDialog: false
    };
  },
  mounted() {
    // 这个时候组件 B 知道组件 A 给它传了一条数据过来了,于是赶紧叫 Bus 这个传话员把数据告诉它
    // bus 就告诉组件 B, 组件 A 那边通过inceptMessage传过来一条数据叫 a
    var that = this;
    EventBus.$on("setTopShape", function(val) {
      //获取
      that.topShape = val;
      //console.log(that.topShape);
    });
    EventBus.$on("setBottomShape", function(val) {
      that.bottomShape = val;
      //console.log(that.bottomShape);
    });
  },
  components: {
  },
  props: {
    viewer: {
      //父组件传过来的viewer
      type: Object,
      default: () => {}
    }
  },
  methods: {
    close2() {
      this.showDialog = true;
      alert("aa")
    },
    getTunnelInfo() {
      this.showDialog = true;

      var _this = this;
      this.handler = new Cesium.ScreenSpaceEventHandler( //屏幕函数
        this.viewer.scene.canvas
      );

      var selectedEntity = new Cesium.Entity(); //创建一个cesium实体

      var that = this;

      that.handler.setInputAction(function(click) {
        //点击函数
        if (tempTunnel.length > 0) {
          tempTunnel[0].polylineVolume.material = that.originTextral; //重置纹理
        }
        tempTunnel = []; //清空巷道数组
        var pickedFeature = viewer.scene.pick(click.position);
        if (!Cesium.defined(pickedFeature)) {
          console.log("未选中巷道");
        } else {
          var idtemp = pickedFeature.id.id.split("_"); //若选中就把ID给读取到并且分割
          console.log(idtemp);
          if (idtemp.length == 2) {
            //若选中的是顶部的模型，检索底部模型的ID，并且着色
            var bottomMesh = viewer.entities.getById(
              pickedFeature.id.id + "_" + "g"
            );
            console.log(bottomMesh.id.id);
            that.originTextral = bottomMesh.polylineVolume.material;
            bottomMesh.polylineVolume.material = Cesium.Color.RED;
            tempTunnel.push(bottomMesh);
          } else {
            //若选中的是底部的模型就着色
            that.originTextral = pickedFeature.id.polylineVolume.material;
            pickedFeature.id.polylineVolume.material = Cesium.Color.RED;
            tempTunnel.push(pickedFeature.id);
          }
          //创建一个侧边栏
          var featureName = pickedFeature.id.name; //获取选中实体的名称
          console.log(featureName);
          var temp = featureName.split("_"); //分割名称
          // // pickedFeature.name = featureName;
          // pickedFeature.description =
          //   'Loading <div class="cesium-infoBox-loading"></div>';
          // viewer.selectedEntity = selectedEntity;
          // selectedEntity.name = "巷道信息";
          // selectedEntity.description =
          //   '<table class="cesium-infoBox-defaultTable"><tbody>' +
          //   "<tr><th>巷道名称</th><td>" +
          //   temp[0] +
          //   "</td></tr>" +
          //   "<tr><th>截面类型</th><td>" +
          //   temp[1] +
          //   "</td></tr>" +
          //   "<tr><th>支护类型</th><td>" +
          //   temp[2] +
          //   "</td></tr>" +
          //   "<tr><th>高度/宽度</th><td>" +
          //   temp[3] +
          //   "米，" +
          //   temp[4] +
          //   "米";
          // "</td></tr>" + "</tbody></table>";
        }
        _this.$store.dispatch(
          "setCMsg",
          "巷道名称为：" +
            temp[0] +
            "</br>截面类型为：" +
            temp[1] +
            "</br>支护类型为：" +
            temp[2] +
            "</br>高度/宽度为：" +
            temp[3] +
            "/" +
            temp[4]
        );
        
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    close() {
      
      this.$emit("closeWTP", this.windowState);
      if (tempTunnel.length > 0) {
        tempTunnel[0].polylineVolume.material = this.originTextral; //重置纹理
      }
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }
};
</script>