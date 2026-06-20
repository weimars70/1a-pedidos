<template>
  <q-dialog v-model="open" maximized>
    <q-card>
      <q-bar class="bg-primary text-white no-print">
        <div class="text-h6">Vista de Impresión — Pedido {{ data?.pedido }}</div>
        <q-space />
        <q-btn flat icon="picture_as_pdf" label="Descargar PDF" @click="downloadPDF" />
        <q-btn flat icon="print" label="Imprimir" @click="printView" />
        <q-btn flat icon="close" @click="open = false" />
      </q-bar>

      <q-card-section id="print-content" class="print-area">
        <!-- Encabezado empresa -->
        <div class="print-header">
          <h2>UNO-A ASEO INTEGRADO S.A.</h2>
          <h3>Pedido de Personal #{{ data?.pedido }}</h3>
        </div>

        <!-- Datos del pedido en grid 2 columnas -->
        <div class="print-grid">
          <div><strong>Nit:</strong> {{ data?.nit }}</div>
          <div><strong>Nombre:</strong> {{ data?.nombre }}</div>
          <div><strong>Perfil:</strong> {{ data?.perfil }}</div>
          <div><strong>Tipo Servicio:</strong> {{ data?.tipo_servicio }}</div>
          <div><strong>Fecha Pedido:</strong> {{ data?.fecha_pedido }}</div>
          <div><strong>Fecha Inicio:</strong> {{ data?.fecha_inicio }}</div>
          <div><strong>Fecha Final:</strong> {{ data?.fecha_final }}</div>
          <div><strong>No. Personas:</strong> {{ data?.no_personas }}</div>
          <div><strong>Sexo:</strong> {{ data?.sexo }}</div>
          <div><strong>Valor Servicio:</strong> {{ data?.valor_servicio }}</div>
          <div><strong>Bonificación:</strong> {{ data?.bonificacion }}</div>
          <div><strong>Total Servicio:</strong> {{ data?.total_servicio }}</div>
          <div><strong>Riesgo ARL:</strong> {{ data?.riesgo_arl }}</div>
          <div><strong>Asesor:</strong> {{ data?.asesor }}</div>
          <div><strong>Contacto:</strong> {{ data?.contacto }}</div>
          <div><strong>Teléfono:</strong> {{ data?.telefono }}</div>
          <div><strong>Estado:</strong> {{ data?.estado }}</div>
          <div><strong>Usuario:</strong> {{ data?.usuario }}</div>
        </div>

        <div class="print-obs" v-if="data?.observaciones">
          <strong>Observaciones:</strong>
          <p>{{ data.observaciones }}</p>
        </div>

        <div class="print-footer">
          <p>Generado el {{ fechaActual }}</p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const open = defineModel<boolean>('modelValue', { default: false })
const props = defineProps<{ data: Record<string, unknown> | null }>()

const fechaActual = computed(() => new Date().toLocaleDateString('es-CO'))

async function downloadPDF() {
  const html2pdf = (await import('html2pdf.js')).default
  const el = document.getElementById('print-content')
  html2pdf(el, {
    margin: 10,
    filename: `pedido-${props.data?.pedido ?? 'sin-id'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  })
}

function printView() {
  window.print()
}
</script>

<style>
@media print {
  .no-print { display: none !important; }
  .print-area { padding: 20px; }
}
.print-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  margin: 16px 0;
}
.print-header { text-align: center; margin-bottom: 20px; }
.print-obs { margin-top: 16px; }
.print-footer { margin-top: 24px; text-align: right; font-size: 12px; color: #666; }
</style>
