<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="app">
    <a href="#main" class="skip-link">Aller au contenu</a>
    <NavBar />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <FooterSection />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  width: 100%;
  background: var(--bg);
  color: var(--text);
}

.skip-link {
  position: fixed;
  top: -4rem;
  left: 1rem;
  z-index: 200;
  padding: 0.7rem 1.2rem;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  transition: top 0.2s ease;
}

.skip-link:focus-visible {
  top: 1rem;
  outline: none;
}
</style>
