<template>
  <div class="firma-viewer" :style="{ width: width + 'px', height: height + 'px' }">
    <img v-if="pngSrc" :src="pngSrc" :style="imgStyle" class="firma-img" />
    <div v-else-if="firma && !error" class="no-firma">
      <q-spinner color="grey-4" size="20px" />
    </div>
    <div v-else-if="error" class="no-firma text-caption text-grey-5">Sin firma</div>
    <div v-else class="no-firma">
      <q-icon name="draw" size="28px" color="grey-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  firma?: string | null
  width?: number
  height?: number
}>(), { firma: null, width: 300, height: 120 })

const pngSrc = ref<string | null>(null)
const error = ref(false)

const imgStyle = computed(() => ({
  width: props.width + 'px',
  height: props.height + 'px',
  objectFit: 'contain' as const,
}))

let libsLoaded = false

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-lib="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.setAttribute('data-lib', src)
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed: ' + src))
    document.head.appendChild(s)
  })
}

async function ensureLibs() {
  if (libsLoaded) return
  await loadScript('/vendor/jquery.min.js')
  await loadScript('/vendor/jSignature.noconflict.js')
  libsLoaded = true
}

async function render(data: string | null | undefined) {
  pngSrc.value = null
  error.value = false
  if (!data) return

  // PNG / JPEG — show directly
  if (data.startsWith('data:image/png') || data.startsWith('data:image/jpeg')) {
    pngSrc.value = data
    return
  }

  // jSignature base30 — convert to PNG via library
  if (data.startsWith('data:image/jsignature')) {
    try {
      await ensureLibs()
      // jSignature.noconflict bundles its own jQuery exposed as window.jSignature_jQuery
      // Fall back to window.jQuery (set by jquery.min.js)
      const jq = (window as Record<string, unknown>).jSignature_jQuery as ((el: HTMLElement) => { jSignature: (...a: unknown[]) => unknown }) | undefined
              || (window as Record<string, unknown>).jQuery as ((el: HTMLElement) => { jSignature: (...a: unknown[]) => unknown })
      if (!jq) { error.value = true; return }

      const container = document.createElement('div')
      container.style.cssText = `position:fixed;left:-99999px;top:-99999px;width:${props.width}px;height:${props.height}px;`
      document.body.appendChild(container)
      try {
        const $el = jq(container)
        $el.jSignature({ width: props.width, height: props.height, 'decor-color': 'transparent' })
        $el.jSignature('setData', data)
        // noconflict version registers svg/svgbase64 exporters
        const result = $el.jSignature('getData', 'svgbase64') as [string, string] | null
        if (result && result[1]) {
          pngSrc.value = 'data:image/svg+xml;base64,' + result[1]
        } else {
          error.value = true
        }
      } finally {
        document.body.removeChild(container)
      }
    } catch (e) {
      console.warn('FirmaViewer error:', e)
      error.value = true
    }
    return
  }

  // Unknown format — try showing as-is
  if (data.startsWith('data:')) {
    pngSrc.value = data
  } else {
    error.value = true
  }
}

watch(() => props.firma, (v) => void render(v))
onMounted(() => void render(props.firma))
</script>

<style lang="scss" scoped>
.firma-viewer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.no-firma {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
}
.firma-img {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  display: block;
}
</style>
