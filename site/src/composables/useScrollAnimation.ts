import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function reducedMotionActive(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setupPageScroll(): () => void {
  if (reducedMotionActive() || typeof window === 'undefined') return () => {}

  const revealEls = gsap.utils.toArray<HTMLElement>('[data-reveal]')
  const triggers: ScrollTrigger[] = []

  revealEls.forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 32, willChange: 'transform, opacity' })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' })
      },
    })
    triggers.push(st)
  })

  const zoomEls = gsap.utils.toArray<HTMLElement>('[data-zoom]')
  zoomEls.forEach((el) => {
    gsap.set(el, { scale: 1.04, willChange: 'transform' })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(el, { scale: 1.04 + self.progress * 0.08 })
      },
    })
    triggers.push(st)
  })

  const countEls = gsap.utils.toArray<HTMLElement>('[data-count]')
  countEls.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count') || '0')
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val)).padStart(
              el.getAttribute('data-count')?.length || 2,
              '0'
            )
          },
        })
      },
    })
    triggers.push(st)
  })

  return () => {
    triggers.forEach((st) => st.kill())
    revealEls.forEach((el) => gsap.set(el, { clearProps: 'all' }))
    zoomEls.forEach((el) => gsap.set(el, { clearProps: 'all' }))
    countEls.forEach((el) => gsap.set(el, { clearProps: 'all' }))
  }
}
