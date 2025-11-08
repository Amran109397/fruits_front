<template>
  <SidebarLayout>
    <div class="container-fluid mt-2">
      <!-- Header -->
      <div class="d-flex align-items-center mb-3">
        <h3 class="fw-bold mb-0">
          <i class="bi bi-bank me-2"></i> Bank
        </h3>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" @click="openAccountModal">
            <i class="bi bi-plus-lg me-1"></i> New Account
          </button>
          <button class="btn btn-primary btn-sm" @click="openTxnModal()">
            <i class="bi bi-cash-coin me-1"></i> New Transaction
          </button>
        </div>
      </div>

      <!-- Filter -->
      <div class="card shadow-sm mb-3">
        <div class="card-body d-flex align-items-center gap-2 flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <label class="fw-semibold">Account:</label>
            <select class="form-select form-select-sm" style="min-width:220px"
                    v-model="filters.accountId" @change="reloadTransactions">
              <option value="">All accounts</option>
              <option v-for="a in accounts" :key="a.id" :value="a.id">
                {{ a.name }} ({{ a.bank_name }})
              </option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <label class="fw-semibold">Type:</label>
            <select class="form-select form-select-sm" style="min-width:160px"
                    v-model="filters.type" @change="reloadTransactions">
              <option value="">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Account Cards -->
      <div class="row g-3 mb-3">
        <div class="col-md-6 col-lg-4" v-for="a in accounts" :key="a.id">
          <div class="card h-100 border-0 shadow-sm position-relative">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-semibold">{{ a.name }}</div>
                  <div class="text-muted small">{{ a.bank_name }} • {{ a.account_number }}</div>
                </div>

                <!-- Vue Dropdown -->
                <div class="dropdown position-relative">
                  <button class="btn btn-sm btn-light border"
                          @click.stop="toggleDropdown(a.id)">
                    Actions <i class="bi bi-caret-down-fill small"></i>
                  </button>

                  <ul v-if="activeDropdown === a.id"
                      class="dropdown-menu show shadow-sm"
                      style="position:absolute; right:0; top:100%; z-index:1000;">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="openTxnModal(a.id)"> 
                        <i class="bi bi-cash me-1"></i> Add Transaction
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="editAccount(a)"> 
                        <i class="bi bi-pencil-square me-1"></i> Edit
                      </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" @click.prevent="removeAccount(a)"> 
                        <i class="bi bi-trash3 me-1"></i> Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-3">
                <div class="text-muted small">Current Balance</div>
                <div class="h5 mb-0">{{ money(a.current_balance) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="card shadow-sm">
        <div class="card-header bg-white fw-semibold">
          <i class="bi bi-receipt me-1"></i> Transactions
        </div>
        <div class="card-body p-0">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light">
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
              <tr v-for="(t, i) in transactions" :key="t.id">
                <td>{{ i + 1 }}</td>
                <td>{{ accountName(t.bank_account_id) }}</td>
                <td>{{ formatDate(t.transaction_date) }}</td>
                <td>{{ t.description || '—' }}</td>
                <td class="text-end">{{ money(t.amount) }}</td>
                <td>
                  <span :class="t.type === 'deposit' ? 'badge bg-success' : 'badge bg-danger'">
                    {{ t.type }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="editTxn(t)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="removeTxn(t)">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
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
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ accountForm.id ? 'Edit Account' : 'New Account' }}</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label fw-semibold">Name *</label>
              <input v-model="accountForm.name" type="text" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Bank Name *</label>
              <input v-model="accountForm.bank_name" type="text" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Account Number *</label>
              <input v-model="accountForm.account_number" type="text" class="form-control" />
            </div>
            <div>
              <label class="form-label fw-semibold">Current Balance *</label>
              <input v-model.number="accountForm.current_balance" type="number" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-success" @click="saveAccount">
              <i class="bi bi-save me-1"></i> Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <div class="modal fade" id="txnModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ txnForm.id ? 'Edit Transaction' : 'New Transaction' }}</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label fw-semibold">Account *</label>
              <select v-model="txnForm.bank_account_id" class="form-select">
                <option value="">Select account</option>
                <option v-for="a in accounts" :value="a.id" :key="a.id">
                  {{ a.name }} ({{ a.bank_name }})
                </option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Date *</label>
              <input v-model="txnForm.transaction_date" type="date" class="form-control" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Type *</label>
              <select v-model="txnForm.type" class="form-select">
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold">Amount *</label>
              <input v-model.number="txnForm.amount" type="number" min="0" step="0.01" class="form-control" />
            </div>
            <div>
              <label class="form-label fw-semibold">Description</label>
              <input v-model="txnForm.description" type="text" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-success" @click="saveTxn">
              <i class="bi bi-save me-1"></i> Save
            </button>
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
const toggleDropdown = (id) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) activeDropdown.value = null
})

// account CRUD
const openAccountModal = () => { accountForm.value = blankAccount(); accountModal.show() }
const editAccount = (a) => { activeDropdown.value = null; accountForm.value = { ...a }; accountModal.show() }
const saveAccount = async () => {
  const f = accountForm.value
  if (!f.name || !f.bank_name || !f.account_number) return alert('Please fill all required fields before saving.')
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
  if (!f.bank_account_id || !f.amount || !f.type) return alert('Please fill required fields before saving transaction.')
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
.table td, .table th { vertical-align: middle; }
.dropdown-menu.show { display:block; }
.dropdown-menu a { cursor: pointer; }
</style>
