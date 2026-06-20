<template>
  <div class="login-page">
    <!-- Left Panel: Brand -->
    <div class="panel-left">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
      <div class="bg-blob blob-3"></div>
      <div class="brand">
        <div class="logo-wrap">
          <div class="logo-ring">
            <div class="logo-inner">
              <span class="logo-uno">UNO</span>
              <span class="logo-sep">— A</span>
            </div>
          </div>
        </div>
        <p class="brand-name">ASEO INTEGRADO S.A.</p>
        <p class="brand-tagline">Sistema de Gestión Empresarial</p>
      </div>
    </div>

    <!-- Right Panel: Form -->
    <div class="panel-right">
      <div class="form-wrap">
        <div class="form-header">
          <h1 class="welcome">¡Bienvenido!</h1>
          <p class="welcome-sub">
            {{ step === 1 ? 'Ingresa tu nombre de usuario para continuar' : 'Selecciona la empresa e ingresa tu clave' }}
          </p>
        </div>

        <!-- Step 1: Username -->
        <transition name="slide-fade" mode="out-in">
          <q-form v-if="step === 1" key="step1" class="q-gutter-y-sm" @submit.prevent="onContinuar">
            <q-input
              v-model="form.email"
              label="Email"
              type="email"
              outlined
              dense
              color="primary"
              autofocus
              :disable="loading"
              :rules="[(v) => !!v || 'Campo requerido', (v) => /.+@.+\..+/.test(v) || 'Email inválido']"
            >
              <template #prepend>
                <q-icon name="email" color="grey-5" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              label="Clave"
              :type="showPass ? 'text' : 'password'"
              outlined
              dense
              color="primary"
              :disable="loading"
              :rules="[(v) => !!v || 'Campo requerido']"
            >
              <template #prepend>
                <q-icon name="lock_outline" color="grey-5" />
              </template>
              <template #append>
                <q-icon
                  :name="showPass ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer text-grey-5"
                  @click="showPass = !showPass"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="CONTINUAR"
              class="full-width continuar-btn q-mt-sm"
              :loading="loading"
              unelevated
              no-caps
            />
          </q-form>

          <!-- Step 2: Empresa -->
          <q-form v-else key="step2" class="q-gutter-y-sm" @submit.prevent="onSubmit">
            <div class="usuario-chip q-mb-xs">
              <q-icon name="person" color="primary" size="16px" />
              <span class="usuario-label">{{ form.email }}</span>
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                label="Cambiar"
                color="primary"
                class="q-ml-auto"
                :disable="loading"
                @click="backToStep1"
              />
            </div>

            <q-select
              v-model="form.empresa"
              :options="empresas"
              option-label="nombre"
              option-value="id"
              label="Seleccione empresa..."
              outlined
              dense
              color="primary"
              emit-value
              map-options
              :disable="loading"
              :rules="[(v) => !!v || 'Seleccione una empresa']"
            >
              <template #prepend>
                <q-icon name="business" color="grey-5" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin opciones disponibles</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-btn
              type="submit"
              label="ENTRAR"
              class="full-width entrar-btn q-mt-sm"
              :loading="loading"
              unelevated
              no-caps
            />
          </q-form>
        </transition>

        <transition name="fade">
          <div v-if="error" class="error-msg q-mt-md">
            <q-icon name="error_outline" size="18px" />
            <span>{{ error }}</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

interface Empresa {
  id: number
  nombre: string
}

const router = useRouter()
const authStore = useAuthStore()

const step = ref<1 | 2>(1)
const form = ref({ email: '', empresa: null as number | null, password: '' })
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const empresas = ref<Empresa[]>([])

function backToStep1() {
  step.value = 1
  form.value.empresa = null
  form.value.password = ''
  showPass.value = false
  error.value = ''
  empresas.value = []
}

async function onContinuar() {
  if (!form.value.email.trim() || !form.value.password.trim()) return
  error.value = ''
  loading.value = true
  try {
    console.log('FRONTEND auth.login request step1:', {
      email: form.value.email.trim(),
      password: form.value.password,
    })
    const { data } = await api.post('/auth/login', {
      email: form.value.email.trim(),
      password: form.value.password,
    })
    console.log('FRONTEND auth.login response step1:', data)
    empresas.value = data.empresas
    if (!Array.isArray(data.empresas) || data.empresas.length === 0) {
      error.value = 'No hay empresas disponibles para este usuario'
      return
    }
    if (data.empresas.length === 1) {
      form.value.empresa = data.empresas[0].id
    }
    step.value = 2
  } catch (e: unknown) {
    const err = e as { response?: { status?: number; data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    console.log('FRONTEND auth.login request step2:', {
      email: form.value.email.trim(),
      password: form.value.password,
      empresa: form.value.empresa,
    })
    const { data } = await api.post('/auth/login', {
      email: form.value.email.trim(),
      password: form.value.password,
      empresa: form.value.empresa,
    })
    console.log('FRONTEND auth.login response step2:', data)
    authStore.setToken(data.access_token)
    authStore.setUser(data.user)
    void router.push('/app/inicio')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
$teal-dark  : #0F5A52;
$teal-mid   : #1B7A6E;
$teal-light : #26A69A;

.login-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Left Panel ── */
.panel-left {
  position: relative;
  width: 50%;
  background: linear-gradient(145deg, $teal-dark 0%, $teal-mid 45%, $teal-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -60px;
    top: 0;
    width: 120px;
    height: 100%;
    background: white;
    border-radius: 50% 0 0 50%;
    opacity: 0.07;
  }
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}
.blob-1 { width: 440px; height: 440px; top: -140px; left: -120px; }
.blob-2 { width: 320px; height: 320px; bottom: -100px; right: -60px; }
.blob-3 { width: 180px; height: 180px; top: 55%; left: 65%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.04); }

.brand {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  animation: fadeInUp 0.7s ease both;
}

.logo-wrap { margin-bottom: 28px; }

.logo-ring {
  width: 210px;
  height: 210px;
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: white;
  box-shadow:
    0 0 0 10px rgba(255, 255, 255, 0.12),
    0 0 0 20px rgba(255, 255, 255, 0.06),
    0 20px 60px rgba(0, 0, 0, 0.35);
}

.logo-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}

.logo-uno {
  font-size: 44px;
  font-weight: 900;
  color: $teal-mid;
  letter-spacing: 8px;
  font-family: 'Roboto', sans-serif;
  border-bottom: 3px double $teal-light;
  padding-bottom: 2px;
}

.logo-sep {
  font-size: 38px;
  font-weight: 900;
  color: $teal-mid;
  letter-spacing: 4px;
  font-family: 'Roboto', sans-serif;
}

.brand-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 8px;
  text-transform: uppercase;
}

.brand-tagline {
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* ── Right Panel ── */
.panel-right {
  width: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 56px;
}

.form-wrap {
  width: 100%;
  max-width: 380px;
  animation: fadeInRight 0.7s ease both;
  animation-delay: 0.15s;
}

.form-header { margin-bottom: 36px; }

.welcome {
  font-size: 40px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
  line-height: 1.15;
}

.welcome-sub {
  font-size: 14px;
  color: #9e9e9e;
  margin: 0;
}

/* ── Usuario chip (step 2) ── */
.usuario-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f0faf9;
  border: 1px solid rgba(27, 122, 110, 0.25);
  border-radius: 8px;
  font-size: 13px;
  color: #1B7A6E;
  font-weight: 600;
}

.usuario-label {
  font-weight: 600;
  color: #1B7A6E;
}

.continuar-btn {
  height: 50px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
  background: linear-gradient(90deg, $teal-dark 0%, $teal-mid 100%);
  color: white;
  border-radius: 10px;
  transition: all 0.25s ease;

  &:hover {
    background: linear-gradient(90deg, $teal-mid 0%, $teal-light 100%);
    box-shadow: 0 10px 28px rgba(27, 122, 110, 0.45);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.entrar-btn {
  height: 50px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
  background: linear-gradient(90deg, $teal-dark 0%, $teal-mid 100%);
  color: white;
  border-radius: 10px;
  transition: all 0.25s ease;

  &:hover {
    background: linear-gradient(90deg, $teal-mid 0%, $teal-light 100%);
    box-shadow: 0 10px 28px rgba(27, 122, 110, 0.45);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff5f5;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  font-size: 13px;
}

/* ── Animations ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .panel-left { width: 100%; height: 260px; }
  .logo-ring { width: 140px; height: 140px; }
  .logo-uno { font-size: 28px; }
  .logo-sep { font-size: 24px; }
  .brand-name, .brand-tagline { display: none; }
  .panel-right { width: 100%; padding: 32px 24px; }
  .welcome { font-size: 30px; }
}
</style>
