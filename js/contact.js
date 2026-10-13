/*
 * Contact form (contact/index.html).
 * The site is static and has no mail server, and WhatsApp is how Asritektur takes consultations, so the form builds
 * the message and opens WhatsApp with it. The visitor can still edit the text before sending.
 * The target number is the form's data-whatsapp attribute (digits only, with country code).
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const status = form.querySelector(".ct-status");
    const i18n = window.i18n;
    const t = (text) => (i18n ? i18n.t(text) : text);
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
        showStatus(t("Mohon lengkapi nama dan nomor WhatsApp Anda."));
        return;
      }

      const lines = [
        (i18n ? i18n.tf("Halo Asritektur, saya {nama}.", { nama: value("nama") }) : "Halo Asritektur, saya " + value("nama") + "."),
        t("Nomor WhatsApp:") + " " + value("whatsapp"),
      ];
      if (value("email")) lines.push(t("Email:") + " " + value("email"));
      lines.push(t("Paket yang diminati:") + " " + t(value("paket")));
      if (value("pesan")) lines.push("", t("Informasi proyek:"), value("pesan"));
      lines.push("", t("Saya tahu info dari website."));

      const url =
        "https://api.whatsapp.com/send/?phone=" +
        encodeURIComponent(form.dataset.whatsapp) +
        "&text=" +
        encodeURIComponent(lines.join("\n")) +
        "&type=phone_number&app_absent=0";

      const opened = window.open(url, "_blank", "noopener");
      showStatus(
        opened
          ? t("WhatsApp dibuka di tab baru. Tekan kirim di sana untuk menyelesaikan.")
          : t("Pop-up diblokir browser. Izinkan pop-up untuk situs ini, lalu kirim ulang.")
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
