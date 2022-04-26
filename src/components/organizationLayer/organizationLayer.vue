<template>
  <div>
    <Checkbox
      @on-change="change"
      style="margin-top:8px"
      v-model="showwork"
      :disabled="isDisabled"
      >&#8197;施工组织</Checkbox
    >
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
export default {
  data() {
    return {
      workingsurfaceData: [],
      mineid: "",
      mineTable: "",
      showwork: false,
      labelEntity: [],
      dest1: [],
      workingid: [],
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
    mineid: {
      type: String,
      default: ""
    }
  },
  mounted() {},
  watch: {
    mineid(val) {
      this.showwork = false;
      this.isDisabled = false;
    }
  },
  methods: {
    change(checked) {
      if (checked == false) {
        //this.viewer.entities.removeAll();
        //  this.viewer.entities.show = false;
        this.$store.commit("setShowCheck", {
          key: "organizationChecked",
          checked: false
        });
        for (var i = 0; i < this.dest1.length; i++) {
          // this.labelEntity[i] = this.viewer.entities.getById(-i - 1);
          this.labelEntity[i] = this.viewer.entities.getById(this.workingid[i]);
          this.viewer.entities.remove(this.labelEntity[i]);
        }
        this.workingid = [];
        this.dest1 = [];
      } else {
        this.$store.commit("setShowCheck", {
          key: "organizationChecked",
          checked: true
        });
/*         this.$axios("api/workingsurface", {
          params: {
            mineTable: this.mineid + "workingsurfacedata"
          }
        }).then(res => {
          this.workingsurfaceData = res.data.data;
          console.log(this.workingsurfaceData);

          var map1 = [];
          for (var i = 0; i < this.workingsurfaceData.length; i++) {
            var ai = this.workingsurfaceData[i];
            if (!map1[ai.workingSurfaceName]) {
              this.dest1.push({
                workingSurfaceName: ai.workingSurfaceName,
                data: [
                  parseFloat(ai.workingSurfaceY),
                  parseFloat(ai.workingSurfaceX),
                  parseFloat(ai.workingSurfaceH)
                ]
              });
              map1[ai.workingSurfaceName] = ai;
            } else {
              for (var j = 0; j < this.dest1.length; j++) {
                var dj = this.dest1[j];
                if (dj.workingSurfaceName == ai.workingSurfaceName) {
                  dj.data.push(
                    parseFloat(ai.workingSurfaceY),
                    parseFloat(ai.workingSurfaceX),
                    parseFloat(ai.workingSurfaceH)
                  );
                  break;
                }
              }
            }
          }
          console.log(this.dest1);
          for (var i = 0; i < this.dest1.length; i++) {
            var working = this.viewer.entities.add({
              //name:-i-1000,
              id: -i - 1,
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                  this.dest1[i].data
                ),
                perPositionHeight: true,
                material: Cesium.Color.LIME
                // outline : true,
                // outlineColor : Cesium.Color.BLACK
              }
            });
            // this.workingid = [];
            this.workingid.push(working.id);
            //  console.log(working.id);
          }

          // this.viewer.zoomTo(this.viewer.entities);
        }); */
        // .catch(error => {});
      }
    }
  }
};
</script>
