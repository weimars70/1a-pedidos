<template>
  <q-page class="pedidos-epp-page q-pa-lg">

    <!-- Header -->
    <div class="page-header q-pa-md q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Pedidos EPP</div>
    </div>

    <!-- Toolbar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="toolbar-row">
        <q-input v-model="search" dense outlined clearable placeholder="Búsqueda rápida..."
          class="search-input" debounce="300">
          <template #prepend><q-icon name="search" color="grey-5" size="18px" /></template>
        </q-input>
        <q-btn flat dense round icon="refresh" :loading="loading" @click="loadData">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="filtered"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat
        dense
        :rows-per-page-options="[25, 50, 100]"
        class="pedidos-table"
      >
        <template #body-cell-facturar="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.facturar ? 'green' : 'orange'"
              :label="props.row.facturar ? 'Sí' : 'No'"
            />
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width column flex-center text-grey-5 q-pa-xl">
            <q-icon name="inventory_2" size="48px" class="q-mb-sm" />
            <span>Sin pedidos EPP</span>
          </div>
        </template>
        <template #loading><q-inner-loading showing color="primary" /></template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

interface PedidoEppRow {
  id: number
  id_pedido: number | string
  nombre_epp: string
  valor: number | string
  cantidad: number
  facturar: boolean | string
}

const $q = useQuasar()

const rows    = ref<PedidoEppRow[]>([])
const loading = ref(false)
const search  = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q ? rows.value.filter(r =>
    [String(r.id_pedido), r.nombre_epp, String(r.valor), String(r.cantidad)]
      .some(v => (v ?? '').toLowerCase().includes(q))
  ) : rows.value
})

const columns = [
  { name: 'id',         label: 'Id',          field: 'id',         align: 'left' as const, sortable: true },
  { name: 'id_pedido',  label: 'Id Pedido',   field: 'id_pedido',  align: 'left' as const, sortable: true },
  { name: 'nombre_epp', label: 'Nombre EPP',  field: 'nombre_epp', align: 'left' as const, sortable: true },
  { name: 'valor',      label: 'Valor',       field: 'valor',      align: 'left' as const, sortable: true },
  { name: 'cantidad',   label: 'Cantidad',    field: 'cantidad',   align: 'left' as const, sortable: true },
  { name: 'facturar',   label: 'Facturar',    field: 'facturar',   align: 'left' as const, sortable: true },
]

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/pedidos/epp')
    rows.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar pedidos EPP' })
  } finally { loading.value = false }
}

onMounted(() => { void loadData() })
</script>

<style lang="scss" scoped>
.pedidos-epp-page { max-width: 1400px; margin: 0 auto; }

.page-header {
  background: linear-gradient(135deg, #0F5A52 0%, #26A69A 100%);
  border-radius: 12px;
}

.toolbar-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px !important;
}
.search-input { width: 280px; }

.pedidos-table {
  :deep(thead tr th) {
    font-weight: 700; font-size: 12px; color: #616161;
    background: #fafafa; text-transform: uppercase; letter-spacing: 0.5px;
  }
  :deep(.q-tr:hover) { background: #f0faf8; }
}
</style>
