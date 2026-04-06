const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Always land at the top on refresh/load
(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener("load", () => {
    if (window.location.hash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    window.scrollTo(0, 0);
  });
})();

// Scroll progress bar
(() => {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
})();

// Scroll-spy: highlight active nav link
(() => {
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  const inPageLinks = document.querySelectorAll('a[href^="#"]');
  const sections = [];
  let activeLink = null;
  let scrollTicking = false;
  let smoothScrollFrame = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  navLinks.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ el, link });
  });

  if (!sections.length) return;

  function getThreshold() {
    const header = document.querySelector(".site-header");
    return header ? header.getBoundingClientRect().height + 40 : 120;
  }

  function cancelSmoothScroll() {
    if (!smoothScrollFrame) return;
    cancelAnimationFrame(smoothScrollFrame);
    smoothScrollFrame = null;
  }

  function easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  function smoothScrollTo(targetY) {
    cancelSmoothScroll();

    const startY = window.scrollY;
    const destination = Math.max(0, Math.round(targetY));
    const distance = destination - startY;

    if (prefersReducedMotion.matches || Math.abs(distance) < 2) {
      window.scrollTo(0, destination);
      return;
    }

    const duration = Math.min(1050, Math.max(680, Math.abs(distance) * 0.55));
    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuart(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        smoothScrollFrame = requestAnimationFrame(step);
      } else {
        smoothScrollFrame = null;
      }
    }

    smoothScrollFrame = requestAnimationFrame(step);
  }

  function scrollToSection(el) {
    const top = window.scrollY + el.getBoundingClientRect().top - getThreshold() + 12;
    smoothScrollTo(top);
  }

  function paintActive(link) {
    if (activeLink === link) return;

    navLinks.forEach((l) => {
      l.classList.remove("active");
      l.removeAttribute("aria-current");
      l.style.background = "";
      l.style.color = "";
      l.style.opacity = "";
      l.style.fontWeight = "";
      l.style.boxShadow = "";
    });

    if (!link) return;

    link.classList.add("active");
    link.setAttribute("aria-current", "true");
    link.style.background = "#f7f7f4";
    link.style.color = "#111318";
    link.style.opacity = "1";
    link.style.fontWeight = "700";
    link.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.24), 0 8px 18px rgba(0,0,0,0.22)";
    activeLink = link;
  }

  function updateActive() {
    const threshold = getThreshold();
    let current = sections[0].link;
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollBottom >= docHeight - 8) {
      paintActive(sections[sections.length - 1].link);
      return;
    }

    for (const { el, link } of sections) {
      const rect = el.getBoundingClientRect();

      if (rect.top <= threshold && rect.bottom > threshold) {
        current = link;
        break;
      }

      if (rect.top <= threshold) {
        current = link;
      }
    }

    paintActive(current);
  }

  function requestActiveUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateActive();
      scrollTicking = false;
    });
  }

  inPageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const id = href ? href.slice(1) : "";
      if (!id) return;

      const el = document.getElementById(id);
      if (!el) return;

      event.preventDefault();

      if (link.matches('.site-nav a[href^="#"]')) {
        paintActive(link);
      }

      history.replaceState(null, "", `#${id}`);
      scrollToSection(el);
      requestAnimationFrame(updateActive);
      setTimeout(updateActive, 220);
    });
  });

  ["wheel", "touchstart", "mousedown", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, cancelSmoothScroll, { passive: true });
  });

  window.addEventListener("scroll", requestActiveUpdate, { passive: true });
  window.addEventListener("resize", updateActive);
  window.addEventListener("hashchange", updateActive);
  updateActive();
})();

// Scroll-reveal: animate sections into view with staggered children
(() => {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  document.documentElement.classList.add("reveal-ready");

  // Tag stagger-able children and set incremental delays
  reveals.forEach((section) => {
    const children = section.querySelectorAll(
      ".project-card, .exp-card, .edu-card, .skill-group, .award-card, .contact-link"
    );
    children.forEach((child, i) => {
      child.classList.add("stagger");
      child.style.animationDelay = `${i * 0.08}s`;
      child.addEventListener("animationend", () => {
        child.classList.remove("stagger");
        child.classList.add("stagger-done");
        child.style.animation = "none";
      }, { once: true });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  reveals.forEach((el) => observer.observe(el));
})();
