<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import ContextNext from '../components/ContextNext.vue'
import { pages } from '../data/pages'
import { setupPageScroll } from '../composables/useScrollAnimation'

const l = pages.laboratoire
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
        <p class="kicker">{{ l.kicker }}</p>
        <h1 class="section-title">{{ l.title }}</h1>
        <p class="section-lead">{{ l.intro }}</p>
      </div>
      <figure class="hero-media" data-reveal>
        <img :src="l.heroImage" alt="Paillasse du laboratoire : éprouvettes, pinces, ingrédients" data-zoom />
      </figure>
    </section>

    <section class="page-section page-section--dark tech-section">
      <div class="section-head" data-reveal>
        <p class="kicker">Instruments</p>
        <h2 class="section-title">Six techniques</h2>
      </div>
      <ul class="tech" role="list">
        <li v-for="t in l.techniques" :key="t.index" class="tech__item" data-reveal>
          <span class="tech__index">{{ t.index }}</span>
          <h3 class="tech__name">{{ t.name }}</h3>
          <span class="tech__temp">{{ t.temp }}</span>
          <p class="tech__body">{{ t.body }}</p>
        </li>
      </ul>
    </section>

    <figure class="band" aria-hidden="true">
      <img :src="l.bandImage" alt="" data-zoom />
    </figure>

    <section class="page-section page-section--dark">
      <div class="section-head" data-reveal>
        <p class="kicker">Méthode</p>
        <h2 class="section-title">Du protocole à l'assiette</h2>
      </div>
      <ol class="method" role="list">
        <li v-for="m in l.method" :key="m.step" class="method__item" data-reveal>
          <span class="method__step">{{ m.step }}</span>
          <div>
            <h3 class="method__title">{{ m.title }}</h3>
            <p class="method__body">{{ m.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="page-section page-section--cream">
      <div class="chef" data-reveal>
        <div class="chef__text">
          <p class="kicker">L'expérimentatrice</p>
          <h2 class="chef__name">{{ l.chef.name }}</h2>
          <p class="chef__role">{{ l.chef.role }}</p>
          <p class="chef__body">{{ l.chef.body }}</p>
        </div>
        <figure class="chef__media">
          <img :src="l.chef.image" alt="Élise Moreau en cuisine, silhouette dans la vapeur" data-zoom />
        </figure>
      </div>
    </section>

    <ContextNext :label="l.next.label" :to="l.next.to" />
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

.tech-section {
  padding-top: 0;
}

.tech {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  list-style: none;
  max-width: 62rem;
  margin: 0 auto;
}

.tech__item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.75rem;
  background: var(--bg);
}

.tech__index {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  color: var(--accent);
}

.tech__name {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 300;
  color: var(--text);
}

.tech__temp {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.tech__body {
  font-size: 0.92rem;
  font-weight: 300;
  line-height: 1.6;
  color: var(--text-muted);
}

.band {
  aspect-ratio: 21 / 7;
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.band img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.method {
  list-style: none;
  max-width: 62rem;
  margin: 0 auto;
  border-top: 1px solid var(--line);
}

.method__item {
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 1.5rem;
  padding: 1.75rem 0;
  border-bottom: 1px solid var(--line);
}

.method__step {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent);
}

.method__title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  margin-bottom: 0.4rem;
}

.method__body {
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--text-muted);
  max-width: 42rem;
}

.chef {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
  max-width: 62rem;
  margin: 0 auto;
}

.chef__name {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 200;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--ink);
  margin-bottom: 0.4rem;
}

.chef__role {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.chef__body {
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.7;
  color: rgba(30, 27, 21, 0.72);
  max-width: 32rem;
}

.chef__media {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid var(--line-ink);
}

.chef__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 720px) {
  .chef {
    grid-template-columns: 1fr;
  }
}
</style>
