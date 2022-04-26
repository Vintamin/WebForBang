<style scoped>
.demo-split {
  height: 550px;
  width: 100%;
  border: 1px solid #dcdee2;
}

.demo-split-pane {
  padding: 20px;
  height: 100%;
  overflow-x: hidden;
}
</style>

<template>
  <div class="demo-split">
    <Split v-model="split1" class="demo-split-pane">
      <div slot="left" class="demo-split-pane">
        <div v-for="(checkb, index) in checkData" :key="index" >
          <Button
            margin-top="40px"
            size="large"
            style="border: none"
            @click="changeTable(checkb)"
            >{{ checkb }}</Button
          >
        </div>
      </div>
      <div slot="right" class="demo-split-pane">
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
        <Modal
          v-model="showDialog"
          :z-index="111111"
          title="设备详情"
          draggable
          width="500px"
        >
          <eachEuipment
            v-if="showDialog"
            :xxxData="xxxData"
            :iseditable="iseditable"
            :mineid="mineid"
          ></eachEuipment>
          <div slot="footer"></div>
        </Modal>
      </div>
    </Split>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
// import Cesium from "cesium/Cesium.js";
import eachEuipment from "./eachEuipment.vue";
import { EventBus } from "@/utils/bus.js";
export default {
  data() {
    return {
      split1: 0.2,
      equipmentData: [],
      showDialog: false,
      pageSize:10,
      xxxData: null,
      mineid: "",
      iseditable: "",
      checkData1: [],
      checkData: [],
      tableData:[],
      editIndex:-1,
      checked: false,
      formNumber: {
        eqid: "",
        category:"",
        posX: 0,
        posY: 0,
        posZ: 0,
        scale: 1,
        eqname: ""
      },
      loading:true,
      columns1: [
        {
          title: "设备编号",
          key: "EQCODE",
          align: "center",
          width: 100,
        },
        {
          title: "名称",
          key: "EQNAME",
          align: "center",
          width: 100,
        },
        {
          title: "所属设备组名称",
          key: "CATEGORY",
          align: "center",
          width: 200,
        },
        {
          title: "x坐标",
          slot: "posX",
          align: "center",
          width: 100,
        },
        {
          title: "y坐标",
          slot: "posY",
          align: "center",
          width: 100,
        },
        {
          title: "z坐标",
          slot: "posZ",
          align: "center",
          width: 100,
        },
        {
          title: "缩放",
          slot: "scale",
          align: "center",
          width: 100,
        },
        {
          title: "操作",
          slot: "operating",
          align: "center",
          fixed: "right",
          width: 200,
        },
      ],
      maskedEquipment: [],
      category2modelName: {
        "备用主要通风机": 'tongfengji',
        "减速器": "jiansuqi",
        "工作局部通风机": "tongfengji",
        "架空人车": "chengrenzhuangzhi",
        "配套电动机": "diandongji",
        "提升绞车": "tishengji",
        "乳化液泵": "yeyabeng",
        "工作主要通风机": "tongfengji",
        "减速机": "jiansuqi"
      }
    };
  },
  components: {
    eachEuipment,
  },
  props: {
    // API URL
    url: {
      type: String,
      default: "",
    },
    viewer: {
      type: Object,
      default: () => {},
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
    mineid: {
      type: String,
      default: "",
    },
    iseditable: {
      type: String,
      default: "",
    },
  },

  created() {
    this.getEquipment();
  },
  methods: {
    getEquipment() {
      this.$axios("api/company&equipment&risk-info/equipment-info", {
        params: {
          ORGANIZEID: this.mineid,
        },
      }).then((res) => {
        if(res.data.code == 500) {
          this.getEquipment();
        }else {
           this.equipmentData = res.data.data;
          console.log(this.equipmentData)          
          this.$axios(`api/mineequipment`, {
            params: {
              mineTable: this.mineid + 'mineequipment'
            }
          }).then(res => {
            this.maskedEquipment = res.data.data;
            this.equipmentData = this.equipmentData.filter(
            item => !this.maskedEquipment.some(ele => ele.eqid == item.EQID)
            );
            this.dataCount = this.equipmentData.length
            if (this.dataCount < this.pageSize) {
              this.tableData = this.equipmentData;
              console.log(this.tableData)
            } else {
              this.tableData = this.equipmentData.slice(0, this.pageSize);
            }
          }).catch(err => {
            console.log(err)
          })
        
          this.equipmentData.forEach((item, index) => {
            if( this.checkData.indexOf(item.CATEGORY) == -1) this.checkData.push(item.CATEGORY)
          });

          this.loading = false;
        }
         
        })
        // .catch((error) => {});
    },
    markPosition(row, index) {
      this.formNumber.eqid = "";
      this.formNumber.posX = 0;
      this.formNumber.posY = 0;
      this.formNumber.posZ = 0;
      this.formNumber.scale = 1;
      this.formNumber.eqid = row.EQID;//将该行的设备ID赋值给formNumber
      this.formNumber.category=row.CATEGORY
      this.formNumber.eqname=row.EQNAME
      this.formNumber['modelName'] = this.category2modelName[this.formNumber.category] || 'jiansuqi';
      this.editIndex = index;
      var getByIdEntity = this.viewer.entities.getById("e" + row.eqid,);
      if (getByIdEntity) {
        this.viewer.entities.remove(getByIdEntity);
      }
      // this.formNumber.eqid =row.eqid;
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

          this.viewer.entities.add({
        id: "e" + this.formNumber.eqid,
        name: this.formNumber.eqname,
        //
        position: Cesium.Cartesian3.fromDegrees(
              this.formNumber.posY,
              this.formNumber.posX,
              this.formNumber.posZ + 1.2
            ),
        // orientation: orientation,
        label: {
          text: this.formNumber.eqname,
          eyeOffset: new Cesium.Cartesian3(0, 0.3, 0),
          fillColor: Cesium.Color.ORANGE,
          font: "30px sans-serif",
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            70
          )
        },
        model: {
          uri: `model3D/CesiumBalloon/${this.formNumber.modelName}.gltf`,
          scale: this.formNumber.scale*1.5
        }
          });
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK); //移除事件
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          // console.log(this.formNumber)

    },
    addPosition(row,index){
    this.editIndex = -1;
    // console.log(this.formNumber)
     if(this.formNumber.eqid ==''){
       this.$Message.error("未标定矿用设备，更新失败");
     }else{
       console.log(this.formNumber)
      this.$axios({
        url: "api/addmineequipment/",
        // url: "api/mineequipment/updatemineequipment",
        method: "post",
        data: {
          ...this.formNumber
        },
        params: {
          mineTable: this.mineid + "mineequipment"
        }
      }).then(res => {
        console.log(res)
        if (res.data.code == 200) {
          this.equipmentData.splice(index, 1);
          this.$Message.success("更新成功");
          EventBus.$emit("addEquipTree", this.formNumber);
          this.dataCount=this.equipmentData.length
          if (this.dataCount < this.pageSize) {
            this.tableData = this.equipmentData;
          } else {
            this.tableData = this.equipmentData.slice(0, this.pageSize);
          }
          // var addrisktree = Object.assign(row, this.formNumber);
          // EventBus.$emit("addtree", addrisktree);
        } else {
          this.$Message.error("更新失败");
        }
      });
     }
    },
    changePage(index) {
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.tableData = this.equipmentData.slice(_start, _end);
    },
    changeTable(checkb) {
      // console.log(e) 
      var arr = [];
      this.equipmentData.forEach((item)=>{
        if(item.CATEGORY == checkb) {
          arr.push(item);
        }
      })
      this.tableData = arr;
    }
  },
};
</script>