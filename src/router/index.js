import { createRouter, createWebHistory } from 'vue-router'
import nhs from '../views/nhs.vue'
import page from '../views/page.vue' 
import videoPlayer from '../views/video_view.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: nhs
  }, 
  {
    path: '/page/:pathMatch(.*)*',
    name: 'Page',
    component: page
  },
  {
    path: '/video/:id',
    name:'VideoView',
    component: videoPlayer
  }
  // {
  //   path: '/:pathMatch(.*)*',
  //   redirect: '/'
  // }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 