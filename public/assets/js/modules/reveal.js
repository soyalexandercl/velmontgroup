// Revela las secciones con un fade-in suave al entrar en el viewport.
// Respeta prefers-reduced-motion desactivando la animacion.
export function initReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((element) => observer.observe(element));
}
