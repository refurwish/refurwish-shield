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
    const response = await fetch("https://script.google.com/macros/s/AKfycbzk8XOzvR7_27-7r_89vYyA4hnGkKUDu62F5MAbKWbw6ZgHrgOBMPVmLWlLmJ9Rkpc3/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    statusMessage.textContent = text.includes("Success") ? "Submitted successfully!" : "Error: " + text;
    form.reset();
  } catch (error) {
    statusMessage.textContent = "Error: Could not submit. Try again later.";
  }
});
