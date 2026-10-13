/*
 * Contact form (contact.html).
 * The site is static and has no mail server, and WhatsApp is how Asritektur takes consultations, so the form builds
 * the message and opens WhatsApp with it. The visitor can still edit the text before sending.
 * The target number is the form's data-whatsapp attribute (digits only, with country code).
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const status = form.querySelector(".ct-status");
    const field = (name) => form.elements[name];
    const value = (name) => (field(name) ? field(name).value.trim() : "");

    const showStatus = (text) => {
      status.textContent = text;
      status.hidden = false;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.hidden = true;

      // Mark empty required fields, focus the first one
      let firstInvalid = null;
      form.querySelectorAll("[required]").forEach((input) => {
        const invalid = !input.value.trim();
        input.closest(".ct-field").classList.toggle("has-error", invalid);
        input.setAttribute("aria-invalid", String(invalid));
        if (invalid && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        showStatus("Mohon lengkapi nama dan nomor WhatsApp Anda.");
        return;
      }

      const lines = [
        "Halo Asritektur, saya " + value("nama") + ".",
        "Nomor WhatsApp: " + value("whatsapp"),
      ];
      if (value("email")) lines.push("Email: " + value("email"));
      lines.push("Paket yang diminati: " + value("paket"));
      if (value("pesan")) lines.push("", "Informasi proyek:", value("pesan"));
      lines.push("", "Saya tahu info dari website.");

      const url =
        "https://api.whatsapp.com/send/?phone=" +
        encodeURIComponent(form.dataset.whatsapp) +
        "&text=" +
        encodeURIComponent(lines.join("\n")) +
        "&type=phone_number&app_absent=0";

      const opened = window.open(url, "_blank", "noopener");
      showStatus(
        opened
          ? "WhatsApp dibuka di tab baru. Tekan kirim di sana untuk menyelesaikan."
          : "Pop-up diblokir browser. Izinkan pop-up untuk situs ini, lalu kirim ulang."
      );
    });

    // Clear the error mark as soon as the visitor types
    form.addEventListener("input", (event) => {
      const wrap = event.target.closest(".ct-field");
      if (wrap && event.target.value.trim()) {
        wrap.classList.remove("has-error");
        event.target.setAttribute("aria-invalid", "false");
      }
    });
  });
})();
