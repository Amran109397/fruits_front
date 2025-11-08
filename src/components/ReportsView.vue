<template>
  <SidebarLayout>
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4 text-center text-primary">
        📈 Financial Reports & Aging Summary
      </h2>

      <!-- Tabs -->
      <ul class="nav nav-pills justify-content-center mb-4">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'ar' }"
            @click="activeTab = 'ar'"
          >
            🧾 Accounts Receivable
          </button>
        </li>
        <li class="nav-item ms-2">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'ap' }"
            @click="activeTab = 'ap'"
          >
            💰 Accounts Payable
          </button>
        </li>
      </ul>

      <!-- Cards Summary -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4" v-for="(card, i) in summaryCards" :key="i">
          <div :class="`card text-white bg-${card.color} shadow-sm h-100`">
            <div class="card-body text-center">
              <h6 class="text-uppercase mb-1">{{ card.title }}</h6>
              <h3 class="fw-bold">{{ formatMoney(card.value) }}</h3>
              <small>{{ card.subtitle }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3">
            {{ activeTab === 'ar' ? 'Receivable Aging (Customers)' : 'Payable Aging (Vendors)' }}
          </h5>
          <div class="chart-container" style="height:280px;">
            <canvas id="agingPieChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card shadow-sm">
        <div class="card-body table-responsive">
          <table class="table table-bordered table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>{{ activeTab === 'ar' ? 'Customer Name' : 'Vendor Name' }}</th>
                <th class="text-end">0–30 Days</th>
                <th class="text-end">31–60 Days</th>
                <th class="text-end">Over 60 Days</th>
                <th class="text-end text-primary">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in tableData" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ row.name }}</td>
                <td class="text-end">{{ formatMoney(row.due_0_30) }}</td>
                <td class="text-end">{{ formatMoney(row.due_31_60) }}</td>
                <td class="text-end">{{ formatMoney(row.due_over_60) }}</td>
                <td class="text-end fw-bold text-primary">
                  {{ formatMoney(totalRow(row)) }}
                </td>
              </tr>
              <tr v-if="tableData.length === 0">
                <td colspan="6" class="text-center text-muted py-3">
                  No records found
                </td>
              </tr>
              <tr v-else class="table-secondary fw-semibold">
                <td colspan="2" class="text-end">Total</td>
                <td class="text-end">{{ formatMoney(grandTotals.due_0_30) }}</td>
                <td class="text-end">{{ formatMoney(grandTotals.due_31_60) }}</td>
                <td class="text-end">{{ formatMoney(grandTotals.due_over_60) }}</td>
                <td class="text-end text-primary">{{ formatMoney(grandTotals.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import SidebarLayout from './SidebarLayout.vue'

Chart.register(...registerables)

// State
const activeTab = ref('ar')
const tableData = ref([])
const grandTotals = ref({ due_0_30: 0, due_31_60: 0, due_over_60: 0, total: 0 })
const summaryCards = ref([
  { title: '0–30 Days', value: 0, subtitle: 'Recent dues', color: 'success' },
  { title: '31–60 Days', value: 0, subtitle: 'Moderate dues', color: 'warning' },
  { title: 'Over 60 Days', value: 0, subtitle: 'Long outstanding', color: 'danger' }
])
let pieChart = null

// Format money safely
const formatMoney = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// Calculate row total safely
const totalRow = (r) =>
  Number(r.due_0_30 || 0) +
  Number(r.due_31_60 || 0) +
  Number(r.due_over_60 || 0)

// Fetch data
const fetchReport = async () => {
  const url =
    activeTab.value === 'ar'
      ? 'http://127.0.0.1:8000/api/reports/ar-aging'
      : 'http://127.0.0.1:8000/api/reports/ap-aging'
  const { data } = await axios.get(url)
  tableData.value = data || []
  calcTotals()
  drawPie()
}

// Calculate totals safely
const calcTotals = () => {
  const totals = { due_0_30: 0, due_31_60: 0, due_over_60: 0, total: 0 }
  for (const r of tableData.value) {
    totals.due_0_30 += Number(r.due_0_30 || 0)
    totals.due_31_60 += Number(r.due_31_60 || 0)
    totals.due_over_60 += Number(r.due_over_60 || 0)
    totals.total += Number(totalRow(r) || 0)
  }
  grandTotals.value = totals
  summaryCards.value = [
    { title: '0–30 Days', value: totals.due_0_30, subtitle: 'Recent dues', color: 'success' },
    { title: '31–60 Days', value: totals.due_31_60, subtitle: 'Moderate dues', color: 'warning' },
    { title: 'Over 60 Days', value: totals.due_over_60, subtitle: 'Long outstanding', color: 'danger' }
  ]
}

// Draw pie chart
const drawPie = () => {
  const ctx = document.getElementById('agingPieChart')
  const dataset = [
    Number(grandTotals.value.due_0_30 || 0),
    Number(grandTotals.value.due_31_60 || 0),
    Number(grandTotals.value.due_over_60 || 0)
  ]

  if (pieChart) pieChart.destroy()

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['0–30 Days', '31–60 Days', 'Over 60 Days'],
      datasets: [
        {
          data: dataset,
          backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b'],
          hoverOffset: 8
        }
      ]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

// Reload data on tab switch
watch(activeTab, async () => {
  await fetchReport()
})

onMounted(async () => {
  await fetchReport()
})
</script>

<style scoped>
.nav-pills .nav-link {
  color: #0d6efd;
  border: 1px solid #0d6efd;
  background-color: #fff;
  transition: 0.3s;
}
.nav-pills .nav-link.active {
  background-color: #0d6efd !important;
  color: #fff !important;
}
.table td,
.table th {
  vertical-align: middle;
}
.chart-container {
  position: relative;
}
.card {
  border-radius: 0.75rem;
}
</style>
