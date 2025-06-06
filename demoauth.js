document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const warrantySection = document.getElementById('warrantySection');
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');
    const loginButton = loginForm.querySelector('.submit-button');
    const displayedStoreId = document.getElementById('displayedStoreId');
    const storeIdInput = document.getElementById('storeId');
    const logoutButton = document.getElementById('drawerLogoutButton'); // Changed to new logout button in drawer
    const warrantyForm = document.getElementById('warrantyForm');

    // NEW ELEMENTS FOR HAMBURGER MENU
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const mainDrawer = document.getElementById('mainDrawer');
    const closeDrawerButton = document.getElementById('closeDrawerButton');
    const drawerStoreIdDisplay = document.getElementById('drawerStoreId'); // To display store ID in drawer


    // Function to handle showing/hiding sections with animations
    function showSection(sectionToShow, sectionToHide) {
        if (sectionToHide) {
            sectionToHide.classList.remove('visible');
            // Give CSS time to run fade-out animation before hiding completely
            setTimeout(() => {
                sectionToHide.classList.add('hidden');
                sectionToShow.classList.remove('hidden');
                setTimeout(() => sectionToShow.classList.add('visible'), 10); // Animate in
            }, 400); // Match CSS transition duration
        } else {
            // Initial load case for login section if no session
            sectionToShow.classList.remove('hidden');
            setTimeout(() => sectionToShow.classList.add('visible'), 10);
        }
    }

    // Restore session if storeId is saved
    const savedStoreId = sessionStorage.getItem('storeId');
    if (savedStoreId) {
        loginSection.classList.add('hidden'); // Immediately hide login section on initial load
        warrantySection.classList.remove('hidden');
        warrantySection.classList.add('visible'); // Show warranty section with animation
        storeIdInput.value = savedStoreId;
        displayedStoreId.textContent = savedStoreId;
        drawerStoreIdDisplay.textContent = savedStoreId; // Set store ID in drawer
        hamburgerIcon.style.display = 'block'; // Show hamburger icon after successful session restore
    } else {
        // If no saved session, ensure login section is visible on load
        showSection(loginSection);
        hamburgerIcon.style.display = 'none'; // Ensure hidden on login page
    }

    // Handle login
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        loginError.classList.remove('visible'); // Hide any previous error
        loginError.classList.add('hidden');
        
        loginLoading.classList.remove('hidden'); // Show loading
        setTimeout(() => loginLoading.classList.add('visible'), 10);
        loginButton.classList.add('hidden'); // Hide button

        const formData = new FormData(loginForm);
        formData.append('action', 'verifyLogin');

        // IMPORTANT: Update this URL if your deployment changes
        fetch('https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loginLoading.classList.remove('visible'); // Hide loading
                loginLoading.classList.add('hidden');
                loginButton.classList.remove('hidden'); // Show button again in case of error

                if (data.status === 'success') {
                    const storeId = formData.get('storeId');
                    sessionStorage.setItem('storeId', storeId);

                    storeIdInput.value = storeId;
                    displayedStoreId.textContent = storeId;
                    drawerStoreIdDisplay.textContent = storeId; // Set store ID in drawer

                    showSection(warrantySection, loginSection); // Animate transition
                    hamburgerIcon.style.display = 'block'; // Show hamburger icon after successful login
                } else {
                    loginError.textContent = 'Invalid Store ID or Password';
                    loginError.classList.remove('hidden');
                    setTimeout(() => loginError.classList.add('visible'), 10); // Animate error in
                }
            })
            .catch(err => {
                loginLoading.classList.remove('visible');
                loginLoading.classList.add('hidden');
                loginButton.classList.remove('hidden');
                loginError.textContent = 'An error occurred: ' + err.message;
                loginError.classList.remove('hidden');
                setTimeout(() => loginError.classList.add('visible'), 10);
            });
    });

    // Handle logout (moved to drawer)
    logoutButton.addEventListener('click', () => {
        // Clear session storage
        sessionStorage.removeItem('storeId');

        // Reset forms (manual reset for mobile autofill issues)
        loginForm.reset();
        warrantyForm.reset();

        // Manually clear the form fields to prevent autofill issues on mobile
        document.getElementById('loginStoreId').value = '';
        document.getElementById('loginPassword').value = '';
        storeIdInput.value = '';
        displayedStoreId.textContent = '';
        drawerStoreIdDisplay.textContent = ''; // Clear store ID in drawer

        // Close drawer if open
        mainDrawer.classList.remove('open');
        // Hide hamburger icon
        hamburgerIcon.style.display = 'none';

        // Switch views with animation
        showSection(loginSection, warrantySection);
        // Ensure login form is in its initial state (no loading/error messages)
        loginError.classList.add('hidden');
        loginError.classList.remove('visible');
        loginLoading.classList.add('hidden');
        loginLoading.classList.remove('visible');
        loginButton.classList.remove('hidden'); // Ensure login button is visible
    });

    // --- HAMBURGER DRAWER FUNCTIONALITY ---
    hamburgerIcon.addEventListener('click', () => {
        mainDrawer.classList.add('open');
        // Optional: Add a dimming overlay to the main content
        // document.body.classList.add('drawer-open');
    });

    closeDrawerButton.addEventListener('click', () => {
        mainDrawer.classList.remove('open');
        // Optional: Remove dimming overlay
        // document.body.classList.remove('drawer-open');
    });

    // Close drawer if clicking outside (optional, but good UX)
    // document.body.addEventListener('click', (event) => {
    //     if (mainDrawer.classList.contains('open') &&
    //         !mainDrawer.contains(event.target) &&
    //         !hamburgerIcon.contains(event.target)) {
    //         mainDrawer.classList.remove('open');
    //         // document.body.classList.remove('drawer-open');
    //     }
    // });
});
