<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AccordionList from '../components/AccordionList.vue'
import ReservationForm from '../components/ReservationForm.vue'
import ContextNext from '../components/ContextNext.vue'
import { pages } from '../data/pages'
import { setupPageScroll } from '../composables/useScrollAnimation'

const r = pages.reserver
let cleanup: (() => void) | null = null

onMounted(() => {
  cleanup = setupPageScroll()
})

onUnmounted(() => {
  cleanup?.()
})
</script>

<template>
  <main>
    <section class="page-section page-section--dark page-hero">
      <div class="section-head" data-reveal>
        <p class="kicker">{{ r.kicker }}</p>
        <h1 class="section-title">{{ r.title }}</h1>
        <p class="section-lead">{{ r.intro }}</p>
      </div>
      <div class="hero-duo">
        <figure v-for="img in r.images" :key="img.src" class="hero-duo__item" data-reveal>
          <img :src="img.src" :alt="img.alt" data-zoom />
        </figure>
      </div>
    </section>

    <section class="page-section page-section--dark">
      <div class="resv-grid">
        <div data-reveal>
          <p class="kicker">Protocole</p>
          <h2 class="resv-grid__title">Choisir son service</h2>
          <ReservationForm />
        </div>
        <aside data-reveal>
          <p class="kicker">Infos pratiques</p>
          <AccordionList :items="r.infos" />
        </aside>
      </div>
    </section>

    <section class="page-section page-section--dark faq-section">
      <div class="section-head" data-reveal>
        <p class="kicker">FAQ</p>
        <h2 class="section-title">Questions</h2>
      </div>
      <div class="faq">
        <AccordionList :items="r.faq" />
      </div>
    </section>

    <ContextNext :label="r.next.label" :to="r.next.to" />
  </main>
</template>

<style scoped>
.page-hero {
  padding-top: clamp(6.5rem, 12vh, 9rem);
  padding-bottom: clamp(2rem, 4vw, 3rem);
}

.page-hero .section-head {
  margin-bottom: 2rem;
}

.hero-duo {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  max-width: 62rem;
  margin: 0 auto;
}

.hero-duo__item {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.hero-duo__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resv-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: clamp(2rem, 5vw, 4rem);
  max-width: 62rem;
  margin: 0 auto;
  align-items: start;
}

.resv-grid__title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 200;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.faq-section {
  border-top: 1px solid var(--line);
}

.faq {
  max-width: 62rem;
  margin: 0 auto;
}

@media (max-width: 860px) {
  .resv-grid,
  .hero-duo {
    grid-template-columns: 1fr;
  }
}
</style>
