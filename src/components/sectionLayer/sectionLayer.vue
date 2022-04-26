<template>
  <div>
    <!-- <Checkbox v-model="showcoal" @on-change="change">&#8197;&#8194;煤&#8195;层&#8194;</Checkbox> -->
    <Checkbox v-model="showcoal" @on-change="change" :disabled="isDisabled"
      >&#8197;断面参数</Checkbox
    >
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
import a from "@/assets/pic2/timg.jpg";
export default {
  data() {
    return {
      coalseamdata: [],
      coalseamid: [],
      mineTable: "",
      showcoal: false,
      t2: [],
      labelEntity1: [],
      isDisabled: true
    };
  },
  props: {
    mineid: {
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
  mounted() {},

  watch: {
    mineid(newVal, oldVal) {
      //this.showcoal = false;
      this.isDisabled = false;
    }
  },
  methods: {
    change(checked) {
      if (this.mineid) {
        if (checked == false) {
          this.$store.commit("setShowCheck", {
            key: "sectionChecked",
            checked: false
          });
          for (var i = 0; i < this.t2.length; i++) {
            // this.labelEntity[i] = this.viewer.entities.getById(-i - 1);
            this.labelEntity1[i] = this.viewer.entities.getById(
              this.coalseamid[i]
            );
            this.viewer.entities.remove(this.labelEntity1[i]);
          }
          this.coalseamid = [];
          this.t2 = [];
        } else {
          this.$store.commit("setShowCheck", {
            key: "sectionChecked",
            checked: true
          });
          console.log(this.mineid);
/*           this.$axios("api/coalseam", {
            params: {
              mineTable: this.mineid + "coalseam"
            }
          }).then(res => {
            this.coalseamdata = res.data.data;
            //console.log(this.coalseamdata);

            // this.viewer.entities.show = true;

            var map = [];
            var dest = [];
            for (var i = 0; i < this.coalseamdata.length; i++) {
              var ai = this.coalseamdata[i];
              if (!map[ai.coalSeamName]) {
                dest.push({
                  coalSeamName: ai.coalSeamName,
                  data1: [
                    parseFloat(ai.coalSeamY),
                    parseFloat(ai.coalSeamX),
                    parseFloat(ai.coalSeamH)
                  ],
                  data2: [parseFloat(ai.coalSeamY), parseFloat(ai.coalSeamX)]
                });
                map[ai.coalSeamName] = ai;
              } else {
                for (var j = 0; j < dest.length; j++) {
                  var dj = dest[j];
                  if (dj.coalSeamName == ai.coalSeamName) {
                    dj.data1.push(
                      parseFloat(ai.coalSeamY),
                      parseFloat(ai.coalSeamX),
                      parseFloat(ai.coalSeamH)
                    );
                    dj.data2.push(
                      parseFloat(ai.coalSeamY),
                      parseFloat(ai.coalSeamX)
                    );

                    break;
                  }
                }
              }
            }
            var Xnum = parseFloat(this.coalseamdata[0].coalSeamXnum);
            var Ynum = parseFloat(this.coalseamdata[0].coalSeamYnum);
            console.log(dest);
            console.log(this.coalseamdata[0].coalSeamXnum);

            function Point(x, y, z) {
              this.x = x;
              this.y = y;
              this.z = z;
              this.point = [this.x, this.y, this.z];
              this.getPoint = function() {
                return this.point;
              };
            }

            function Rectange(point1, point2, point3, point4) {
              this.ll = point1;
              this.lr = point2;
              this.tr = point3;
              this.tl = point4;
              this.rectange = [this.ll, this.lr, this.tr, this.tl];
              this.getRectange = function() {
                return this.rectange;
              };
            }

            var arrayPoint = [];
            for (var i = 0; i < dest[0].data1.length; i += 3) {
              var p1 = new Point(
                dest[0].data1[i],
                dest[0].data1[i + 1],
                dest[0].data1[i + 2]
              );
              //console.log(p1.getPoint());
              arrayPoint.push(p1.getPoint());
            }
            console.log(arrayPoint);
            var arrayRectange = [];
            for (var i = 0; i < Ynum - 1; i++) {
              for (var j = 0; j < Xnum - 1; j++) {
                var index = Xnum * i + j;
                var r1 = new Rectange(
                  arrayPoint[index],
                  arrayPoint[index + 1],
                  arrayPoint[index + Xnum + 1],
                  arrayPoint[index + Xnum]
                );
                arrayRectange.push(r1.getRectange());
              }
            }
            console.log("矩形:", arrayRectange.length);
            console.log("矩形数据:", arrayRectange);
            var t1 = [];

            for (var i = 0; i < arrayRectange.length; i++) {
              for (var j = 0; j < arrayRectange[i].length; j++) {
                for (var k = 0; k < arrayRectange[i][j].length; k++) {
                  t1.push(arrayRectange[i][j][k]);
                }
              }
              this.t2.push(t1);
              t1 = [];
            }
            console.log(this.t2);
            for (var i = 0; i < this.t2.length; i++) {
              var coalseamModel = this.viewer.entities.add({
                id: 50000000 + i,
                name: this.t2[i].coalSeamName,
                polygon: {
                  hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                    this.t2[i]
                  ),
                  perPositionHeight: true,
                  material: a //,
                  //outline: true,
                  // outlineColor: Cesium.Color.BLACK,
                }
              });
              // console.log(10000000 + i);
              this.coalseamid.push(coalseamModel.id);
            }
            // this.viewer.zoomTo(this.viewer.entities);
          }); */
        }
      }
    }
  }
};
</script>
