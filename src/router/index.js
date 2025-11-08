import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../components/DashboardView.vue'
import CoreAccountingView from '../components/CoreAccountingView.vue'
import SalesView from '../components/SalesView.vue'
import PurchaseView from '../components/PurchaseView.vue'
import BankView from '../components/BankView.vue'
import ReportsView from '../components/ReportsView.vue'


const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/core', name: 'core', component: CoreAccountingView },
  { path: '/sales', name: 'sales', component: SalesView },
  { path: '/purchase', name: 'purchase', component: PurchaseView },
  { path: '/bank', name: 'bank', component: BankView },
  { path: '/reports', name: 'reports', component: ReportsView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
