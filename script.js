document.getElementById("warrantyForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;

  const data = {
    StoreID: form.StoreID.value,
    CustomerName: form.CustomerName.value,
    Email: form.Email.value,
    PhoneModel: form.PhoneModel.value,
    IMEI: form.IMEI.value,
    WarrantyPlan: form.WarrantyPlan.value,
  };

  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "Submitting...";

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzk8XOzvR7_27-7r_89vYyA4hnGkKUDu62F5MAbKWbw6ZgHrgOBMPVmLWlLmJ9Rkpc3/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    statusMessage.textContent = "Submitted successfully! Warranty certificate will be sent to the customer's email shortly.";
    form.reset();
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "❌ Error: Could not submit. Please try again.";
  }
});
