const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const debug = process.env.NODE_ENV !== "production";
let cesiumSource = "./node_modules/cesium/Source";
let cesiumNavigation = "./node_modules/cesium-navigation-es6";
let cesiumWorkers = "../Build/Cesium/Workers";
module.exports = {
  outputDir: "docs", //build输出目录
  assetsDir: "assets", //静态资源目录（js, css, img）
  lintOnSave: false, //是否开启eslint
  // publicPath: '',
  devServer: {
    open: true, //是否自动弹出浏览器页面
    // host: "o34422981m.zicp",
    // port: 80, //修改服务端口号
    https: false, //是否使用https协议
    hotOnly: false, //是否开启热更新
    proxy: {
      //跨域设置
      "/api": {
        // target: 'http://10.238.0.137:8090',//本地地址，目标地址
        target: "http://o34422981m.zicp.vip", // 线上部署地址，目标路径

        changeOrigin: true, //允许跨域
        pathRewrite: {
          //路径重写
          "^/api": "" //这里理解成用‘/api’代替target里面的地址，后面组件中我们掉接口时直接用api代替 比如我要调用'http://40.00.100.100:3002/user/add'，直接写‘/api/user/add’即可
        }
      }
    }
  },
  //设置 build 输出目录
  configureWebpack: {
    output: {
      sourcePrefix: " "
    },
    amd: {
      toUrlUndefined: true
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        "@": path.resolve("src"),
        cesium: path.resolve(__dirname, cesiumSource),
        cesiumNavigation: path.resolve(__dirname, cesiumNavigation)
      }
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Assets"), to: "Assets" }
      ]),
      new CopyWebpackPlugin([
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" }
      ]),
      new CopyWebpackPlugin([
        {
          from: path.join(cesiumSource, "ThirdParty/Workers"),
          to: "ThirdParty/Workers"
        }
      ]),
      new CopyWebpackPlugin([
        { from: path.join("./src", "model"), to: "model3D" }
      ]),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("")
      })
    ],
    module: {
      unknownContextCritical: /^.\/.*$/,
      unknownContextCritical: false
    }
  }
};
