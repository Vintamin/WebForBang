<template>
  <div>
    <Tree
      :data="treeData"
      :render="renderContent"
      @on-check-change="checkItem"
      @on-select-change="clickItem"
      show-checkbox
    ></Tree>
    <Modal
      v-model="showDialog"
      title="风险详情"
      width="600px"
      draggable
      :styles="{ left: '20px' }"
    >
      <!--       <Modelmodify
        v-if="showDialog"
        :xxxData="xxxData"
        :projectID="projectID"
        :iseditable="iseditable"
      ></Modelmodify> -->
      <div slot="footer"></div>
    </Modal>
  </div>
</template>
<script>
import { EventBus } from "@/utils/bus.js";
import Cesium from "cesium/Cesium.js";
import { Point } from "@/utils/object.js";
export default {
  data() {
    return {
      treeData: [
        {
          id: "11",
          title: "起爆顺序",
          expand: false,
          disabled: true,
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
          },
          children: []
        }
      ],
      riskData: [],
      showDialog: false,
      orderTypeNum: 5,
      //起爆顺序不同类型的数据
      orderTypeData: null,
      context: null,
      OrderTypeColor: [
        "#0000FF", //蓝色
        "#00FF00", //绿色
        "#FFD700", //金色
        "#FF0000", //红色
        "#9900CC" //紫色
      ],
      scale: 40,
      //距离上和左的距离
      moveLenFront:150,
      clickItemNums: 0
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
    projectID: {
      type: String,
      default: ""
    },
    iseditable: {
      type: String,
      default: ""
    },
    shotData: [],
    ctx: {
      type: Object,
      default: () => {}
    }
  },
  components: {},
  created() {
    if (this.projectID != "") {
      //kk this.gettree();
    }
  },
  mounted() {
    var that = this;
  },
  watch: {
    projectID(val) {
      this.treeData[0].disabled = false;
      //传递出去起爆顺序中的渲染方法
      //kk this.gettree();
    }
  },
  methods: {
    renderContent(h, { root, node, data }) {
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            width: "100%"
          }
        },
        [
          h(
            "span",
            {
              style: {
                color: "#666",
                cursor: "pointer"
              },
              domProps: {
                className: "btn"
              },
              on: {
                click: () => {
                  this.clickItem(data);
                }
              }
            },
            data.title
          ),
          h(
            "span",
            {
              style: {
                display: "inline-block",
                float: "right",
                marginRight: "35px"
              }
            },
            [
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "ios-create-outline",
                  size: "small"
                }),
                style: {
                  marginRight: "8px"
                },
                on: {
                  click: () => {
                    this.modify(data);
                  }
                }
              })
            ]
          )
        ]
      );
    },
    getBlastTree(){
      this.orderTypeData.forEach((item,index)=>{
        this.treeData[0].children.push({
          title:`起爆顺序${item[0].BangOrder}`,//取每个起爆顺序的第一项即可
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
          },
          id:index
        })
      })
    },
    gettree() {
      this.treeData[0].checked = false; //kk
      this.treeData[0].children = [];

      this.treeData[0].children.push(
        {
          title: "特别重大风险",
          disableCheckbox: true,
          checked: false,
          id: 0,
          expand: false,
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
          },
          children: []
        },
        {
          title: "重大风险",
          id: 1,
          expand: false,
          checked: false,
          disableCheckbox: true,
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
          },
          children: []
        },
        {
          title: "中等风险",
          id: 2,
          expand: false,
          checked: false,
          disableCheckbox: true,
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
          },
          children: []
        },
        {
          title: "一般风险",
          id: 3,
          expand: false,
          checked: false,
          disableCheckbox: true,
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
          },
          children: []
        },
        {
          title: "低风险",
          id: 4,
          expand: false,
          checked: false,
          disableCheckbox: true,
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
          },
          children: []
        }
      );

      this.$axios(
        "api/company&equipment&risk-info/riskAddress-Info/" + this.projectID
      )
        .then(res => {
          var riskInfo = res.data.rows;
          this.$axios("api/risk", {
            params: {
              mineTable: this.projectID + "risk"
            }
          }).then(res => {
            var risk = res.data.data;
            // console.log(risk)

            for (let task of riskInfo) {
              const itemdata = risk.find(item => {
                return item.detailId == task.id;
              });
              if (typeof itemdata != "undefined") {
                // console.log(itemdata);
                this.$axios(
                  "api/company&equipment&risk-info/riskByRiskaddress-Info/" +
                    itemdata.detailId
                ).then(res => {
                  var riskByRiskaddressInfo = res.data.rows;
                  // console.log(riskByRiskaddressInfo);
                  if (riskByRiskaddressInfo) {
                    riskByRiskaddressInfo.sort((a, b) => {
                      return b.riskLevel - a.riskLevel;
                    });
                    itemdata.riskLevel = riskByRiskaddressInfo[0].riskLevel;
                    itemdata.riskAddress = riskByRiskaddressInfo[0].riskAddress;
                    // console.log(itemdata);
                    this.riskData.push(itemdata);
                    this.treeData[0].children[itemdata.riskLevel].children.push(
                      {
                        title: itemdata.riskAddress,
                        id: "900" + itemdata.detailId,
                        disableCheckbox: true,
                        checked: true
                      }
                    );
                    this.viewer.entities.add({
                      id: "900" + itemdata.detailId,
                      position: Cesium.Cartesian3.fromDegrees(
                        itemdata.posY,
                        itemdata.posX,
                        itemdata.posZ + 0.5
                      ),
                      billboard: {
                        image: require("./risk" + itemdata.riskLevel + ".png"),
                        scale: itemdata.scale * 0.08
                      },
                      label: {
                        text: itemdata.riskAddress,
                        eyeOffset: new Cesium.Cartesian3(0, 0.5, 0),
                        fillColor: Cesium.Color.ORANGE,
                        font: "30px sans-serif",
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                          0,
                          150
                        )
                      }
                    });
                  }
                });
              }
            }
          });
        })
        .catch(error => {});
    },
    //计算爆破顺序类型
    orderTypeSort(data) {
      let myOrderArray = [];
      for (let i = 0; i < this.orderTypeNum; i++) {
        myOrderArray[i] = new Array();
      }
      data.forEach(item => {
        myOrderArray[item.BangOrder - 1].push(item); //这里起爆顺序都减去了1
      });
      return myOrderArray;
    },
    //绘制起爆顺序
    render2DBoomOrder() {
      var canvas = document.getElementById("can");
      const context = canvas.getContext("2d");
      const count = this.orderTypeData.length;
      for (let i = 0; i < count; i++) {
        context.beginPath(); //开始绘制线
        context.lineWidth = 1;
        context.strokeStyle = this.OrderTypeColor[i];

        //绘制标记
        context.font = '10px "微软雅黑"';
        context.fillStyle = this.OrderTypeColor[i];
        context.textBaseline = "bottom";

        for (let j = 0; j < this.orderTypeData[i].length; j++) {
          let p = new Point();
          p.x = Number(this.orderTypeData[i][j].PositionX);
          p.y = Number(this.orderTypeData[i][j].PositionY);
          p.z = Number(this.orderTypeData[i][j].PositionZ);
          if (j == 0) {
            context.fillText(
              `${i + 1}`,
              p.x * this.scale + this.moveLenFront,
              -p.y * this.scale + 90
            ); //填充文字
            context.moveTo(p.x * this.scale + this.moveLenFront, -p.y * this.scale + this.moveLenFront); //坐标起点
            continue;
          }
          context.lineTo(p.x * this.scale + this.moveLenFront, -p.y * this.scale + this.moveLenFront); //终点,或者理解为下一个点
          context.fillText(
            `${i + 1}`,
            p.x * this.scale + this.moveLenFront,
            -p.y * this.scale + this.moveLenFront
          ); //填充文字
        }

        context.stroke();
      }

    },
    //selectedArr是当前checked的子项数组列表
    //selectedItem是当前选择的项，可能是子项也可能是父项
    checkItem(selectedArr, selectedItem) {
      //关闭图层，点击父节点或者子节点checked列表为空
      if ( selectedItem.children && !selectedItem.checked || selectedArr.length == 0) {
        this.$store.commit("setShowCheck", {
          key: "blastChecked",
          checked: false
        });
        var canvas = document.getElementById("can");
        const context = canvas.getContext("2d");
        //先清空画布
        context.clearRect(0, 0, canvas.width, canvas.height);
        //检查是否其他图层打开
        if (this.$store.state.showListCheck.shotChecked) {
          setTimeout(() => {
            this.$parent.$refs.shotholeRef.render2Dshothole(); 
          });
               
        }
      }else if(selectedItem.children && selectedItem.checked || selectedArr.length !== 0){
        //打开图层
        if (this.clickItemNums < 1) {
            this.clickItemNums++;
            //初始化数据
            this.orderTypeData = this.orderTypeSort(this.shotData);
            this.getBlastTree()
          }
          //打开视图
          this.$store.commit("setShowCheck", {
            key: "blastChecked",
            checked: true
          });
          //渲染二维
          setTimeout(()=>{
            this.render2DBoomOrder();
          })
            
      }
 
      

    },
    getModel() {
      this.riskData.forEach(it => {
        this.viewer.entities.add({
          id: "900" + it.detailId,
          position: Cesium.Cartesian3.fromDegrees(
            it.posY,
            it.posX,
            it.posZ + 0.5
          ),
          billboard: {
            image: require("./risk" + it.riskLevel + ".png"),
            scale: it.scale * 0.08
          },
          label: {
            text: it.riskAddress,
            eyeOffset: new Cesium.Cartesian3(0, 0.5, 0),
            fillColor: Cesium.Color.ORANGE,
            font: "30px sans-serif",
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              150
            )
          }
        });
      });
    },
    clickItem(clickedItem) {
      var getByIdEntity = this.viewer.entities.getById(clickedItem.id);
      this.viewer.zoomTo(getByIdEntity);
    },
    modify(data) {
      this.showDialog = true;
      this.xxxData = data.id;
    }
  }
};
</script>
