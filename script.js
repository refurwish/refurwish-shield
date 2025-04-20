document.getElementById("warrantyForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = "Submitting...";

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzk8XOzvR7_27-7r_89vYyA4hnGkKUDu62F5MAbKWbw6ZgHrgOBMPVmLWlLmJ9Rkpc3/exec", {
      method: "POST",
      body: formData
    });
    statusMessage.textContent = "Submitted successfully!";
    form.reset();
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Error: Could not submit. Try again later.";
  }
});
