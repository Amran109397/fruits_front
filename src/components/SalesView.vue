<template>
  <SidebarLayout>
    <div>
      <h2 class="fw-bold mb-4 text-center">Sales Module - Invoices</h2>

      <!-- Top Buttons -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-primary" @click="openInvoiceModal">➕ New Invoice</button>
        <button class="btn btn-outline-secondary" @click="loadInvoices">🔄 Refresh</button>
      </div>

      <!-- Invoice Table -->
      <div class="table-responsive shadow-sm">
        <table class="table table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id">
              <td>{{ invoice.id }}</td>
              <td>{{ invoice.date }}</td>
              <td>{{ invoice.customer_name }}</td>
              <td>{{ Number(invoice.total).toFixed(2) }}</td>
              <td>{{ Number(invoice.paid_amount || 0).toFixed(2) }}</td>
              <td>
                <span v-if="invoice.paid_amount >= invoice.total" class="badge bg-success">Paid ✅</span>
                <span v-else-if="invoice.paid_amount > 0" class="badge bg-info text-dark">Partial 💵</span>
                <span v-else class="badge bg-warning text-dark">Unpaid ⚠️</span>
              </td>
              <td>
                <button class="btn btn-sm btn-info me-1" @click="viewDetails(invoice)">🔍 View</button>
                <button v-if="!invoice.posted_at" class="btn btn-sm btn-success me-1" @click="postInvoice(invoice.id)">📥 Post</button>
                <button v-else class="btn btn-sm btn-danger me-1" @click="unpostInvoice(invoice.id)">📤 Unpost</button>

                <!-- ✅ Received / Receive -->
                <button
                  v-if="invoice.posted_at && invoice.paid_amount < invoice.total"
                  class="btn btn-sm btn-primary"
                  @click="receivePayment(invoice)"
                >💰 Receive</button>

                <button
                  v-else-if="invoice.paid_amount >= invoice.total"
                  class="btn btn-sm btn-outline-success"
                  disabled
                >✅ Received</button>
              </td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="7" class="text-center text-muted">No invoices found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- New Invoice Modal -->
      <div v-if="showInvoiceModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">New Sales Invoice</h5>
              <button type="button" class="btn-close" @click="closeInvoiceModal"></button>
            </div>

            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" v-model="newInvoice.date" />
                </div>
                <div class="col-md-8">
                  <label class="form-label">Customer</label>
                  <select class="form-select" v-model="newInvoice.customer_id">
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

              <h6 class="fw-bold mt-3">Invoice Items</h6>
              <table class="table table-sm table-bordered">
                <thead>
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
                    <td>{{ (item.qty * item.rate).toFixed(2) }}</td>
                    <td><button class="btn btn-sm btn-outline-danger" @click="removeItem(i)">🗑</button></td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-sm btn-outline-secondary" @click="addItem">➕ Add Item</button>

              <div class="mt-3 text-end fw-bold">Total: {{ totalAmount.toFixed(2) }}</div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-success" @click="saveInvoice">💾 Save Invoice</button>
              <button class="btn btn-secondary" @click="closeInvoiceModal">Close</button>
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
import { getSalesInvoices, createSalesInvoice, getCustomers, receiveSalesPayment, postSalesInvoice, unpostSalesInvoice } from '../api/apiService'

const invoices = ref([])
const customers = ref([])
const showInvoiceModal = ref(false)

const newInvoice = ref({
  date: new Date().toISOString().split('T')[0],
  customer_id: '',
  items: [{ description: '', qty: 1, rate: 0 }]
})

// Load Invoices
const loadInvoices = async () => {
  const res = await getSalesInvoices()
  invoices.value = res.data || []
}

// Load Customers
const loadCustomers = async () => {
  const res = await getCustomers()
  customers.value = res.data?.data || []
}

// New Invoice Modal
const openInvoiceModal = async () => {
  if (!customers.value.length) await loadCustomers()
  showInvoiceModal.value = true
}
const closeInvoiceModal = () => (showInvoiceModal.value = false)

// Add/Remove Items
const addItem = () => newInvoice.value.items.push({ description: '', qty: 1, rate: 0 })
const removeItem = (i) => newInvoice.value.items.splice(i, 1)

// Computed total
const totalAmount = computed(() =>
  newInvoice.value.items.reduce((sum, i) => sum + i.qty * i.rate, 0)
)

// Save Invoice
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

// Post/Unpost
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

// Payment receive
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

// View Details
const viewDetails = (invoice) => {
  let msg = `Invoice #${invoice.id}\nCustomer: ${invoice.customer_name}\nTotal: ${invoice.total}\nPaid: ${invoice.paid_amount}`
  alert(msg)
}

onMounted(() => {
  loadInvoices()
  loadCustomers()
})
</script>
