<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import SequenceList from '../components/SequenceList.vue'
import ContextNext from '../components/ContextNext.vue'
import { pages } from '../data/pages'
import { setupPageScroll } from '../composables/useScrollAnimation'

const d = pages.degustation
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
        <p class="kicker">{{ d.kicker }}</p>
        <h1 class="section-title">{{ d.title }}</h1>
        <p class="section-lead">{{ d.intro }}</p>
      </div>
      <figure class="hero-media" data-reveal>
        <img :src="d.heroImage" alt="Dessert sous fumée d'azote" data-zoom />
      </figure>
    </section>

    <section class="page-section page-section--dark seq-wrap">
      <SequenceList :sequences="d.sequences" />
    </section>

    <section class="page-section page-section--dark">
      <div class="extras">
        <div class="extras__item" data-reveal>
          <p class="kicker">Accords</p>
          <h2 class="extras__title">{{ d.pairing.title }}</h2>
          <p class="extras__body">{{ d.pairing.body }}</p>
          <figure class="extras__media">
            <img :src="d.pairing.image" alt="Cocktail sombre fumant au comptoir" loading="lazy" />
          </figure>
        </div>
        <div class="extras__item extras__price" data-reveal>
          <p class="kicker">Tarif</p>
          <p class="extras__amount">{{ d.price.amount }}</p>
          <p class="extras__note">{{ d.price.note }}</p>
          <RouterLink to="/reserver" class="btn btn--filled">Réserver une table</RouterLink>
        </div>
      </div>
    </section>

    <ContextNext :label="d.next.label" :to="d.next.to" />
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

.hero-media {
  max-width: 62rem;
  margin: 0 auto;
  aspect-ratio: 21 / 9;
  overflow: hidden;
  border: 1px solid var(--line);
}

.hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seq-wrap {
  padding-top: 0;
}

.extras {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 3rem;
  max-width: 62rem;
  margin: 0 auto;
  align-items: start;
}

.extras__title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 200;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.extras__body {
  color: var(--text-muted);
  line-height: 1.7;
  font-weight: 300;
}

.extras__media {
  margin-top: 1.75rem;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--line);
}

.extras__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.extras__price {
  border: 1px solid var(--line);
  padding: 2rem;
  text-align: center;
}

.extras__amount {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 200;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.extras__note {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
  letter-spacing: 0.08em;
}

@media (max-width: 720px) {
  .extras {
    grid-template-columns: 1fr;
  }
}
</style>
