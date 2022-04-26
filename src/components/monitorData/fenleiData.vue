<style scoped>
.demo-split {
  height: 450px;
  border: 1px solid #dcdee2;
}
.split-pane {
  padding: 10px;
  height: 450px;
}
.paging1 {
  float: right;
  margin-top: 10px;
  margin-bottom: 10px;
}
.paging2 {
  float: right;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>

<template>
  <div class="demo-split">
    <Split v-model="split1" class="split-pane">
      <div slot="left" class="split-pane">
        <Scroll height="430">
          <div v-for="checked in checkData" :key="checked">
            <Button size="large" style="border:none;" @click="changeTable(checked)">{{checked}}</Button>
          </div>
        </Scroll>
      </div>

      <div slot="right" class="split-pane">
        <Table
          height="375"
          border
          :columns="columns"
          :data="sernordata"
          :loading="loading"
          @on-row-dblclick="rowClick"
        ></Table>
        <!-- 分页 -->
        <div style="margin: 10px;overflow: hidden">
          <div style="float: right;">
            <Page :total="dataCount" :page-size="pageSize" show-total @on-change="changePage" show-elevator></Page>
          </div>
        </div>
      </div>
    </Split>
  </div>
</template>
                   

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      split1: 0.2,
      test: [],
      dataCount: 0,
      pageSize: 7,
      //mineid:"",
      checkData: ["全部类型"],
      columns: [
        {
            title: "序号",
            type: "index",
            align: "center",
            fixed: 'left',
            width: 70
          },
        {
          title: "时间",
          key: "UPDATE_TIME",
          align: "center"
        },
        {
          title: "类型",
          key: "SENSOR_NAME",
          align: "center"
        },
        {
          title: "检测值",
          key: "STR_DATA_VALUE",
          width: 100,
          align: "center"
        }
      ],
      sernordata: []
    };
  },
  props: {
    Type: {
      type: String,
      default: () => {}
    },
    mineid: {
      type: String,
      default: ""
    },
    viewer: {
      type: Object,
      default: () => {}
    }
  },

  mounted() {},

  created() {
    this.getSCCAdata();

  },

  methods: {
    ////////调单煤矿实时数据
    getSCCAdata() {
      axios
        .get("/api/sensor&person-info/sensorCurrentList-info", {
          params: {
            // SENSOR_NAME: type,
            mineid: this.mineid
          }
        })
        .then(res => {
          this.test = res.data.rows;
          this.dataCount = this.test.length;
          this.test.forEach(a => {
              var current = a.SENSOR_NAME;
              if (this.checkData.indexOf(current) === -1) {
                this.checkData.push(current);
              }
            })        
          // 初始化显示，小于每页显示条数，全显，大于每页显示条数，取前每页条数显示
          if (this.test.length < this.pageSize) {
            this.sernordata = this.test;
          } else {
            this.sernordata = this.test.slice(0, this.pageSize);
          }
          this.loading = false;
        })
        .catch(error => {});
           
    },
    //表格切换页面
    changePage(index) {     
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.sernordata = this.test.slice(_start, _end);
    },
    changeTable(checked) {
          if (checked == "全部类型") {
          this.loading=true;
          this.getSCCAdata();
        } else {
          this.loading=true;
          this.getSCCAdata(checked);
        }
      },
    rowClick(row) {
      // console.log(row.SENSOR_ID);
      var id = 4 * 100000 + row.SENSOR_ID;
      var getByIdEntity = this.viewer.entities.getById(id);
      // console.log(getByIdEntity);
      this.viewer.zoomTo(getByIdEntity);
    }
  }
};
</script>