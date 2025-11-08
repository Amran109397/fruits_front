<template>
  <SidebarLayout>
    <div class="container-fluid mt-4">
      <h3 class="fw-bold mb-3">
        <i class="bi bi-basket2"></i> Purchase (Bills)
      </h3>

      <!-- Filter & Add -->
      <div class="d-flex align-items-center mb-3">
        <label class="me-2 fw-semibold">Filter by Vendor:</label>
        <select
          v-model="selectedVendor"
          class="form-select w-auto"
          @change="fetchBills"
        >
          <option value="">All Vendors</option>
          <option v-for="v in vendors" :key="v?.id ?? v?.name" :value="v.id">
            {{ v.name }}
          </option>
        </select>

        <button class="btn btn-primary btn-sm ms-auto" @click="openForm">
          <i class="bi bi-plus-lg"></i> New Bill
        </button>
      </div>

      <!-- Bill Table -->
      <div class="card shadow-sm">
        <div class="card-body p-0">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Vendor</th>
                <th>Bill No</th>
                <th>Date</th>
                <th class="text-end">Total (৳)</th>
                <th class="text-end">Paid (৳)</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bill, i) in bills" :key="bill?.id ?? i">
                <td>{{ i + 1 }}</td>
                <td>{{ bill.vendor_name || '—' }}</td>
                <td>{{ bill.bill_number }}</td>
                <td>{{ formatDate(bill.date) }}</td>
                <td class="text-end">{{ Number(bill.total || 0).toFixed(2) }}</td>
                <td class="text-end">{{ Number(bill.paid_amount || 0).toFixed(2) }}</td>

                <!-- STATUS -->
                <td>
                  <span
                    v-if="bill.status === 'draft'"
                    class="badge bg-warning text-dark px-3 py-2"
                  >
                    <i class="bi bi-exclamation-triangle me-1"></i> Draft
                  </span>
                  <span
                    v-else-if="bill.status === 'posted' && (bill.paid_amount || 0) === 0"
                    class="badge bg-success px-3 py-2"
                  >
                    <i class="bi bi-check-circle me-1"></i> Posted
                  </span>
                  <span
                    v-else-if="(bill.paid_amount || 0) > 0 && bill.paid_amount < bill.total"
                    class="badge bg-info text-dark px-3 py-2"
                  >
                    <i class="bi bi-piggy-bank me-1"></i> Partial
                  </span>
                  <span
                    v-else-if="(bill.paid_amount || 0) >= bill.total"
                    class="badge bg-primary px-3 py-2"
                  >
                    <i class="bi bi-cash-stack me-1"></i> Paid
                  </span>
                  <span
                    v-else
                    class="badge bg-secondary px-3 py-2"
                  >
                    <i class="bi bi-hourglass-split me-1"></i> Pending
                  </span>
                </td>

                <!-- ACTIONS -->
                <td class="text-center">
                  <div class="btn-group">
                    <button
                      class="btn btn-info btn-sm text-white d-flex align-items-center me-1"
                      @click="editBill(bill)"
                    >
                      <i class="bi bi-eye me-1"></i> View
                    </button>

                    <!-- Post/Unpost -->
                    <button
                      v-if="bill.status === 'draft'"
                      class="btn btn-success btn-sm d-flex align-items-center me-1"
                      @click="togglePost(bill, true)"
                    >
                      <i class="bi bi-upload me-1"></i> Post
                    </button>
                    <button
                      v-else-if="bill.status === 'posted'"
                      class="btn btn-danger btn-sm d-flex align-items-center me-1"
                      @click="togglePost(bill, false)"
                    >
                      <i class="bi bi-arrow-down-circle me-1"></i> Unpost
                    </button>

                    <!-- Pay / Unpay -->
                    <button
                      v-if="bill.status === 'posted' || bill.status === 'partial'"
                      class="btn btn-warning btn-sm text-dark d-flex align-items-center me-1"
                      @click="openPayment(bill)"
                    >
                      <i class="bi bi-cash-coin me-1"></i> Pay
                    </button>
                    <button
                      v-else-if="(bill.paid_amount || 0) >= bill.total"
                      class="btn btn-outline-secondary btn-sm d-flex align-items-center"
                      @click="unpayBill(bill)"
                    >
                      <i class="bi bi-arrow-counterclockwise me-1"></i> Unpay
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="bills.length === 0">
                <td colspan="8" class="text-center text-muted py-3">No bills found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal fade" id="billFormModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Edit Bill' : 'New Bill' }}
              </h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Vendor</label>
                  <select v-model="billForm.vendor_id" class="form-select">
                    <option value="">Select Vendor</option>
                    <option v-for="v in vendors" :key="v?.id" :value="v.id">
                      {{ v.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Bill Date</label>
                  <input v-model="billForm.date" type="date" class="form-control" />
                </div>
              </div>

              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th class="text-end">Line Total</th>
                    <th class="text-center">
                      <button class="btn btn-sm btn-outline-success" @click="addItem">
                        <i class="bi bi-plus-lg"></i>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in billForm.items" :key="i">
                    <td><input v-model="item.description" class="form-control form-control-sm" /></td>
                    <td><input v-model.number="item.qty" type="number" class="form-control form-control-sm text-center" /></td>
                    <td><input v-model.number="item.unit_price" type="number" class="form-control form-control-sm text-end" /></td>
                    <td class="text-end">{{ (item.qty * item.unit_price).toFixed(2) }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-danger" @click="removeItem(i)">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="text-end mt-2 fw-bold">
                Total: ৳
                {{
                  billForm.items.reduce(
                    (sum, i) => sum + i.qty * i.unit_price,
                    0
                  ).toFixed(2)
                }}
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button class="btn btn-success" @click="saveBill">
                <i class="bi bi-save me-1"></i> {{ isEditing ? 'Update Bill' : 'Save Bill' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div class="modal fade" id="paymentModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="bi bi-cash-coin me-1"></i> Make Payment</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p><strong>Vendor:</strong> {{ selectedBill.vendor_name }}</p>
              <p><strong>Total:</strong> ৳ {{ Number(selectedBill.total || 0).toFixed(2) }}</p>
              <p><strong>Already Paid:</strong> ৳ {{ Number(selectedBill.paid_amount || 0).toFixed(2) }}</p>

              <label class="form-label fw-semibold">Payment Amount</label>
              <input v-model.number="paymentForm.amount" type="number" class="form-control" min="0" />
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-success" @click="submitPayment">
                <i class="bi bi-check2 me-1"></i> Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from './SidebarLayout.vue'
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import api from '../api/apiService'

const bills = ref([])
const vendors = ref([])
const selectedVendor = ref('')
const selectedBill = ref({})

const billForm = ref({
  id: null,
  vendor_id: '',
  date: new Date().toISOString().substring(0, 10),
  items: [],
})
const isEditing = ref(false)

const paymentForm = ref({ amount: 0 })

let modalInstance = null
let paymentModal = null

// Fetch bills & vendors
const fetchBills = async () => {
  const { data } = await api.get('/purchase/bills')
  bills.value = data.data || data
}
const fetchVendors = async () => {
  const { data } = await api.get('/vendors')
  vendors.value = data.data || data
}

// Edit bill
const editBill = async (bill) => {
  try {
    const { data } = await api.get(`/purchase/bills/${bill.id}`)
    billForm.value = {
      id: data.id,
      vendor_id: data.vendor_id,
      date: data.date,
      items: data.items?.length
        ? data.items.map((i) => ({
            description: i.description,
            qty: Number(i.qty),
            unit_price: Number(i.unit_price),
          }))
        : [{ description: '', qty: 1, unit_price: 0 }],
    }
    isEditing.value = true
    modalInstance.show()
  } catch (e) {
    alert('Could not load bill details.')
  }
}

// Add/remove items
const addItem = () => billForm.value.items.push({ description: '', qty: 1, unit_price: 0 })
const removeItem = (i) => billForm.value.items.splice(i, 1)

// Open new form
const openForm = () => {
  billForm.value = { id: null, vendor_id: '', date: new Date().toISOString().substring(0, 10), items: [{ description: '', qty: 1, unit_price: 0 }] }
  isEditing.value = false
  modalInstance.show()
}

// Save or update bill
const saveBill = async () => {
  if (isEditing.value && billForm.value.id) {
    await api.put(`/purchase/bills/${billForm.value.id}`, billForm.value)
  } else {
    await api.post('/purchase/bills', billForm.value)
  }
  modalInstance.hide()
  await fetchBills()
}

// Post/unpost
const togglePost = async (bill, post = true) => {
  const url = post
    ? `/purchase/bills/${bill.id}/post`
    : `/purchase/bills/${bill.id}/unpost`
  await api.post(url)
  await fetchBills()
}

// Payment modals
const openPayment = (bill) => {
  selectedBill.value = bill
  paymentForm.value.amount = Number(bill.total) - Number(bill.paid_amount || 0)
  paymentModal.show()
}
const submitPayment = async () => {
  try {
    await api.post('/purchase/payments', {
      vendor_id: selectedBill.value.vendor_id,
      bill_id: selectedBill.value.id,
      amount: paymentForm.value.amount,
    })
    paymentModal.hide()
    await fetchBills()
  } catch (e) {
    alert('Payment failed')
  }
}
const unpayBill = async (bill) => {
  await api.post(`/purchase/bills/${bill.id}/unpay`)
  await fetchBills()
}

// Format date
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—')

onMounted(async () => {
  await fetchVendors()
  await fetchBills()
  modalInstance = new Modal(document.getElementById('billFormModal'))
  paymentModal = new Modal(document.getElementById('paymentModal'))
})
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
.badge {
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 0.5rem;
}
.btn-group .btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
