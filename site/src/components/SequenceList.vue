<script setup lang="ts">
import type { Sequence } from '../data/pages'

defineProps<{
  sequences: Sequence[]
}>()
</script>

<template>
  <ol class="seq" role="list">
    <li v-for="s in sequences" :key="s.number" class="seq__item" data-reveal>
      <span class="seq__number">{{ s.number.replace('SEQ.', '') }}</span>
      <div class="seq__body">
        <div class="seq__head">
          <h3 class="seq__name">{{ s.name }}</h3>
          <span class="seq__dots" aria-hidden="true" />
          <span class="seq__tech">{{ s.technique }}</span>
        </div>
        <p class="seq__desc">{{ s.description }}</p>
      </div>
      <div v-if="s.image" class="seq__thumb">
        <img :src="s.image" alt="" loading="lazy" decoding="async" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.seq {
  list-style: none;
  border-top: 1px solid var(--line);
  max-width: 62rem;
  margin: 0 auto;
}

.seq__item {
  display: grid;
  grid-template-columns: 3.5rem 1fr auto;
  gap: clamp(1rem, 3vw, 2rem);
  padding: 2rem 0;
  border-bottom: 1px solid var(--line);
  align-items: center;
}

.seq__thumb {
  width: 7.5rem;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid var(--line);
}

.seq__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.5s ease;
  filter: saturate(0.9);
}

.seq__item:hover .seq__thumb img {
  transform: scale(1.06);
  filter: saturate(1.1);
}

.seq__number {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: var(--accent);
  padding-top: 0.5rem;
}

.seq__head {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  margin-bottom: 0.6rem;
}

.seq__name {
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 3vw, 1.9rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--text);
  white-space: nowrap;
}

.seq__dots {
  flex: 1;
  border-bottom: 1px dotted var(--line);
  transform: translateY(-4px);
}

.seq__tech {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;
}

.seq__desc {
  font-size: 0.98rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 40rem;
}

@media (max-width: 560px) {
  .seq__item {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .seq__thumb {
    width: 100%;
    margin-top: 0.75rem;
  }

  .seq__number {
    padding-top: 0;
  }

  .seq__name {
    white-space: normal;
  }
}
</style>
