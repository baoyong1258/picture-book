import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './assets/style/reset.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
import {
  Message,
  MessageBox,
} from 'element-ui';

Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.config.productionTip = false;

// 自定义指令
// - 拖拽
import './directives';

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
