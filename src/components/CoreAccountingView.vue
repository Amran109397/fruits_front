<template>
  <SidebarLayout>
    <div class="p-4 core-bg">
      <h2 class="fw-bold mb-4 text-center text-gradient">
        📘 Core Accounting - Journal Entries
      </h2>

      <!-- Top Buttons -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-gradient-primary" @click="openAddModal">➕ New Entry</button>
        <button class="btn btn-outline-secondary" @click="loadEntries">🔄 Refresh</button>
      </div>

      <!-- Journal Entries Table -->
      <div class="table-responsive shadow-sm rounded-3 overflow-hidden">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-header text-white">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Memo</th>
              <th>Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td>{{ entry.id }}</td>
              <td>{{ entry.date }}</td>
              <td>{{ entry.memo || '-' }}</td>
              <td>
                <span v-if="entry.posted_at" class="badge bg-success">Posted</span>
                <span v-else class="badge bg-warning text-dark">Draft</span>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-info me-1" @click="viewDetails(entry)">🔍 View</button>
                <button class="btn btn-sm btn-outline-primary me-1" @click="editEntry(entry)">✏️ Edit</button>
                <button v-if="!entry.posted_at" class="btn btn-sm btn-success me-1" @click="postEntry(entry.id)">📥 Post</button>
                <button v-else class="btn btn-sm btn-danger" @click="unpostEntry(entry.id)">📤 Unpost</button>
              </td>
            </tr>
            <tr v-if="entries.length === 0">
              <td colspan="5" class="text-center text-muted py-3">No journal entries found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Entry Modal -->
      <div v-if="showAddModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content rounded-4 shadow-lg border-0">
            <div class="modal-header bg-gradient-primary text-white rounded-top-4">
              <h5 class="modal-title">
                {{ isEditing ? '✏️ Edit Journal Entry' : '➕ New Journal Entry' }}
              </h5>
              <button type="button" class="btn-close" @click="closeAddModal"></button>
            </div>

            <div class="modal-body bg-light">
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" v-model="newEntry.date" />
                </div>
                <div class="col-md-8">
                  <label class="form-label">Memo</label>
                  <input type="text" class="form-control" v-model="newEntry.memo" placeholder="Description..." />
                </div>
              </div>

              <h6 class="fw-bold mt-3 text-primary border-bottom pb-2">Journal Lines</h6>
              <table class="table table-sm table-bordered bg-white rounded-3">
                <thead class="table-secondary">
                  <tr>
                    <th>Account ID</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in newEntry.items" :key="index">
                    <td><input type="number" class="form-control" v-model.number="item.account_id" /></td>
                    <td><input type="number" class="form-control" v-model.number="item.debit" /></td>
                    <td><input type="number" class="form-control" v-model.number="item.credit" /></td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" @click="removeLine(index)">🗑</button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button class="btn btn-sm btn-outline-secondary" @click="addLine">➕ Add Line</button>

              <div class="mt-3 text-end fw-bold">
                Total Debit: {{ totalDebit.toFixed(2) }} |
                Total Credit: {{ totalCredit.toFixed(2) }}
              </div>
            </div>

            <div class="modal-footer bg-light rounded-bottom-4">
              <button class="btn btn-success" @click="isEditing ? updateEntry() : saveEntry()">
                💾 {{ isEditing ? 'Update Entry' : 'Save Entry' }}
              </button>
              <button class="btn btn-secondary" @click="closeAddModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SidebarLayout from './SidebarLayout.vue'
import { getJournalEntries, createJournalEntry, updateJournalEntry, postJournalEntry, unpostJournalEntry } from '../api/apiService'

// reactive state
const entries = ref([])
const showAddModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)

const newEntry = ref({
  date: new Date().toISOString().substr(0, 10),
  memo: '',
  items: [{ account_id: '', debit: 0, credit: 0 }]
})

// load all
const loadEntries = async () => {
  try {
    const res = await getJournalEntries()
    entries.value = res.data
  } catch (error) {
    console.error('Error loading entries:', error)
  }
}

// add/remove lines
const addLine = () => newEntry.value.items.push({ account_id: '', debit: 0, credit: 0 })
const removeLine = (index) => newEntry.value.items.splice(index, 1)

// computed totals
const totalDebit = computed(() => newEntry.value.items.reduce((s, i) => s + Number(i.debit || 0), 0))
const totalCredit = computed(() => newEntry.value.items.reduce((s, i) => s + Number(i.credit || 0), 0))

// save new
const saveEntry = async () => {
  try {
    const payload = { date: newEntry.value.date, description: newEntry.value.memo, items: newEntry.value.items }
    const res = await createJournalEntry(payload)
    alert(res.data.message || '✅ Journal entry saved!')
    closeAddModal()
    await loadEntries()
  } catch (error) {
    console.error('Error saving entry:', error)
    alert(error.response?.data?.error || '❌ Failed to save entry')
  }
}

// update existing
const updateEntry = async () => {
  try {
    const payload = { date: newEntry.value.date, description: newEntry.value.memo, items: newEntry.value.items }
    const res = await updateJournalEntry(editId.value, payload)
    alert(res.data.message || '✅ Journal entry updated!')
    closeAddModal()
    await loadEntries()
  } catch (error) {
    console.error('Error updating entry:', error)
    alert(error.response?.data?.error || '❌ Failed to update entry')
  }
}

// edit entry
const editEntry = (entry) => {
  isEditing.value = true
  editId.value = entry.id
  newEntry.value = {
    date: entry.date,
    memo: entry.memo,
    items: entry.items?.map(i => ({ account_id: i.account_id, debit: i.debit, credit: i.credit })) || []
  }
  showAddModal.value = true
}

// post/unpost
const postEntry = async (id) => {
  try {
    await postJournalEntry(id)
    await loadEntries()
  } catch (err) {
    alert(err.response?.data?.error || 'Post failed ❌')
  }
}

const unpostEntry = async (id) => {
  try {
    await unpostJournalEntry(id)
    await loadEntries()
  } catch (err) {
    alert(err.response?.data?.error || 'Unpost failed ❌')
  }
}

// view entry
const viewDetails = (entry) => {
  let details = `📅 Date: ${entry.date}\n🧾 Memo: ${entry.memo}\n\nLines:\n`
  entry.items.forEach(i => { details += `Account ${i.account_id} → Dr ${i.debit} | Cr ${i.credit}\n` })
  alert(details)
}

// modal control
const openAddModal = () => {
  isEditing.value = false
  editId.value = null
  newEntry.value = { date: new Date().toISOString().substr(0, 10), memo: '', items: [{ account_id: '', debit: 0, credit: 0 }] }
  showAddModal.value = true
}
const closeAddModal = () => (showAddModal.value = false)

onMounted(loadEntries)
</script>

<style scoped>
.core-bg {
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
