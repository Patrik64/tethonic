import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../components/Home.vue';
import ShowBlock from '../components/ShowBlock.vue';
import TransactionRange from '../components/TransactionRange.vue';
import BlockSum from '../components/BlockSum.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/showblock',
    name: 'showblock',
    component: ShowBlock,
  },
  {
    path: '/transactionrange',
    name: 'transactionrange',
    component: TransactionRange,
  },
  {
    path: '/blocksum',
    name: 'blocksum',
    component: BlockSum,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
