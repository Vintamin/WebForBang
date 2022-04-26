<template>
<div>
    <Checkbox  @on-change="change">地下模式</Checkbox>
</div>

</template>
<script src="public\Build\Cesium\Cesium.js"></script>
<script>
 //import Cesium from "cesium/Cesium.js";
export default {
  data() {
    return {
        EquipmentData: [],
        PersorientatioData: [],
        SensorData: [],
    }
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
    }
  },
  mounted() {
    
          
  },
  methods: {
    change(checked) {
              var scene = viewer.scene;
              var globe = scene.globe;
              //修改地球内部的颜色
              //globe.undergroundColor = Cesium.Color.fromCssColorString("rgba(58, 130, 210, 1)")
              scene.screenSpaceCameraController.enableCollisionDetection = false;
             
             var originalColor =Cesium.Color.fromCssColorString("rgba(58, 130, 210, 1)")
              var originalNearDistance = 1000.0;
              var originalFarDistance = 1000000.0;
              var originalNearAlpha = 0.5; 
              var originalFarAlpha = 1.0;

              var color = originalColor;

        
             var viewModel = {
                enabled: true,
                nearDistance: originalNearDistance,
                farDistance: originalFarDistance,
                nearAlpha: originalNearAlpha,
                farAlpha: originalFarAlpha,
              };

              Cesium.knockout.track(viewModel);
              
              var toolbar = document.getElementById("toolbar");
              Cesium.knockout.applyBindings(viewModel, toolbar);
            
              for (var name in viewModel) {
                if (viewModel.hasOwnProperty(name)) {
                  Cesium.knockout.getObservable(viewModel, name).subscribe(update);
                }
              }
            
   
              function update() {
                globe.undergroundColor = viewModel.enabled ? color : undefined;



                var nearDistance = Number(viewModel.nearDistance);
                nearDistance = isNaN(nearDistance)
                  ? originalNearDistance
                  : nearDistance;

                var farDistance = Number(viewModel.farDistance);
                farDistance = isNaN(farDistance) ? originalFarDistance : farDistance;

                if (nearDistance > farDistance) {
                  nearDistance = farDistance;
                }

                var nearAlpha = Number(viewModel.nearAlpha);
                nearAlpha = isNaN(nearAlpha) ? 0.0 : nearAlpha;

                var farAlpha = Number(viewModel.farAlpha);
                farAlpha = isNaN(farAlpha) ? 1.0 : farAlpha;

                globe.undergroundColorAlphaByDistance.near = nearDistance;
                globe.undergroundColorAlphaByDistance.far = farDistance;
                globe.undergroundColorAlphaByDistance.nearValue = nearAlpha;
                globe.undergroundColorAlphaByDistance.farValue = farAlpha;
              }
               update(); 

       
 
        if (checked == false) {  
                update();    
        }
        else{

        update(); 
        }
                 
       

    },
  }
};
</script>

