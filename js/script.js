(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Theme toggle ---------------- */

  var themeBtn = document.getElementById("themeToggle");

  function currentTheme() {
    return root.getAttribute("data-bs-theme") === "light" ? "light" : "dark";
  }

  function setTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) { /* ignore */ }
    if (themeBtn) {
      var toLight = theme === "dark";
      themeBtn.setAttribute("aria-pressed", String(theme === "light"));
      themeBtn.setAttribute("aria-label", toLight ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  // Sync the button state with whatever the inline head script already applied.
  setTheme(currentTheme());

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ---------------- Hero title: typewriter effect ---------------- */

  var typeEl = document.getElementById("typeText");
  if (typeEl) {
    var fullText = typeEl.getAttribute("data-text") || "";
    if (reduceMotion) {
      typeEl.textContent = fullText;
    } else {
      var typeIndex = 0;
      (function typeChar() {
        typeEl.textContent = fullText.slice(0, typeIndex);
        typeIndex++;
        if (typeIndex <= fullText.length) setTimeout(typeChar, 90);
      })();
    }
  }
  /* ---------------- Hero title: typewriter effect ---------------- */

var typeEl = document.getElementById("typeText");
if (typeEl) {
  var fullText = typeEl.getAttribute("data-text") || "";
  if (reduceMotion) {
    typeEl.textContent = fullText;
  } else {
    var i = 0;
    (function typeChar() {
      typeEl.textContent = fullText.slice(0, i);
      i++;
      if (i <= fullText.length) setTimeout(typeChar, 45);
    })();
  }
}

  /* ---------------- Experience tabs ---------------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".exp-tab"));

      function activateTab(tab, focus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = !selected;
        if (selected) {
          panel.classList.remove("enter");
          void panel.offsetWidth;
          panel.classList.add("enter");
        }
      }
    });
    if (focus) tab.focus();
    moveExpIndicator(tab);
  }

  var expIndicator = document.querySelector(".exp-indicator");
  function moveExpIndicator(tab) {
    if (!expIndicator || !tab) return;
    expIndicator.style.transform = "translateY(" + tab.offsetTop + "px)";
    expIndicator.style.height = tab.offsetHeight + "px";
  }

  if (tabs.length) moveExpIndicator(tabs[0]);
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var dir = 0;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") dir = 1;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") dir = -1;
      else return;
      e.preventDefault();
      var next = tabs[(index + dir + tabs.length) % tabs.length];
      activateTab(next, true);
    });
  });

  /* ---------------- Home photo: gentle tilt toward the pointer ---------------- */

  var portrait = document.querySelector(".portrait-hero");
  if (portrait && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var maxTilt = 24; // degrees

    portrait.addEventListener("pointermove", function (e) {
      var rect = portrait.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;  // 0 to 1
      var py = (e.clientY - rect.top) / rect.height;
      var ry = (px - 0.5) * 2 * maxTilt;
      var rx = (0.5 - py) * 2 * maxTilt;
      portrait.style.setProperty("--rx", rx.toFixed(2) + "deg");
      portrait.style.setProperty("--ry", ry.toFixed(2) + "deg");
    });

    portrait.addEventListener("pointerleave", function () {
      portrait.style.setProperty("--rx", "0deg");
      portrait.style.setProperty("--ry", "0deg");
    });
  }

  /* ---------------- Home sphere: a dot sphere that drifts and reacts to the pointer ---------------- */

  var canvas = document.getElementById("sphere");

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var size = canvas.width; // 420, scaled down by CSS on small screens
    var cx = size / 2;
    var cy = size / 2;
    var sphereRadius = size * 0.34;
    var focalLength = size * 0.9;

    // Points spread evenly over a sphere surface (a Fibonacci sphere).
    var count = 800;
    var points = [];
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < count; i++) {
      var y = 1 - (i / (count - 1)) * 2; // 1 to -1
      var r = Math.sqrt(1 - y * y);
      var theta = goldenAngle * i;
      points.push({
        x: Math.cos(theta) * r,
        y: y,
        z: Math.sin(theta) * r,
        offset: 0,
        target: 0
      });
    }

    var pointer = { x: -9999, y: -9999, active: false };
    var influence = size * 0.22;
    var maxPush = size * 0.05;

    function getAccentColor() {
      return getComputedStyle(root).getPropertyValue("--accent").trim() || "#64ffda";
    }
    var dotColor = getAccentColor();
    new MutationObserver(function () { dotColor = getAccentColor(); })
      .observe(root, { attributes: true, attributeFilter: ["data-bs-theme"] });

    function setPointerFromEvent(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = size / rect.width;
      var scaleY = size / rect.height;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      pointer.x = (clientX - rect.left) * scaleX;
      pointer.y = (clientY - rect.top) * scaleY;
      pointer.active = true;
    }

    canvas.addEventListener("pointermove", setPointerFromEvent);
    canvas.addEventListener("pointerdown", setPointerFromEvent);
    canvas.addEventListener("pointerleave", function () { pointer.active = false; });
    canvas.addEventListener("touchmove", setPointerFromEvent, { passive: true });
    canvas.addEventListener("touchend", function () { pointer.active = false; });

    var angle = 0;

    function project(p, rot) {
      // Rotate around the vertical axis, then apply a simple perspective projection.
      var cosA = Math.cos(rot), sinA = Math.sin(rot);
      var x = p.x * cosA - p.z * sinA;
      var z = p.x * sinA + p.z * cosA;
      var r = sphereRadius + p.offset;
      var scale = focalLength / (focalLength + z * sphereRadius * 0.6);
      return {
        sx: cx + x * r * scale,
        sy: cy + p.y * r * scale,
        depth: z,
        scale: scale
      };
    }

    function frame() {
      ctx.clearRect(0, 0, size, size);

      var projected = points.map(function (p) { return { p: p, s: project(p, angle) }; });
      // Draw far points first so near points overlap them, giving a sense of depth.
      projected.sort(function (a, b) { return a.s.depth - b.s.depth; });

      projected.forEach(function (item) {
        var p = item.p, s = item.s;

        if (pointer.active) {
          var dx = s.sx - pointer.x;
          var dy = s.sy - pointer.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          p.target = dist < influence ? (1 - dist / influence) * maxPush : 0;
        } else {
          p.target = 0;
        }
        p.offset += (p.target - p.offset) * 0.12;

        var depthFactor = (s.depth + 1) / 2; // 0 (back) to 1 (front)
        var alpha = 0.25 + depthFactor * 0.65;
        var radius = 1.1 + depthFactor * 1.7;

        ctx.beginPath();
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = alpha;
        ctx.arc(s.sx, s.sy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      if (!reduceMotion) {
        angle += 0.0022;
        requestAnimationFrame(frame);
      }
    }

    frame();
  }

  /* ---------------- Contact form validation ---------------- */

  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("formStatus");
    var fields = {
      name: { input: document.getElementById("name"), error: document.getElementById("nameError") },
      email: { input: document.getElementById("email"), error: document.getElementById("emailError") },
      message: { input: document.getElementById("message"), error: document.getElementById("messageError") }
    };
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateField(key) {
      var f = fields[key];
      var value = f.input.value.trim();
      var message = "";

      if (key === "name") {
        if (!value) message = "Please enter your name.";
        else if (value.length < 2) message = "Name must be at least 2 characters.";
      } else if (key === "email") {
        if (!value) message = "Please enter your email address.";
        else if (!emailPattern.test(value)) message = "Please enter a valid email address.";
      } else if (key === "message") {
        if (!value) message = "Please enter a message.";
        else if (value.length < 10) message = "Message must be at least 10 characters.";
      }

      f.error.textContent = message;
      f.input.classList.toggle("is-invalid", Boolean(message));
      f.input.classList.toggle("is-valid", !message);
      return !message;
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener("input", function () {
        if (fields[key].input.classList.contains("is-invalid")) validateField(key);
      });
      fields[key].input.addEventListener("blur", function () { validateField(key); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var validKeys = Object.keys(fields).map(validateField);
      var allValid = validKeys.every(Boolean);

      if (!allValid) {
        status.textContent = "Please fix the errors above before sending.";
        status.className = "mt-3 error";
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // No backend is connected. This confirms the form works and resets it.
      status.textContent = "Thank you, " + fields.name.input.value.trim() + ". Your message looks good. " +
        "This form is not yet connected to an email service, so please also reach out directly using the links above.";
      status.className = "mt-3 success";
      form.reset();
      Object.keys(fields).forEach(function (key) {
        fields[key].input.classList.remove("is-valid", "is-invalid");
      });
    });
  }
})();
