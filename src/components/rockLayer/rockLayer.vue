<style>
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.demo-spin-col {
  height: 100px;
  width: 170px;
  border: 1px solid #e9e8ee;
}
.vertical-center-modal {
  display: flex;
  top: 30%;
  justify-content: center;
}
</style>
<template>
  <div>
    <Tree
      :data="MT"
      @on-check-change="checkFun"
      @on-select-change="clickFun"
      show-checkbox
      :empty-text="暂无数据"
    ></Tree>
    <!-- <Checkbox @on-change="showairflow" style="margin-top:8px">通风巷道纹理</Checkbox> -->
    <!-- <Checkbox @on-change="change" style="margin-right:30px">巷道</Checkbox> -->
    <!-- <Checkbox @on-change="showairflow" v-model="showfeng" >查看风向</Checkbox> -->
    <Modal
      v-model="showif"
      class-name="vertical-center-modal"
      draggable
      footer-hide
      header-hide
      :closable="false"
    >
      <div class="demo-spin-col" span="8" v-if="showif">
        <Spin fix>
          <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
          <div>巷道加载中...</div>
        </Spin>
      </div>
    </Modal>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
// import Cesium from "cesium/Cesium.js";
import { EventBus } from "@/utils/bus.js";
import Texture from "@/assets/pic2/123.jpg";
import Texture1 from "@/assets/pic2/16.jpg";
import Texture2 from "@/assets/pic2/top2.jpg";
import Texture3 from "@/assets/pic2/color4_1.png";
import Texture4 from "@/assets/pic2/color4_2.png";
// import Texture5 from "./111.png";
import sm from "@/assets/pic2/111.png";
import zh from "@/assets/pic2/1.png";
import mh from "@/assets/pic2/mh.jpg";
import coal from "@/assets/pic2/coal.jpg";

import zhujing from "@/assets/img/zhujing.png";
import tongfeng from "@/assets/img/tongfeng.png";
import anjing from "@/assets/img/anjing.png";

/**
 * 两个临时数组存放夯道字段和夯道实体
 * @type {*[]}
 */
// var a = [];
// var b = [];
var modelData = [];

export default {
  data() {
    return {
      tunnelData: [],
      mineTable: "",
      showif: false,
      showtu: false,
      showfeng: false,
      a: [],
      b: [],
      straightWay_1: [],
      straightWay_2: [],
      showairflow: false,
      dest: [],
      topShape: [],
      bottomShape: [],
      minelongitude: "",
      minelatitude: "",
      height: 0,
      heading: 0,
      pitch: 0,
      roll: 0,
      MT: [
        {
          title: "岩层参数",
          expand: false,
          disabled: true,
          children: [],
          render: (h, { root, node, data }) => {
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%"
                }
              },
              [h("span", [h("span", data.title)])]
            );
          }
        }
      ]
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

  created() {
    //获取用户参数
    // this.mineid=this.$parent.$parent.mineid;
    if (this.mineid != "") {
      //kk this.gettree();
    }
  },

  mounted() {},
  watch: {
    mineid(val) {
      this.showtu = false;
      this.showfeng = false;
      this.MT[0].disabled = false;
      //kk this.gettree();
    }
  },
  methods: {
    checkFun(selectedArr, selectedItem) {
      if (selectedItem.checked == false) {
        // console.log(this.dest)
        this.$store.commit("setShowCheck", {
          key: "rockChecked",
          checked: false
        });
        //this.$store.commit("setTwoDimensional", false);
        for (var j = 0; j < this.dest.length; j++) {
          this.viewer.entities.removeById("r" + "_" + this.dest[j].tunnelName);
          this.viewer.entities.removeById(
            "r" + "_" + this.dest[j].tunnelName + "_" + "g"
          );
        }
        return;
      } else {
        this.$store.commit("setShowCheck", {
          key: "rockChecked",
          checked: true
        });
        //kk this.gettunneldata();
      }
    },
    clickFun(clickedItem) {
      var getByIdEntity = this.viewer.entities.getById(clickedItem[0].id);
      this.viewer.zoomTo(getByIdEntity);
    },
    gettree() {
      this.MT[0].children = [];
      this.$axios("api/tunneldata", {
        params: {
          mineTable: this.mineid + "tunneldata"
        }
      })
        .then(res => {
          this.tunnelData = res.data.data;
          // console.log(this.tunnelData);
          var s = new Set();
          this.tunnelData.forEach(a => {
            if (a.tunnelType == "主巷") {
              s.add(a.tunnelName);
            }
          });
          for (let x of s) {
            //  console.log(x);
            this.MT[0].children.push({
              id: "r" + "_" + x,
              title: x,
              disableCheckbox: true,
              checked: true
            });
          }
          this.MT[0].disabled = false;
          this.$store.commit("setShowCheck", {
            key: "rockChecked",
            checked: true
          });
          //this.$store.commit("setTwoDimensional", false);
          //this.gettunneldata();
        })
        .catch(error => {});
    },
    gettunneldata() {
      //获取home父组件的参数值,然后获取巷道数据
      this.dest = [];

      this.showif = true;

      modelData = this.tunnelData;
      var wide = modelData[0].wide; //巷道的宽度
      var height = modelData[0].height; //巷道高度
      var mh = (modelData[0].height - modelData[0].wide / 2) / 2;
      var wHalf = wide / 2;

      function computeCircle(radius1, radius2) {
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
      var map = [];

      modelData.forEach(ai => {
        if (!map[ai.tunnelName]) {
          this.dest.push({
            tunnelName: ai.tunnelName,
            data1: [
              parseFloat(ai.longitude),
              parseFloat(ai.latitude),
              parseFloat(ai.altitude)
            ],
            data2: [
              parseFloat(ai.longitude),
              parseFloat(ai.latitude),
              parseFloat(ai.altitude) + mh * 2
            ],
            data3: ai.airflowType,
            data4: [
              parseFloat(ai.longitude),
              parseFloat(ai.latitude),
              parseFloat(ai.altitude) + mh * 2.5
            ],
            data5: wHalf,
            data6: ai.tunnelName,
            data7: ai.shape,
            data8: ai.supportPattern,
            data9: ai.wide,
            data10: ai.height,
            data11: [ai.tunnelType]
          });
          map[ai.tunnelName] = ai;
        } else {
          for (var j = 0; j < this.dest.length; j++) {
            var dj = this.dest[j];
            if (dj.tunnelName == ai.tunnelName) {
              dj.data1.push(
                parseFloat(ai.longitude),
                parseFloat(ai.latitude),
                parseFloat(ai.altitude)
              );
              dj.data2.push(
                parseFloat(ai.longitude),
                parseFloat(ai.latitude),
                parseFloat(ai.altitude) + mh * 2
              );
              dj.data3 = ai.airflowType;
              dj.data4.push(
                parseFloat(ai.longitude),
                parseFloat(ai.latitude),
                parseFloat(ai.altitude) + mh * 2 + 1
              ),
                (dj.data5 = wHalf),
                (dj.data6 = ai.tunnelName),
                (dj.data7 = ai.shape),
                (dj.data8 = ai.supportPattern),
                (dj.data9 = ai.wide),
                dj.data11.push(ai.tunnelType);
              break;
            }
          }
        }
      });

      //console.log(this.dest.length);
      setTimeout(() => {
        this.showif = false;
      }, 8000);
      for (var m = 0; m < this.dest.length; m++) {
        var points = this.dest[m].data2.length / 3; //先求出有多少个点，然后依次两两相减
        var redTube = this.viewer.entities.add({
          name:
            this.dest[m].data6 +
            "_" +
            this.dest[m].data7 +
            "_" +
            this.dest[m].data8 +
            "_" +
            this.dest[m].data9 +
            "_" +
            this.dest[m].data10,
          // id: "r" + "_" + m,
          id: "r" + "_" + this.dest[m].tunnelName,
          polylineVolume: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(
              this.dest[m].data2
            ),
            shape: computeCircle(wHalf - 1 / 100, wHalf)
            // material: new Cesium.ImageMaterialProperty({
            //   image: Texture5,
            //   //color: Cesium.Color.BLUE,
            //   repeat: new Cesium.Cartesian2(200, 1)
            // })
          }
        });
        //获取巷道中段，并且显示巷道名称
        var pointNum = this.dest[m].data2.length / 3;
        var getMidPoint = Math.ceil(pointNum / 2);
        // var label = this.viewer.entities.add({
        //   position: Cesium.Cartesian3.fromDegrees(
        //     this.dest[m].data2[(getMidPoint - 1) * 3],
        //     this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
        //     this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
        //   ),
        //   label: {
        //     text: this.dest[m].data6,
        //     eyeOffset: new Cesium.Cartesian3(0, 3, 0),
        //     fillColor: Cesium.Color.AQUA,
        //     font: "3px sans-serif",
        //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        //       0,
        //       500
        //     )
        //   }
        // });
        if (
          this.dest[m].data6.indexOf("巷") == -1 &&
          (this.dest[m].data6.indexOf("副井") != -1 ||
            this.dest[m].data6.indexOf("风井") != -1 ||
            this.dest[m].data6.indexOf("主井") != -1 ||
            this.dest[m].data6.indexOf("主斜井") != -1 ||
            this.dest[m].data6.indexOf("暗井") != -1 ||
            this.dest[m].data6.indexOf("暗副井") != -1)
        ) {
          var label = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              this.dest[m].data2[(getMidPoint - 1) * 3],
              this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
              this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
            ),
            label: {
              text: this.dest[m].data6,
              eyeOffset: new Cesium.Cartesian3(0, 3, 0),
              fillColor: Cesium.Color.RED,
              font: "3px sans-serif",
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                50000
              ),
              horizontalOrigin: Cesium.HorizontalOrigin.RIGHT
            },
            billboard: {
              sizeInMeters: true,
              width: 10, // default: undefined
              height: 10, // default: undefined
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT
            }
          });

          if (
            this.dest[m].data6.indexOf("主井") != -1 ||
            this.dest[m].data6.indexOf("主斜井") != -1 ||
            this.dest[m].data6.indexOf("副井") != -1
          ) {
            label.billboard.image = zhujing;
          } else if (this.dest[m].data6.indexOf("风井")) {
            label.billboard.image = tongfeng;
          } else if (
            this.dest[m].data6.indexOf("暗井") ||
            this.dest[m].data6.indexOf("暗副井")
          ) {
            label.billboard.image = anjing;
          }
        } else {
          var label = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              this.dest[m].data2[(getMidPoint - 1) * 3],
              this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
              this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
            ),
            label: {
              text: this.dest[m].data6,
              eyeOffset: new Cesium.Cartesian3(0, 3, 0),
              fillColor: Cesium.Color.AQUA,
              font: "3px sans-serif",
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                700
              )
            }
          });
        }
        // if (
        //   this.dest[m].data6.indexOf("巷") == -1 &&
        //   (this.dest[m].data6.indexOf("副井") != -1 ||
        //     this.dest[m].data6.indexOf("风井") != -1 ||
        //     this.dest[m].data6.indexOf("主井") != -1)
        // ) {
        //   var label = this.viewer.entities.add({
        //     position: Cesium.Cartesian3.fromDegrees(
        //       this.dest[m].data2[(getMidPoint - 1) * 3],
        //       this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
        //       this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
        //     ),
        //     label: {
        //       text: this.dest[m].data6,
        //       eyeOffset: new Cesium.Cartesian3(0, 3, 0),
        //       fillColor: Cesium.Color.RED,
        //       font: "3px sans-serif",
        //       distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        //         0,
        //         50000
        //       ),
        //     },
        //   });
        // } else {
        //   var label = this.viewer.entities.add({
        //     position: Cesium.Cartesian3.fromDegrees(
        //       this.dest[m].data2[(getMidPoint - 1) * 3],
        //       this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
        //       this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
        //     ),
        //     label: {
        //       text: this.dest[m].data6,
        //       eyeOffset: new Cesium.Cartesian3(0, 3, 0),
        //       fillColor: Cesium.Color.AQUA,
        //       font: "3px sans-serif",
        //       distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        //         0,
        //         500
        //       ),
        //     },
        //   });
        // }

        var greenBox = this.viewer.entities.add({
          name:
            this.dest[m].data6 +
            "_" +
            this.dest[m].data7 +
            "_" +
            this.dest[m].data8 +
            "_" +
            this.dest[m].data9 +
            "_" +
            this.dest[m].data10,
          // id: "r" + "_" + m + "_" + "g",
          id: "r" + "_" + this.dest[m].tunnelName + "_" + "g",
          polylineVolume: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(
              this.dest[m].data1
            ),
            shape: [
              new Cesium.Cartesian2(-wHalf, -mh),
              new Cesium.Cartesian2(wHalf, -mh),
              new Cesium.Cartesian2(wHalf, mh),
              new Cesium.Cartesian2(wHalf - 1 / 100, mh),
              new Cesium.Cartesian2(wHalf - 1 / 100, -mh + 1 / 100),
              new Cesium.Cartesian2(-wHalf + 1 / 100, -mh + 1 / 100),
              new Cesium.Cartesian2(-wHalf + 1 / 100, mh),
              new Cesium.Cartesian2(-wHalf, mh)
            ],
            cornerType: Cesium.CornerType.ROUNDED
            // material: new Cesium.ImageMaterialProperty({
            //   image: Texture1,
            //   //color: Cesium.Color.BLUE,
            //   repeat: new Cesium.Cartesian2(200, 1)
            // })
          }
        });
        this.topShape.push(redTube);
        this.bottomShape.push(greenBox);

        if (this.dest[m].data11[0] == "主巷") {
          redTube.polylineVolume.material = new Cesium.ImageMaterialProperty({
            image: zh,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(100, 1)
          });

          greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty({
            image: zh,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(100, 1)
          });
        } else if (this.dest[m].data11[0] == "煤巷") {
          redTube.polylineVolume.material = new Cesium.ImageMaterialProperty({
            image: coal,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(100, 1)
          });

          greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty({
            image: coal,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(100, 1)
          });
        } else if (this.dest[m].data11[0] == "石门") {
          redTube.polylineVolume.material = new Cesium.ImageMaterialProperty({
            image: sm,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(100, 1)
          });

          greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty({
            image: Texture1,
            //color: Cesium.Color.BLUE,
            repeat: new Cesium.Cartesian2(100, 1)
          });
        } //else{}
      }
      // for (var m = 50; m < 100; m++) {
      //   var redTube = this.viewer.entities.add({
      //     name:
      //       this.dest[m].data6 +
      //       "_" +
      //       this.dest[m].data7 +
      //       "_" +
      //       this.dest[m].data8 +
      //       "_" +
      //       this.dest[m].data9 +
      //       "_" +
      //       this.dest[m].data10,
      //     // id: "r" + "_" + m,
      //     id: "r" + "_" + this.dest[m].tunnelName,
      //     polylineVolume: {
      //       positions: Cesium.Cartesian3.fromDegreesArrayHeights(
      //         this.dest[m].data2
      //       ),
      //       shape: computeCircle(wHalf - 1 / 100, wHalf)
      //       // material: new Cesium.ImageMaterialProperty({
      //       //   image: Texture5,
      //       //   //color: Cesium.Color.BLUE,
      //       //   repeat: new Cesium.Cartesian2(200, 1)
      //       // })
      //     }
      //   });
      //   var pointNum = this.dest[m].data2.length / 3;
      //   var getMidPoint = Math.ceil(pointNum / 2);
      //   var label = this.viewer.entities.add({
      //     position: Cesium.Cartesian3.fromDegrees(
      //       this.dest[m].data2[(getMidPoint - 1) * 3],
      //       this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
      //       this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
      //     ),
      //     label: {
      //       text: this.dest[m].data6,
      //       eyeOffset: new Cesium.Cartesian3(0, 3, 0),
      //       fillColor: Cesium.Color.AQUA,
      //       font: "3px sans-serif",
      //       distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
      //         0,
      //         500
      //       )
      //     }
      //   });
      //   var greenBox = this.viewer.entities.add({
      //     name:
      //       this.dest[m].data6 +
      //       "_" +
      //       this.dest[m].data7 +
      //       "_" +
      //       this.dest[m].data8 +
      //       "_" +
      //       this.dest[m].data9 +
      //       "_" +
      //       this.dest[m].data10,
      //     // id: "r" + "_" + m + "_" + "g",
      //     id: "r" + "_" + this.dest[m].tunnelName + "_" + "g",

      //     polylineVolume: {
      //       positions: Cesium.Cartesian3.fromDegreesArrayHeights(
      //         this.dest[m].data1
      //       ),
      //       shape: [
      //         new Cesium.Cartesian2(-wHalf, -mh),
      //         new Cesium.Cartesian2(wHalf, -mh),
      //         new Cesium.Cartesian2(wHalf, mh),
      //         new Cesium.Cartesian2(wHalf - 1 / 100, mh),
      //         new Cesium.Cartesian2(wHalf - 1 / 100, -mh + 1 / 100),
      //         new Cesium.Cartesian2(-wHalf + 1 / 100, -mh + 1 / 100),
      //         new Cesium.Cartesian2(-wHalf + 1 / 100, mh),
      //         new Cesium.Cartesian2(-wHalf, mh)
      //       ],
      //       cornerType: Cesium.CornerType.ROUNDED
      //       // material: new Cesium.ImageMaterialProperty({
      //       //   image: Texture1,
      //       //   //color: Cesium.Color.BLUE,
      //       //   repeat: new Cesium.Cartesian2(200, 1)
      //       // })
      //     }
      //   });
      //   this.topShape.push(redTube);
      //   this.bottomShape.push(greenBox);

      //   if (this.dest[m].data11[0] == "主巷") {
      //     redTube.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: zh,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );

      //     greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: zh,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );
      //   } else if (this.dest[m].data11[0] == "煤巷") {
      //     redTube.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: coal,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );

      //     greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: coal,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );
      //   } else if (this.dest[m].data11[0] == "石门") {
      //     redTube.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: sm,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );

      //     greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: Texture1,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );
      //   }
      // }
      // // //this.viewer.zoomTo(this.viewer.entities);
      // //       setTimeout(() => {
      // //         this.showif = false;
      // //       }, 8000);
      // for (var m = 100; m < this.dest.length; m++) {
      //   var redTube = this.viewer.entities.add({
      //     name:
      //       this.dest[m].data6 +
      //       "_" +
      //       this.dest[m].data7 +
      //       "_" +
      //       this.dest[m].data8 +
      //       "_" +
      //       this.dest[m].data9 +
      //       "_" +
      //       this.dest[m].data10,
      //     // id: "r" + "_" + m,
      //     id: "r" + "_" + this.dest[m].tunnelName,
      //     polylineVolume: {
      //       positions: Cesium.Cartesian3.fromDegreesArrayHeights(
      //         this.dest[m].data2
      //       ),
      //       shape: computeCircle(wHalf - 1 / 100, wHalf)
      //       // material: new Cesium.ImageMaterialProperty({
      //       //   image: Texture5,
      //       //   //color: Cesium.Color.BLUE,
      //       //   repeat: new Cesium.Cartesian2(200, 1)
      //       // })
      //     }
      //   });
      //   var pointNum = this.dest[m].data2.length / 3;
      //   var getMidPoint = Math.ceil(pointNum / 2);
      //   var label = this.viewer.entities.add({
      //     position: Cesium.Cartesian3.fromDegrees(
      //       this.dest[m].data2[(getMidPoint - 1) * 3],
      //       this.dest[m].data2[(getMidPoint - 1) * 3 + 1],
      //       this.dest[m].data2[(getMidPoint - 1) * 3 + 2]
      //     ),
      //     label: {
      //       text: this.dest[m].data6,
      //       eyeOffset: new Cesium.Cartesian3(0, 3, 0),
      //       fillColor: Cesium.Color.AQUA,
      //       font: "3px sans-serif",
      //       distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
      //         0,
      //         500
      //       )
      //     }
      //   });
      //   var greenBox = this.viewer.entities.add({
      //     name:
      //       this.dest[m].data6 +
      //       "_" +
      //       this.dest[m].data7 +
      //       "_" +
      //       this.dest[m].data8 +
      //       "_" +
      //       this.dest[m].data9 +
      //       "_" +
      //       this.dest[m].data10,
      //     // id: "r" + "_" + m + "_" + "g",
      //     id: "r" + "_" + this.dest[m].tunnelName + "_" + "g",
      //     polylineVolume: {
      //       positions: Cesium.Cartesian3.fromDegreesArrayHeights(
      //         this.dest[m].data1
      //       ),
      //       shape: [
      //         new Cesium.Cartesian2(-wHalf, -mh),
      //         new Cesium.Cartesian2(wHalf, -mh),
      //         new Cesium.Cartesian2(wHalf, mh),
      //         new Cesium.Cartesian2(wHalf - 1 / 100, mh),
      //         new Cesium.Cartesian2(wHalf - 1 / 100, -mh + 1 / 100),
      //         new Cesium.Cartesian2(-wHalf + 1 / 100, -mh + 1 / 100),
      //         new Cesium.Cartesian2(-wHalf + 1 / 100, mh),
      //         new Cesium.Cartesian2(-wHalf, mh)
      //       ],
      //       cornerType: Cesium.CornerType.ROUNDED
      //       // material: new Cesium.ImageMaterialProperty({
      //       //   image: Texture1,
      //       //   //color: Cesium.Color.BLUE,
      //       //   repeat: new Cesium.Cartesian2(10, 1)
      //       // })
      //       // outline : true,
      //       // outlineColor : Cesium.Color.BLUE
      //     }
      //   });
      //   this.topShape.push(redTube);
      //   this.bottomShape.push(greenBox);
      //   //巷道贴图
      //   if (this.dest[m].data11[0] == "主巷") {
      //     redTube.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: zh,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );

      //     greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: zh,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );
      //   } else if (this.dest[m].data11[0] == "煤巷") {
      //     redTube.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: coal,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );

      //     greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: coal,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );
      //   } else if (this.dest[m].data11[0] == "石门") {
      //     redTube.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: sm,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );

      //     greenBox.polylineVolume.material = new Cesium.ImageMaterialProperty(
      //       {
      //         image: Texture1,
      //         //color: Cesium.Color.BLUE,
      //         repeat: new Cesium.Cartesian2(100, 1)
      //       }
      //     );
      //   }
      // }

      // setTimeout(() => {
      //   this.showif = false;
      // }, 8000);
      EventBus.$emit("change", this.dest);
      EventBus.$emit("setTopShape", this.topShape);
      EventBus.$emit("setBottomShape", this.bottomShape);

      this.topShape = [];
      this.bottomShape = [];

      if (this.mineid != null) {
        this.$axios.get("api/mineName").then(res => {
          this.test = res.data.data;
          // console.log(this.test);
          for (var i = 0; i < this.test.length; i++) {
            if (this.mineid == this.test[i].mineId) {
              this.minelongitude = this.test[i].mineLongitude;
              this.minelatitude = this.test[i].mineLatitude;
              this.height = this.test[i].height;
              this.heading = this.test[i].heading;
              this.pitch = this.test[i].pitch;
              this.roll = this.test[i].roll;
            }
          }

          //视角设为该煤矿
          window.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              this.minelongitude,
              this.minelatitude,
              this.height
            ),
            orientation: {
              heading: this.heading,
              pitch: this.pitch,
              roll: this.roll
            }
          });
        });
      } else {
        alert("get mineid filed!");
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
    vertexPosition(positions) {
      var points = positions.length / 3; //先求出有多少个点，然后依次两两相减
      for (var i = 0; i < points - 1; i++) {
        this.straightWay_2.push(positions[3 * i]);
        this.straightWay_2.push(positions[3 * i + 1]);
        this.straightWay_2.push(positions[3 * i + 2]);

        this.straightWay_2.push(positions[3 * i + 3]);
        this.straightWay_2.push(positions[3 * i + 4]);
        this.straightWay_2.push(positions[3 * i + 5]);
      }
      return this.straightWay_2;
    }
  }
};
</script>
