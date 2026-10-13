/*
 * Newsletter form.
 *
 * The page is static, so the form needs somewhere to send the data. Put the URL of
 * your form service (Formspree, Netlify Forms, your own API, ...) in the form's
 * `data-endpoint` attribute in index.html. It receives a POST with the form fields
 * (multipart/form-data) and should answer with a 2xx status on success.
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("newsletter-form");
    if (!form) return;

    const wrap = form.closest(".form-wrap");
    const done = wrap.querySelector(".form-done");
    const fail = wrap.querySelector(".form-fail");
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = submit.value;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const endpoint = form.dataset.endpoint;
      done.style.display = "none";
      fail.style.display = "none";

      if (!endpoint) {
        console.warn("newsletter-form: set data-endpoint on the form to a URL that accepts the submission.");
        fail.style.display = "block";
        return;
      }

      submit.disabled = true;
      submit.value = submit.dataset.waitText || submitLabel;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        form.style.display = "none";
        done.style.display = "block";
        form.reset();
      } catch (error) {
        console.error("newsletter-form:", error);
        fail.style.display = "block";
      } finally {
        submit.disabled = false;
        submit.value = submitLabel;
      }
    });
  });
})();
