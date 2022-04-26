<template>
  <div>
    <Table
      height="450"
      :loading="loading"
      :data="tableData"
      :columns="columns1"
      border
    >
      <template slot-scope="{ row, index }" slot="posX">
        <InputNumber
          v-model="formNumber.posX"
          size="large"
          :step="0.000001"
          v-if="editIndex === index"
        ></InputNumber>
        <span v-else>{{ row.posX }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="posY">
        <InputNumber
          v-model="formNumber.posY"
          size="large"
          :step="0.000001"
          v-if="editIndex === index"
        ></InputNumber>
        <span v-else>{{ row.posY }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="posZ">
        <InputNumber
          v-model="formNumber.posZ"
          size="large"
          :step="0.1"
          v-if="editIndex === index"
        ></InputNumber>
        <span v-else>{{ row.posZ }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="scale">
        <InputNumber
          v-model="formNumber.scale"
          :step="0.1"
          size="large"
          v-if="editIndex === index"
        ></InputNumber>
        <span v-else>{{ row.scale }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="riskMark">
        <Input
          v-model="formNumber.riskMark"
          :step="0.1"
          size="large"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.riskMark }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="riskCheck">
        <Input
          v-model="formNumber.riskCheck"
          size="large"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.riskCheck }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="operating">
        <Button
          type="primary"
          style="margin-right: 5px"
          @click="markPosition(row, index)"
          >位置标定</Button
        >
        <Button
          type="primary"
          style="margin-right: 5px"
          @click="addPosition(row, index)"
          >提交</Button
        >
      </template>
    </Table>
    <div style="margin: 10px; overflow: hidden">
      <div style="float: right">
        <Page
          :total="dataCount"
          :page-size="pageSize"
          show-total
          @on-change="changePage"
          show-elevator
        ></Page>
      </div>
    </div>
  </div>
</template>
<script>
import { EventBus } from "@/utils/bus.js";
export default {
  data() {
    return {
      tableData: [],
      riskData:[],
      columns1: [
        {
          title: "风险地点",
          key: "riskAddress",
          align: "center",
          width: 200
        },
        {
          title: "x",
          slot: "posX",
          align: "center",
          width: 100
        },
        {
          title: "y",
          slot: "posY",
          align: "center",
          width: 100
        },
        {
          title: "z",
          slot: "posZ",
          align: "center",
          width: 100
        },
        {
          title: "缩放",
          slot: "scale",
          align: "center",
          width: 100
        },
        {
          title: "风险标识人",
          slot: "riskMark",
          align: "center",
          width: 100

        },
        {
          title: "风险审核人",
          slot: "riskCheck",
          align: "center",
          width: 100
        },
        {
          title: "操作",
          slot: "operating",
          align: "center",
          fixed: "right",
          width: 200
        }
      ],
      loading: true,
      formNumber: {
        detailId: "",
        posX: 0,
        posY: 0,
        posZ: 0,
        scale: 1,
        riskMark:'',
        riskCheck:''
      },

      editIndex: -1,
      pageSize: 10,
      dataCount: 0,
    };
  },
  props: {
    // API URL
    viewer: {
      type: Object,
      default: () => {}
    },
    url: {
      type: String,
      default: ""
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
    //煤矿id
    mineid: {
      type: String,
      default: ""
    }
  },
  created() {
    this.$axios("api/company&equipment&risk-info/riskAddress-Info/" + this.mineid)
      .then(res => {
        var riskInfo = res.data.rows;
        // console.log(riskInfo);
        this.$axios("api/risk", {
          params: {
            mineTable: this.mineid + "risk"
          }
        }).then(res => {
          var risk = res.data.data;
          this.riskData = riskInfo.filter(
            item => !risk.some(ele => ele.detailId == item.id)
          );
          // console.log(this.riskData)
          this.dataCount=this.riskData.length
          if (this.dataCount < this.pageSize) {
            this.tableData = this.riskData;
          } else {
            this.tableData = this.riskData.slice(0, this.pageSize);
          }
          this.loading = false;
        });
      })
      .catch(error => {});
  },
  watch: {
    formNumber: {
      handler: function(val) {
        if (val.detailId != "") {
          this.viewer.entities.getById(
            '900' + val.detailId
          ).position = Cesium.Cartesian3.fromDegrees(
            val.posY,
            val.posX,
            val.posZ +0.5
          );
          //更新姿态
          this.viewer.entities.getById('900' + val.detailId).billboard.scale =
            val.scale *0.08;
        }
      },
      deep: true
    }
  },
  methods: {
    markPosition(row, index) {
      this.formNumber.detailId = "";
      this.formNumber.posX = 0;
      this.formNumber.posY = 0;
      this.formNumber.posZ = 0;
      this.formNumber.scale = 1;
      this.formNumber.riskMark = '';
      this.formNumber.riskCheck='';
      var getByIdEntity = this.viewer.entities.getById('900' + row.id);
      if (getByIdEntity) {
        this.viewer.entities.remove(getByIdEntity);
      }

      this.editIndex = index;
      this.formNumber.detailId = row.id;
      const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      handler.setInputAction(e => {
        const pixel = e.position;
        var pickedObject = this.viewer.scene.pick(pixel);
        if (
          this.viewer.scene.pickPositionSupported &&
          Cesium.defined(pickedObject)
        ) {
          //判断是否拾取到模型
          var cartesian = this.viewer.scene.pickPosition(pixel); //若拾取到模型，则保存拾取点笛卡尔坐标
        }

        if (cartesian) {
          var ellipsoid = this.viewer.scene.globe.ellipsoid;
          var cartographic = ellipsoid.cartesianToCartographic(cartesian);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var alt = cartographic.height;
          this.formNumber.posX = lat;
          this.formNumber.posY = lng;
          this.formNumber.posZ = alt;
          // let img = "./risk"+row.riskLevel+".png"
          // console.log(img)
          this.viewer.entities.add({
            id: '900' + this.formNumber.detailId,
            position: Cesium.Cartesian3.fromDegrees(
              this.formNumber.posY,
              this.formNumber.posX,
              this.formNumber.posZ + 0.5
            ),
            billboard: {
              image: require("@/assets/pic2/risk0.png"),
              scale: this.formNumber.scale*0.08,
              // scaleByDistance : new Cesium.NearFarScalar(1.5e2, 0.5, 8.0e6, 0.0)
              // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              //   0,
              //   50
              // )
            },
            label: {
              text: row.riskAddress,
              eyeOffset: new Cesium.Cartesian3(0, 1.5, 0),
              fillColor: Cesium.Color.ORANGE,
              font: "30px sans-serif",
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                50
              )
            }
          });

          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    addPosition(row, index) {
      this.editIndex = -1;
     if(this.formNumber.detailId ==''){
       this.$Message.error("未标定风险点，更新失败");
     }else{
      this.$axios({
        url: "api/addRisk",
        method: "post",
        data: {
          ...this.formNumber
        },
        params: {
          mineTable: this.mineid + "risk"
        }
      }).then(res => {
        // console.log(res)
        if (res.data.code == 200) {
           this.riskData.splice(index, 1);
            var getByIdEntity = this.viewer.entities.getById('900' + this.formNumber.detailId);
        this.viewer.entities.remove(getByIdEntity);
          this.$Message.success("更新成功");
          this.dataCount=this.riskData.length
          if (this.dataCount < this.pageSize) {
            this.tableData = this.riskData;
          } else {
            this.tableData = this.riskData.slice(0, this.pageSize);
          }
          EventBus.$emit("addtree", this.formNumber);
        } else {
          this.$Message.error("更新失败");
        }
      });
     }
    },
    changePage(index) {
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.tableData = this.riskData.slice(_start, _end);
    },
  }
};
</script>