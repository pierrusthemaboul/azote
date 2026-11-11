<script setup lang="ts">
import { content } from '../data/content'

const hero = content.hero
</script>

<template>
  <section class="hero" aria-label="Accueil">
    <div class="hero__media" aria-hidden="true">
      <img :src="hero.image" alt="" class="hero__img" fetchpriority="high" />
      <div class="hero__veil" />
    </div>

    <p class="hero__pager" aria-hidden="true">
      <span v-for="(p, i) in hero.pager.split(' — ')" :key="i">{{ p }}</span>
    </p>

    <div class="hero__inner">
      <h1 class="hero__title">
        <span
          v-for="(line, i) in hero.lines"
          :key="line"
          class="hero__line"
          :class="{ 'hero__line--accent': i === hero.accentLine }"
        >
          {{ line }}
        </span>
      </h1>
      <p class="hero__sub">{{ hero.sub }}</p>
      <RouterLink :to="hero.ctaTo" class="hero__cta">
        <span class="hero__cta-circle" aria-hidden="true">→</span>
        {{ hero.cta }}
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--bg);
}

.hero__media {
  position: absolute;
  inset: 0;
}

.hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(var(--bg-rgb), 0.72) 0%,
    rgba(var(--bg-rgb), 0.25) 55%,
    rgba(var(--bg-rgb), 0.1) 100%
  );
}

.hero__inner {
  position: relative;
  z-index: 2;
  padding: clamp(6rem, 14vh, 9rem) clamp(1.5rem, 6vw, 4.5rem);
  max-width: 60rem;
}

.hero__title {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: clamp(2.6rem, 8vw, 6.5rem);
  line-height: 1.08;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.hero__line {
  display: block;
}

.hero__line--accent {
  color: var(--accent);
}

.hero__sub {
  margin-top: 1.75rem;
  max-width: 26rem;
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 1.7;
  color: var(--text-muted);
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 2.5rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text);
  transition: color 0.25s ease;
}

.hero__cta-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid var(--accent);
  border-radius: 50%;
  color: var(--accent);
  transition: background 0.25s ease, color 0.25s ease;
}

.hero__cta:hover,
.hero__cta:focus {
  color: var(--accent);
  outline: none;
}

.hero__cta:hover .hero__cta-circle,
.hero__cta:focus .hero__cta-circle {
  background: var(--accent);
  color: var(--bg);
}

.hero__pager {
  position: absolute;
  right: clamp(1.25rem, 4vw, 3rem);
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.hero__pager span + span::before {
  content: '';
  display: block;
  width: 1px;
  height: 3rem;
  background: var(--line);
  margin: 0 auto;
}

@media (max-width: 640px) {
  .hero__pager {
    display: none;
  }
}
</style>
