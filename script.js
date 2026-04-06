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

// Scroll-spy: highlight active nav link
(() => {
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  const sections = [];
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

  function paintActive(link) {
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

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      paintActive(link);
      requestAnimationFrame(updateActive);
      setTimeout(updateActive, 120);
    });
  });

  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", updateActive);
  window.addEventListener("hashchange", updateActive);
  updateActive();
})();

// Scroll-reveal: animate sections into view
(() => {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  // Signal CSS that JS is ready — sections stay visible if JS fails
  document.documentElement.classList.add("reveal-ready");

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
