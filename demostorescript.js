// --- App Script URL (Placeholder - Update with your deployed Web App URL) ---
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxhL6X17U5Fr9i7ze3SnqqURZalpVsWRfCZLrSh11tD3yDGqn2bB6SzLAcdo-rGbJs1w/exec';

// --- Global Variables for session ---
let loggedInEmployeeId = null;

// --- Element References ---
const employeeLoginSection = document.getElementById('employeeLoginSection');
const employeeLoginForm = document.getElementById('employeeLoginForm');
// Removed loginLoading as it's integrated into the button
const loginError = document.getElementById('loginError');
const loginSubmitButton = document.getElementById('loginSubmitButton'); // Changed from loginButton to loginSubmitButton

const storeRegistrationSection = document.getElementById('storeRegistrationSection');
const displayedEmployeeId = document.getElementById('displayedEmployeeId');
const storeIdDisplay = document.getElementById('storeIdDisplay');
const storeRegistrationForm = document.getElementById('storeRegistrationForm');
const storeRegLoading = document.getElementById('storeRegLoading');
const storeRegSuccess = document.getElementById('storeRegSuccess');
const storeRegError = document.getElementById('storeRegError');
const loginCredentialsDiv = document.getElementById('loginCredentials');
const submittedCredentialsDiv = document.getElementById('submittedCredentials');
const hamburgerMenu = document.getElementById('hamburgerMenu');

const mainDrawer = document.getElementById('mainDrawer');
const drawerCloseButton = document.getElementById('drawerCloseButton');
const drawerOverlay = document.getElementById('drawerOverlay');
const logoutButton = document.getElementById('logoutButton');
const drawerDisplayedUserId = document.getElementById('drawerDisplayedUserId');
const employeeStoreRegButton = document.getElementById('employeeStoreRegButton');
const employeeEarningsButton = document.getElementById('employeeEarningsButton');

const employeeEarningsSection = document.getElementById('employeeEarningsSection');
const employeeFromDateInput = document.getElementById('employeeFromDate');
const employeeToDateInput = document.getElementById('employeeToDate');
const filterEmployeeEarningsButton = document.getElementById('filterEmployeeEarningsButton');
const employeeEarningsLoading = document.getElementById('employeeEarningsLoading');
const employeeEarningsError = document.getElementById('employeeEarningsError');
const employeeEarningsResults = document.getElementById('employeeEarningsResults');
const employeeEarningsDateRangeDisplay = document.getElementById('employeeEarningsDateRange');
const totalStoresRegisteredDisplay = document.getElementById('totalStoresRegistered');
const totalEmployeeEarningsDisplay = document.getElementById('totalEmployeeEarnings');

// --- Utility Functions ---

// Function to show/hide sections with animations
function showSection(sectionToShow, sectionToHide) {
    if (sectionToHide) {
        sectionToHide.classList.remove('visible');
        sectionToHide.classList.add('hidden');
    }

    sectionToShow.classList.remove('hidden');
    setTimeout(() => sectionToShow.classList.add('visible'), 10);
}

function showStatusMessage(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type} visible`;
    setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

function hideStatusMessage(element) {
    element.classList.remove('visible');
    // For elements with display:none !important, the class 'hidden' is enough
    // For status messages, we leverage the height/padding/opacity transition
    if (element.classList.contains('status-message')) {
        element.classList.remove('visible');
        // No need to add 'hidden' explicitly for status messages if the default style handles it
    } else {
        element.classList.add('hidden');
    }
}


// Helper function to format dates for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// --- Session Restoration on Load ---
const savedEmployeeId = sessionStorage.getItem('loggedInEmployeeId');
if (savedEmployeeId) {
    loggedInEmployeeId = savedEmployeeId;
    displayedEmployeeId.textContent = loggedInEmployeeId;
    drawerDisplayedUserId.textContent = loggedInEmployeeId;
    showSection(storeRegistrationSection, employeeLoginSection);
    fetchNextStoreId(); // Fetch initial Store ID
} else {
    showSection(employeeLoginSection); // Show login if no session
}

// --- Employee Login Logic ---
employeeLoginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    hideStatusMessage(loginError);
    // Add loading class to button and disable it
    loginSubmitButton.classList.add('loading');
    loginSubmitButton.disabled = true;

    const formData = new FormData(employeeLoginForm);
    formData.append('action', 'verifyEmployeeLogin');

    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        // Remove loading class from button and re-enable it
        loginSubmitButton.classList.remove('loading');
        loginSubmitButton.disabled = false;

        if (data.status === 'success') {
            loggedInEmployeeId = data.employeeId;
            sessionStorage.setItem('loggedInEmployeeId', loggedInEmployeeId); // Store employee ID
            
            displayedEmployeeId.textContent = loggedInEmployeeId;
            drawerDisplayedUserId.textContent = loggedInEmployeeId;
            showSection(storeRegistrationSection, employeeLoginSection);
            fetchNextStoreId(); // Fetch initial Store ID for registration
        } else {
            showStatusMessage(loginError, data.message || 'Invalid Employee ID or Password.', 'error');
        }
    } catch (err) {
        // Ensure button state is reset on error
        loginSubmitButton.classList.remove('loading');
        loginSubmitButton.disabled = false;
        showStatusMessage(loginError, 'An error occurred: ' + err.message, 'error');
    }
});

// --- Store Registration Logic ---

// Function to fetch next Store ID
async function fetchNextStoreId() {
    storeIdDisplay.textContent = 'Store ID: Loading...';
    hideStatusMessage(storeRegError); // Hide any previous error
    try {
        const response = await fetch(`${APP_SCRIPT_URL}?action=nextStoreId`, { method: 'GET' });
        const data = await response.json();
        if (data.status === 'success') {
            storeIdDisplay.textContent = 'Store ID: ' + data.storeId;
            storeRegistrationForm.dataset.storeId = data.storeId;
        } else {
            storeIdDisplay.textContent = 'Store ID: Failed to load';
            showStatusMessage(storeRegError, data.message || 'Failed to generate Store ID.', 'error');
        }
    } catch (err) {
        storeIdDisplay.textContent = 'Store ID: Failed to load';
        showStatusMessage(storeRegError, 'Error fetching next Store ID: ' + err.message, 'error');
    }
}

// Function for Google Map link paste
function pasteMapLink() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(text => {
            document.getElementById('mapLink').value = text;
        }).catch(err => {
            console.error('Failed to read clipboard contents: ', err);
            showStatusMessage(storeRegError, 'Failed to paste from clipboard. Please paste manually.', 'error');
        });
    } else {
        showStatusMessage(storeRegError, 'Clipboard access not supported by your browser. Please paste the Google Maps link manually.', 'error');
    }
}
window.pasteMapLink = pasteMapLink; // Make accessible globally for onclick

// Store Registration Form Submission
storeRegistrationForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    hideStatusMessage(storeRegSuccess);
    hideStatusMessage(storeRegError);
    // Ensure loginCredentialsDiv is hidden before submission
    hideStatusMessage(loginCredentialsDiv); 

    storeRegLoading.classList.remove('hidden');
    setTimeout(() => storeRegLoading.classList.add('visible'), 10);

    const formData = new FormData(this);
    const submittedStoreId = this.dataset.storeId;
    formData.append('storeId', submittedStoreId);
    formData.append('employeeId', loggedInEmployeeId); // Add logged-in employee ID
    formData.append('action', 'registerStore');

    try {
        const response = await fetch(APP_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        storeRegLoading.classList.remove('visible');
        storeRegLoading.classList.add('hidden');

        if (data.status === 'success') {
            showStatusMessage(storeRegSuccess, 'Store registered successfully!', 'success');
            const generatedPassword = data.generatedPassword || 'N/A';
            submittedCredentialsDiv.innerHTML = `Store ID: <strong>${submittedStoreId}</strong><br>Password: <strong>${generatedPassword}</strong>`;
            // Use showStatusMessage to handle visibility and transition for loginCredentialsDiv
            showStatusMessage(loginCredentialsDiv, '', 'credentials-box'); // The message is already in innerHTML, just make it visible
            loginCredentialsDiv.scrollIntoView({ behavior: 'smooth' });

            this.reset();
            fetchNextStoreId(); // Get next ID for fresh registration
        } else {
            throw new Error(data.message || 'Unknown error during registration');
        }
    } catch (err) {
        storeRegLoading.classList.remove('visible');
        storeRegLoading.classList.add('hidden');
        showStatusMessage(storeRegError, 'Error occurred: ' + err.message, 'error');
    }
});

// --- Drawer and Employee Tracking Functionality ---

// Function to open the drawer
function openDrawer() {
    mainDrawer.classList.add('open');
    drawerOverlay.classList.remove('hidden');
    setTimeout(() => drawerOverlay.classList.add('visible'), 10);
    document.body.style.overflow = 'hidden';
}

// Function to close the drawer
function closeDrawer() {
    mainDrawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
    setTimeout(() => drawerOverlay.classList.add('hidden'), 300);
    document.body.style.overflow = '';

    // Hide tracking section when drawer closes
    hideStatusMessage(employeeEarningsSection); // Use hideStatusMessage for consistency
    hideStatusMessage(employeeEarningsResults); // Use hideStatusMessage for consistency
    hideStatusMessage(employeeEarningsError);
    hideStatusMessage(employeeEarningsLoading);
}

// Event listeners for drawer
hamburgerMenu.addEventListener('click', openDrawer);
drawerCloseButton.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

// --- Logout Functionality ---
logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('loggedInEmployeeId');
    loggedInEmployeeId = null;

    // Reset forms and clear displayed IDs
    employeeLoginForm.reset();
    storeRegistrationForm.reset();

    document.getElementById('employeeIdLogin').value = '';
    document.getElementById('employeePasswordLogin').value = '';
    displayedEmployeeId.textContent = '';
    drawerDisplayedUserId.textContent = '';

    // Reset all status messages
    hideStatusMessage(loginError);
    // Ensure login button is not in loading state and is enabled
    loginSubmitButton.classList.remove('loading');
    loginSubmitButton.disabled = false;
    hideStatusMessage(storeRegSuccess);
    hideStatusMessage(storeRegError);
    hideStatusMessage(storeRegLoading);
    hideStatusMessage(loginCredentialsDiv); // Ensure this is hidden on logout

    // Close drawer and switch to login view
    closeDrawer();
    showSection(employeeLoginSection, storeRegistrationSection);
});

// --- Drawer Menu Item Handlers ---

employeeStoreRegButton.addEventListener('click', () => {
    closeDrawer();
    showSection(storeRegistrationSection, employeeLoginSection);
    // Ensure credentials box is hidden when navigating to store registration
    hideStatusMessage(loginCredentialsDiv); 
    storeRegistrationForm.reset(); // Clear form when navigating back to it
});

employeeEarningsButton.addEventListener('click', () => {
    // Toggle visibility of tracking section using showStatusMessage/hideStatusMessage for smooth transition
    if (employeeEarningsSection.classList.contains('visible')) {
        hideStatusMessage(employeeEarningsSection);
    } else {
        showStatusMessage(employeeEarningsSection, '', ''); // No specific message, just make it visible
    }

    // Set default dates if not already set
    if (!employeeFromDateInput.value || !employeeToDateInput.value) {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        employeeFromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        employeeToDateInput.value = today.toISOString().split('T')[0];
    }
    // Scroll to section after a short delay to allow visibility transition
    setTimeout(() => {
        if (employeeEarningsSection.classList.contains('visible')) {
            employeeEarningsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 450); // Slightly more than the transition duration
});

filterEmployeeEarningsButton.addEventListener('click', fetchEmployeeEarnings);

async function fetchEmployeeEarnings() {
    const fromDate = employeeFromDateInput.value;
    const toDate = employeeToDateInput.value;

    if (!loggedInEmployeeId) {
        showStatusMessage(employeeEarningsError, 'Employee ID not found. Please log in again.', 'error');
        return;
    }

    if (!fromDate || !toDate) {
        showStatusMessage(employeeEarningsError, 'Please select both From and To dates.', 'error');
        return;
    }

    hideStatusMessage(employeeEarningsError);
    hideStatusMessage(employeeEarningsResults); // Hide results before new fetch
    showStatusMessage(employeeEarningsLoading, '<span class="loader"></span> Fetching earnings...', 'loading'); // Use showStatusMessage

    const queryParams = new URLSearchParams({
        action: 'getEmployeeEarnings',
        employeeId: loggedInEmployeeId,
        fromDate: fromDate,
        toDate: toDate
    });

    try {
        const response = await fetch(`${APP_SCRIPT_URL}?${queryParams.toString()}`, { method: 'GET' });
        const data = await response.json();

        hideStatusMessage(employeeEarningsLoading); // Use hideStatusMessage

        if (data.status === 'success') {
            totalStoresRegisteredDisplay.textContent = data.storesRegistered;
            totalEmployeeEarningsDisplay.textContent = `₹${data.totalEarnings.toLocaleString('en-IN')}`;
            employeeEarningsDateRangeDisplay.textContent = `${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`;

            showStatusMessage(employeeEarningsResults, '', 'results'); // Use showStatusMessage
        } else {
            showStatusMessage(employeeEarningsError, data.message || 'Failed to fetch employee earnings.', 'error');
        }
    } catch (error) {
        hideStatusMessage(employeeEarningsLoading); // Use hideStatusMessage
        showStatusMessage(employeeEarningsError, 'An error occurred while fetching earnings: ' + error.message, 'error');
    }
}
