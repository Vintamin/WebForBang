<style scoped>
.demo {
  height: 550px;
  width: 100%;
  border: 1px solid #dcdee2;
}
.demo-top {
  height: 50px;
  padding: 10px;
  width: 100%;
}
</style>

<template>
  <div class="demo">
    <div class="demo-top">
      <div style="float: left;width:200px">
        <Input v-model="inputName" placeholder="请输入姓名">
          <span slot="prepend">关键字：</span>
        </Input>
      </div>
      <Col span="6" style="margin-left:10px">
        <DatePicker
          type="daterange"
          placement="bottom-end"
          placeholder="Select date"
          style="width: 200px"
          :value="date"
          @on-change="handleChange"
        ></DatePicker>
      </Col>
      <Button type="primary" @click="searchData()" icon="ios-search">查询</Button>
    </div>
    <div class="demo-table">
      <Modal
        v-model="showDialog"
        draggable
        scrollable
        footer-hide
        :z-index="111111"
        title="人员定位历史数据"
        width="1000px"
      >
        <historical-track-data v-if="showDialog" :xxxData="xxxData" :viewer="viewer" :mineid="mineid"></historical-track-data>
      </Modal>
      <Table
        height="450"
        :loading="loading"
        :data="tableData"
        :columns="columns1"
        border
        @on-row-dblclick="rowClick"
      >
        <template slot-scope="{ row}" slot="operating">
          <Button type="primary" style="margin-right: 5px" @click="openModal(row)">历史轨迹</Button>
        </template>
      </Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
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
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
import historicalTrackData from "./historicalTrackData.vue";
export default {
  data() {
    return {
      date: [],
      inputName: "",
      loading: true,
      showDialog: false,
      personMonitorList: {},
      pageSize: 10,
      dataCount: 0,
      tableData: [],
      paramData: [],
      xxxData: null,
      //mineid:"",
      columns1: [
        {
          title: "序号",
          type: "index",
          align: "center",
          fixed: "left",
          width: 70
        },
        {
          title: "员工编号",
          key: "STAFF_CODE",
          align: "center",
          width: 100
        },
        {
          title: "姓名",
          key: "STAFF_NAME",
          align: "center",
          fixed: "left",
          width: 100
        },
        {
          title: "部门",
          key: "DEPARTMENT",
          align: "center",
          width: 100
        },
        {
          title: "工种",
          key: "WORK_TYPE",
          align: "center",
          width: 100
        },
        {
          title: "职务",
          key: "DUTY",
          align: "center",
          width: 100
        },
        {
          title: "工作区域",
          key: "BS_LOC_AREA",
          align: "center",
          width: 100
        },
        {
          title: "所在分站位置",
          key: "STATION_NAME",
          align: "center",
          width: 110
        },
        {
          title: "所在分站时间",
          key: "IN_TIME",
          align: "center",
          width: 170
        },
        {
          title: "入矿时间",
          key: "ENTER_WELL_TIME",
          align: "center",
          width: 170
        },
        {
          title: "状态",
          key: "PERSONNEL_STATUS",
          align: "center",
          width: 100
        },
        {
          title: "操作",
          slot: "operating",
          align: "center",
          width: 100
        }
      ]
    };
  },
   props: {
    // API URL
    xxxData: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: ""
    },
    viewer: {
      type: Object,
      default: () => {},

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

  components: {
    historicalTrackData
  },

  created() {
    this.addDate();
    this.paramData = {
      start: this.date[0],
      end: this.date[1],
       mine: this.mineid
    };
    // console.log(this.paramData);
    this.getpersonMonitorList(this.paramData);
  },

  methods: {
    addDate() {
      var nowDate = new Date();
      var year = nowDate.getFullYear();
      var month = nowDate.getMonth() + 1;
      month = month < 10 ? "0" + month : month;
      var date = nowDate.getDate();
      date = date < 10 ? "0" + date : date;
      var systemDate = year + "-" + month + "-" + date;
      this.date = [systemDate, systemDate];
    },
    openModal(row) {
      this.showDialog = true;
      this.xxxData = row.STAFF_NAME;
      // console.log(this.xxxData);
    },
    rowClick(row) {
       
        this.$axios("api/persorientatio/Installationsite/" + row.STATION_NAME, {
          params: {
            mineTable: this.mineid + 'persorientatio'
          }
        })
          .then(res => {
            this.personId = res.data.data;
            // console.log(this.personId.id);
            // console.log(3 * 100000 + this.personId.id);
            var getByIdEntity = this.viewer.entities.getById(
              3 * 100000 + this.personId.sid
            ); //tableType*100000
            // console.log(getByIdEntity);
            this.viewer.zoomTo(getByIdEntity);
          })
          .catch(error => {});
          
    },
    searchData() {
      this.loading = true;
      var name = this.inputName;
      var start = this.date[0];
      var end = this.date[1];
      this.paramData = {
        name: name,
        start: start,
        end: end,
        mine: this.mineid
      };
      // console.log(this.paramData);
      this.getpersonMonitorList(this.paramData);
    },

    getpersonMonitorList(paramData) {     
       
          this.$axios({
          url: "api/sensor&person-info/personMonitorList-info",
          method: "get",
          params: paramData
        })
          .then(res => {
            this.personMonitorList = res.data.rows;
            this.dataCount = res.data.rows.length;
            if (this.dataCount < this.pageSize) {
              this.tableData = this.personMonitorList;
            } else {
              this.tableData = this.personMonitorList.slice(0, this.pageSize);
            }
            this.loading = false;
          })
          .catch(error => {});
                    
    },
    changePage(index) {
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.tableData = this.personMonitorList.slice(_start, _end);
    },
    handleChange(date) {
      this.date = date;
    }
  },
 
};
</script>

