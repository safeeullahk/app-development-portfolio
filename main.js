/* Safee Ullah Khan — portfolio interactions */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  var loader = document.getElementById("loader");
  var loadBar = document.getElementById("loadBar");
  var loadCount = document.getElementById("loadCount");
  var loaded = false;

  function finishLoad() {
    if (loaded) return;
    loaded = true;
    document.body.classList.add("loaded");
    if (loader) {
      loader.classList.add("is-done");
      window.setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 800);
    }
  }

  if (reduce || !loader) {
    finishLoad();
  } else {
    var progress = 0;
    var timer = window.setInterval(function () {
      progress = Math.min(100, progress + Math.random() * 16 + 6);
      if (loadBar) loadBar.style.width = progress + "%";
      if (loadCount) loadCount.textContent = Math.round(progress) + "%";
      if (progress >= 100) {
        window.clearInterval(timer);
        window.setTimeout(finishLoad, 260);
      }
    }, 110);
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        progress = 100;
        if (loadBar) loadBar.style.width = "100%";
        if (loadCount) loadCount.textContent = "100%";
        window.clearInterval(timer);
        finishLoad();
      }, 380);
    });
  }

  /* ---------- Year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  function closeMenu() {
    if (!links) return;
    links.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- Scroll progress + nav background ---------- */
  var progressBar = document.getElementById("progressBar");
  var scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progressBar) progressBar.style.width = pct + "%";
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
      scrollTicking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = el.getAttribute("data-delay");
          if (delay) el.style.setProperty("--d", delay + "ms");
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Active nav link ---------- */
  var sectionIds = ["home", "school-manager", "filcon", "keychat", "skills", "about", "contact"];
  var navAnchors = links ? Array.prototype.slice.call(links.querySelectorAll("a")) : [];
  if ("IntersectionObserver" in window && navAnchors.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            var target = a.getAttribute("href").replace("#", "");
            if (target === id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Device tilt ---------- */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (device) {
      device.addEventListener("pointermove", function (event) {
        var rect = device.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        device.style.setProperty("--ry", (x * 16).toFixed(2) + "deg");
        device.style.setProperty("--rx", (-y * 14).toFixed(2) + "deg");
      });
      device.addEventListener("pointerleave", function () {
        device.style.setProperty("--ry", "0deg");
        device.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- Galleries: arrows + drag ---------- */
  document.querySelectorAll(".gallery-block").forEach(function (block) {
    var gallery = block.querySelector("[data-gallery]");
    if (!gallery) return;

    block.querySelectorAll("[data-gal]").forEach(function (button) {
      button.addEventListener("click", function () {
        var dir = button.getAttribute("data-gal") === "next" ? 1 : -1;
        var amount = gallery.clientWidth * 0.7 * dir;
        gallery.scrollBy({ left: amount, behavior: reduce ? "auto" : "smooth" });
      });
    });

    var down = false;
    var startX = 0;
    var startLeft = 0;
    var moved = false;

    gallery.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse") {
        down = true;
        moved = false;
        startX = event.clientX;
        startLeft = gallery.scrollLeft;
        gallery.classList.add("dragging");
      }
    });
    window.addEventListener("pointerup", function () {
      down = false;
      gallery.classList.remove("dragging");
    });
    gallery.addEventListener("pointermove", function (event) {
      if (!down) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      gallery.scrollLeft = startLeft - delta;
    });
    gallery.addEventListener("click", function (event) {
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocus = null;

  function openLightbox(img) {
    if (!lightbox || !lightboxImg) return;
    lastFocus = document.activeElement;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "Screenshot preview";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll("[data-gallery] img").forEach(function (img) {
    img.addEventListener("click", function () { openLightbox(img); });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });

  /* ---------- Subtle pointer parallax on hero portrait ---------- */
  var heroVisual = document.querySelector(".hero__visual");
  var portrait = document.querySelector(".portrait");
  if (!reduce && heroVisual && portrait && window.matchMedia("(hover: hover)").matches) {
    heroVisual.addEventListener("pointermove", function (event) {
      var rect = heroVisual.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform =
        "translate3d(" + (x * 10).toFixed(2) + "px," + (y * 10).toFixed(2) + "px,0)";
    });
    heroVisual.addEventListener("pointerleave", function () {
      portrait.style.transform = "";
    });
  }
})();
