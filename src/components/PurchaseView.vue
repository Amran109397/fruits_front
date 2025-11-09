<template>
  <SidebarLayout>
    <div class="purchase-bg p-4">
      <div class="card shadow-lg border-0 rounded-4 p-4 bg-light">
        <h3 class="fw-bold mb-4 text-center text-gradient">
          🧾 Purchase Module – Bills
        </h3>

        <!-- Filter & Add -->
        <div class="d-flex align-items-center mb-4">
          <label class="me-2 fw-semibold text-secondary">Filter by Vendor:</label>
          <select
            v-model="selectedVendor"
            class="form-select w-auto shadow-sm"
            @change="fetchBills"
          >
            <option value="">All Vendors</option>
            <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
          </select>

          <button class="btn btn-gradient-primary ms-auto shadow-sm" @click="openForm">
            ➕ New Bill
          </button>
        </div>

        <!-- Bill Table -->
        <div class="table-responsive rounded-3 overflow-hidden shadow-sm">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-header text-white">
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
              <tr v-for="(bill, i) in bills" :key="bill.id" class="table-row">
                <td>{{ i + 1 }}</td>
                <td>{{ bill.vendor_name || '—' }}</td>
                <td>{{ bill.bill_number }}</td>
                <td>{{ formatDate(bill.date) }}</td>
                <td class="text-end text-success fw-semibold">
                  {{ Number(bill.total || 0).toFixed(2) }}
                </td>
                <td class="text-end text-primary fw-semibold">
                  {{ Number(bill.paid_amount || 0).toFixed(2) }}
                </td>

                <!-- Status -->
                <td>
                  <span
                    v-if="bill.status === 'draft'"
                    class="badge bg-warning text-dark bg-gradient px-3 py-2"
                    >🕓 Draft</span
                  >
                  <span
                    v-else-if="bill.status === 'posted' && (bill.paid_amount || 0) === 0"
                    class="badge bg-success bg-gradient px-3 py-2"
                    >✅ Posted</span
                  >
                  <span
                    v-else-if="(bill.paid_amount || 0) > 0 && bill.paid_amount < bill.total"
                    class="badge bg-info text-dark bg-gradient px-3 py-2"
                    >💵 Partial</span
                  >
                  <span
                    v-else-if="(bill.paid_amount || 0) >= bill.total"
                    class="badge bg-primary bg-gradient px-3 py-2"
                    >💰 Paid</span
                  >
                  <span v-else class="badge bg-secondary bg-gradient px-3 py-2"
                    >⌛ Pending</span
                  >
                </td>

                <!-- Actions -->
                <td class="text-center">
                  <button class="btn btn-sm btn-info me-1 shadow-sm" @click="editBill(bill)">
                    🔍 View
                  </button>
                  <button
                    v-if="bill.status === 'draft'"
                    class="btn btn-sm btn-success me-1 shadow-sm"
                    @click="togglePost(bill, true)"
                  >
                    📤 Post
                  </button>
                  <button
                    v-else-if="bill.status === 'posted'"
                    class="btn btn-sm btn-danger me-1 shadow-sm"
                    @click="togglePost(bill, false)"
                  >
                    📥 Unpost
                  </button>

                  <button
                    v-if="bill.status === 'posted' || bill.status === 'partial'"
                    class="btn btn-sm btn-gradient-primary shadow-sm"
                    @click="openPayment(bill)"
                  >
                    💸 Pay
                  </button>
                  <button
                    v-else-if="(bill.paid_amount || 0) >= bill.total"
                    class="btn btn-sm btn-outline-secondary shadow-sm"
                    @click="unpayBill(bill)"
                  >
                    🔄 Unpay
                  </button>
                </td>
              </tr>

              <tr v-if="bills.length === 0">
                <td colspan="8" class="text-center text-muted py-3">
                  No bills found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bill Modal -->
      <div class="modal fade" id="billFormModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header bg-gradient-primary text-white rounded-top-4">
              <h5 class="modal-title">
                {{ isEditing ? '✏️ Edit Bill' : '➕ New Bill' }}
              </h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body bg-light">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Vendor</label>
                  <select v-model="billForm.vendor_id" class="form-select shadow-sm">
                    <option value="">Select Vendor</option>
                    <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Bill Date</label>
                  <input v-model="billForm.date" type="date" class="form-control shadow-sm" />
                </div>
              </div>

              <h6 class="fw-bold border-bottom pb-2 text-primary">🧾 Bill Items</h6>
              <table class="table table-sm table-bordered bg-white rounded-3 shadow-sm">
                <thead class="table-secondary">
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th class="text-end">Line Total</th>
                    <th class="text-center">
                      <button class="btn btn-sm btn-outline-primary" @click="addItem">➕</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in billForm.items" :key="i">
                    <td><input v-model="item.description" class="form-control form-control-sm" /></td>
                    <td>
                      <input
                        v-model.number="item.qty"
                        type="number"
                        class="form-control form-control-sm text-center"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="item.unit_price"
                        type="number"
                        class="form-control form-control-sm text-end"
                      />
                    </td>
                    <td class="text-end">
                      {{ (item.qty * item.unit_price).toFixed(2) }}
                    </td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-danger" @click="removeItem(i)">
                        🗑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="text-end mt-3 fw-bold text-dark border-top pt-2">
                💰 Total: ৳
                {{
                  billForm.items.reduce((sum, i) => sum + i.qty * i.unit_price, 0).toFixed(2)
                }}
              </div>
            </div>

            <div class="modal-footer bg-light rounded-bottom-4">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button class="btn btn-success shadow-sm" @click="saveBill">
                💾 {{ isEditing ? 'Update Bill' : 'Save Bill' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div class="modal fade" id="paymentModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header bg-gradient-primary text-white rounded-top-4">
              <h5 class="modal-title">💸 Make Payment</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body bg-light">
              <p><strong>Vendor:</strong> {{ selectedBill.vendor_name }}</p>
              <p><strong>Total:</strong> ৳ {{ Number(selectedBill.total || 0).toFixed(2) }}</p>
              <p><strong>Already Paid:</strong> ৳ {{ Number(selectedBill.paid_amount || 0).toFixed(2) }}</p>

              <label class="form-label fw-semibold">Payment Amount</label>
              <input
                v-model.number="paymentForm.amount"
                type="number"
                class="form-control shadow-sm"
                min="0"
              />
            </div>

            <div class="modal-footer bg-light rounded-bottom-4">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-success shadow-sm" @click="submitPayment">
                ✅ Confirm
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
const billForm = ref({ id: null, vendor_id: '', date: new Date().toISOString().substring(0, 10), items: [] })
const isEditing = ref(false)
const paymentForm = ref({ amount: 0 })

let modalInstance = null
let paymentModal = null

const fetchBills = async () => {
  const { data } = await api.get('/purchase/bills')
  bills.value = data.data || data
}
const fetchVendors = async () => {
  const { data } = await api.get('/vendors')
  vendors.value = data.data || data
}

const editBill = async (bill) => {
  const { data } = await api.get(`/purchase/bills/${bill.id}`)
  billForm.value = {
    id: data.id,
    vendor_id: data.vendor_id,
    date: data.date,
    items: data.items?.length
      ? data.items.map((i) => ({
          description: i.description,
          qty: Number(i.qty),
          unit_price: Number(i.unit_price)
        }))
      : [{ description: '', qty: 1, unit_price: 0 }]
  }
  isEditing.value = true
  modalInstance.show()
}

const addItem = () => billForm.value.items.push({ description: '', qty: 1, unit_price: 0 })
const removeItem = (i) => billForm.value.items.splice(i, 1)
const openForm = () => {
  billForm.value = { id: null, vendor_id: '', date: new Date().toISOString().substring(0, 10), items: [{ description: '', qty: 1, unit_price: 0 }] }
  isEditing.value = false
  modalInstance.show()
}

const saveBill = async () => {
  if (isEditing.value && billForm.value.id) {
    await api.put(`/purchase/bills/${billForm.value.id}`, billForm.value)
  } else {
    await api.post('/purchase/bills', billForm.value)
  }
  modalInstance.hide()
  await fetchBills()
}

const togglePost = async (bill, post = true) => {
  const url = post ? `/purchase/bills/${bill.id}/post` : `/purchase/bills/${bill.id}/unpost`
  await api.post(url)
  await fetchBills()
}

const openPayment = (bill) => {
  selectedBill.value = bill
  paymentForm.value.amount = Number(bill.total) - Number(bill.paid_amount || 0)
  paymentModal.show()
}
const submitPayment = async () => {
  await api.post('/purchase/payments', {
    vendor_id: selectedBill.value.vendor_id,
    bill_id: selectedBill.value.id,
    amount: paymentForm.value.amount
  })
  paymentModal.hide()
  await fetchBills()
}
const unpayBill = async (bill) => {
  await api.post(`/purchase/bills/${bill.id}/unpay`)
  await fetchBills()
}
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—')

onMounted(async () => {
  await fetchVendors()
  await fetchBills()
  modalInstance = new Modal(document.getElementById('billFormModal'))
  paymentModal = new Modal(document.getElementById('paymentModal'))
})
</script>

<style scoped>
.purchase-bg {
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
