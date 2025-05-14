document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Create a new FormData object from the form
    const formData = new FormData(this); // `this` refers to the form being submitted

    // Add the 'action' to the FormData (you can add additional hidden fields for action if needed)
    formData.append('action', 'verifyLogin'); 

    // Perform the fetch request using the POST method
    fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
        method: 'POST',
        body: formData // Send form data
    })
    .then(response => response.json()) // Parse JSON response
    .then(data => {
        const loginError = document.getElementById('loginError');
        
        if (data.status === 'success') {
            // Login successful
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('warrantySection').classList.remove('hidden');

            // Auto-fill Store ID in warranty form
            const storeId = formData.get('storeId');
            document.getElementById('storeId').value = storeId;
        } else {
            // Login failed
            loginError.classList.remove('hidden');
        }
    })
    .catch(err => {
        // Handle errors during the fetch request
        const loginError = document.getElementById('loginError');
        loginError.textContent = 'An error occurred: ' + err.message;
        loginError.classList.remove('hidden');
    });
});
