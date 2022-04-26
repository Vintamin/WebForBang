<template>
  <div>
    <Checkbox
      @on-change="change"
      style="margin-top:8px"
      v-model="showsuface"
      :disabled="isDisabled"
      >&#8197;施工进度</Checkbox
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      showsuface: false,
      isDisabled: true
    };
  },
  props: {
    mineid: {
      type: String,
      default: ""
    },
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
  watch: {
    mineid(val) {
      this.showsuface = false;
      this.isDisabled = false;
    }
  },
  methods: {
    change(checked) {
      if (checked == false) {
        this.$store.commit("setShowCheck", {
          key: "processChecked",
          checked: false
        });
        console.log("checked是", this.$store.state.showListCheck);
        this.viewer.entities.removeById(this.mineid);
        return;
      } else {
        //移除地形
        // var scene = viewer.scene;
        // var terrainProvider;
        // scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
        this.$store.commit("setShowCheck", {
          key: "processChecked",
          checked: true
        });
        console.log(this.$store.state.showListCheck);
/*         this.$axios
          .get("api/surfaceModel/" + this.mineid)
          .then(res => {
            this.surfaceModelMessage = res.data.data;
            var height = 50.0;
            var name = this.surfaceModelMessage.buildingName;
            var position = Cesium.Cartesian3.fromDegrees(
              this.surfaceModelMessage.posY,
              this.surfaceModelMessage.posX,
              height
            );
            var heading = this.surfaceModelMessage.rotationX;
            var pitch = this.surfaceModelMessage.rotationX;
            var roll = this.surfaceModelMessage.rotationZ;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(
              position,
              hpr
            );
            this.viewer.entities.add({
              id: this.mineid,
              name: name,
              position: position,
              orientation: orientation,
              model: {
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                scale: 10,
                uri:
                  "model3D/CesiumBalloon/" + this.surfaceModelMessage.modelName
                // minimumPixelSize: 128,
                // maximumScale: 20000,
              }
            });
            var getByIdEntity = this.viewer.entities.getById(this.mineid); //tableType*100000
            // console.log(getByIdEntity)
            this.viewer.zoomTo(getByIdEntity);
            //  this.viewer.zoomTo(this.viewer.entities);
          })
          .catch(error => {
            console.log(error);
          }); */
      }
    }
  }
};
</script>
