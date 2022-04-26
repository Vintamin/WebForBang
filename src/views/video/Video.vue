<template>
    <div class="online-video">
        <div class="header">工业视频联网</div>
        <!-- 设备列表 -->
        <div class="bode-tree" v-if="!!nodeTree">
            <div class="tree-tit">组织单位</div>
            <div class="lv1tree" v-for="(item1, i) in nodeTree" :key="i">
                <div class="title"  @click="hideShow(`${i}`)"><span :id="`p-icon${i}`">+</span><span :id="`d-icon${i}`" style="display:none">-&nbsp;</span><span>{{ item1['_name'] }}</span></div>
                <div :id="`con${i}`" v-show="v1">
                    <div class="lv1cha" v-for="(cha1, l) in item1.Channel" :key="'1-' + l" v-show="!item1.Department">
                        <div class="title" @click="SelectStartRealplayNo(cha1['_id'])" v-if="cha1">&nbsp;&nbsp;&nbsp;&nbsp;<span>{{ cha1['_name'] }}</span><span v-if="cha1['_status'] == 0">[在线]</span></div>
                    </div>
                    <div class="lv2tree" v-for="(item2, j) in item1.Department" :key="j">
                        <div class="title"  @click="hideShow(`${i}-${j}`)">&nbsp;&nbsp;&nbsp;&nbsp;<span :id="`p-icon${i}-${j}`">+</span><span :id="`d-icon${i}-${j}`" style="display:none">-&nbsp;</span><span>{{ item2['_name'] }}</span></div>
                        <div :id="`con${i}-${j}`" v-show="v2">
                            <div class="lv2cha" v-for="(cha2, m) in item1.Channel" :key="'2-' + m" v-show="!item2.Department">
                                <div class="title" @click="SelectStartRealplayNo(cha2['_id'])" v-if="cha2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>{{ cha2['_name'] }}</span><span v-if="cha2['_status'] == 0">[在线]</span></div>
                            </div>
                            <div class="lv3tree" v-for="(item3, k) in item2.Department" :key="k">
                                <div class="title"  @click="hideShow(`${i}-${j}-${k}`)">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span :id="`p-icon${i}-${j}-${k}`">+</span><span :id="`d-icon${i}-${j}-${k}`" style="display:none">-&nbsp;</span><span>{{ item3['_name'] }}</span></div>
                                <div :id="`con${i}-${j}-${k}`" v-show="v3">
                                    <div class="lv3cha" v-for="(cha3, n) in item3.Channel" :key="'3-' + n">
                                        <div class="title" @click="SelectStartRealplayNo(cha3['_id'])" v-if="cha3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>{{ cha3['_name'] }}</span><span v-if="cha3['_status'] == 0">[在线]</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 视频 -->
        <div class="main-video">
            <!-- 主窗口 -->
            <div class="mv-view">
                <div class="oozcx mviewl" v-if="ocxInstalled">
                    <object id="DPSDK_OCX" classid="CLSID:D3E383B6-765D-448D-9476-DFD8B499926D" codebase="/Build/ActiveX/DpsdkOcx.cab#version=1.0.0.0"  style="width: 100%; height: 100%" ></object>
                </div>
                <div class="no-ocx-tip mviewl" v-else></div>
            </div>
            <!-- 信息提示 -->
            <div style="width: 90%;height: 30px;overflow: auto;" id="RetInfo">状态：{{RetInfoText}}</div>
            <!-- 操作 -->
            <div class="handle-all">
                <div class="bbc">
                    <input type="number" id="numWndCount" class="wnd-input numWndCount" value="4">
                    <i-button type="primary" id="buttonSetWndCount" @click="ButtonSetWndCount_onclick()">窗口数量设置</i-button>
                </div>
                <i-button type="primary" class="i-button-cl" @click="Button_CapturePictureByWndNo_onclick()">图像抓拍</i-button>
                <i-button type="primary" class="i-button-cl" @click="ButtonStartRealplayByWndNo_onclick()">播放视频</i-button>
                <i-button type="primary" class="i-button-cl" @click="ButtonStopRealplayByWndNo_onclick()">关闭视频</i-button>
                <div class="re-play bbc">
                    <input type="number" id="start-time-y" class="wnd-input start-time-y" value="2020">年
                    <input type="number" id="start-time-m" class="wnd-input start-time-m" value="08">月
                    <input type="number" id="start-time-d" class="wnd-input start-time-d" value="03">日&nbsp;&nbsp;至&nbsp;&nbsp;
                    <input type="number" id="end-time-y" class="wnd-input end-time-y" value="2020">年
                    <input type="number" id="end-time-m" class="wnd-input end-time-m" value="08">月
                    <input type="number" id="end-time-d" class="wnd-input end-time-d" value="04">日
                    <i-button type="primary" @click="ButtonStartTimePlaybackByWndNo_onclick()">回放</i-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import x2js from 'x2js'
var x2j = new x2js()
export default {
    name: 'onlineVideo',
    data() {
        return {
            gWndId: 0, // 主窗口ID
            bLogin: 0, // 登陆状态
            obj: null, // DPSDK_OCX
            RetInfoText: '等待窗口初始化',  // tips
            createWndOk: -1, // 窗口状态
            szCameraId: '', // 视频源ID
            preTree: {},  // xml
            nodeTree: [], // tree
            ocxInstalled: true, // ocx安装状态
            timer1: null, // 初始化定时器
            timer2: null, // 动态提示定时器
            v1: false, // 一级菜单状态
            v2: false, // 二级菜单状态
            v3: false, // 三级菜单状态
            vkk: '+' // icon
        }
    },
    created() {
        !this.isLegalUser() && this.$router.replace({path: "/404"});
    },
    mounted() {
        this.timer1 = setInterval(() => {
            this.createWndOk !== 0 && this.init();
            this.createWndOk === 0 && clearInterval(this.timer1)
        },2000)
    },
    beforeDestroy() {
        this.ButtonLogout_onclick();
        clearInterval(this.timer1);
        clearInterval(this.timer2);
    },
    methods: {
        /**
         * init() 初始化
         * 1.ocx控件下载安装
         * 2.窗口初始化
         * 3.登录并异步加载组织结构
         * 4.组织结构解析
         * 5.导航菜单初构建
         * 注：methonds：DSK Function(SDK) 与 DIY Function(开发者)
         */
        init() {
            this.ocxInstalled = true;
            (document.all.DPSDK_OCX.object)
            this.setDateLong();
            try {
                this.obj = document.getElementById("DPSDK_OCX");
                this.gWndId = this.obj.DPSDK_CreateSmartWnd(0, 0, 100, 100);
                this.createWndOk = this.obj.DPSDK_GetLastError();
            }
            catch(e) {
                // console.log(e)
                !!!this.timer2 && this.tipsDyn('OCX控件安装中 请稍等')
                this.ocxInstalled = false;
            }
            if (this.createWndOk === 0) {
                clearInterval(this.timer2);
                this.ButtonCreateWnd_onclick();
                this.ButtonLogin_onclick();
                this.ButtonLoadDGroupInfo_onclick();
                this.ButtonGetDGroupInfo_onclick();
                this.nodeTree = this.deepClone(this.preTree.Department.Department)
            }
        },
        /**
         * DSK Function
         */
        // 选择播放
        SelectStartRealplayNo(id) {
            this.szCameraId = id;
            this.ButtonStartRealplayByWndNo_onclick();
        },
        // 创建窗口
        ButtonCreateWnd_onclick() {
            this.obj.DPSDK_SetWndCount(this.gWndId, 4); 
            this.obj.DPSDK_SetSelWnd(this.gWndId, 0); 
        },
        // 登录
        ButtonLogin_onclick() {
            let szIp = '222.240.224.39';
            let nPort = '9000';
            let szUsername = 'system';
            let szPassword = 'hnmj()123888;2018';
            let nRet = this.obj.DPSDK_Login(szIp, nPort, szUsername, szPassword);
            this.ShowCallRetInfo(nRet, "登录");
            if(nRet == 0) {
                this.bLogin = 1;
            }
        },
        // 登出
        ButtonLogout_onclick() {
            if( this.bLogin == 1)
            {
                this.ShowCallRetInfo(this.obj.DPSDK_Logout(), "登出");
                this.bLogin = 0;
            }
        },
        // 加载组织结构
        ButtonLoadDGroupInfo_onclick() {
	        this.ShowCallRetInfo(this.obj.DPSDK_LoadDGroupInfo(), "加载组织结构");
        },
        // 异步加载组织结构
        ButtonAsyncLoadDGroupInfo_onclick() {
            this.obj.DPSDK_SetCompressType(1);
            this.ShowCallRetInfo(this.obj.DPSDK_AsyncLoadDGroupInfo(), "异步加载组织结构");
        },
        // 获取组织结构
        ButtonGetDGroupInfo_onclick() {
            var xml = this.obj.DPSDK_GetDGroupStr();
            var x = x2j.xml2js(xml)
            this.preTree = x.Organization;
        },
        // 播放视频
        ButtonStartRealplayByWndNo_onclick() {
            var nStreamType = 1;
            var nMediaType = 1;
            var nTransType = 1;
            var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);
            var nRet = this.obj.DPSDK_StartRealplayByWndNo(this.gWndId, nWndNo, this.szCameraId, nStreamType, nMediaType, nTransType);
            this.ShowCallRetInfo(nRet, "播放视频");
        },
        // 停止播放
        ButtonStopRealplayByWndNo_onclick() {
            var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);
            var nResult = this.obj.DPSDK_StopRealplayByWndNo(this.gWndId, nWndNo)
            this.ShowCallRetInfo(nResult, '停止播放');
            
        },
        // 抓拍
        Button_CapturePictureByWndNo_onclick() {
            var code = new Date().getTime().toString().substr(-6);
            var strPicPathName = `D:\\pic${code}.jpg`;
            var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);      
            var nResult = this.obj.DPSDK_CapturePictureByWndNo(this.gWndId, nWndNo, strPicPathName);
            this.ShowCallRetInfo(nResult, `抓拍(D:\\pic${code}.jpg)`);
        },
        // 窗口数量设置
        ButtonSetWndCount_onclick() {
            let nWndCount = document.getElementById("numWndCount").value;
            var result = this.obj.DPSDK_SetWndCount(this.gWndId, nWndCount);
            this.ShowCallRetInfo(result, '窗口数量设置');

        },
        // 根据时间回放
        ButtonStartTimePlaybackByWndNo_onclick() {
            //窗口号
            var nWndNo = this.obj.DPSDK_GetSelWnd(this.gWndId);
            //视频通道ID
            // var szCameraId = "1000000$1$0$0";
            //录像来源类型，2设备，3平台
            var nSourceType = 2;
            //录像类型,0全部
            var nRecordType = 0;
            var nStartTime = this.getTime('start');
            console.log(nStartTime)
            var nEndTime = this.getTime('end');
            console.log(nEndTime)
            var result = this.obj.DPSDK_StartTimePlaybackByWndNo(this.gWndId, nWndNo, this.szCameraId, nSourceType, nStartTime, nEndTime);
            if (result != 0) {
                nSourceType = 3;
                result = this.obj.DPSDK_StartTimePlaybackByWndNo(this.gWndId, nWndNo, this.szCameraId, nSourceType, nStartTime, nEndTime);
                this.ShowCallRetInfo(result, '双渠道回放')
                return;
            }
            this.ShowCallRetInfo(result, '回放')
        },
        // 广播信息
        ShowCallRetInfo(nRet, strInfo) {
            let str = "";
            if(nRet == 0)
            {
                str = strInfo + " 成功！";
            }
            else
            {
                str = strInfo + "失败！错误码：" + nRet;
                if(nRet == 19 || nRet == 20)
                {
                    str += "，请先加载组织结构！";
                }
            }
            this.RetInfoText = str;
        },
        /**
         * DIY Function
         */
        // 获取inputInt值
        getValueById(id) {
            return parseInt(document.getElementById(id).value);
        },
        // 获取时间
        getTime(t) {
            if (t == 'start') {
                var y1 = this.getValueById('start-time-y')
                var m1 = this.getValueById('start-time-m')
                var d1 = this.getValueById('start-time-d')
                var str1 = `${y1}-${m1}-${d1} 00:00:00`
                return this.getLongTimeByStr(str1)
            } else {
                var y2 = this.getValueById('end-time-y')
                var m2 = this.getValueById('end-time-m')
                var d2 = this.getValueById('end-time-d')
                var str2 = `${y2}-${m2}-${d2} 00:00:00`
                return this.getLongTimeByStr(str2)
            }
        },
        // 解析xmlTree
        deepClone(obj = {}, k) {
            if (obj.Channel instanceof Object && !(obj.Channel instanceof Array)) obj.Channel = [obj.Channel]
            if (obj.Department instanceof Object && !(obj.Department instanceof Array)) obj.Department = [obj.Department]
            if (typeof obj !== 'object' || obj == null) {
                if(k == '_name' || k == '_id') {
                    return obj
                } else {
                    return null
                }
            }
            // 初始化返回结果
            let result
            if (obj instanceof Array) {
                result = []
            } else {
                result = {}
            }
            for (let key in obj) {
                // 保证 key 不是原型的属性
                if (obj.hasOwnProperty(key)) {
                    if (key == 'Device') {
                        // result[key] = obj.Device;
                        var devs = obj.Device;
                        var temp = []
                        if (devs instanceof Object && !(devs instanceof Array)) devs = [devs]
                        for (var i in devs) {
                            let c = this.getDeviceStatus(devs[i]['_id']);
                            temp = temp.concat(c)
                        }
                        result.Device = obj.Device
                        result.Channel = temp;
                    } else if( key == 'Channel') result[key] = result.Channel ? result.Channel : obj.Channel;
                    else result[key] = this.deepClone(obj[key], key)
                }
            }
            // 返回结果
            return result
        },
        // 获取设备状态
        getDeviceStatus(id) {
            var devs = this.preTree.Devices.Device;
            for (let i in devs) {
                if(devs[i]['_id'] == id) {

                    var chan = devs[i].UnitNodes.Channel
                    if (chan instanceof Object && !(chan instanceof Array)) chan = [chan]
                    return chan
                }
            }
            return []
        },
        // 动态提示信息
        tipsDyn(tips) {
            var n = 0;
            var str = ['.','..','...','....','.....','......','.......',];
            this.timer2 = setInterval(() => {
                this.RetInfoText = tips + str[n]
                n ++;
                if(n > 5) n = 0;
            }, 200);
        },
        // Date replace
        setDateLong() {
            Date.prototype.format = function (format) {
                var o = {
                    "M+": this.getMonth() + 1,
                    "d+": this.getDate(),
                    "h+": this.getHours(),
                    "m+": this.getMinutes(),
                    "s+": this.getSeconds(),
                    "q+": Math.floor((this.getMonth() + 3) / 3),
                    "S": this.getMilliseconds()
                }
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }
        },
        // 日期转长整型
        getLongTimeByStr(datestr) {
            var date = new Date(datestr.replace("-", "/").replace("-", "/"));
            return parseInt(date.getTime()/1000);
        },
        // 长整型转日期
        getFormateDateByLong(longtime) {
            var date = new Date();
            date.setTime(longtime);
            return date.format("yyyy-MM-dd hh:mm:ss");
        },
        // 动态tree
        hideShow(lvIndex) {
            let doc = document.getElementById('con' + lvIndex);
            let plus = document.getElementById('p-icon' + lvIndex);
            let decline = document.getElementById('d-icon' + lvIndex);

            if (doc.style.display === 'none') {
                doc.style.display = 'block';
                plus.style.display = 'none'
                decline.style.display = 'inline-block'
            } else {
                doc.style.display = 'none';
                plus.style.display = 'inline-block'
                decline.style.display = 'none'
            }
        },
        // 权限判断
        isLegalUser() {
            return 1;
        }
    }
}
</script>

<style scoped>
.online-video {
    position: relative;
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    background-color: #f5f7f9;
    overflow-x: hidden;
}
/* logo */
.header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    font-size: 35px;
    padding: 22px;
    font-weight: 500;
    color: #fff;
    background-color: #2d8cf0;
}
/* 设备tree */
.bode-tree {
    position: absolute;
    top: 100px;
    left: 0;
    width: 295px;
    height: calc(100vh - 120px);
    padding: 10px;
    overflow-y:scroll;
    white-space: nowrap;
    overflow-x:scroll;
}
.bode-tree .tree-tit {
    font-size: 20px;
    padding: 8px;
    border: #e3e8ee solid 1px;
}
/* 视频窗口 */
.main-video {
    position: absolute;
    top: 100px;
    left: 310px;
    margin: 12px;
}
/* .oozcx {
    z-index: 100;
} */
.main-video .mviewl{
    width: calc(100vw - 350px);
    height: calc(100vh - 300px);

}
.no-ocx-tip {
    width: calc(100vw - 350px);
    height: calc(100vh - 300px);
    border: 1px solid #000;
}
#RetInfo {
    font-size: 20px;
    height: 27px;
    color: #ff6600;
    margin: 22px 5px;
}
.handle-all {
    margin-top: 8px;
}
.handle-all .i-button-cl {
    margin-right: 20px;
}
.bbc {
    display: inline-block;
    border: solid 1px #3399ff;
    margin: 0 20px 0 0;
    border-radius: 4px;
}
/* 公共部分 */
.wnd-input {
    display: inline-block;
    height: 32px;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    color: #515a6e;
    background-color: #fff;
    position: relative;
    cursor: text;
    
}
.wnd-input.numWndCount {
    width: 45px;
}
.wnd-input:hover {
    outline: 0;
    box-shadow: 0px 0px 0px 2px rgba(45, 140, 240, 0.2);
}
.title {
    margin: 0;
    padding: 0 4px;
    border-radius: 3px;
    cursor: pointer;
    vertical-align: top;
    color: #657180;
    font-size: 15px;
}
.title span {
    padding: 3px;
}
.title span:hover {
    background-color: #ebf5ff;
}
.wnd-input.start-time-y,
.wnd-input.end-time-y {
    width: 65px;
}
.wnd-input.start-time-m,
.wnd-input.end-time-m {
    width: 55px;
}
.wnd-input.start-time-d,
.wnd-input.end-time-d {
    width: 55px;
}
</style>