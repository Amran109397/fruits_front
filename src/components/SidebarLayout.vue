<template>
  <div class="d-flex" id="wrapper">
    <!-- Sidebar -->
    <div id="sidebar-wrapper" class="bg-dark text-white vh-100">
      <div class="sidebar-heading text-center py-3 border-bottom border-secondary fw-bold">
        Fruits Bag
      </div>
      <div class="list-group list-group-flush">
        <router-link to="/dashboard" class="list-group-item list-group-item-action bg-dark text-white">📊 Dashboard</router-link>
        <router-link to="/core" class="list-group-item list-group-item-action bg-dark text-white">💼 Core Accounting</router-link>
        <router-link to="/sales" class="list-group-item list-group-item-action bg-dark text-white">🧾 Sales</router-link>
        <router-link to="/purchase" class="list-group-item list-group-item-action bg-dark text-white">🛒 Purchase</router-link>
        <router-link to="/bank" class="list-group-item list-group-item-action bg-dark text-white">🏦 Bank</router-link>
        <router-link to="/reports" class="list-group-item list-group-item-action bg-dark text-white">📈 Reports</router-link>
        <router-link to="/fiscal-management" class="list-group-item list-group-item-action bg-dark text-white">📅 Fiscal Management</router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div id="page-content-wrapper" class="flex-grow-1 bg-light p-4">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
#sidebar-wrapper {
  width: 230px;
}
.list-group-item:hover {
  background-color: #0d6efd !important;
  color: #fff !important;
  transition: 0.3s;
}
</style>
