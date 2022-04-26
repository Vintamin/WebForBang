/* <script src = "public\Build\Cesium\Cesium.js"></script> */
var TrailMaterial_1 = {
    PolylineTrailMaterialProperty_1 :function (options) {
        //options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = options.color;
        this.duration = options.duration;
        this._time =  (new Date()).getTime();
    }
}

var PolylineTrailMaterialProperty_1 = TrailMaterial_1.PolylineTrailMaterialProperty_1;

PolylineTrailMaterialProperty_1.prototype.getType = function (time) {
    return 'PolylineTrail_1';
}

PolylineTrailMaterialProperty_1.prototype.getValue = function (time, result) {

    if (!Cesium.defined(result)) {

        result = {};

    }

    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);

    result.image = Cesium.Material.PolylineTrailImage_1;

    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;

    return result;

}

 

PolylineTrailMaterialProperty_1.prototype.equals = function (other) {

    return this === other ||

        (other instanceof PolylineTrailMaterialProperty_1 &&

            Cesium.Property.equals(this._color, other._color))

}

 

Cesium.PolylineTrailMaterialProperty_1 = PolylineTrailMaterialProperty_1;

 

Cesium.Material.PolylineTrailType_1 = 'PolylineTrail_1';

 

Cesium.Material.PolylineTrailImage_1 = require("@/assets/pic2/color4_4.png");

// 注意，网上有很多坑，没有把PolylineTrailImage的重要性介绍的很清楚，需要注意该图片在调试阶段使用渐变色！！！

Cesium.Material.PolylineTrailSource_1 = "czm_material czm_getMaterial(czm_materialInput materialInput)" +
    "{" +
    "czm_material material = czm_getDefaultMaterial(materialInput);" +
    "vec2 st = materialInput.st;" +
    "vec4 colorImage = texture2D(image, vec2(fract(repeat*st.s - time), st.t));" +
    "material.alpha = colorImage.a;" +
    "material.diffuse = (color.rgb);" +
    "return material;" +
    "}";
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType_1, {
    fabric: {
        type: Cesium.Material.PolylineTrailType_1,
        uniforms: {
            color: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
            image: Cesium.Material.PolylineTrailImage_1,
            time: 50,
            repeat:8
        },
        source: Cesium.Material.PolylineTrailSource_1
    },
    translucent: function (material) {
        return true;
    }
});

//注意Cesium.defineProperties会报错，需要改为Object

Object.defineProperties(PolylineTrailMaterialProperty_1.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

export default TrailMaterial_1