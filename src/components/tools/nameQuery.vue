
  <template>
  <div>
    <span slot="prepend" style="font-weight: bold">巷道名称 : </span>
    <Row>
      <i-col span="12">
        <Select v-model="tunnelName" size="small" style="width:100px" @on-change="selectChange(tunnelName)" >
        <Option v-for="item in tunnelList" :value="item" :key="item">{{ item }}</Option>
        </Select>
      </i-col>
      <Button type="primary" style="float: right" @click="MFAH()">定位</Button>
    </Row>
  </div>
</template>  

<script>
import Cesium from "cesium/Cesium.js";

export default {
  data() {
    return {
      loading1: false,
      model2:"",
      mineTable: "",
      inputName: "",
      tunnelName: "",
      tunnelList: [],
      show:[],
      X: 0,
      Y: 0,
      Z: 0,
    };
  },
  props: {
    viewer: {
      type: Object,
      default: () => {},
    },
    mineid: {
      type: String,
      default: "",
    },
  },
  created(){
    this.getTunnelName()
  },
  methods: {
    MFAH() {
      this.getTunnelData();
      var that = this;
      setTimeout(function () {
        if (that.X == 0) {
          alert("没有获取到数据，无法定位！");
        } else {        
          //相机飞向坐标
          window.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              that.X,
              that.Y,
              that.Z + 20,
            ),
          });
        }
      }, 2000);
    },

    //获取本煤矿所有巷道的名称
    getTunnelName() {
      this.$axios({
        url: "api/tunneldata/tunnelName",
        method: "get",
        params: {
          mineTable: this.mineid + "tunneldata",
        },
      })
        .then((res) => {
          var temp = res.data.data;
          for (var i = 0; i < temp.length; i++) {  
            this.tunnelList.push(temp[i].tunnelName);
          }
          //console.log(this.tunnelList);
        })
        .catch((error) => {});
    },
    //获取下拉框选中的值
    selectChange(tunnelName) {     
      this.inputName = tunnelName;
    },

    //调接口获取数据
    getTunnelData() {
      this.mineTable = this.mineid + "tunneldata";
      this.$axios({
        url: "api/tunneldata/sometunnelName",
        method: "get",
        params: {
          mineTable: this.mineTable,
          tunnelName: this.inputName,
        },
      })
        .then((res) => {
          this.show = res.data.data;
          var len = parseInt(this.show.length / 2);
          this.X = parseFloat(this.show[len].longitude);
          this.Y = parseFloat(this.show[len].latitude);
          this.Z = parseFloat(this.show[len].altitude);
        })
        .catch((error) => {});
    },
  },
};
</script> 


