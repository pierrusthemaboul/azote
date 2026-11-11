import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import DegustationView from './views/DegustationView.vue'
import LaboView from './views/LaboView.vue'
import ReserverView from './views/ReserverView.vue'
import NotFoundView from './views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    component: HomeView,
    meta: { title: 'AZOTE — Cuisine moléculaire · Lyon' },
  },
  {
    path: '/degustation',
    component: DegustationView,
    meta: { title: 'Le menu — AZOTE' },
  },
  {
    path: '/laboratoire',
    component: LaboView,
    meta: { title: 'Le laboratoire — AZOTE' },
  },
  {
    path: '/reserver',
    component: ReserverView,
    meta: { title: 'Réserver une table — AZOTE' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page introuvable — AZOTE' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash) {
      return new Promise((resolve) => {
        let attempts = 0
        const tryFind = () => {
          if (document.querySelector(to.hash)) {
            resolve({ el: to.hash, top: 72, behavior: 'smooth' })
          } else if (attempts++ < 60) {
            requestAnimationFrame(tryFind)
          } else {
            resolve({ top: 0 })
          }
        }
        tryFind()
      })
    }

    return { top: 0, behavior: 'instant' }
  },
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'AZOTE'
})
