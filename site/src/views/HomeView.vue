<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import HeroScene from '../components/HeroScene.vue'
import { content } from '../data/content'
import { setupPageScroll } from '../composables/useScrollAnimation'

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
    <HeroScene />

    <section id="philosophie" class="page-section page-section--cream">
      <div class="philo">
        <div class="philo__text" data-reveal>
          <p class="kicker">{{ content.philosophie.kicker }}</p>
          <h2 class="philo__title">{{ content.philosophie.title }}</h2>
          <p class="philo__body">{{ content.philosophie.body }}</p>
          <RouterLink :to="content.philosophie.to" class="text-link">
            {{ content.philosophie.link }} →
          </RouterLink>
        </div>
        <figure class="philo__media" data-reveal>
          <img :src="content.philosophie.image" :alt="content.philosophie.alt" data-zoom />
        </figure>
      </div>
    </section>

    <section class="quote page-section page-section--dark">
      <blockquote class="quote__line" data-reveal>
        {{ content.quote }}
      </blockquote>
    </section>

    <section class="grid" aria-label="Explorer">
      <RouterLink
        v-for="card in content.grid"
        :key="card.label"
        :to="card.to"
        class="grid__card"
      >
        <div class="grid__media">
          <img :src="card.image" alt="" data-zoom loading="lazy" decoding="async" />
        </div>
        <div class="grid__info">
          <div>
            <p class="grid__label">{{ card.label }}</p>
            <p class="grid__text">{{ card.text }}</p>
          </div>
          <span class="grid__arrow" aria-hidden="true">→</span>
        </div>
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.philo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
  max-width: 68rem;
  margin: 0 auto;
}

.philo__title {
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 4.5vw, 3.2rem);
  font-weight: 200;
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink);
  margin-bottom: 1.5rem;
}

.philo__body {
  font-size: 0.98rem;
  font-weight: 300;
  line-height: 1.75;
  color: rgba(30, 27, 21, 0.72);
  max-width: 30rem;
}

.philo__media {
  border: 1px solid var(--line-ink);
  padding: 0.75rem;
}

.philo__media img {
  width: 100%;
  height: 100%;
  min-height: 26rem;
  object-fit: cover;
}

.quote {
  text-align: center;
}

.quote__line {
  max-width: 52rem;
  margin: 0 auto;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.8rem);
  font-weight: 200;
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: var(--text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--bg);
}

.grid__card {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
}

.grid__card:last-child {
  border-right: none;
}

.grid__media {
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.grid__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease, filter 0.6s ease;
}

.grid__card:hover .grid__media img,
.grid__card:focus .grid__media img {
  transform: scale(1.04);
  filter: brightness(1.08);
}

.grid__info {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem 1.75rem;
  border-top: 1px solid var(--line);
}

.grid__label {
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.grid__text {
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--text-muted);
  max-width: 16rem;
  line-height: 1.6;
}

.grid__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--text);
  transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
}

.grid__card:hover .grid__arrow,
.grid__card:focus .grid__arrow {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 720px) {
  .philo {
    grid-template-columns: 1fr;
  }

  .philo__media img {
    min-height: 16rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .grid__card {
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
}
</style>
