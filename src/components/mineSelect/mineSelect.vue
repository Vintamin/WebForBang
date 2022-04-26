<template>
  <div>
    <Table :columns="columns" :data="data" highlight-row>
      <template slot-scope="{}" slot="action">
        <Button type="primary" @click="clickRes">确定</Button>
      </template>
    </Table>
    <!-- 分页 -->
    <Page
      :total="dataCount"
      :page-size="pageSize"
      show-total
      class="paging"
      @on-change="changepage"
    ></Page>

    <!-- <i-button type="primary" style="margin-left:260px;" @click="postparam">确定</i-button>      -->
  </div>
</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
import { EventBus } from "@/utils/bus.js";

export default {
  data() {
    return {
      test: [],
      dataCount: 0,
      pageSize: 8,
      projectID: "",
      projectName: "",
      minelongitude: "",
      minelatitude: "",
      height: 0,
      heading: 0,
      pitch: 0,
      roll: 0,
      authorized: "",
      iseditable: "yes",
      open: false,
      columns: [
        {
          title: "项目名称",
          key: "Name",
          width: 100,
          align: "center"
        },
        {
          title: "项目ID",
          key: "ProjectID",
          width: 80,
          align: "center"
        },
        {
          //单选框
          title: "选择",
          key: "chose",
          width: 80,
          align: "center",
          render: (h, params) => {
            let id = params.row.ProjectID;
            let name = params.row.Name;
            let flag = false;

            if (this.projectID === id) {
              flag = true;
            } else {
              flag = false;
            }
            let self = this;
            return h("div", [
              h("Radio", {
                props: {
                  value: flag
                },
                on: {
                  "on-change": () => {
                    self.projectID = id;
                    self.projectName = name;
                    flag = true;
                  }
                }
              })
            ]);
          }
        },
        {
          title: "操作",
          slot: "action",
          width: 80,
          align: "center"
        }
      ],
      data: []
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
    authorized: {
      type: String,
      default: ""
    },
    projectDataList: []
  },
  created() {
    //this.authorized = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.authorized;
    if (this.authorized == "admin") {
      //若用户为管理员，显示煤矿选择
      this.getminename(); //显示所有煤矿
    } else {
      //若为普通用户，不显示煤矿选择
    }
  },
  mounted() {},
  watch: {
    projectDataList(newVal, oldVal) {
      this.data = newVal;
    }
  },
  methods: {
    getminename() {
/*       this.$axios
        .get("api/projectName")
        .then(res => {
          this.test = res.data.data;
          // console.log( this.test);
          this.dataCount = this.test.length;
          // 初始化显示，小于每页显示条数，全显，大于每页显示条数，取前每页条数显示
          if (this.test.length < this.pageSize) {
            this.data = this.test;
          } else {
            this.data = this.test.slice(0, this.pageSize);
          }
        })
        .catch(error => {}); */
      this.data = this.projectDataList;
      this.dataCount = this.projectDataList.length;
    },
    //表格切换页面
    changepage(index) {
      var _start = (index - 1) * this.pageSize;
      var _end = index * this.pageSize;
      this.data = this.test.slice(_start, _end);
    },

    //选择煤矿,向父组件home传递煤矿id
    clickRes(){
      this.$emit(
        "func",
        this.projectID,
        this.iseditable,
        this.open,
        this.projectName
      );
    },
    postparam() {
      this.$emit(
        "func",
        this.projectID,
        this.iseditable,
        this.open,
        this.projectName
      );
      this.viewer.entities.removeAll();

      //复位
      var originPosition = Cesium.Cartesian3.fromDegrees(
        112.885665,
        26.296894,
        10000
      );
      if (this.projectID != null) {
        this.$axios.get("api/projectName").then(res => {
          this.test = res.data.data;
          for (var i = 0; i < this.test.length; i++) {
            if (this.projectID == this.test[i].mineId) {
              this.minename = this.test[i].projectName;
              this.minelongitude = this.test[i].mineLongitude;
              this.minelatitude = this.test[i].mineLatitude;
              this.height = this.test[i].height;
              this.heading = this.test[i].heading;
              this.pitch = this.test[i].pitch;
              this.roll = this.test[i].roll;
            }
          }
          //视角设为该煤矿
          originPosition = Cesium.Cartesian3.fromDegrees(
            this.minelongitude,
            this.minelatitude,
            this.height
          );
          EventBus.$emit(
            "positions",
            this.minelongitude,
            this.minelatitude,
            this.height
          ); //传值给淹没分析生成水平面
          viewer.dataSources.removeAll();
        });
      } else {
        alert("get projectID filed!");
      }

      var that = this;
      that.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        function(e) {
          e.cancel = true;
          that.$axios
            .get("api/projectName")
            .then(res => {
              that.test = res.data.data;
              for (var i = 0; i < that.test.length; i++) {
                if (that.projectID == that.test[i].mineId) {
                  that.minename = that.test[i].projectName;
                  that.minelongitude = that.test[i].mineLongitude;
                  that.minelatitude = that.test[i].mineLatitude;
                  that.height = that.test[i].height;
                  that.heading = that.test[i].heading;
                  that.pitch = that.test[i].pitch;
                  that.roll = that.test[i].roll;
                }
              }
              //视角设为该煤矿
              originPosition = Cesium.Cartesian3.fromDegrees(
                that.minelongitude,
                that.minelatitude,
                that.height
              );
            })
            //你要飞的位置
            .then(() => {
              viewer.camera.flyTo({
                destination: originPosition,
                orientation: {
                  heading: that.heading,
                  pitch: that.pitch,
                  roll: that.roll
                }
              });
            });
        }
      );
    }
  }
};
</script>
