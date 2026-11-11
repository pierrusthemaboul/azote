<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const path = computed(() => route.fullPath)
</script>

<template>
  <main class="nf">
    <section class="page-section page-section--dark nf__inner">
      <p class="kicker">Erreur 404</p>
      <h1 class="nf__code">PAGE<br />INTROUVABLE<span class="nf__dot">.</span></h1>
      <p class="nf__path">{{ path }}</p>
      <p class="nf__body">
        Cette séquence n'existe pas dans le protocole. Retour au menu principal.
      </p>
      <RouterLink to="/" class="btn">Retour à l'accueil</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.nf__inner {
  min-height: 80svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  max-width: 62rem;
  margin: 0 auto;
}

.nf__code {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 9vw, 6.5rem);
  font-weight: 400;
  line-height: 0.98;
  letter-spacing: -0.03em;
  
  margin-bottom: 1.25rem;
}

.nf__dot {
  color: var(--accent);
}

.nf__path {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent);
  margin-bottom: 1.5rem;
  word-break: break-all;
}

.nf__body {
  color: var(--text-muted);
  margin-bottom: 2rem;
  max-width: 30rem;
}
</style>
