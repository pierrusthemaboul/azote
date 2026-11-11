<script setup lang="ts">
defineProps<{
  label: string
  to: string
}>()
</script>

<template>
  <section class="next page-section page-section--dark">
    <RouterLink :to="to" class="next__link" data-reveal>
      <span class="next__kicker">Suite →</span>
      <span class="next__label">{{ label }}</span>
    </RouterLink>
  </section>
</template>

<style scoped>
.next {
  border-top: 1px solid var(--line);
}

.next__link {
  display: block;
  max-width: 62rem;
  margin: 0 auto;
}

.next__kicker {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}

.next__label {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5.5vw, 3.8rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  font-style: italic;
  color: var(--text);
  transition: color 0.3s ease;
}

.next__link:hover .next__label,
.next__link:focus .next__label {
  color: var(--accent);
}
</style>
