
document.getElementById("warrantyForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    store_id: form.store_id.value,
    name: form.name.value,
    email: form.email.value,
    phone_model: form.phone_model.value,
    imei: form.imei.value,
    plan: form.plan.value,
  };

  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "Submitting...";

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxKKXrVemMkJ2zc0VkWlZ37JSyWIxqML6aDCBCMmzg/dev", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    statusMessage.textContent = "Submitted successfully!";
    form.reset();
  } catch (error) {
    statusMessage.textContent = "Error: Could not submit. Try again later.";
  }
});
