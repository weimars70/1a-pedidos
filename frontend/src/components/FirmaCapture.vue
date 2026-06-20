<template>
  <div class="firma-capture">
    <div class="canvas-wrap">
      <canvas
        ref="canvasEl"
        :width="width"
        :height="height"
        class="sig-canvas"
      />
      <div v-if="isEmpty" class="sig-placeholder">
        <q-icon name="draw" size="28px" color="grey-4" class="q-mr-xs" />
        <span class="text-grey-5 text-caption">Firme aquí</span>
      </div>
    </div>
    <div class="sig-toolbar q-mt-xs">
      <q-btn flat dense no-caps icon="refresh" label="Limpiar" size="sm" color="grey-7" @click="clear" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import SignaturePad from 'signature_pad'

const props = withDefaults(defineProps<{
  modelValue?: string
  width?: number
  height?: number
}>(), {
  modelValue: '',
  width: 400,
  height: 160,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const isEmpty = ref(true)
let pad: SignaturePad | null = null

onMounted(() => {
  if (!canvasEl.value) return
  pad = new SignaturePad(canvasEl.value, {
    backgroundColor: 'rgb(255,255,255)',
    penColor: 'rgb(20,80,70)',
  })
  pad.addEventListener('afterUpdateStroke', () => {
    isEmpty.value = pad?.isEmpty() ?? true
    emit('update:modelValue', pad?.toDataURL('image/png') ?? '')
  })
})

onUnmounted(() => { pad?.off() })

function clear() {
  pad?.clear()
  isEmpty.value = true
  emit('update:modelValue', '')
}

watch(() => props.modelValue, (val) => {
  if (!val && pad && !pad.isEmpty()) clear()
})
</script>

<style lang="scss" scoped>
.firma-capture {
  display: inline-block;
}
.canvas-wrap {
  position: relative;
  border: 2px dashed #26A69A;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  cursor: crosshair;
}
.sig-canvas {
  display: block;
  touch-action: none;
}
.sig-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.sig-toolbar {
  display: flex;
  justify-content: flex-end;
}
</style>
