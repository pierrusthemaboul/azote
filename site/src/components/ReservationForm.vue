<script setup lang="ts">
import { ref, computed } from 'vue'
import { pages } from '../data/pages'

const name = ref('')
const email = ref('')
const date = ref('')
const guests = ref(2)
const service = ref('19:30')
const allergies = ref('')
const submitted = ref(false)

const protocol = computed(() => {
  const seed = (name.value + date.value).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return `AZ-${String(seed % 1000).padStart(3, '0')}`
})

const minDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function submit() {
  if (!name.value.trim() || !email.value.includes('@') || !date.value) return

  const body = [
    `Nom : ${name.value}`,
    `Courriel : ${email.value}`,
    `Date : ${date.value}`,
    `Couverts : ${guests.value}`,
    `Service : ${service.value}`,
    allergies.value ? `Allergies / régime : ${allergies.value}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const mailto =
    'mailto:labo@azote.example' +
    `?subject=${encodeURIComponent(`Réservation AZOTE — ${name.value}, ${guests.value} couvert${guests.value > 1 ? 's' : ''}, ${date.value} ${service.value}`)}` +
    `&body=${encodeURIComponent(body)}`

  window.location.href = mailto
  submitted.value = true
}

function reset() {
  submitted.value = false
}
</script>

<template>
  <div class="resv">
    <form v-if="!submitted" class="resv__form" @submit.prevent="submit">
      <div class="resv__row">
        <label class="resv__field">
          <span class="resv__label">Nom</span>
          <input v-model="name" class="resv__input" type="text" required autocomplete="name" />
        </label>
        <label class="resv__field">
          <span class="resv__label">Courriel</span>
          <input v-model="email" class="resv__input" type="email" required autocomplete="email" />
        </label>
      </div>

      <div class="resv__row">
        <label class="resv__field">
          <span class="resv__label">Date</span>
          <input v-model="date" class="resv__input" type="date" required :min="minDate" />
        </label>
        <label class="resv__field">
          <span class="resv__label">Couverts</span>
          <select v-model.number="guests" class="resv__input">
            <option v-for="n in 6" :key="n" :value="n">{{ n }} couvert{{ n > 1 ? 's' : '' }}</option>
          </select>
        </label>
      </div>

      <fieldset class="resv__services">
        <legend class="resv__label">Service</legend>
        <label
          v-for="s in pages.reserver.services"
          :key="s.time"
          class="resv__service"
          :class="{ 'resv__service--active': service === s.time }"
        >
          <input v-model="service" type="radio" :value="s.time" class="visually-hidden" />
          <span class="resv__service-time">{{ s.time }}</span>
          <span class="resv__service-note">{{ s.note }}</span>
        </label>
      </fieldset>

      <label class="resv__field">
        <span class="resv__label">Allergies / régime</span>
        <input
          v-model="allergies"
          class="resv__input"
          type="text"
          placeholder="Fruits à coque, végétal…"
        />
      </label>

      <button type="submit" class="btn btn--filled">Valider le protocole</button>
    </form>

    <div v-else class="resv__confirm" role="status">
      <p class="resv__confirm-kicker">Demande préparée</p>
      <p class="resv__confirm-code">{{ protocol }}</p>
      <p class="resv__confirm-body">
        {{ name }} — {{ guests }} couvert{{ guests > 1 ? 's' : '' }}, {{ date }}, service
        {{ service }}. Votre messagerie s'est ouverte avec la demande adressée au
        laboratoire — il ne reste qu'à l'envoyer.
      </p>
      <button type="button" class="btn" @click="reset">Nouvelle réservation</button>
    </div>
  </div>
</template>

<style scoped>
.resv__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.resv__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.resv__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resv__label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
}

.resv__input {
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  border: 1px solid var(--line);
  border-radius: 0;
  transition: border-color 0.25s ease;
  color-scheme: dark;
}

.resv__input:focus {
  outline: none;
  border-color: var(--accent);
}

.resv__services {
  border: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0;
}

.resv__services legend {
  margin-bottom: 0.75rem;
}

.resv__service {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.resv__service:focus-within {
  outline: 1px solid var(--accent);
  outline-offset: 3px;
}

.resv__service--active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.06);
}

.resv__service-time {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text);
}

.resv__service-note {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-muted);
}

.resv__confirm {
  border: 1px solid var(--accent);
  padding: 2.5rem;
  text-align: center;
  background: rgba(var(--accent-rgb), 0.04);
}

.resv__confirm-kicker {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}

.resv__confirm-code {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 7vw, 4rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  color: var(--text);
  margin-bottom: 1.25rem;
}

.resv__confirm-body {
  color: var(--text-muted);
  max-width: 32rem;
  margin: 0 auto 2rem;
  line-height: 1.65;
}

@media (max-width: 560px) {
  .resv__row,
  .resv__services {
    grid-template-columns: 1fr;
  }
}
</style>
