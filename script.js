document.getElementById("warrantyForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    store_id: form.store_id.value.trim(),
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone_model: form.phone_model.value.trim(),
    imei: form.imei.value.trim(),
    plan: form.plan.value,
  };

  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "Submitting...";

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxcRbHJnva_oMEgAV-yIsxnawHbY_afl8-iH3QN6nZy11YdYhkbojafrIfAAO7q_VnY/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.text();
    if (result.includes("Success")) {
      statusMessage.style.color = "green";
      statusMessage.textContent = "Submitted successfully!";
      form.reset();
    } else {
      throw new Error(result);
    }
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Error: Could not submit. Try again later.";
  }
});
