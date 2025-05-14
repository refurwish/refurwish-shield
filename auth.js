document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const storeId = document.getElementById('loginStoreId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const loginError = document.getElementById('loginError');

    fetch(`https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec?action=verifyLogin&storeId=${encodeURIComponent(storeId)}&password=${encodeURIComponent(password)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                // Login successful
                document.getElementById('loginSection').classList.add('hidden');
                document.getElementById('warrantySection').classList.remove('hidden');

                // Auto-fill Store ID in warranty form
                document.getElementById('storeId').value = storeId;
            } else {
                // Login failed
                loginError.classList.remove('hidden');
            }
        })
        .catch(err => {
            loginError.textContent = 'An error occurred: ' + err.message;
            loginError.classList.remove('hidden');
        });
});
