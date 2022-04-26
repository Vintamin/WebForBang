<style>
.modelhome {
  height: 450px;
  width: 100%;
  border: 1px solid #dcdee2;
}
.btn {
  margin: 5px;
  border-bottom: 1px solid #dcdee2;
}
.model {
  height: 300px;
  width: 100%;
}

.model-form {
  margin: 20px;
}
</style>
<template>
  <div class="modelhome">
    <div class="btn">
      <Button style="margin:5px" type="info" size="large" @click="show('table')"
        >属性信息</Button
      >
      <Button size="large" type="info" @click="show('form')">空间信息</Button>
    </div>
    <div class="model" v-if="showform">
      <Form :model="formNumber" :label-width="50" class="model-form">
        <FormItem label="位置">
          <br />
          <span :style="{ marginRight: '10px' }">X</span>
          <InputNumber
            v-model="formNumber.posX"
            size="large"
            :step="0.000001"
            :style="{ width: '110px' }"
            :readonly="!showsubmit"
          ></InputNumber>
          <span :style="{ margin: '0 10px 0 30px' }">Y</span>
          <InputNumber
            v-model="formNumber.posY"
            size="large"
            :step="0.000001"
            :style="{ width: '110px' }"
            :readonly="!showsubmit"
          ></InputNumber>
          <span :style="{ margin: '0 10px 0 10px' }">Z</span>
          <InputNumber
            v-model="formNumber.posZ"
            :readonly="!showsubmit"
            size="large"
            :step="0.1"
            :style="{ width: '110px' }"
          ></InputNumber>
        </FormItem>
        <FormItem label="旋转">
          <br />
          <span :style="{ marginRight: '10px' }">X</span>
          <InputNumber
            v-model="formNumber.rotationX"
            size="large"
            :step="0.1"
            :style="{ width: '110px' }"
            :readonly="!showsubmit"
          ></InputNumber>
          <span :style="{ margin: '0 10px 0 30px' }">Y</span>
          <InputNumber
            v-model="formNumber.rotationY"
            size="large"
            :step="0.1"
            :style="{ width: '110px' }"
            :readonly="!showsubmit"
          ></InputNumber>
          <span :style="{ margin: '0 10px 0 10px' }">Z</span>
          <InputNumber
            v-model="formNumber.rotationZ"
            size="large"
            :step="0.1"
            :style="{ width: '110px' }"
            :readonly="!showsubmit"
          ></InputNumber>
        </FormItem>
        <FormItem label="缩放">
          <br />
          <Slider
            v-model="formNumber.scale"
            :step="0.1"
            :max="3"
            show-input
            style="width:420px"
          ></Slider>
        </FormItem>
         <FormItem>
          <span :style="{ marginRight: '10px' }">风险标识人</span>
          <Input
            v-model="formNumber.riskMark"
            style="width: 120px"
            :readonly="!showsubmit"
          />
          <span :style="{ margin: '0 10px 0 50px' }">风险审核人</span>
          <Input
            v-model="formNumber.riskCheck"
            style="width: 120px"
            :readonly="!showsubmit"
          />
        </FormItem>
        <FormItem style="text-align:center;">
          <Button
            v-if="showsubmit"
            type="primary"
            size="large"
            style="margin:0 20px 0 -30px"
            @click="positionSet"
            >位置标定</Button
          >
          <Button
            type="primary"
            @click="handleSubmit()"
            size="large"
            v-if="showsubmit"
            >提交</Button
          >
        </FormItem>
      </Form>
    </div>
    <!-- 切换页面2 -->
    <div class="model" v-if="showtable">
      <Table
        width="550"
        height="300"
        style="margin:20px auto"
        border
        :columns="columns"
        :data="dataInfo"
      ></Table>
      <Button
        v-if="showbtn"
        type="primary"
        style="display:block;margin:0 auto"
        @click="showperson()"
        >分站详情</Button
      >
    </div>
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
export default {
  props: {
    // API URL
    xxxData: {
      // type: Number,
      default: null
    },
    url: {
      type: String,
      default: ""
    },
    // viewer: {
    //   type: Object,
    //   default: () => {}
    // },
    mineid: {
      type: String,
      default: ""
    },
    iseditable: {
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
    }
  },
  data() {
    return {
      formNumber: {},
      iseditable: "",
      showform: false,
      showtable: true,
      showbtn: false,
      showsubmit: false,
      stationName: "",
      dataInfo: [],
      columns: [],
      columns1: [
        {
          title: "分站序号",
          align: "center",
          key: "id"
        },
        {
          title: "模型名称",
          key: "modelName",
          align: "center"
        },
        {
          title: "安装位置",
          key: "installationsite",
          align: "center"
        },
        {
          title: "分站人数",
          key: "count",
          align: "center"
        },
        {
          title: "当前状态",
          key: "status",
          align: "center"
        },
        {
          title: "更新时间",
          key: "update_data",
          align: "center"
        }
      ],
      columns2: [
        {
          title: "设备代码",
          key: "sensorID",
          align: "center"
        },
        {
          title: "模型名称",
          key: "modelName",
          align: "center"
        },
        {
          title: "安装位置",
          key: "position",
          align: "center"
        },
        {
          title: "设备类型",
          key: "deviceName",
          align: "center"
        },
        {
          title: "设备名称",
          key: "sensorName",
          align: "center"
        },
        {
          title: "当前日期",
          key: "update_data",
          align: "center"
        }
      ],
      columns3: [
        {
          title: "设备名称",
          key: "equipmentName",
          align: "center"
        },
        {
          title: "模型名称",
          key: "modelName",
          align: "center"
        },
        {
          title: "存放位置",
          key: "position",
          align: "center"
        },
        {
          title: "规格型号",
          key: "type",
          align: "center"
        },
        {
          title: "制造厂家",
          key: "manufacturer",
          align: "center"
        },
        {
          title: "出厂序号",
          key: "equipmentNum",
          align: "center"
        },
        {
          title: "出厂日期",
          key: "equipmentDate",
          align: "center"
        }
      ],
      columns4: [
        {
          title: "风险详情ID",
          key: "detailId",
          align: "center",
          width: 100
        },
        {
          title: "风险详情",
          key: "riskDesc",
          align: "center"

        },
        {
          title: "风险地点",
          key: "riskAddress",
          align: "center",
          width: 100
        },
        {
          title: "风险级别",
          key: "riskLevel",
          align: "center",
          width:50
        },
        {
          title: "风险状态",
          key: "status",
          align: "center",
          width: 50
        },
        
      ],
      columns5: [
        {
          title: "ID",
          key: "EQID",
          align: "center"
        },
        {
          title: "名称",
          key: "EQNAME",
          align: "center"
        },
        // {
        //   title: "位置",
        //   key: "ADDRESS",
        //   align: "center"
        // },
        {
          title: "所属设备组名称",
          key: "CATEGORY",
          align: "center"
        },
        {
          title: "所属公司",
          key: "MANUFACTOR",
          align: "center"
        }
      ]
    };
  },
  created() {
    //this.iseditable=this.$parent.$parent.$parent.$parent.$parent.$parent.iseditable;
    var id = this.xxxData;
    console.log(this.xxxData)
    // console.log(this.mineid)
    var getByIdEntity = viewer.entities.getById(id);
    // console.log(getByIdEntity)
    viewer.zoomTo(getByIdEntity);
    if (id.toString().startsWith("3")) {
      id = id - 3 * 100000;
      this.$axios("api/persorientatio/sid/" + id, {
        params: {
          mineTable: this.mineid + "persorientatio"
        }
      }).then(res => {
        this.formNumber = res.data.data;
        this.show("table");
      });
    } else if (id.toString().startsWith("4")) {
      id = id - 4 * 100000;
      this.$axios("api/sensor/sid/" + id, {
        params: {
          mineTable: this.mineid + "sensordata"
        }
      }).then(res => {
        this.formNumber = res.data.data;
        this.show("table");
        // console.log(this.formNumber);
      });
    } else if (id.toString().startsWith("1")) {
      id = id - 1 * 100000;
      this.$axios("api/equipment/sid/" + id, {
        params: {
          mineTable: this.mineid + "equipmentdata"
        }
      }).then(res => {
        this.formNumber = res.data.data;
        this.show("table");
      });
    }else if(id.toString().startsWith("9")){
      id=id.replace('900','')
        this.$axios("api/risk/detailId/"+id, {
            params: {
              mineTable: this.mineid + "risk"
            }
          }).then(res => {
            this.formNumber = res.data.data;
            this.show("table");
          })
    }else if(id.startsWith("e")){
      debugger;
        id = id.slice(1)
        
        this.$axios("api/mineequipment/eqid/"+id, {
            params: {
              mineTable: this.mineid + "mineequipment"
            }
          }).then(res => {
            this.formNumber = res.data.data;
            // console.log(res.data)
            this.show("table");
          })
    }
  },
  mounted() {},
  watch: {
    formNumber: {
      handler: function(val) {
        if (this.xxxData.toString().startsWith("e")) return
        var position = Cesium.Cartesian3.fromDegrees(
          val.posY,
          val.posX,
          val.posZ + 1.5
        );
        var heading = Cesium.Math.toRadians(val.rotationY); //俯仰角
        var pitch = Cesium.Math.toRadians(val.rotationX); //偏行角
        var roll = Cesium.Math.toRadians(val.rotationZ); //滚转角
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(
          position,
          hpr
        );
        viewer.entities.getById(this.xxxData).position = position;
        //更新姿态
        viewer.entities.getById(this.xxxData).orientation = orientation;
        if(this.xxxData.toString().startsWith("9")){
          viewer.entities.getById(this.xxxData).billboard.scale =
            val.scale *0.1;
        
        }else{
        viewer.entities.getById(this.xxxData).model.scale = val.scale;
        }
      },
      deep: true
    }
  },

  methods: {
    show(type) {
      var id = this.xxxData;
      if (type == "form") {
        this.showtable = false;
        this.showform = true;
        if (this.iseditable == "yes") {
          this.showsubmit = true;
        }
      } else if (type == "table") {
        this.dataInfo = [];
        this.showform = false;
        this.showtable = true;
        Date.prototype.Format = function(fmt) {
          var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            S: this.getMilliseconds() //毫秒
          };
          if (/(y+)/.test(fmt))
            fmt = fmt.replace(
              RegExp.$1,
              (this.getFullYear() + "").substr(4 - RegExp.$1.length)
            );
          for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
              fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                  ? o[k]
                  : ("00" + o[k]).substr(("" + o[k]).length)
              );
          return fmt;
        };
        if (id.toString().startsWith("3")) {
          this.columns = this.columns1;
          this.showbtn = true;
          this.stationName = this.formNumber.installationsite;
          let form = {};
          form.id = this.formNumber.id;
          form.installationsite = this.formNumber.installationsite;
          form.modelName = this.formNumber.modelName;
          this.$axios({
            url: "api/sensor&person-info/personRealTimeList-info",
            method: "get",
            params: {
              station: this.formNumber.installationsite,
              mine: this.mineid
            }
          }).then(res => {
            let perdata = res.data.rows[0];
            let dataCount = res.data.rows.length;
            form.count = dataCount + "人";
            if (dataCount == 0) {
              var time = new Date().Format("yyyy-MM-dd HH:mm:ss");
              form.update_data = time;
            } else {
              form.update_data = perdata.UPDATE_DATE;
              form.status = perdata.PERSONNEL_STATUS;
            }

            this.dataInfo.push(form);
          });
        } else if (id.toString().startsWith("4")) {
          this.columns = this.columns2;
          var time = new Date().Format("yyyy-MM-dd HH:mm:ss");
          this.formNumber.update_data = time;
          this.dataInfo.push(this.formNumber);
        } else if (id.toString().startsWith("1")) {
          this.columns = this.columns3;

          this.dataInfo.push(this.formNumber);
        }else if (id.toString().startsWith("9")) {
          this.columns = this.columns4;
          id=id.replace('900','')
          this.$axios("api/company&equipment&risk-info/riskByRiskaddress-Info/" + id)
        .then(res => {
         this.dataInfo= res.data.rows;
        //  console.log(iddata)
        })

        } else if(id.startsWith('e')) {
          id = id.slice(1)
          this.columns = this.columns5;
          this.$axios("api/company&equipment&risk-info/equipment-info", {
          params: {
            ORGANIZEID: this.mineid,
          },}).then((res) => {
            if(res.data.code == 500) {
              this.show(type);
            }else{
            var eq = res.data.data;
            }
            
            // console.log(res)
            // var eq = [{"FACTORYNUMBER":null,"EQMODEL":"4-72-12NO:20B","MANUFACTOR":"长沙华忠工业风机厂","CATEGORY":"备用主要通风机","ADDRESS":null,"EQCODE":"EQTB00007792","EQID":"5668","ORGANIZEID":"431322008429","EQNAME":"离心通风机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":"1999-03-01 00:00:00","CONTACTSMUMBER":"13875460137"},{"FACTORYNUMBER":null,"EQMODEL":"B3SV9","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"减速器","ADDRESS":"二暗副井","EQCODE":"EQTB00009308","EQID":"7241","ORGANIZEID":"431322008429","EQNAME":"减速器","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"ZQ850","MANUFACTOR":"湖南金塔机械制造有限公司","CATEGORY":"配套设施","ADDRESS":null,"EQCODE":"EQTB00009281","EQID":"7216","ORGANIZEID":"431322008429","EQNAME":"减速器","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"FBDYNO:5.6/2×11","MANUFACTOR":"浙江广宇电器有限公司","CATEGORY":"工作局部通风机","ADDRESS":null,"EQCODE":"EQTB00009263","EQID":"7201","ORGANIZEID":"431322008429","EQNAME":"局部通风机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"RJKY30-25/1200(A)","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"架空人车","ADDRESS":null,"EQCODE":"EQTB00009291","EQID":"7226","ORGANIZEID":"431322008429","EQNAME":"架空人车","EQUID":null,"PCCODE":"MCF190007","UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"RJKY37-25/2000(A)","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"架空人车","ADDRESS":null,"EQCODE":"EQTB00009287","EQID":"7223","ORGANIZEID":"431322008429","EQNAME":"可摘挂抱索器架空人车","EQUID":null,"PCCODE":"MCF140088","UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"YB3-225M-6","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"配套电动机","ADDRESS":null,"EQCODE":"EQTB00009299","EQID":"7232","ORGANIZEID":"431322008429","EQNAME":"电机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"1000S","MANUFACTOR":"湖南煤矿机械有限公司","CATEGORY":"配套输送带","ADDRESS":null,"EQCODE":"EQTB00009272","EQID":"7209","ORGANIZEID":"431322008429","EQNAME":"钢丝绳芯输送带","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"ZQS-50","MANUFACTOR":"晋生源矿山物资设备有限公司","CATEGORY":"风煤钻","ADDRESS":null,"EQCODE":"EQTB00009255","EQID":"7194","ORGANIZEID":"431322008429","EQNAME":"手持风煤钻","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"JTPB-1.6×1.5P","MANUFACTOR":"湖南金塔机械制造有限公司","CATEGORY":"提升绞车","ADDRESS":null,"EQCODE":"EQTB00009278","EQID":"7213","ORGANIZEID":"431322008429","EQNAME":"提升绞车","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"RJY22-28/1000(A)","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"架空人车","ADDRESS":null,"EQCODE":"EQTB00009295","EQID":"7228","ORGANIZEID":"431322008429","EQNAME":"架空人车","EQUID":null,"PCCODE":"MCF140085","UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"B3SV7","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"减速器","ADDRESS":null,"EQCODE":"EQTB00009307","EQID":"7239","ORGANIZEID":"431322008429","EQNAME":"减速机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"BRW125/31.5","MANUFACTOR":"浙江众博矿业机械有限公司","CATEGORY":"乳化液泵","ADDRESS":null,"EQCODE":"EQTB00009259","EQID":"7197","ORGANIZEID":"431322008429","EQNAME":"乳化液泵","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"DXT90/330","MANUFACTOR":"四川省乐山宇强电机车制造有限公司","CATEGORY":"蓄电池机车","ADDRESS":null,"EQCODE":"EQTB00009268","EQID":"7204","ORGANIZEID":"431322008429","EQNAME":"蓄电池机车","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"4-72-12N0:20B","MANUFACTOR":"长沙华忠工业风机厂","CATEGORY":"工作主要通风机","ADDRESS":null,"EQCODE":"EQTB00007787","EQID":"5667","ORGANIZEID":"431322008429","EQNAME":"离心式主通风机4-","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":"1999-03-13 00:00:00","CONTACTSMUMBER":"13875460137"},{"FACTORYNUMBER":null,"EQMODEL":"KFU0.75-6","MANUFACTOR":"涟源矿山机械制造有限公司","CATEGORY":"固定式矿车","ADDRESS":null,"EQCODE":"EQTB00009269","EQID":"7207","ORGANIZEID":"431322008429","EQNAME":"矿车","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"YBK3-355S-6","MANUFACTOR":"湖南煤矿机械有限公司","CATEGORY":"配套电动机","ADDRESS":null,"EQCODE":"EQTB00009275","EQID":"7211","ORGANIZEID":"431322008429","EQNAME":"皮带电机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"YB3-225M-8","MANUFACTOR":"同丰科技有限公司","CATEGORY":"配套电动机","ADDRESS":null,"EQCODE":"EQTB00009301","EQID":"7234","ORGANIZEID":"431322008429","EQNAME":"电机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"ZWY-80/45L","MANUFACTOR":"江西鑫通机械制造有限公司","CATEGORY":"装岩机","ADDRESS":null,"EQCODE":"EQTB00007784","EQID":"5661","ORGANIZEID":"431322008429","EQNAME":"履带式挖掘装载机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13875460137"},{"FACTORYNUMBER":null,"EQMODEL":"6×19S+FC 24","MANUFACTOR":"宇宙钢丝绳有限公司","CATEGORY":"提升钢丝绳","ADDRESS":null,"EQCODE":"EQTB00009283","EQID":"7218","ORGANIZEID":"431322008429","EQNAME":"钢丝绳","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"MG150/380-WD","MANUFACTOR":"辽源煤矿机械制造有限责任公司","CATEGORY":"采煤机","ADDRESS":"综采工作面","EQCODE":"EQTB00007099","EQID":"5147","ORGANIZEID":"431322008429","EQNAME":"交流电牵引采煤机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13875460137"},{"FACTORYNUMBER":null,"EQMODEL":"DCY355-31.5","MANUFACTOR":"湖南煤矿机械有限公司","CATEGORY":"减速机","ADDRESS":null,"EQCODE":"EQTB00009277","EQID":"7212","ORGANIZEID":"431322008429","EQNAME":"减速器","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"SGZ620/40T","MANUFACTOR":"湖南永安煤矿机械制造有限公司","CATEGORY":"刮板输送机","ADDRESS":null,"EQCODE":"EQTB00007516","EQID":"5451","ORGANIZEID":"431322008429","EQNAME":"刮板输送机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"15193642256"},{"FACTORYNUMBER":null,"EQMODEL":"DW20-300/100","MANUFACTOR":"山东矿机集团股份有限公司","CATEGORY":"单体液压支柱","ADDRESS":null,"EQCODE":"EQTB00007783","EQID":"5660","ORGANIZEID":"431322008429","EQNAME":"外注式单体支柱","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13875460137"},{"FACTORYNUMBER":"M18-3959","EQMODEL":"6*36WS+FC","MANUFACTOR":"湖南湘钢钢丝绳有限公司","CATEGORY":"提升钢丝绳","ADDRESS":"一暗副井、二暗副井、31轨道上山","EQCODE":"EQTB00009303","EQID":"7238","ORGANIZEID":"431322008429","EQNAME":"光面钢绳","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"7665MZ","MANUFACTOR":"济宁金林机械设备有限公司","CATEGORY":"锚杆钻机","ADDRESS":null,"EQCODE":"EQTB00009256","EQID":"7195","ORGANIZEID":"431322008429","EQNAME":"气腿凿岩机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"ZDL2400/16/24L","MANUFACTOR":"北京天地聚能有限公司","CATEGORY":"液压支架","ADDRESS":null,"EQCODE":"EQTB00007782","EQID":"5658","ORGANIZEID":"431322008429","EQNAME":"拉杆垛式液压支架","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13875460137"},{"FACTORYNUMBER":null,"EQMODEL":"YB3-250M-6","MANUFACTOR":"娄底市同丰科技有限公司","CATEGORY":"配套电动机","ADDRESS":null,"EQCODE":"EQTB00009297","EQID":"7230","ORGANIZEID":"431322008429","EQNAME":"人车电机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"},{"FACTORYNUMBER":null,"EQMODEL":"PZ-7D","MANUFACTOR":"巩力机械有限公司","CATEGORY":"混凝土喷射机","ADDRESS":"岩掘工作面","EQCODE":"EQTB00009257","EQID":"7196","ORGANIZEID":"431322008429","EQNAME":"混凝土喷射机","EQUID":null,"PCCODE":null,"UPDATETIME":null,"DATEOFPRODUCTION":null,"CONTACTSMUMBER":"13548825349"}]

            this.dataInfo = eq.filter(item => {
              return item.EQID == id
            })
            this.dataInfo.push(this.formNumber)
            // console.log(id)
            // console.log(this.dataInfo)
          })
        }
      }
    },
    handleSubmit() {
      var id = this.xxxData;
      var getByIdEntity = viewer.entities.getById(id);
      if (id.toString().startsWith("3")) {
        id = id - 3 * 100000;
        this.$axios({
          url: "api/persorientatio/sid",
          method: "post",
          data: {
            ...this.formNumber
          },
          params: {
            mineTable: this.mineid + "persorientatio"
          }
        }).then(res => {
          // console.log(res)
          if (res.data.code == 200) {
            this.$Message.success("更新成功");
          } else {
            this.$Message.error("更新失败");
          }
        });
      } else if (id.toString().startsWith("4")) {
        id = id - 4 * 100000;
        this.$axios({
          url: "api/sensor/sid",
          method: "post",
          data: {
            ...this.formNumber
          },
          params: {
            mineTable: this.mineid + "sensordata"
          }
        }).then(res => {
          // console.log(res)
          if (res.data.code == 200) {
            this.$Message.success("更新成功");
          } else {
            this.$Message.error("更新失败");
          }
        });
      } else if (id.toString().startsWith("1")) {
        id = id - 1 * 100000;
        this.$axios({
          url: "api/equipment/sid",
          method: "post",
          data: {
            ...this.formNumber
          },
          params: {
            mineTable: this.mineid + "equipmentdata"
          }
        }).then(res => {
          // console.log(res)
          if (res.data.code == 200) {
            this.$Message.success("更新成功");
          } else {
            this.$Message.error("更新失败");
          }
        });
      }else if (id.toString().startsWith("9")) {
        id=id.replace('900','')
        // console.log(this.formNumber)
        this.$axios({
          url: "api/risk/updateRisk",
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
            this.$Message.success("更新成功");
          } else {
            this.$Message.error("更新失败");
          }
        });
      } else if (id.startsWith("e")) {
        id = id.slice(1)
        this.$axios({
          url: "api/mineequipment/updatemineequipment/",
          method: "post",
          data: {
            ...this.formNumber
          },
          params: {
            mineTable: this.mineid + "mineequipment"
          }
        }).then(res => {
          if (res.data.code == 200) {
            this.$Message.success("更新成功");
          } else {
            this.$Message.error("更新失败");
          }
        });
      }
    },
    showperson() {
      this.$emit("childByValue", this.stationName, "false");
    },
    positionSet() {
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(e => {
        const pixel = e.position;
        var pickedObject = viewer.scene.pick(pixel);
        if (
          viewer.scene.pickPositionSupported &&
          Cesium.defined(pickedObject)
        ) {
          //判断是否拾取到模型
          var cartesian = viewer.scene.pickPosition(pixel); //若拾取到模型，则保存拾取点笛卡尔坐标
        }

        if (cartesian) {
          var ellipsoid = viewer.scene.globe.ellipsoid;
          var cartographic = ellipsoid.cartesianToCartographic(cartesian);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var alt = cartographic.height;
          // console.log(lat,lng,alt);
          this.formNumber.posX=lat;
          this.formNumber.posY=lng;
          this.formNumber.posZ=alt;
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      
    }
  }
};
</script>