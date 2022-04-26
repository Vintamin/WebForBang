<template>
  <div>
    <Table
      width="700"
      height="200"
      border
      :columns="columns2"
      :data="tableData"
      @on-row-dblclick="dbcli"
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
      <template slot-scope="{ row, index }" slot="operating">
        <Button
          ref="markPos"
          type="primary"
          style="margin-right: 5px"
          @click="markPosition(row, index)"
          >位置标定</Button
        >
        <Button
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
export default {
  data() {
    return {
      columns2: [
        {
          title: "ID",
          key: "id",
          width: 100,
          fixed: "left",
        },
        {
          title: "名称",
          key: "name",
          width: 100,
        },
        {
          title: "X",
          slot: "posX",
          width: 100,
        },
        {
          title: "Y",
          slot: "posY",
          width: 100,
        },
        {
          title: "Z",
          slot: "posZ",
          width: 100,
        },
        {
          title: "缩放",
          slot: "scale",
          align: "center",
          width: 100,
        },
        {
          title: "位置",
          key: "position",
          width: 100,
        },
        {
          title: "操作",
          slot: "operating",
          width: 200,
          fixed: "right",
          align: "center",
        },
      ],

      formNumber: {
        id: "",
        name: "",
        posX: 0,
        posY: 0,
        posZ: 0,
        scale: 1,
      },
      editIndex: -1,
      pageSize: 10,
      dataCount: 0,
      vediodata: [],
      tableData:[]
    };
  },
  props: {
    // API URL
    viewer: {
      type: Object,
      default: () => {},
    },
    url: {
      type: String,
      default: "",
    },

    // URL路径中的参数，如：/posts/#{id}/comments
    pathParams: {
      type: Object,
      default: () => {},
    },
    // Query参数
    options: {
      type: Object,
      default: function () {
        return { params: {} };
      },
    },
    //煤矿id
    mineid: {
      type: String,
      default: "",
    },
  },
  created() {
    this.vediodata = [
      {
        id: 20001,
        name: "摄像头",
        position: "山上",
      },
      {
        id: 20002,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20003,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20004,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20005,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20006,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20007,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20008,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20009,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20010,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20011,
        name: "摄像头",
        position: "山脚",
      },
      {
        id: 20012,
        name: "摄像头",
        position: "山脚",
      },
    ];
    this.dataCount = this.vediodata.length; //管理页码数
    if (this.dataCount < this.pageSize) {
      this.tableData = this.vediodata;
    } else {
      this.tableData = this.vediodata.slice(0, this.pageSize);
    }
  },
  methods: {
    dbcli(row) {
      // console.log(11)
      var getByIdEntity = this.viewer.entities.getById(row.id);
      this.viewer.zoomTo(
        getByIdEntity,
        new Cesium.HeadingPitchRange(0, -0.8, 20)
      );
    },
    markPosition(row, index) {
      //   console.log(11);
      this.formNumber.id = "";
      this.formNumber.name = "";
      this.formNumber.posX = 0;
      this.formNumber.posY = 0;
      this.formNumber.posZ = 0;
      this.formNumber.scale = 1;
      console.log(this.viewer);
      var getByIdEntity = this.viewer.entities.getById(row.id); //
      if (getByIdEntity) {
        this.viewer.entities.remove(getByIdEntity);
      }

      this.editIndex = index;
      this.formNumber.id = row.id;
      this.formNumber.name = row.name;
      //   console.log(11)
      const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      handler.setInputAction((e) => {
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
            id: this.formNumber.id,
            position: Cesium.Cartesian3.fromDegrees(
              this.formNumber.posY,
              this.formNumber.posX,
              this.formNumber.posZ + 0.5
            ),
            model: {
              uri: `model3D/CesiumBalloon/zhidongqi.gltf`,
              scale: this.formNumber.scale * 1.5,
            },
            label: {
              text: this.formNumber.name,
              eyeOffset: new Cesium.Cartesian3(0, 1.5, 0),
              fillColor: Cesium.Color.ORANGE,
              font: "30px sans-serif",
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                50
              ),
            },
          });

          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    addPosition(row, index) {
      var videoId = '1000174$1$0$0'
      let routeData = this.$router.resolve({name:'miniVideo',query:{id:videoId}})
      window.open(routeData.href,'_blank');
      this.editIndex = -1;
      if (this.formNumber.id == "") {
        console.log(11);
        this.$Message.error("未添加标定点，更新失败");
      } else {
        this.$axios({
          url: "/api/IndustryVideo/updateIndustryVideo",
          method: "post",
          data: {
            ...this.formNumber,
          },
          params: {
            mineTable: this.mineid + "industryvideo",
          },
        }).then((res) => {
          if (res.data.code == 200) {
			  console.log(res.data)
            //  this.riskData.splice(index, 1);
            // var getByIdEntity = this.viewer.entities.getById( this.formNumber.id);
            // this.viewer.entities.remove(getByIdEntity);
            this.$Message.success("修改成功333");
            this.dataCount = this.vediodata.length;
            if (this.dataCount < this.pageSize) {
              this.tableData = this.vediodata;
            } else {
              this.tableData = this.vediodata.slice(0, this.pageSize);
            }
            // EventBus.$emit("addtree", this.formNumber);
          } else {
            this.$axios({
              url: "/api/addIndustryVideo",
              method: "post",
              data: {
                ...this.formNumber,
              },
              params: {
                mineTable: this.mineid + "industryvideo",
              },
            }).then((res) => {
              if (res.data.code == 200) {
                this.$Message.success("添加成功");
              } else {
                this.$Message.error("添加失败");
              }
            });
          }
        });
      }
    },
    changePage(index) {
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.tableData = this.riskData.slice(_start, _end);
    },
  },
};
</script>