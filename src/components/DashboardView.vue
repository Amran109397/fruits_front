<template>
  <div class="d-flex" id="wrapper">
    <!-- Sidebar -->
    <div id="sidebar-wrapper" class="bg-dark text-white vh-100">
      <div class="sidebar-heading text-center py-3 border-bottom border-secondary fw-bold">
        Fruits Bag
      </div>
      <div class="list-group list-group-flush">
        <router-link to="/dashboard" class="list-group-item list-group-item-action bg-dark text-white">📊 Dashboard</router-link>
        <router-link to="/core" class="list-group-item list-group-item-action bg-dark text-white">💼 Core Accounting</router-link>
        <router-link to="/sales" class="list-group-item list-group-item-action bg-dark text-white">🧾 Sales</router-link>
        <router-link to="/purchase" class="list-group-item list-group-item-action bg-dark text-white">🛒 Purchase</router-link>
        <router-link to="/bank" class="list-group-item list-group-item-action bg-dark text-white">🏦 Bank</router-link>
        <router-link to="/reports" class="list-group-item list-group-item-action bg-dark text-white">📈 Reports</router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div id="page-content-wrapper" class="flex-grow-1 bg-light">
      <div class="container-fluid py-4">
        <h2 class="fw-bold mb-4 text-center">System Dashboard</h2>

        <!-- Summary Cards -->
        <div class="row g-3 mb-4">
          <div
            v-for="(card, index) in summaryCards"
            :key="index"
            class="col-12 col-sm-6 col-lg-3"
          >
            <div :class="`card text-white bg-${card.color} shadow-sm h-100`">
              <div class="card-body text-center">
                <h6 class="card-title text-uppercase mb-2">{{ card.title }}</h6>
                <h3 class="fw-bold mb-0">{{ formatCurrency(card.value) }}</h3>
                <small>{{ card.subtitle }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row g-3">
          <!-- Line Chart -->
          <div class="col-12 col-lg-8">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-center mb-3">Monthly Sales Overview</h5>
                <canvas id="salesChart" height="150"></canvas>
              </div>
            </div>
          </div>

          <!-- Pie Chart (smaller) -->
          <div class="col-12 col-lg-4">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-center mb-3">Expense vs Income</h5>
                <div class="chart-container" style="height:220px;">
                  <canvas id="pieChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Feature -->
        <div class="card mt-4 shadow-sm">
          <div class="card-body text-center">
            <h5 class="fw-bold">💡 Quick Stats</h5>
            <p class="mb-1">Total Customers: <b>{{ stats.customers }}</b></p>
            <p>Total Vendors: <b>{{ stats.vendors }}</b></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getDashboardSummary } from '../api/apiService'

Chart.register(...registerables)

// Summary Cards Data
const summaryCards = ref([
  { title: 'Loading...', value: '-', subtitle: '', color: 'secondary' }
])

// Extra stats placeholder
const stats = ref({
  customers: 0,
  vendors: 0
})

// Format currency
const formatCurrency = (val) => {
  if (val === '-' || val === null) return '-'
  const num = parseFloat(val)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

onMounted(async () => {
  try {
    const { data } = await getDashboardSummary()

    // ✅ Update Summary Cards
    summaryCards.value = [
      { title: 'Total Sales', value: data.total_sales ?? 0, subtitle: 'All invoices', color: 'primary' },
      { title: 'Total Purchases', value: data.total_purchases ?? 0, subtitle: 'All bills', color: 'danger' },
      { title: 'Bank Balance', value: data.bank_balance ?? 0, subtitle: 'Available', color: 'success' },
      { title: 'Receivable Due', value: data.ar_due ?? 0, subtitle: 'Pending', color: 'warning' }
    ]

    // ✅ Optional stats (if backend sends)
    stats.value.customers = data.total_customers ?? 0
    stats.value.vendors = data.total_vendors ?? 0

    // ✅ Line Chart
    const ctx1 = document.getElementById('salesChart')
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales ($)',
            data: [400, 550, 620, 800, 1050, 950],
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78,115,223,0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' }
        },
        scales: { y: { beginAtZero: true } }
      }
    })

    // ✅ Pie Chart (smaller size)
    const ctx2 = document.getElementById('pieChart')
    new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: ['Purchases', 'Sales'],
        datasets: [
          {
            data: [data.total_purchases ?? 0, data.total_sales ?? 0],
            backgroundColor: ['#e74a3b', '#1cc88a'],
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    })
  } catch (err) {
    console.error('Dashboard API error:', err)
  }
})
</script>

<style scoped>
/* Sidebar styling */
#sidebar-wrapper {
  width: 230px;
}
#wrapper {
  display: flex;
}
.list-group-item:hover {
  background-color: #0d6efd !important;
  color: #fff !important;
  transition: 0.3s;
}
.card {
  border: none;
  border-radius: 1rem;
}
canvas {
  width: 100% !important;
}
</style>
