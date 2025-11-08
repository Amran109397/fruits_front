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
/* 🏦 BANK MODULE (optional future use)                                      */
/* -------------------------------------------------------------------------- */

// Bank Accounts
export const getBankAccounts = () => api.get('/banks/accounts')
export const getBankTransactions = () => api.get('/banks/transactions')


/* -------------------------------------------------------------------------- */
/* 📊 REPORTS MODULE (optional future use)                                   */
/* -------------------------------------------------------------------------- */
export const getFinancialReports = () => api.get('/reports/financials')


/* -------------------------------------------------------------------------- */
/* ✅ Export default                                                        */
/* -------------------------------------------------------------------------- */
export default api
