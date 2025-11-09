<template>
  <SidebarLayout>
    <div class="p-4 sales-bg">
      <div class="card shadow-lg border-0 rounded-4 p-4 bg-light">
        <h2 class="fw-bold mb-4 text-center text-gradient">
          🧾 Sales Module - Invoices
        </h2>

        <!-- Top Buttons -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-gradient-primary shadow-sm" @click="openInvoiceModal">
            ➕ New Invoice
          </button>
          <button class="btn btn-outline-dark shadow-sm" @click="loadInvoices">
            🔄 Refresh
          </button>
        </div>

        <!-- Invoice Table -->
        <div class="table-responsive rounded-3 overflow-hidden shadow-sm">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-header text-white">
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in invoices" :key="invoice.id" class="table-row">
                <td>{{ invoice.id }}</td>
                <td>{{ invoice.date }}</td>
                <td>{{ invoice.customer_name }}</td>
                <td class="text-success fw-semibold">
                  ${{ Number(invoice.total).toFixed(2) }}
                </td>
                <td class="text-primary fw-semibold">
                  ${{ Number(invoice.paid_amount || 0).toFixed(2) }}
                </td>
                <td>
                  <span
                    v-if="invoice.paid_amount >= invoice.total"
                    class="badge bg-success bg-gradient px-3 py-2"
                    >Paid ✅</span
                  >
                  <span
                    v-else-if="invoice.paid_amount > 0"
                    class="badge bg-info text-dark bg-gradient px-3 py-2"
                    >Partial 💵</span
                  >
                  <span
                    v-else
                    class="badge bg-warning text-dark bg-gradient px-3 py-2"
                    >Unpaid ⚠️</span
                  >
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-info me-1 shadow-sm" @click="viewDetails(invoice)">
                    🔍 View
                  </button>
                  <button
                    v-if="!invoice.posted_at"
                    class="btn btn-sm btn-success me-1 shadow-sm"
                    @click="postInvoice(invoice.id)"
                  >
                    📥 Post
                  </button>
                  <button
                    v-else
                    class="btn btn-sm btn-danger me-1 shadow-sm"
                    @click="unpostInvoice(invoice.id)"
                  >
                    📤 Unpost
                  </button>

                  <button
                    v-if="invoice.posted_at && invoice.paid_amount < invoice.total"
                    class="btn btn-sm btn-gradient-primary shadow-sm"
                    @click="receivePayment(invoice)"
                  >
                    💰 Receive
                  </button>

                  <button
                    v-else-if="invoice.paid_amount >= invoice.total"
                    class="btn btn-sm btn-outline-success shadow-sm"
                    disabled
                  >
                    ✅ Received
                  </button>
                </td>
              </tr>
              <tr v-if="invoices.length === 0">
                <td colspan="7" class="text-center text-muted py-3">
                  No invoices found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- New Invoice Modal -->
      <div
        v-if="showInvoiceModal"
        class="modal fade show d-block"
        style="background: rgba(0, 0, 0, 0.6)"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header bg-gradient-primary text-white rounded-top-4">
              <h5 class="modal-title">🧾 New Sales Invoice</h5>
              <button type="button" class="btn-close" @click="closeInvoiceModal"></button>
            </div>

            <div class="modal-body bg-light">
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold">Date</label>
                  <input type="date" class="form-control shadow-sm" v-model="newInvoice.date" />
                </div>
                <div class="col-md-8">
                  <label class="form-label fw-bold">Customer</label>
                  <select class="form-select shadow-sm" v-model="newInvoice.customer_id">
                    <option disabled value="">Select Customer</option>
                    <template v-if="customers.length">
                      <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </template>
                    <template v-else>
                      <option disabled>Loading customers...</option>
                    </template>
                  </select>
                </div>
              </div>

              <h6 class="fw-bold mt-4 border-bottom pb-2 text-primary">🧮 Invoice Items</h6>
              <table class="table table-sm table-bordered bg-white rounded-3 shadow-sm">
                <thead class="table-secondary">
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in newInvoice.items" :key="i">
                    <td><input type="text" class="form-control" v-model="item.description" /></td>
                    <td><input type="number" class="form-control" v-model.number="item.qty" /></td>
                    <td><input type="number" class="form-control" v-model.number="item.rate" /></td>
                    <td class="fw-semibold text-end">${{ (item.qty * item.rate).toFixed(2) }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-danger rounded-circle" @click="removeItem(i)">
                        🗑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-sm btn-outline-primary" @click="addItem">➕ Add Item</button>

              <div class="mt-3 text-end fw-bold text-dark border-top pt-2">
                💰 Total Amount: <span class="text-success">{{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <div class="modal-footer bg-light rounded-bottom-4">
              <button class="btn btn-success shadow-sm" @click="saveInvoice">💾 Save Invoice</button>
              <button class="btn btn-secondary shadow-sm" @click="closeInvoiceModal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import SidebarLayout from './SidebarLayout.vue'
import {
  getSalesInvoices,
  createSalesInvoice,
  getCustomers,
  receiveSalesPayment,
  postSalesInvoice,
  unpostSalesInvoice
} from '../api/apiService'

const invoices = ref([])
const customers = ref([])
const showInvoiceModal = ref(false)

const newInvoice = ref({
  date: new Date().toISOString().split('T')[0],
  customer_id: '',
  items: [{ description: '', qty: 1, rate: 0 }]
})

const loadInvoices = async () => {
  const res = await getSalesInvoices()
  invoices.value = res.data || []
}
const loadCustomers = async () => {
  const res = await getCustomers()
  customers.value = res.data?.data || []
}

const openInvoiceModal = async () => {
  if (!customers.value.length) await loadCustomers()
  showInvoiceModal.value = true
}
const closeInvoiceModal = () => (showInvoiceModal.value = false)

const addItem = () => newInvoice.value.items.push({ description: '', qty: 1, rate: 0 })
const removeItem = (i) => newInvoice.value.items.splice(i, 1)

const totalAmount = computed(() =>
  newInvoice.value.items.reduce((sum, i) => sum + i.qty * i.rate, 0)
)

const saveInvoice = async () => {
  try {
    const payload = {
      date: newInvoice.value.date,
      customer_id: newInvoice.value.customer_id,
      items: newInvoice.value.items
    }
    const res = await createSalesInvoice(payload)
    if (res.data?.success) {
      alert(res.data.message)
      closeInvoiceModal()
      await loadInvoices()
    } else {
      alert('Failed to save invoice ❌')
    }
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to save invoice ❌')
  }
}

const postInvoice = async (id) => {
  const res = await postSalesInvoice(id)
  alert(res.data?.message || 'Posted ✅')
  await loadInvoices()
}
const unpostInvoice = async (id) => {
  const res = await unpostSalesInvoice(id)
  alert(res.data?.message || 'Unposted ⚙️')
  await loadInvoices()
}

const receivePayment = async (invoice) => {
  const due = invoice.total - (invoice.paid_amount || 0)
  const amount = prompt(`Enter amount to receive (Due: ${due.toFixed(2)})`)
  if (!amount || isNaN(amount)) return alert('Invalid amount.')

  try {
    const payload = {
      invoice_id: invoice.id,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0]
    }
    const res = await receiveSalesPayment(payload)
    if (res.data?.success) {
      alert('✅ Payment received successfully!')
      await loadInvoices()
    } else {
      alert('Failed to receive payment ❌')
    }
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to receive payment ❌')
  }
}

const viewDetails = (invoice) => {
  let msg = `Invoice #${invoice.id}\nCustomer: ${invoice.customer_name}\nTotal: ${invoice.total}\nPaid: ${invoice.paid_amount}`
  alert(msg)
}

onMounted(() => {
  loadInvoices()
  loadCustomers()
})
</script>

<style scoped>
.sales-bg {
  background: linear-gradient(135deg, #f5f7fa, #e4ebf7);
  min-height: 100vh;
}
.text-gradient {
  background: linear-gradient(to right, #007bff, #00bcd4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.btn-gradient-primary {
  background: linear-gradient(to right, #007bff, #00bcd4);
  color: #fff;
  border: none;
}
.btn-gradient-primary:hover {
  background: linear-gradient(to right, #0056b3, #0097a7);
  color: #fff;
}
.table-header {
  background: linear-gradient(to right, #007bff, #00bcd4);
}
.table-row:hover {
  background-color: #f1f8ff;
  transition: 0.3s;
}
.bg-gradient-primary {
  background: linear-gradient(to right, #007bff, #00bcd4);
}
</style>
