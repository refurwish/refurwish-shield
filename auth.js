document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginButton = loginForm.querySelector('.submit-button');
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');
    const storeIdDisplay = document.getElementById('storeIdValue');
    const storeIdHiddenInput = document.getElementById('storeIdHidden'); // <-- hidden input

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Hide any previous error
        loginError.classList.add('hidden');
        loginError.textContent = '';

        // Show loading and hide button
        loginLoading.classList.remove('hidden');
        loginButton.classList.add('hidden');

        // Collect form data
        const formData = new FormData(this);
        formData.append('action', 'verifyLogin');

        // Make request
        fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading and restore button
            loginLoading.classList.add('hidden');
            loginButton.classList.remove('hidden');

            if (data.status === 'success') {
                // Login successful
                document.getElementById('loginSection').classList.add('hidden');
                document.getElementById('warrantySection').classList.remove('hidden');

                const storeId = formData.get('storeId');
                storeIdDisplay.textContent = storeId;

                // Set hidden input value so it submits with the form
                if (storeIdHiddenInput) {
                    storeIdHiddenInput.value = storeId;
                }
            } else {
                // Login failed
                loginError.textContent = 'Invalid Store ID or Password';
                loginError.classList.remove('hidden');
            }
        })
        .catch(err => {
            // Hide loading and restore button
            loginLoading.classList.add('hidden');
            loginButton.classList.remove('hidden');

            // Show error
            loginError.textContent = 'An error occurred: ' + err.message;
            loginError.classList.remove('hidden');
        });
    });
});
