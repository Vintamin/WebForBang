import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    consoleMsg: "",
    twoDimensional: false,
    showListCheck: {
      rockChecked: false,
      sectionChecked: false,
      shotChecked: false,
      blastChecked: false,
      routeChecked: false,
      organizationChecked: false,
      processChecked: false
    },
  },
  mutations: {
    SET_CMSG(state, consoleMsg) {
      state.consoleMsg = consoleMsg;
    },
    setShowCheck(state, payload) {
      state.showListCheck[payload.key] = payload.checked;
    },
    setTwoDimensional(state, res) {
      state.twoDimensional = res;
    },
    setCtx(state, payLoad) {
      state[payLoad.type] = payLoad.ctxImg;
    }
  },
  actions: {
    setCMsg: ({ commit }, consoleMsg) => {
      commit("SET_CMSG", consoleMsg);
    }
  }
});
