<template>
  <SidebarLayout>
    <div>
      <h2 class="fw-bold mb-4 text-center">Core Accounting - Journal Entries</h2>

      <!-- Top Buttons -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-primary" @click="openAddModal">➕ New Entry</button>
        <button class="btn btn-outline-secondary" @click="loadEntries">🔄 Refresh</button>
      </div>

      <!-- Journal Entries Table -->
      <div class="table-responsive shadow-sm">
        <table class="table table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Memo</th>
              <th>Status</th>
              <th>Actions</th>
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
              <td>
                <button class="btn btn-sm btn-info me-1" @click="viewDetails(entry)">🔍 View</button>
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

      <!-- Add Entry Modal -->
      <div v-if="showAddModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">New Journal Entry</h5>
              <button type="button" class="btn-close" @click="closeAddModal"></button>
            </div>

            <div class="modal-body">
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

              <h6 class="fw-bold mt-3">Journal Lines</h6>
              <table class="table table-sm table-bordered">
                <thead>
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

            <div class="modal-footer">
              <button class="btn btn-success" @click="saveEntry">💾 Save Entry</button>
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
import { getJournalEntries, createJournalEntry, postJournalEntry, unpostJournalEntry } from '../api/apiService'


const entries = ref([])
const showAddModal = ref(false)

const newEntry = ref({
  date: new Date().toISOString().substr(0, 10),
  memo: '',
  items: [{ account_id: '', debit: 0, credit: 0 }]
})

// Load entries
const loadEntries = async () => {
  try {
    const res = await getJournalEntries()
    entries.value = res.data
  } catch (error) {
    console.error('Error loading entries:', error)
  }
}

// Add / Remove lines
const addLine = () => newEntry.value.items.push({ account_id: '', debit: 0, credit: 0 })
const removeLine = (index) => newEntry.value.items.splice(index, 1)

// Totals
const totalDebit = computed(() => newEntry.value.items.reduce((s, i) => s + Number(i.debit || 0), 0))
const totalCredit = computed(() => newEntry.value.items.reduce((s, i) => s + Number(i.credit || 0), 0))

// Save new entry
const saveEntry = async () => {
  try {
    const payload = {
      date: newEntry.value.date,
      description: newEntry.value.memo,
      items: newEntry.value.items
    }
    const res = await createJournalEntry(payload)
    alert(res.data.message || 'Journal entry saved successfully ✅')
    closeAddModal()
    await loadEntries()
  } catch (error) {
    console.error('Error saving entry:', error)
    alert(error.response?.data?.error || 'Failed to save entry ❌')
  }
}

// Post / Unpost actions
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


// View entry (simple alert)
const viewDetails = (entry) => {
  let details = `📅 Date: ${entry.date}\n🧾 Memo: ${entry.memo}\n\nLines:\n`
  entry.items.forEach(i => {
    details += `Account ${i.account_id} → Dr ${i.debit} | Cr ${i.credit}\n`
  })
  alert(details)
}

// Modal control
const openAddModal = () => (showAddModal.value = true)
const closeAddModal = () => (showAddModal.value = false)

onMounted(loadEntries)
</script>

<style scoped>
.modal {
  overflow-y: auto;
}
.table th, .table td {
  vertical-align: middle;
}
</style>
