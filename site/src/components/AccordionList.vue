<script setup lang="ts">
import { ref, useId } from 'vue'
import type { AccordionItemData } from '../data/pages'

defineProps<{
  items: AccordionItemData[]
}>()

const openIndex = ref<number | null>(0)
const uid = useId()

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <ul class="accordion" role="list">
    <li v-for="(item, index) in items" :key="item.title" class="accordion__item">
      <button
        type="button"
        class="accordion__trigger"
        :aria-expanded="openIndex === index"
        :aria-controls="`acc-${uid}-${index}`"
        @click="toggle(index)"
      >
        <span class="accordion__title">{{ item.title }}</span>
        <span class="accordion__icon" aria-hidden="true">
          {{ openIndex === index ? '−' : '+' }}
        </span>
      </button>
      <div
        v-show="openIndex === index"
        :id="`acc-${uid}-${index}`"
        class="accordion__panel"
      >
        <p class="accordion__body">{{ item.body }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.accordion {
  list-style: none;
  border-top: 1px solid var(--line);
}

.accordion__item {
  border-bottom: 1px solid var(--line);
}

.accordion__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.35rem 0;
  text-align: left;
}

.accordion__trigger:hover .accordion__title,
.accordion__trigger:focus .accordion__title {
  color: var(--accent);
}

.accordion__title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  color: var(--text);
  transition: color 0.25s ease;
}

.accordion__icon {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--accent);
}

.accordion__panel {
  padding-bottom: 1.35rem;
}

.accordion__body {
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 46rem;
}
</style>
