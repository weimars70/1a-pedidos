import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppTab {
  id: string
  label: string
  icon: string
  route: string
}

let tabCounter = 0

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<AppTab[]>([])
  const activeTabId = ref<string>('')

  const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value) ?? null)

  function openTab(route: string, label: string, icon: string) {
    // Si ya existe una pestaña con esa ruta, activarla
    const existing = tabs.value.find(t => t.route === route)
    if (existing) {
      activeTabId.value = existing.id
      return
    }

    const id = `tab-${++tabCounter}`
    tabs.value.push({ id, label, icon, route })
    activeTabId.value = id
  }

  function closeTab(tabId: string) {
    const idx = tabs.value.findIndex(t => t.id === tabId)
    if (idx === -1) return

    tabs.value.splice(idx, 1)

    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        const newIdx = Math.max(0, idx - 1)
        activeTabId.value = tabs.value[newIdx]!.id
      } else {
        activeTabId.value = ''
      }
    }
  }

  function setActiveTab(tabId: string) {
    activeTabId.value = tabId
  }

  function closeAllTabs() {
    tabs.value = []
    activeTabId.value = ''
  }

  // Compat aliases for existing code
  function addTab(tab: { id: string; label: string; path: string; icon?: string }) {
    openTab(tab.path, tab.label, tab.icon ?? 'tab')
  }

  function removeTab(id: string) {
    closeTab(id)
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab,
    setActiveTab,
    closeAllTabs,
    addTab,
    removeTab,
  }
})
