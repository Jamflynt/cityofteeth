(function () {
  function pad(n, width = 6) {
    const s = String(n);
    return s.length >= width ? s : "0".repeat(width - s.length) + s;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const strip = document.getElementById("bottom-strip");
    if (strip) strip.style.display = "block";

    let count = parseInt(localStorage.getItem('cityOfTeethCounter'), 10);
    if (isNaN(count)) {
      count = 0;
    }
    count++;
    localStorage.setItem('cityOfTeethCounter', count);

    const counterEl = document.querySelector(".visitor-counter-number");
    if (counterEl) counterEl.textContent = pad(count);
  });
})();