import './firebase.tethonic';
import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import moment from 'moment';
import { firestorePlugin } from 'vuefire';
import vuetify from '@/plugins/vuetify';
import '@/plugins/echarts';


import App from './App.vue';
import router from './router';
import store from './store';

import 'vue-loading-overlay/dist/vue-loading.css';

Vue.config.productionTip = false;
Vue.prototype.moment = moment;

Vue.use(Loading);
Vue.use(firestorePlugin);

new Vue({
  router,
  store,
  render: h => h(App),
  vuetify,
}).$mount('#app');
