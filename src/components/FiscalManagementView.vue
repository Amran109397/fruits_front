<template>
  <SidebarLayout>
    <div class="container-fluid py-3">

      <!-- 🔹 Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-primary mb-1">
            <i class="bi bi-calendar2-week me-2"></i> Fiscal Management
          </h2>
          <p class="text-muted mb-0">
            Manage your fiscal years and accounting periods efficiently.
          </p>
        </div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
            </li>
            <li class="breadcrumb-item active text-dark" aria-current="page">
              Fiscal Management
            </li>
          </ol>
        </nav>
      </div>

      <!-- 🧾 Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm border-0 bg-primary text-white text-center p-3 rounded-4">
            <h6 class="fw-bold mb-1">Total Fiscal Years</h6>
            <h3 class="fw-bolder">{{ fiscalYears.length }}</h3>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm border-0 bg-success text-white text-center p-3 rounded-4">
            <h6 class="fw-bold mb-1">Open Periods</h6>
            <h3 class="fw-bolder">{{ openPeriodsCount }}</h3>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm border-0 bg-danger text-white text-center p-3 rounded-4">
            <h6 class="fw-bold mb-1">Closed Periods</h6>
            <h3 class="fw-bolder">{{ closedPeriodsCount }}</h3>
          </div>
        </div>
      </div>

      

      <div class="row g-4">
        <!-- Fiscal Years -->
        <div class="col-md-5">
          <div class="card shadow border-0 rounded-4">
            <div class="card-header d-flex justify-content-between align-items-center bg-primary text-white rounded-top-4">
              <h5 class="mb-0"><i class="bi bi-calendar3 me-2"></i>Fiscal Years</h5>
              <button class="btn btn-light btn-sm fw-semibold" @click="openFiscalYearModal()">
                <i class="bi bi-plus-circle"></i> Add
              </button>
            </div>
            <div class="card-body">
              <input
                v-model="yearSearch"
                type="text"
                class="form-control form-control-sm mb-3 shadow-sm"
                placeholder="🔍 Search fiscal year..."
              />
              <div class="table-responsive" style="max-height:400px; overflow-y:auto;">
                <table class="table table-hover align-middle">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Name</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="year in filteredFiscalYears"
                      :key="year.id"
                      :class="{'table-primary': selectedFiscalYear?.id === year.id}"
                      @click="selectFiscalYear(year)"
                      style="cursor:pointer"
                    >
                      <td class="fw-semibold">{{ year.name }}</td>
                      <td>{{ formatDate(year.start_date) }} → {{ formatDate(year.end_date) }}</td>
                      <td>
                        <span :class="year.is_locked ? 'badge bg-danger' : 'badge bg-success'">
                          {{ year.is_locked ? 'Locked' : 'Open' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" @click.stop="openFiscalYearModal(year)">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-secondary" @click.stop="toggleLock(year)">
                            <i :class="year.is_locked ? 'bi bi-unlock' : 'bi bi-lock'"></i>
                          </button>
                          <button class="btn btn-outline-danger" @click.stop="deleteFiscalYear(year.id)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredFiscalYears.length === 0">
                      <td colspan="4" class="text-center text-muted">No fiscal years found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Accounting Periods -->
        <div class="col-md-7">
          <div class="card shadow border-0 rounded-4">
            <div class="card-header d-flex justify-content-between align-items-center bg-success text-white rounded-top-4">
              <h5 class="mb-0"><i class="bi bi-calendar-range me-2"></i>Accounting Periods</h5>
              <button class="btn btn-light btn-sm fw-semibold" :disabled="!selectedFiscalYear" @click="openPeriodModal()">
                <i class="bi bi-plus-circle"></i> Add
              </button>
            </div>
            <div class="card-body">
              <div v-if="!selectedFiscalYear" class="alert alert-info shadow-sm">
                <i class="bi bi-info-circle"></i> Select a fiscal year to view its periods.
              </div>
              <div v-else>
                <div class="table-responsive" style="max-height:400px; overflow-y:auto;">
                  <table class="table table-hover align-middle">
                    <thead class="table-light sticky-top">
                      <tr>
                        <th>Name</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="p in filteredPeriods" :key="p.id">
                        <td class="fw-semibold">{{ p.name }}</td>
                        <td>{{ formatDate(p.start_date) }}</td>
                        <td>{{ formatDate(p.end_date) }}</td>
                        <td>
                          <span :class="p.is_closed ? 'badge bg-danger' : 'badge bg-success'">
                            {{ p.is_closed ? 'Closed' : 'Open' }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" @click="openPeriodModal(p)">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-secondary" @click="toggleClose(p)">
                              <i :class="p.is_closed ? 'bi bi-unlock' : 'bi bi-lock'"></i>
                            </button>
                            <button class="btn btn-outline-danger" @click="deletePeriod(p.id)">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="filteredPeriods.length === 0">
                        <td colspan="5" class="text-center text-muted">No periods found</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <div class="modal fade" id="fiscalYearModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content rounded-3 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">{{ fiscalYearForm.id ? 'Edit Fiscal Year' : 'New Fiscal Year' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="fw-semibold">Name</label>
                <input v-model="fiscalYearForm.name" class="form-control shadow-sm" placeholder="e.g., FY 2025" />
              </div>
              <div class="row">
                <div class="col">
                  <label class="fw-semibold">Start Date</label>
                  <input type="date" v-model="fiscalYearForm.start_date" class="form-control shadow-sm" />
                </div>
                <div class="col">
                  <label class="fw-semibold">End Date</label>
                  <input type="date" v-model="fiscalYearForm.end_date" class="form-control shadow-sm" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-primary" @click="saveFiscalYear">Save</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="periodModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content rounded-3 shadow">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">{{ periodForm.id ? 'Edit Period' : 'New Period' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="fw-semibold">Name</label>
                <input v-model="periodForm.name" class="form-control shadow-sm" placeholder="e.g., January 2025" />
              </div>
              <div class="row">
                <div class="col">
                  <label class="fw-semibold">Start Date</label>
                  <input type="date" v-model="periodForm.start_date" class="form-control shadow-sm" />
                </div>
                <div class="col">
                  <label class="fw-semibold">End Date</label>
                  <input type="date" v-model="periodForm.end_date" class="form-control shadow-sm" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-success" @click="savePeriod">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import SidebarLayout from './SidebarLayout.vue'
import api from '../api/apiService'
import { Modal } from 'bootstrap'
import Chart from 'chart.js/auto'

export default {
  name: 'FiscalManagementView',
  components: { SidebarLayout },
  data() {
    return {
      fiscalYears: [],
      periods: [],
      selectedFiscalYear: null,
      yearSearch: '',
      fiscalYearForm: { id: null, name: '', start_date: '', end_date: '' },
      periodForm: { id: null, fiscal_year_id: null, name: '', start_date: '', end_date: '' },
      fiscalModal: null,
      periodModal: null,
      chart: null
    }
  },
  computed: {
    filteredFiscalYears() {
      return this.fiscalYears.filter(y =>
        y.name.toLowerCase().includes(this.yearSearch.toLowerCase())
      )
    },
    filteredPeriods() {
      return this.periods.filter(p => p.fiscal_year_id === this.selectedFiscalYear?.id)
    },
    openPeriodsCount() {
      return this.periods.filter(p => !p.is_closed).length
    },
    closedPeriodsCount() {
      return this.periods.filter(p => p.is_closed).length
    }
  },
  methods: {
    async loadData() {
      try {
        const [fy, p] = await Promise.all([
          api.get('/fiscal-years'),
          api.get('/accounting-periods')
        ])
        this.fiscalYears = fy.data
        this.periods = p.data
        this.renderChart()
      } catch (error) {
        console.error('API load failed:', error)
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-GB')
    },
    selectFiscalYear(y) {
      this.selectedFiscalYear = y
    },
    openFiscalYearModal(item = null) {
      this.fiscalYearForm = item ? { ...item } : { id: null, name: '', start_date: '', end_date: '' }
      this.fiscalModal = new Modal(document.getElementById('fiscalYearModal'))
      this.fiscalModal.show()
    },
    async saveFiscalYear() {
      try {
        this.fiscalYearForm.id
          ? await api.put(`/fiscal-years/${this.fiscalYearForm.id}`, this.fiscalYearForm)
          : await api.post('/fiscal-years', this.fiscalYearForm)
        this.fiscalModal.hide()
        this.loadData()
      } catch (e) {
        alert('Failed to save fiscal year!')
      }
    },
    async toggleLock(y) {
      await api.put(`/fiscal-years/${y.id}`, { ...y, is_locked: !y.is_locked })
      this.loadData()
    },
    async deleteFiscalYear(id) {
      if (confirm('Delete this fiscal year?')) {
        await api.delete(`/fiscal-years/${id}`)
        this.loadData()
      }
    },
    openPeriodModal(p = null) {
      if (!this.selectedFiscalYear) return alert('Select a Fiscal Year first!')
      this.periodForm = p
        ? { ...p }
        : {
            id: null,
            fiscal_year_id: this.selectedFiscalYear.id,
            name: '',
            start_date: '',
            end_date: ''
          }
      this.periodModal = new Modal(document.getElementById('periodModal'))
      this.periodModal.show()
    },
    async savePeriod() {
      try {
        this.periodForm.id
          ? await api.put(`/accounting-periods/${this.periodForm.id}`, this.periodForm)
          : await api.post('/accounting-periods', this.periodForm)
        this.periodModal.hide()
        this.loadData()
      } catch (e) {
        alert('Failed to save period!')
      }
    },
    async toggleClose(p) {
      await api.put(`/accounting-periods/${p.id}`, { ...p, is_closed: !p.is_closed })
      this.loadData()
    },
    async deletePeriod(id) {
      if (confirm('Delete this accounting period?')) {
        await api.delete(`/accounting-periods/${id}`)
        this.loadData()
      }
    },
    renderChart() {
      const open = this.openPeriodsCount
      const closed = this.closedPeriodsCount
      const ctx = document.getElementById('periodStatusChart')
      if (this.chart) this.chart.destroy()
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Open Periods', 'Closed Periods'],
          datasets: [
            {
              data: [open, closed],
              backgroundColor: ['#198754', '#dc3545']
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      })
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f1f8ff;
}
.card {
  border-radius: 12px;
}
.badge {
  font-size: 0.8rem;
}
</style>
