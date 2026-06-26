const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function animateNumber(element, nextValue, options = {}) {
  if (!element) {
    return;
  }

  const { duration = 650, formatter = (value) => String(Math.round(value)) } = options;
  const target = Number(nextValue) || 0;

  if (prefersReducedMotion) {
    element.textContent = formatter(target);
    return;
  }

  const previous = Number(element.dataset.numericValue || 0);
  const startTime = performance.now();

  element.dataset.numericValue = String(target);

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = previous + (target - previous) * eased;

    element.textContent = formatter(current);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

export function animateBars(container) {
  if (!container) {
    return;
  }

  const bars = container.querySelectorAll("[data-bar-value]");

  bars.forEach((bar) => {
    const value = Number(bar.dataset.barValue) || 0;
    bar.style.width = "0%";

    requestAnimationFrame(() => {
      bar.style.width = `${value}%`;
    });
  });
}
