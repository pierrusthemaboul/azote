<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { content } from '../data/content'

const scrolled = ref(false)
const menuOpen = ref(false)
const route = useRoute()

function onScroll() {
  scrolled.value = window.scrollY > 40
}

function closeMenu() {
  menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

watch(
  () => route.fullPath,
  () => closeMenu()
)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <nav class="nav" :class="{ 'nav--scrolled': scrolled || menuOpen }" aria-label="Navigation principale">
    <RouterLink to="/" class="nav__brand" aria-label="Retour à l'accueil">
      <span class="nav__logo">{{ content.hero.brand.replace('.', '') }}</span>
      <span class="nav__sub">restaurant moléculaire</span>
    </RouterLink>

    <ul class="nav__links">
      <li v-for="link in content.nav.slice(0, 2)" :key="link.label">
        <RouterLink :to="link.href" class="nav__link">{{ link.label }}</RouterLink>
      </li>
      <li>
        <RouterLink to="/reserver" class="nav__cta">Réserver une table →</RouterLink>
      </li>
    </ul>

    <button
      class="nav__burger"
      :class="{ 'nav__burger--open': menuOpen }"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="nav-menu"
      :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
      @click="menuOpen = !menuOpen"
    >
      <span class="nav__burger-bar" />
      <span class="nav__burger-bar" />
    </button>
  </nav>

  <div id="nav-menu" class="nav-menu" :class="{ 'nav-menu--open': menuOpen }" :inert="!menuOpen">
    <ul class="nav-menu__links" role="list">
      <li v-for="(link, i) in content.nav" :key="link.label" :style="{ '--i': i }">
        <RouterLink :to="link.href" class="nav-menu__link" @click="closeMenu">
          {{ link.label }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.4rem clamp(1.25rem, 4vw, 3rem);
  color: var(--text);
  background: transparent;
  transition: background 0.3s ease, border-color 0.3s ease;
  border-bottom: 1px solid transparent;
}

.nav--scrolled {
  background: rgba(var(--bg-rgb), 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: var(--line);
}

.nav__brand {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.nav__logo {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 300;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--text);
}

.nav__sub {
  font-family: var(--font-display);
  font-size: 0.55rem;
  font-weight: 300;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: clamp(1.5rem, 3vw, 2.75rem);
  list-style: none;
}

.nav__link {
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--text);
  opacity: 0.85;
  transition: color 0.25s ease, opacity 0.25s ease;
}

.nav__link:hover,
.nav__link:focus,
.nav__link.router-link-active {
  color: var(--accent);
  opacity: 1;
  outline: none;
}

.nav__cta {
  display: inline-flex;
  padding: 0.65rem 1.5rem;
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text);
  border: 1px solid var(--accent);
  border-radius: 999px;
  transition: background 0.25s ease, color 0.25s ease;
}

.nav__cta:hover,
.nav__cta:focus-visible {
  background: var(--accent);
  color: var(--bg);
  outline: none;
}

.nav__burger {
  display: none;
  position: relative;
  z-index: 110;
  width: 2.5rem;
  height: 2.5rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.nav__burger-bar {
  display: block;
  width: 1.6rem;
  height: 1.5px;
  background: var(--text);
  transition: transform 0.3s ease;
}

.nav__burger--open .nav__burger-bar:first-child {
  transform: translateY(3.5px) rotate(45deg);
}

.nav__burger--open .nav__burger-bar:last-child {
  transform: translateY(-3.5px) rotate(-45deg);
}

.nav-menu {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bg-rgb), 0.97);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.nav-menu--open {
  opacity: 1;
  visibility: visible;
}

.nav-menu__links {
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.25rem;
  text-align: center;
}

.nav-menu__link {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 7vw, 2.6rem);
  font-weight: 200;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.35s ease, transform 0.35s ease, color 0.25s ease;
  transition-delay: calc(var(--i, 0) * 40ms);
}

.nav-menu--open .nav-menu__link {
  opacity: 0.95;
  transform: translateY(0);
}

.nav-menu__link:hover,
.nav-menu__link:focus,
.nav-menu__link.router-link-active {
  color: var(--accent);
  outline: none;
}

@media (max-width: 720px) {
  .nav__links {
    display: none;
  }

  .nav__burger {
    display: flex;
  }
}
</style>
