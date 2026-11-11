<script setup lang="ts">
import { content } from '../data/content'

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="footer">
    <div class="footer__row">
      <div class="footer__brand">
        <p class="footer__wordmark">{{ content.footer.tagline }}</p>
        <p class="footer__address">{{ content.footer.address }}</p>
      </div>

      <ul class="footer__links" role="list">
        <li v-for="link in content.footer.links" :key="link.label">
          <RouterLink :to="link.href" class="footer__link">{{ link.label }}</RouterLink>
        </li>
      </ul>
    </div>

    <div class="footer__bottom">
      <p class="footer__legal">
        AZOTE — restaurant fictif de démonstration. Site réalisé avec Vue&nbsp;3.
      </p>
      <button type="button" class="footer__top" @click="backToTop">
        Haut de page ↑
      </button>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  background: var(--bg);
  padding: clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem) 2rem;
}

.footer__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
}

.footer__wordmark {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 200;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text);
  margin-bottom: 0.75rem;
}

.footer__address {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  max-width: 32rem;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  list-style: none;
}

.footer__link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  transition: color 0.25s ease;
}

.footer__link:hover,
.footer__link:focus {
  color: var(--accent);
  outline: none;
}

.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
}

.footer__legal {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.footer__top {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  transition: opacity 0.25s ease;
}

.footer__top:hover,
.footer__top:focus {
  opacity: 0.7;
  outline: none;
}
</style>
