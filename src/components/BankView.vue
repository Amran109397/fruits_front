<template>
  <SidebarLayout>
    <div class="bank-bg p-4">
      <!-- Header -->
      <div class="d-flex align-items-center mb-4">
        <h3 class="fw-bold mb-0 text-gradient">
          🏦 Bank Module
        </h3>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-gradient-primary shadow-sm btn-sm" @click="openAccountModal">
            ➕ New Account
          </button>
          <button class="btn btn-primary btn-sm shadow-sm" @click="openTxnModal()">
            💰 New Transaction
          </button>
        </div>
      </div>

      <!-- Filter -->
      <div class="card shadow-sm mb-4 border-0 rounded-4">
        <div class="card-body d-flex align-items-center gap-3 flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <label class="fw-semibold text-secondary">Account:</label>
            <select
              class="form-select form-select-sm shadow-sm"
              style="min-width:220px"
              v-model="filters.accountId"
              @change="reloadTransactions"
            >
              <option value="">All Accounts</option>
              <option v-for="a in accounts" :key="a.id" :value="a.id">
                {{ a.name }} ({{ a.bank_name }})
              </option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <label class="fw-semibold text-secondary">Type:</label>
            <select
              class="form-select form-select-sm shadow-sm"
              style="min-width:160px"
              v-model="filters.type"
              @change="reloadTransactions"
            >
              <option value="">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Account Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-6 col-lg-4" v-for="a in accounts" :key="a.id">
          <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-semibold">{{ a.name }}</div>
                  <div class="text-muted small">{{ a.bank_name }} • {{ a.account_number }}</div>
                </div>
                <!-- Dropdown -->
                <div class="dropdown position-relative">
                  <button class="btn btn-sm btn-light border shadow-sm" @click.stop="toggleDropdown(a.id)">
                    Actions ▾
                  </button>
                  <ul
                    v-if="activeDropdown === a.id"
                    class="dropdown-menu show shadow-sm"
                    style="position:absolute; right:0; top:100%; z-index:1000;"
                  >
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="openTxnModal(a.id)">
                        💵 Add Transaction
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editAccount(a)">
                        ✏️ Edit Account
                      </a>
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" @click.prevent="removeAccount(a)">
                        🗑 Delete Account
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-3">
                <div class="text-muted small">Current Balance</div>
                <div class="h5 fw-bold text-success mb-0">৳ {{ money(a.current_balance) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="card shadow-lg border-0 rounded-4">
        <div class="card-header bg-gradient-primary text-white fw-semibold">
          💳 Bank Transactions
        </div>
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-header text-white">
              <tr>
                <th>#</th>
                <th>Account</th>
                <th>Date</th>
                <th>Description</th>
                <th class="text-end">Amount</th>
                <th>Type</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, i) in transactions" :key="t.id" class="table-row">
                <td>{{ i + 1 }}</td>
                <td>{{ accountName(t.bank_account_id) }}</td>
                <td>{{ formatDate(t.transaction_date) }}</td>
                <td>{{ t.description || '—' }}</td>
                <td class="text-end fw-semibold">{{ money(t.amount) }}</td>
                <td>
                  <span
                    :class="t.type === 'deposit' ? 'badge bg-success bg-gradient px-3 py-2' : 'badge bg-danger bg-gradient px-3 py-2'"
                  >
                    {{ t.type }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary shadow-sm me-1" @click="editTxn(t)">
                    ✏️ Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger shadow-sm" @click="removeTxn(t)">
                    🗑 Delete
                  </button>
                </td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="7" class="text-center text-muted py-3">No transactions found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Account Modal -->
    <div class="modal fade" id="accountModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-gradient-primary text-white rounded-top-4">
            <h5 class="modal-title">
              {{ accountForm.id ? '✏️ Edit Account' : '➕ New Account' }}
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body bg-light">
            <div class="mb-2">
              <label class="form-label fw-semibold">Name *</label>
              <input v-model="accountForm.name" type="text" class="form-control shadow-sm" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Bank Name *</label>
              <input v-model="accountForm.bank_name" type="text" class="form-control shadow-sm" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Account Number *</label>
              <input v-model="accountForm.account_number" type="text" class="form-control shadow-sm" />
            </div>
            <div>
              <label class="form-label fw-semibold">Current Balance *</label>
              <input v-model.number="accountForm.current_balance" type="number" class="form-control shadow-sm" />
            </div>
          </div>
          <div class="modal-footer bg-light rounded-bottom-4">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-success shadow-sm" @click="saveAccount">💾 Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <div class="modal fade" id="txnModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-gradient-primary text-white rounded-top-4">
            <h5 class="modal-title">
              {{ txnForm.id ? '✏️ Edit Transaction' : '➕ New Transaction' }}
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body bg-light">
            <div class="mb-2">
              <label class="form-label fw-semibold">Account *</label>
              <select v-model="txnForm.bank_account_id" class="form-select shadow-sm">
                <option value="">Select account</option>
                <option v-for="a in accounts" :value="a.id" :key="a.id">{{ a.name }} ({{ a.bank_name }})</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Date *</label>
              <input v-model="txnForm.transaction_date" type="date" class="form-control shadow-sm" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Type *</label>
              <select v-model="txnForm.type" class="form-select shadow-sm">
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Amount *</label>
              <input v-model.number="txnForm.amount" type="number" min="0" step="0.01" class="form-control shadow-sm" />
            </div>
            <div>
              <label class="form-label fw-semibold">Description</label>
              <input v-model="txnForm.description" type="text" class="form-control shadow-sm" />
            </div>
          </div>
          <div class="modal-footer bg-light rounded-bottom-4">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-success shadow-sm" @click="saveTxn">💾 Save</button>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import SidebarLayout from './SidebarLayout.vue'
import {
  getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount,
  getBankTransactions, createBankTransaction, updateBankTransaction, deleteBankTransaction
} from '../api/apiService'

// reactive state
const accounts = ref([])
const transactions = ref([])
const filters = ref({ accountId: '', type: '' })
let accountModal, txnModal
const activeDropdown = ref(null)

// form templates
const blankAccount = () => ({ id: null, name: '', bank_name: '', account_number: '', current_balance: 0 })
const blankTxn = () => ({
  id: null,
  bank_account_id: '',
  transaction_date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: 0,
  type: 'deposit',
})
const accountForm = ref(blankAccount())
const txnForm = ref(blankTxn())

// helpers
const money = (v) => Number(v || 0).toFixed(2)
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—')
const accountName = (id) => accounts.value.find(a => a.id === id)?.name || '—'

// load data
const loadAccounts = async () => {
  const { data } = await getBankAccounts()
  accounts.value = data?.data ?? data ?? []
}
const loadTransactions = async () => {
  const { data } = await getBankTransactions()
  transactions.value = data?.data ?? data ?? []
}
const reloadTransactions = async () => { await loadTransactions() }

// dropdown
const toggleDropdown = (id) => { activeDropdown.value = activeDropdown.value === id ? null : id }
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) activeDropdown.value = null
})

// account CRUD
const openAccountModal = () => { accountForm.value = blankAccount(); accountModal.show() }
const editAccount = (a) => { activeDropdown.value = null; accountForm.value = { ...a }; accountModal.show() }
const saveAccount = async () => {
  const f = accountForm.value
  if (!f.name || !f.bank_name || !f.account_number) return alert('Please fill all required fields.')
  const payload = { ...f }
  if (payload.id) await updateBankAccount(payload.id, payload)
  else await createBankAccount(payload)
  accountModal.hide()
  await loadAccounts()
}
const removeAccount = async (a) => {
  activeDropdown.value = null
  if (!confirm('Delete this account?')) return
  await deleteBankAccount(a.id)
  await loadAccounts()
  await reloadTransactions()
}

// transaction CRUD
const openTxnModal = (accId = '') => { activeDropdown.value = null; txnForm.value = blankTxn(); if (accId) txnForm.value.bank_account_id = accId; txnModal.show() }
const editTxn = (t) => { txnForm.value = { ...t }; txnModal.show() }
const saveTxn = async () => {
  const f = txnForm.value
  if (!f.bank_account_id || !f.amount || !f.type) return alert('Please fill required fields.')
  const payload = { ...f }
  if (payload.id) await updateBankTransaction(payload.id, payload)
  else await createBankTransaction(payload)
  txnModal.hide()
  await loadTransactions()
  await loadAccounts()
}
const removeTxn = async (t) => {
  if (!confirm('Delete this transaction?')) return
  await deleteBankTransaction(t.id)
  await loadTransactions()
  await loadAccounts()
}

// mount
onMounted(async () => {
  accountModal = new Modal(document.getElementById('accountModal'))
  txnModal = new Modal(document.getElementById('txnModal'))
  await loadAccounts()
  await loadTransactions()
})
</script>

<style scoped>
.bank-bg {
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
.hover-card:hover {
  transform: translateY(-3px);
  transition: 0.3s;
}
</style>
