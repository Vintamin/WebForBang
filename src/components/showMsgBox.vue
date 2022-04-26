<template>
    <div class="input-box">
        <div class="big-input-box" v-show="showBox">
            <Icon @click="colseView" class="button-close" type="ios-arrow-down" size="20"></Icon>
            <!-- <Icon type="ios-arrow-down" /> -->
            <div id="show-msg" class="show-msg" v-html="allMsgHtml"></div>
            <div class="input-msg">
                <Icon class="diy-arrow" type="md-arrow-dropright" size="22" />
                <textarea placeholder="可以运行js或执行命令clear(清屏)与close(关闭)命令" class="text-in" v-model="inputVal" @keydown="checkEnter($event)" rows="1"></textarea>
            </div>
        </div>
        <div v-show="!showBox">
            <!-- <Icon @click="colseView" class="small-input-box" type="md-arrow-dropup-circle" size="40"></Icon>控制台 -->
            <div class="small-input-box" @click="colseView">
                <Icon type="ios-arrow-up" size="20"></Icon>控制台
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'inputBox',
    data() {
        return {
            // 输入框内容
            inputVal: '',
            // 控制台是否显示
            showBox: true,
            allMsgHtml: ''
        }
    },
    props: {
        // 初始显示的内容
        msgHtml: {
            type: String,
            default: ''
        },
        // 控制台是否显示
        isShow: {
            type: Boolean,
            default: false
        },
        // 新增内容
        plusMsgHtml: {
            type: String,
            default: ''
        }
    },
    created() {
        this.showBox = this.isShow;
        if ( this.plusMsgHtml == '' ) {
            this.allMsgHtml = this.msgHtml;
            return
        }
        this.allMsgHtml = '<p>' + this.msgHtml + '</p>' + '<p>' + this.plusMsgHtml + '</p>'
    },
    watch: {
        isShow(val) {
            this.showBox = val
            if(this.showBox){
                return;
            }else {
            this.allMsgHtml='';
            }
        },
        plusMsgHtml(val) {
            if(val=='') {
                this.allMsgHtml ='';
                return;
            }
            this.allMsgHtml = this.allMsgHtml + '<p>' + val + '</p>'
            this.$nextTick(() => {
                this.showBox && document.getElementById('show-msg').scroll({top:999,left:0,behavior:'smooth' });
            })
        },
        msgHtml(val) {
            this.allMsgHtml = '<p>' + val + '</p>'
        }
    },
    methods: {
        checkEnter(e) {
            var et = e || window.event;
            var keycode = et.charCode || et.keyCode;
            if (keycode == 13) {
                if (['clear', 'Clear', 'clear()', 'Clear()'].indexOf(this.inputVal) > -1) {
                    this.allMsgHtml = '';
                    this.inputVal = '';
                    window.event.returnValue = false;
                    return;
                }
                if (['close', 'close', 'close()', 'Close()'].indexOf(this.inputVal) > -1) {
                    this.inputVal = '';
                    this.colseView()
                    window.event.returnValue = false;
                    return;
                }
                this.evalJS()
                window.event.returnValue = false;
            }
        },
        colseView() {
            this.showBox = !this.showBox;
            this.$nextTick(() => {
                this.showBox && document.getElementById('show-msg').scroll({top:999,left:0,behavior:'smooth' });
            })
            this.allMsgHtml='';
        },
        evalJS() {
            try {
                this.allMsgHtml = this.allMsgHtml + '<div style="border-top:1px solid #dddee1">' +  eval(this.inputVal) + '</div>';
                this.inputVal = ''
                this.$nextTick(() => {
                    document.getElementById('show-msg').scroll({top:999,left:0,behavior:'smooth' });
                })
            } catch {
                this.allMsgHtml = this.allMsgHtml + '<div style="border-top:1px solid #dddee1;color:red">' + 'Error' + '</div>';
                this.inputVal = ''
                this.$nextTick(() => {
                    document.getElementById('show-msg').scroll({top:999,left:0,behavior:'smooth' });
                })
            }
        }
    }
}
</script>

<style scoped>
.input-box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
}
.big-input-box {
    width: 100%;
    height: 200px;
    background-color: #f8f8f9;
    /* opacity: .9; */
}
.small-input-box {
    width: 100%;
    height: 17px;
    background-color: #e8eaec;
    /* opacity: .7; */
    bottom: 0;
    left: 0;
    cursor: pointer;
    z-index: 999;
    padding-left: calc(50% - 10px);
}
.show-msg {
    width: calc(100% - 10px);
    height: 160px;
    position: absolute;
    top: 0;
    margin: 17px 10px 10px 10px;
    overflow-y: scroll;
    z-index: 0;
    border: 1px solid #ccc;
    white-space: normal
}
.show-msg >>> div:before,
.show-msg >>> p:before {
    content:"> "; 
    color:#808695;
}
.input-msg {
    position: absolute;
    bottom: 0;
    width: 100%;
    /* padding: 0 10px; */
}
.text-in {
    width: 100%;
    resize: none;
    overflow: auto;
    word-break: break-all; 
    border: none;
    outline: none;
    text-indent:2em;
}
/* 滚动条 */
.show-msg::-webkit-scrollbar{
  width:10px;
  height:10px;
  /**/
}
.show-msg::-webkit-scrollbar-track{
  background: rgb(239, 239, 239);
  border-radius:2px;
}
.show-msg::-webkit-scrollbar-thumb{
  background: #bfbfbf;
  border-radius:10px;
}
.show-msg::-webkit-scrollbar-thumb:hover{
  background: #333;
}
.show-msg::-webkit-scrollbar-corner{
  background: #179a16;
}
.diy-arrow {
    position: absolute;
    bottom: 2px;
    left: 0;
    color: #2d8cf0;
}
.button-close {
    position: absolute;
    bottom: 181px;
    right: 50%;
    cursor: pointer;
    z-index: 999;
}
</style>