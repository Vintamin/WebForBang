<template>
  <div>
    <Checkbox
      @on-change="change"
      style="margin-top:8px"
      v-model="showsuface"
      :disabled="isDisabled"
      >&#8197;施工进度</Checkbox
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      showsuface: false,
      isDisabled: true
    };
  },
  props: {
    mineid: {
      type: String,
      default: ""
    },
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
  watch: {
    mineid(val) {
      this.showsuface = false;
      this.isDisabled = false;
    }
  },
  methods: {
    change(checked) {
      if (checked == false) {
        this.viewer.entities.removeById(this.mineid);
        return;
      } else {
      }
    }
  }
};
</script>
