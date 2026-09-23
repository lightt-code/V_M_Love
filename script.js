"use strict";

const $ = (s) => document.querySelector(s);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================
   1. МЕРЦАЮЩИЕ ЗВЁЗДЫ
===================================================== */
(function stars() {
    const canvas = $("#stars");
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, list = [];

    function makeStars() {
        const count = Math.min(170, Math.round((w * h) / 5000));
        list = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.3 + 0.2,
            a: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.006,
            drift: Math.random() * 0.12 + 0.02,
            pink: Math.random() < 0.25
        }));
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nw = window.innerWidth;
        const nh = window.innerHeight;
        canvas.width = nw * dpr;
        canvas.height = nh * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const widthChanged = nw !== w;
        w = nw;
        h = nh;
        if (widthChanged || !list.length) makeStars();
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const s of list) {
            s.a += s.speed;
            s.y -= s.drift;
            if (s.y < -2) {
                s.y = h + 2;
                s.x = Math.random() * w;
            }
            ctx.globalAlpha = 0.45 + Math.sin(s.a) * 0.45;
            ctx.fillStyle = s.pink ? "#ff9ccc" : "#ffffff";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
})();

/* =====================================================
   2. ЛЕТАЮЩИЕ СЕРДЕЧКИ НА ФОНЕ
===================================================== */
(function floatingHearts() {
    const box = $("#floatingHearts");
    const count = window.innerWidth < 600 ? 10 : 16;

    for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        const dur = 16 + Math.random() * 16;
        el.className = "float-heart";
        el.textContent = "♥";
        el.style.setProperty("--x", Math.random() * 100 + "%");
        el.style.setProperty("--size", 10 + Math.random() * 16 + "px");
        el.style.setProperty("--dur", dur + "s");
        el.style.setProperty("--delay", -Math.random() * dur + "s");
        el.style.setProperty("--sway", Math.random() * 60 - 30 + "px");
        el.style.setProperty("--op", (0.35 + Math.random() * 0.45).toFixed(2));
        box.appendChild(el);
    }
})();

/* =====================================================
   3. СТРЕЛОЧКА «ПРОМОТАЙ ВНИЗ»
===================================================== */
const heartSection = $("#heartSection");

$("#scrollHint").addEventListener("click", () => {
    heartSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* =====================================================
   4. ПОЯВЛЕНИЕ СЕРДЦА ПРИ ПРОКРУТКЕ
===================================================== */
new IntersectionObserver(
    (entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                heartSection.classList.add("show");
                obs.disconnect();
            }
        });
    },
    { threshold: 0.35 }
).observe(heartSection);

/* =====================================================
   5. ЧАСТИЦЫ ДЛЯ ВЗРЫВА
===================================================== */
(function createParticles() {
    const box = $("#particles");
    const colors = ["#ff2d87", "#ff8cc0", "#ffffff", "#ff5aa7", "#ffc2de"];

    for (let i = 0; i < 30; i++) {
        const p = document.createElement("span");
        const angle = Math.random() * Math.PI * 2;
        const dist = 110 + Math.random() * 170;

        p.className = "particle";
        p.textContent = "♥";
        p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
        p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
        p.style.setProperty("--r", Math.random() * 360 - 180 + "deg");
        p.style.setProperty("--s", 10 + Math.random() * 18 + "px");
        p.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
        p.style.setProperty("--d", Math.random() * 0.15 + "s");
        box.appendChild(p);
    }
})();

/* =====================================================
   6. РАЗБИВАНИЕ СЕРДЦА
===================================================== */
const heartButton = $("#heartButton");
const photosSection = $("#photos");
const finalSection = $("#final");
let isBroken = false;

function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

heartButton.addEventListener("click", () => {
    if (isBroken) return;
    isBroken = true;

    // 1 этап — трещина и дрожь
    heartButton.classList.add("cracking");
    vibrate([25, 40, 25]);

    // 2 этап — разлетается на кусочки
    setTimeout(() => {
        heartButton.classList.add("broken");
        vibrate(90);
    }, 430);

    // 3 этап — показываем фотографии
    setTimeout(() => {
        heartSection.classList.add("done");
        showPhotos();
    }, 1500);
});

/* =====================================================
   7. ПЛАВНОЕ ПОЯВЛЕНИЕ ФОТОГРАФИЙ
===================================================== */
function showPhotos() {
    photosSection.hidden = false;
    finalSection.hidden = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document
        .querySelectorAll(".photo, .reveal")
        .forEach((el) => observer.observe(el));

    requestAnimationFrame(() => {
        photosSection.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });
    });
}
