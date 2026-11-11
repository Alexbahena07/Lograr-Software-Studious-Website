(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Menu ---------- */
  const menuBtn = $("#menuBtn");
  const menu = $("#menu");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", !open);
  };
  menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Typing code in hero ---------- */
  const codeEl = $("#code");
  const lines = [
    [["c", "// your idea, shipped"]],
    [["k", "const "], ["", "project = "], ["f", "lograr"], ["", "({"]],
    [["", "  goal: "], ["s", "\"grow the business\""], ["", ","]],
    [["", "  design: "], ["s", "\"bold, fast, yours\""], ["", ","]],
    [["", "  stack: ["], ["s", "\"web\""], ["", ", "], ["s", "\"mobile\""], ["", ", "], ["s", "\"cloud\""], ["", "],"]],
    [["", "});"]],
    [["k", "await "], ["", "project."], ["f", "launch"], ["", "(); "], ["c", "// achieved ✓"]],
  ];
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const render = (charsShown) => {
    let left = charsShown, html = "";
    for (const line of lines) {
      for (const [cls, txt] of line) {
        if (left <= 0) break;
        const part = txt.slice(0, left);
        left -= part.length;
        html += cls ? `<span class="${cls}">${esc(part)}</span>` : esc(part);
      }
      if (left <= 0) break;
      html += "\n";
      left -= 1;
    }
    codeEl.innerHTML = html + '<span class="cursor"></span>';
  };
  const total = lines.reduce((n, l) => n + l.reduce((m, [, t]) => m + t.length, 0) + 1, 0);
  if (reduce) render(total);
  else {
    let i = 0;
    const tick = () => {
      render(i);
      i++;
      if (i <= total) setTimeout(tick, 28 + Math.random() * 40);
      else setTimeout(() => { i = 0; tick(); }, 4200);
    };
    setTimeout(tick, 600);
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Count-up stats ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Services carousel ---------- */
  const services = [
    { t: "Web Development", d: "Fast, beautiful, search-friendly websites and web apps built with modern frameworks.", g: "WEB", c1: "#ff5a1f", c2: "#7a4dff" },
    { t: "Mobile Apps", d: "Native-feeling iOS and Android apps, from MVP to app store launch and beyond.", g: "APP", c1: "#f6c344", c2: "#ff3d6e" },
    { t: "UI / UX Design", d: "Research-backed interfaces and design systems that look sharp and feel effortless.", g: "UX", c1: "#c14bff", c2: "#4bc6ff" },
    { t: "Custom Software", d: "Dashboards, automations, APIs and internal tools tailored to how your team works.", g: "API", c1: "#26d9a1", c2: "#1c4dff" },
    { t: "E-Commerce", d: "Online stores that convert, with secure payments, inventory and a CMS you control.", g: "SHOP", c1: "#ffb36b", c2: "#ff5a1f" },
  ];
  const dots = $("#svcDots"), stack = $("#svcStack"), text = $("#svcText");
  services.forEach((s, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", s.t);
    b.addEventListener("click", () => { setSvc(i); restart(); });
    dots.appendChild(b);
    const c = document.createElement("div");
    c.className = "card";
    c.style.setProperty("--c1", s.c1);
    c.style.setProperty("--c2", s.c2);
    c.innerHTML = `<div class="card-img"><span class="mono">0${i + 1} / 0${services.length}</span><span class="glyph">${s.g}</span></div>`;
    stack.appendChild(c);
  });
  let cur = -1, timer;
  const setSvc = (i) => {
    if (i === cur) return;
    cur = i;
    $$("button", dots).forEach((b, j) => b.classList.toggle("active", j === i));
    $$(".card", stack).forEach((c, j) => {
      const off = (j - i + services.length) % services.length;
      const tf = [
        "translate(-62%, -50%) rotate(-5deg)",
        "translate(-30%, -46%) rotate(6deg)",
        "translate(-45%, -52%) rotate(-1deg)",
      ];
      c.style.zIndex = off === 0 ? 3 : off === 1 ? 2 : 1;
      c.style.opacity = off <= 1 ? 1 : 0;
      c.style.transform = off === 0 ? tf[0] : off === 1 ? tf[1] : tf[2];
    });
    text.classList.remove("swap"); void text.offsetWidth; text.classList.add("swap");
    text.innerHTML = `<h3>${services[i].t}</h3><p>${services[i].d}</p>`;
  };
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => setSvc((cur + 1) % services.length), 4000); };
  setSvc(0); restart();

  /* ---------- Tilt on hover ---------- */
  if (matchMedia("(hover: hover)").matches && !reduce) {
    $$(".tilt").forEach((el) => {
      const base = getComputedStyle(el).transform === "none" ? "" : getComputedStyle(el).transform;
      el.style.transition = "transform .5s cubic-bezier(.2,.7,.1,1)";
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `${base} perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Scroll effects ---------- */
  const header = $("#header");
  const work = $("#work"), track = $("#workTrack"), bar = $("#workBar");
  const darkSections = $$(".dark, .ink, .footer");
  const heroLetters = $$(".hero-letters span");
  const bgWords = $$(".bg-word-fill");
  const parallax = $$(".parallax");
  const mobile = matchMedia("(max-width: 640px)");

  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    header.classList.toggle("scrolled", y > 80);

    // header color based on what's behind it
    const probe = 48;
    const onDark = darkSections.some((s) => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
    header.classList.toggle("on-dark", onDark);

    if (reduce) return;

    heroLetters.forEach((s, i) => s.style.setProperty("--py", `${y * (0.12 + i * 0.08)}px`));

    // horizontal work scroll
    if (!mobile.matches) {
      const r = work.getBoundingClientRect();
      const dist = work.offsetHeight - vh;
      const p = Math.min(1, Math.max(0, -r.top / dist));
      const max = track.scrollWidth - innerWidth;
      track.style.transform = `translateX(${-max * p}px)`;
      bar.style.width = `${p * 100}%`;
    }

    bgWords.forEach((w) => {
      const r = w.parentElement.getBoundingClientRect();
      w.style.setProperty("--px", `${(r.top / vh) * 8}vw`);
    });

    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const c = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translateY(${c * -(+el.dataset.speed)}px)`;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Contact form ---------- */
  // Opens the visitor's email app with the message filled in.
  // Replace CONTACT_EMAIL with the studio's real inbox (or wire to Formspree, etc.).
  const CONTACT_EMAIL = "hello@lograrstudious.com";
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = encodeURIComponent(`New project inquiry from ${f.get("name")}`);
    const body = encodeURIComponent(`${f.get("message")}\n\n${f.get("name")}\n${f.get("email")}`);
    location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    $("#formNote").textContent = "Opening your email app...";
  });
})();
