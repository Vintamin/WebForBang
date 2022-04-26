<template>
  <div class="mini-video">
    <!-- 主窗口 -->
    <div class="mv-view">
      <!-- 视频窗口 -->
      <div class="mviewl" v-if="ocxInstalled">
        <object
          id="DPSDK_OCX"
          classid="CLSID:D3E383B6-765D-448D-9476-DFD8B499926D"
          codebase="/Build/ActiveX/DpsdkOcx.cab#version=1.0.0.0"
          style="width: 100%; height: 100%"
        ></object>
      </div>
      <!-- 加载ocx闪烁窗口 -->
      <div class="no-ocx-tip mviewl" v-else></div>
    </div>
    <!-- 信息提示 -->
    <div id="RetInfo">状态：{{ RetInfoText }}</div>
    <!-- 操作 -->
    <div class="handle-all">
      <i-button type="primary" @click="ButtonStartRealplayByWndNo_onclick()"
        >实时播放</i-button
      >
      <i-button type="primary" @click="Button_CapturePictureByWndNo_onclick()"
        >图像抓拍</i-button
      >
      <i-button type="primary" @click="ButtonStartTimePlaybackByWndNo_onclick()"
        >回放录像</i-button
      >
      <i-button type="primary" @click="ButtonDownloadRecordByTime_onclick()"
        >下载录像</i-button
      >
      <Input
        v-model="startTime"
        icon="ios-clock-outline"
        placeholder="2021-01-19 10:05:52"
        style="width: 160px"
      />至
      <Input
        v-model="endTime"
        icon="ios-clock-outline"
        placeholder="2021-01-19 10:15:33"
        style="width: 160px"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "miniVideo",
  data() {
    return {
      gWndId: 0, // 主窗口ID
      bLogin: 0, // 登陆状态
      obj: null, // DPSDK_OCX
      RetInfoText: "等待窗口初始化", // tips
      createWndOk: -1, // 窗口状态
      szCameraId: "", // 视频源ID
      ocxInstalled: true, // ocx安装状态
      timer1: null, // 初始化定时器
      timer2: null, // 动态提示定时器
      startTime: "2021/01/19 10:05:52",
      endTime: "2021/01/19 10:15:33",
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.szCameraId = to.query.id;
    });
  },
  created() {
    this.szCameraId = this.getQueryVariable("id");
  },
  mounted() {
    this.timer1 = setInterval(() => {
      this.createWndOk !== 0 && this.init();
      this.createWndOk === 0 && clearInterval(this.timer1);
    }, 2000);
  },
  beforeDestroy() {
    this.ButtonLogout_onclick();
    clearInterval(this.timer1);
    clearInterval(this.timer2);
  },
  methods: {
    init() {
      this.ocxInstalled = true;
      //   document.all.DPSDK_OCX.object;
      try {
        this.obj = document.getElementById("DPSDK_OCX");
        this.gWndId = this.obj.DPSDK_CreateSmartWnd(0, 0, 100, 100);
        this.createWndOk = this.obj.DPSDK_GetLastError();
      } catch (e) {
        // console.log(e)
        !!!this.timer2 && this.tipsDyn("OCX控件安装中 请稍等");
        this.ocxInstalled = false;
      }
      if (this.createWndOk === 0) {
        clearInterval(this.timer2);
        this.ButtonCreateWnd_onclick();
        this.ButtonLogin_onclick();
        this.ButtonStartRealplayByWndNo_onclick();
      }
    },
    // 创建窗口
    ButtonCreateWnd_onclick() {
      this.obj.DPSDK_SetWndCount(this.gWndId, 1);
      this.obj.DPSDK_SetSelWnd(this.gWndId, 0);
    },
    // 登录
    ButtonLogin_onclick() {
      let szIp = "222.240.224.39";
      let nPort = "9000";
      let szUsername = "system";
      let szPassword = "hnmj()123888;2018";
      let nRet = this.obj.DPSDK_Login(szIp, nPort, szUsername, szPassword);
      this.ShowCallRetInfo(nRet, "登录");
      if (nRet == 0) {
        this.bLogin = 1;
      }
    },
    // 登出
    ButtonLogout_onclick() {
      if (this.bLogin == 1) {
        this.ShowCallRetInfo(this.obj.DPSDK_Logout(), "登出");
        this.bLogin = 0;
      }
    },
    // 播放视频
    ButtonStartRealplayByWndNo_onclick() {
      var nStreamType = 1;
      var nMediaType = 1;
      var nTransType = 1;
      var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);
      var nRet = this.obj.DPSDK_StartRealplayByWndNo(
        this.gWndId,
        nWndNo,
        this.szCameraId,
        nStreamType,
        nMediaType,
        nTransType
      );
      this.ShowCallRetInfo(nRet, "播放视频");
    },
    // 抓拍
    Button_CapturePictureByWndNo_onclick() {
      var path = this.browseFolder()
      if (!!!path) return
      var code = new Date().getTime().toString().substr(-6);
      var strPicPathName = `${path}煤矿${code}.jpg`;
      alert(strPicPathName)
      var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);
      var nResult = this.obj.DPSDK_CapturePictureByWndNo(
        this.gWndId,
        nWndNo,
        strPicPathName
      );
      this.ShowCallRetInfo(nResult, `抓拍并保存到(${strPicPathName})`);
    },
    // 根据时间回放
    ButtonStartTimePlaybackByWndNo_onclick() {
      //窗口号
      var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);
      //录像来源类型，2设备，3平台
      var nSourceType = 2;
      var nStartTime = (new Date(this.startTime) / 1).toString().slice(0, 10);
      var nEndTime = (new Date(this.endTime) / 1).toString().slice(0, 10);
      var result = this.obj.DPSDK_StartTimePlaybackByWndNo(
        this.gWndId,
        nWndNo,
        this.szCameraId,
        nSourceType,
        nStartTime,
        nEndTime
      );
      if (result != 0) {
        nSourceType = 3;
        result = this.obj.DPSDK_StartTimePlaybackByWndNo(
          this.gWndId,
          nWndNo,
          this.szCameraId,
          nSourceType,
          nStartTime,
          nEndTime
        );
        this.ShowCallRetInfo(result, "双渠道回放");
        return;
      }
      this.ShowCallRetInfo(result, "回放");
    },
    ButtonDownloadRecordByTime_onclick() {
      var path = this.browseFolder()
      if (!!!path) return
      var code = new Date().getTime().toString().substr(-6);
      var szFileName = `${path}录像${code}.dav`;
      //录像来源类型，2设备，3平台
      var nSourceType = 2;
      var nStartTime = (new Date(this.startTime) / 1).toString().slice(0, 10);
      var nEndTime = (new Date(this.endTime) / 1).toString().slice(0, 10);

      var result = this.obj.DPSDK_DownloadRecordByTime(
        szFileName,
        this.szCameraId,
        nSourceType,
        nStartTime,
        nEndTime
      );
      if (result != 0) {
        nSourceType = 3;
        result = this.obj.DPSDK_DownloadRecordByTime(
          szFileName,
          this.szCameraId,
          nSourceType,
          nStartTime,
          nEndTime
        );
        this.ShowCallRetInfo(result, `下载录像并保存到${szFileName}`);
        return;
      }
      this.ShowCallRetInfo(result, `下载录像并保存到${szFileName}`);
    },
    // 广播信息
    ShowCallRetInfo(nRet, strInfo) {
      let str = "";
      if (nRet == 0) {
        str = strInfo + " 成功！";
      } else {
        str = strInfo + "失败！错误码：" + nRet;
        if (nRet == 19 || nRet == 20) {
          str += "，请先加载组织结构！";
        }
      }
      this.RetInfoText = str;
    },
    tipsDyn(tips) {
      var n = 0;
      var str = [".", "..", "...", "....", ".....", "......", "......."];
      this.timer2 = setInterval(() => {
        this.RetInfoText = tips + str[n];
        n++;
        if (n > 5) n = 0;
      }, 200);
    },
    // 获取url中参数
    getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    },
    browseFolder() {
      try {
        var Shell = new ActiveXObject("Shell.Application");
        var Folder = Shell.BrowseForFolder(0, "请选择路径", 64, 17); //起始目录为：我的电脑
        if (Folder != null) {
          Folder = Folder.items(); // 返回 FolderItems 对象
          Folder = Folder.item(); // 返回 Folderitem 对象
          Folder = Folder.Path; // 返回路径
          if (Folder.charAt(Folder.length - 1) != "\\") {
            Folder = Folder + "\\";
          }
          return Folder;
        }
      } catch (e) {
        alert(e.message);
      }
    },
  },
};
</script>

<style scoped>
.mini-video {
  width: 100vw;
  height: 100vh;
}
.mv-view {
  width: 90%;
  height: 80%;
}
.mini-video .mviewl {
  margin: 0 5vw;
  width: 100%;
  height: 100%;
}
.no-ocx-tip {
  width: 90%;
  height: 80%;
  border: 1px solid #000;
}
#RetInfo {
  font-size: 20px;
  padding-left: 5%;
  height: 27px;
  color: #ff6600;
  margin: 22px 5px;
}
.handle-all {
  margin: 0 5vw;
}
.handle-all > * {
  margin-right: 8px;
}
</style>