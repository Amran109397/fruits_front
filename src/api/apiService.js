import axios from 'axios'

// 🔧 Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Laravel backend URL
  timeout: 8000,
  headers: { 'Accept': 'application/json' }
})

/* -------------------------------------------------------------------------- */
/* 🧭 DASHBOARD MODULE                                                        */
/* -------------------------------------------------------------------------- */
export const getDashboardSummary = () => api.get('/dashboard')


/* -------------------------------------------------------------------------- */
/* 🧾 CORE ACCOUNTING MODULE                                                  */
/* -------------------------------------------------------------------------- */

// Chart of Accounts
export const getChartOfAccounts = () => api.get('/chart-of-accounts')

// Journal Entries
export const getJournalEntries = () => api.get('/journal-entries')
export const createJournalEntry = (payload) => api.post('/journal-entries', payload)
export const postJournalEntry = (id) => api.post(`/journal-entries/${id}/post`)
export const unpostJournalEntry = (id) => api.post(`/journal-entries/${id}/unpost`)


/* -------------------------------------------------------------------------- */
/* 💼 SALES MODULE                                                           */
/* -------------------------------------------------------------------------- */

// Invoices
export const getSalesInvoices = () => api.get('/sales/invoices')
export const createSalesInvoice = (payload) => api.post('/sales/invoices', payload)
export const postSalesInvoice = (id) => api.post(`/sales/invoices/${id}/post`)
export const unpostSalesInvoice = (id) => api.post(`/sales/invoices/${id}/unpost`)

// Payments
export const receiveSalesPayment = (payload) => api.post('/sales/receipts', payload)

// Customers (for dropdowns, filters)
export const getCustomers = () => api.get('/customers')


/* -------------------------------------------------------------------------- */
/* 🧾 PURCHASE MODULE                                                        */
/* -------------------------------------------------------------------------- */

// Bills
export const getPurchaseBills = (params = {}) => api.get('/purchase/bills', { params })
export const createPurchaseBill = (payload) => api.post('/purchase/bills', payload)
export const postPurchaseBill = (billId) => api.post(`/purchase/bills/${billId}/post`)

// Payments
export const makePurchasePayment = (payload) => api.post('/purchase/payments', payload)

// Vendors
export const getVendors = () => api.get('/vendors')


/* -------------------------------------------------------------------------- */
/* 🏦 BANK MODULE                                                             */
/* -------------------------------------------------------------------------- */

// Bank Accounts
export const getBankAccounts = (params = {}) => api.get('/bank/accounts', { params })
export const createBankAccount = (payload) => api.post('/bank/accounts', payload)
export const updateBankAccount = (id, payload) => api.put(`/bank/accounts/${id}`, payload)
export const deleteBankAccount = (id) => api.delete(`/bank/accounts/${id}`)

// Bank Transactions
export const getBankTransactions = (params = {}) => api.get('/bank/transactions', { params })
export const createBankTransaction = (payload) => api.post('/bank/transactions', payload)
export const updateBankTransaction = (id, payload) => api.put(`/bank/transactions/${id}`, payload)
export const deleteBankTransaction = (id) => api.delete(`/bank/transactions/${id}`)


/* -------------------------------------------------------------------------- */
/* ✅ Export default                                                        */
/* -------------------------------------------------------------------------- */
export default api
