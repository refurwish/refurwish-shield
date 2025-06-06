// You MUST replace this with your actual Apps Script Web App URL
// Deploy your code.gs as a Web App (Execute as: Me, Who has access: Anyone)
// Copy the URL provided after deployment and paste it here.
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec'; 

document.addEventListener('DOMContentLoaded', function() {
    const warrantyForm = document.getElementById('warrantyForm');
    const phonePriceInput = document.getElementById('phonePrice');
    const phonePriceGroup = document.getElementById('phonePriceGroup');
    const displayedPhonePriceInfo = document.getElementById('displayedPhonePriceInfo');
    const displayPhonePrice = document.getElementById('displayPhonePrice');
    const changePhonePriceButton = document.getElementById('changePhonePriceButton');
    const planSelectionSection = document.getElementById('planSelectionSection');
    const planOptionsContainer = document.getElementById('planOptionsContainer');
    const planSelectionMessage = document.getElementById('planSelectionMessage');
    const submitWarrantyButton = document.getElementById('submitWarrantyButton');
    const loadingMessage = document.getElementById('loading');
    const successContainer = document.getElementById('successContainer');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const qrcodeElement = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const errorMessage = document.getElementById('errorMessage');
    const newSubmissionButton = document.getElementById('newSubmissionButton');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const appDrawer = document.getElementById('appDrawer');
    const overlay = document.getElementById('overlay');

    // Drawer elements for navigation
    const drawerItems = document.querySelectorAll('.drawer-item');
    const subSections = document.querySelectorAll('.sub-section'); // All sub-sections within warrantySection

    // Tracking section elements
    const submissionsFromDate = document.getElementById('submissionsFromDate');
    const submissionsToDate = document.getElementById('submissionsToDate');
    const trackSubmissionsButton = document.getElementById('trackSubmissionsButton');
    const totalSubmissionsCount = document.getElementById('totalSubmissionsCount');
    const submissionsTableBody = document.getElementById('submissionsTableBody');

    const commissionFromDate = document.getElementById('commissionFromDate');
    const commissionToDate = document = document.getElementById('commissionToDate');
    const trackCommissionButton = document.getElementById('trackCommissionButton');
    const totalCommissionAmount = document.getElementById('totalCommissionAmount');
    const commissionTableBody = document.getElementById('commissionTableBody');

    const paymentFromDate = document.getElementById('paymentFromDate');
    const paymentToDate = document.getElementById('paymentToDate');
    const trackPaymentButton = document.getElementById('trackPaymentButton');
    const totalPaymentAmount = document.getElementById('totalPaymentAmount');
    const paymentTableBody = document.getElementById('paymentTableBody');

    const totalAmountFromDate = document.getElementById('totalAmountFromDate');
    const totalAmountToDate = document.getElementById('totalAmountToDate');
    const trackTotalAmountButton = document.getElementById('trackTotalAmountButton');
    const grandTotalAmount = document.getElementById('grandTotalAmount');
    const totalAmountTableBody = document.getElementById('totalAmountTableBody');

    const trackingLoadingMessages = document.querySelectorAll('.tracking-loading');
    const trackingErrorMessages = document.querySelectorAll('.tracking-error');


    let currentStoreId = ''; // Variable to hold the logged-in store ID
    let selectedPlanData = null;
    let selectedPhonePrice = null;

    // --- Helper Functions ---

    function showElement(element) {
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('visible'), 10); // Small delay for transition
    }

    function hideElement(element) {
        element.classList.remove('visible');
        // Wait for transition to finish before hiding completely
        element.addEventListener('transitionend', function handler() {
            element.classList.add('hidden');
            element.removeEventListener('transitionend', handler);
        }, { once: true });
    }

    function toggleLoading(isLoading, section) {
        if (section === 'mainForm') {
            if (isLoading) {
                submitWarrantyButton.disabled = true;
                showElement(loadingMessage);
                hideElement(errorMessage);
                hideElement(successContainer);
            } else {
                submitWarrantyButton.disabled = false;
                hideElement(loadingMessage);
            }
        } else {
            // For tracking sections
            const loadingEl = section.querySelector('.tracking-loading');
            const errorEl = section.querySelector('.tracking-error');
            if (isLoading) {
                showElement(loadingEl);
                hideElement(errorEl);
            } else {
                hideElement(loadingEl);
            }
        }
    }

    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.classList.toggle('error', isError);
        showElement(element);
    }

    function clearMessages() {
        hideElement(loadingMessage);
        hideElement(errorMessage);
        hideElement(successContainer);
        hideElement(planSelectionMessage);
        trackingLoadingMessages.forEach(el => hideElement(el));
        trackingErrorMessages.forEach(el => hideElement(el));
    }

    function resetForm() {
        warrantyForm.reset();
        selectedPlanData = null;
        selectedPhonePrice = null;
        clearMessages();
        hideElement(planSelectionSection);
        hideElement(displayedPhonePriceInfo);
        showElement(phonePriceGroup); // Show phone price input again
        phonePriceInput.classList.remove('error'); // Clear validation styles
        planOptionsContainer.classList.remove('error');
        // Clear dynamically added plan buttons
        planOptionsContainer.innerHTML = '';
        // Reset specific inputs
        document.getElementById('customerEmail').value = '';
        document.getElementById('purchaseDate').valueAsDate = new Date(); // Set to current date
    }

    function validateInput(inputElement) {
        if (inputElement.hasAttribute('required') && !inputElement.value.trim()) {
            inputElement.classList.add('error');
            return false;
        }
        inputElement.classList.remove('error');
        return true;
    }

    function validateEmail(email) {
        if (!email) return true; // Email is optional
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        // Basic phone number validation (e.g., allow digits and common separators)
        const re = /^\+?[0-9\s\-\(\)]{7,15}$/;
        return re.test(String(phone).trim());
    }

    // --- Plan Data (Moved from demoscript.js as it's client-side UI data) ---
    // The commission rate is still handled on the server for security.
    const planData = [
        {
            type: 'extended',
            title: 'Extended Warranty',
            description: '1 Year Extended Warranty',
            ranges: [
                { priceMin: 0, priceMax: 10000, planPrice: 799 },
                { priceMin: 10001, priceMax: 20000, planPrice: 999 },
                { priceMin: 20001, priceMax: 30000, planPrice: 1299 },
                { priceMin: 30001, priceMax: 40000, planPrice: 1699 },
                { priceMin: 40001, priceMax: 50000, planPrice: 2099 },
                { priceMin: 50001, priceMax: 60000, planPrice: 2499 },
                { priceMin: 60001, priceMax: 70000, planPrice: 2899 },
                { priceMin: 70001, priceMax: 80000, planPrice: 3299 },
                { priceMin: 80001, priceMax: 90000, planPrice: 3699 },
                { priceMin: 90001, priceMax: 100000, planPrice: 4099 },
                { priceMin: 100001, priceMax: Infinity, planPrice: 4599 }
            ]
        },
        {
            type: 'screen_protection',
            title: 'Screen Protection Plan',
            description: '1 Year Screen Damage Protection',
            ranges: [
                { priceMin: 0, priceMax: 10000, planPrice: 599 },
                { priceMin: 10001, priceMax: 20000, planPrice: 799 },
                { priceMin: 20001, priceMax: 30000, planPrice: 999 },
                { priceMin: 30001, priceMax: 40000, planPrice: 1299 },
                { priceMin: 40001, priceMax: 50000, planPrice: 1599 },
                { priceMin: 50001, priceMax: 60000, planPrice: 1899 },
                { priceMin: 60001, priceMax: 70000, planPrice: 2199 },
                { priceMin: 70001, priceMax: 80000, planPrice: 2499 },
                { priceMin: 80001, priceMax: 90000, planPrice: 2799 },
                { priceMin: 90001, priceMax: 100000, planPrice: 3099 },
                { priceMin: 100001, priceMax: Infinity, planPrice: 3499 }
            ]
        },
        {
            type: 'total_damage',
            title: 'Total Damage Protection',
            description: '1 Year Total Damage Protection',
            ranges: [
                { priceMin: 0, priceMax: 10000, planPrice: 999 },
                { priceMin: 10001, priceMax: 20000, planPrice: 1499 },
                { priceMin: 20001, priceMax: 30000, planPrice: 1999 },
                { priceMin: 30001, priceMax: 40000, planPrice: 2599 },
                { priceMin: 40001, priceMax: 50000, planPrice: 3199 },
                { priceMin: 50001, priceMax: 60000, planPrice: 3799 },
                { priceMin: 60001, priceMax: 70000, planPrice: 4399 },
                { priceMin: 70001, priceMax: 80000, planPrice: 4999 },
                { priceMin: 80001, priceMax: 90000, planPrice: 5599 },
                { priceMin: 90001, priceMax: 100000, planPrice: 6199 },
                { priceMin: 100001, priceMax: Infinity, planPrice: 6899 }
            ]
        },
        {
            type: 'combo_screen_extended',
            title: 'Combo: Screen + Extended',
            description: '1 Yr Screen Damage + 1 Yr Extended Warranty',
            ranges: [
                { priceMin: 0, priceMax: 10000, planPrice: 1199 },
                { priceMin: 10001, priceMax: 20000, planPrice: 1499 },
                { priceMin: 20001, priceMax: 30000, planPrice: 1999 },
                { priceMin: 30001, priceMax: 40000, planPrice: 2499 },
                { priceMin: 40001, priceMax: 50000, planPrice: 2999 },
                { priceMin: 50001, priceMax: 60000, planPrice: 3499 },
                { priceMin: 60001, priceMax: 70000, planPrice: 3999 },
                { priceMin: 70001, priceMax: 80000, planPrice: 4499 },
                { priceMin: 80001, priceMax: 90000, planPrice: 4999 },
                { priceMin: 90001, priceMax: 100000, planPrice: 5499 },
                { priceMin: 100001, priceMax: Infinity, planPrice: 5999 }
            ]
        },
        {
            type: 'combo_total_extended',
            title: 'Combo: Total Damage + Extended',
            description: '1 Yr Total Damage + 1 Yr Extended Warranty',
            ranges: [
                { priceMin: 0, priceMax: 10000, planPrice: 1599 },
                { priceMin: 10001, priceMax: 20000, planPrice: 2199 },
                { priceMin: 20001, priceMax: 30000, planPrice: 2899 },
                { priceMin: 30001, priceMax: 40000, planPrice: 3699 },
                { priceMin: 40001, priceMax: 50000, planPrice: 4499 },
                { priceMin: 50001, priceMax: 60000, planPrice: 5299 },
                { priceMin: 60001, priceMax: 70000, planPrice: 6099 },
                { priceMin: 70001, priceMax: 80000, planPrice: 6899 },
                { priceMin: 80001, priceMax: 90000, planPrice: 7699 },
                { priceMin: 90001, priceMax: 100000, planPrice: 8499 },
                { priceMin: 100001, priceMax: Infinity, planPrice: 9399 }
            ]
        }
    ];

    function getPlanPrice(price, type) {
        const plan = planData.find(p => p.type === type);
        if (!plan) return null;

        const range = plan.ranges.find(r => price >= r.priceMin && price <= r.priceMax);
        return range ? range.planPrice : null;
    }

    function populatePlans(phonePrice) {
        planOptionsContainer.innerHTML = ''; // Clear previous plans
        planSelectionMessage.classList.add('hidden'); // Hide any previous error message

        if (isNaN(phonePrice) || phonePrice <= 0) {
            planOptionsContainer.innerHTML = '<p class="no-data-message">Please enter a valid phone price to see plans.</p>';
            return;
        }

        const availablePlans = planData.map(plan => {
            const price = getPlanPrice(phonePrice, plan.type);
            if (price !== null) {
                return {
                    type: plan.type,
                    title: plan.title,
                    description: plan.description,
                    planPrice: price
                };
            }
            return null;
        }).filter(Boolean); // Remove null entries

        if (availablePlans.length === 0) {
            planOptionsContainer.innerHTML = '<p class="no-data-message">No plans available for the entered phone price range.</p>';
            return;
        }

        availablePlans.forEach(plan => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('plan-button');
            button.dataset.planType = plan.type;
            button.dataset.planPrice = plan.planPrice;
            button.innerHTML = `
                <div class="plan-text">
                    <strong>${plan.title}</strong><br>
                    <small>${plan.description}</small>
                </div>
                <span class="plan-price">₹${plan.planPrice.toLocaleString('en-IN')}</span>
            `;
            button.addEventListener('click', () => {
                // Remove 'selected' from all other buttons
                document.querySelectorAll('.plan-button').forEach(btn => btn.classList.remove('selected'));
                // Add 'selected' to the clicked button
                button.classList.add('selected');
                selectedPlanData = {
                    planType: plan.type,
                    planPrice: plan.planPrice,
                    selectedPlanDetails: `${plan.title} (₹${plan.planPrice.toLocaleString('en-IN')})`
                };
                planOptionsContainer.classList.remove('error'); // Clear validation style on selection
                hideElement(planSelectionMessage);
            });
            planOptionsContainer.appendChild(button);
        });

        // Pre-select first plan if none is selected
        if (!selectedPlanData && availablePlans.length > 0) {
            planOptionsContainer.querySelector('.plan-button').click();
        } else if (selectedPlanData) {
            // Re-select the previously selected plan if it's still available
            const prevSelectedButton = document.querySelector(`.plan-button[data-plan-type="${selectedPlanData.planType}"]`);
            if (prevSelectedButton) {
                prevSelectedButton.click();
            } else {
                // If previously selected plan is no longer available for new price, select the first
                planOptionsContainer.querySelector('.plan-button').click();
            }
        }
    }


    // --- Event Listeners for Plan Selection ---

    phonePriceInput.addEventListener('input', function() {
        // Clear selected plan when phone price changes
        selectedPlanData = null;
        phonePriceInput.classList.remove('error');
        planOptionsContainer.classList.remove('error');
        hideElement(planSelectionMessage);
        hideElement(planSelectionSection);
        hideElement(displayedPhonePriceInfo);
        planOptionsContainer.innerHTML = ''; // Clear plans immediately
    });

    phonePriceInput.addEventListener('blur', function() {
        const price = parseFloat(phonePriceInput.value);
        if (isNaN(price) || price <= 0) {
            phonePriceInput.classList.add('error');
            return;
        }
        phonePriceInput.classList.remove('error');
        selectedPhonePrice = price;
        displayPhonePrice.textContent = price.toLocaleString('en-IN');
        showElement(displayedPhonePriceInfo);
        hideElement(phonePriceGroup); // Hide input
        populatePlans(selectedPhonePrice);
        showElement(planSelectionSection); // Show plan selection
    });

    changePhonePriceButton.addEventListener('click', () => {
        hideElement(displayedPhonePriceInfo);
        hideElement(planSelectionSection);
        showElement(phonePriceGroup);
        phonePriceInput.focus(); // Focus back on price input
        selectedPlanData = null; // Clear selected plan
        planOptionsContainer.innerHTML = ''; // Clear dynamic buttons
    });

    // New Submission Button
    newSubmissionButton.addEventListener('click', resetForm);

    // --- Main Form Submission ---
    warrantyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearMessages();

        let isValid = true;

        // Validate basic fields
        if (!validateInput(document.getElementById('customerName'))) isValid = false;
        if (!validateInput(document.getElementById('customerPhone'))) isValid = false;
        if (!validateInput(document.getElementById('productName'))) isValid = false;
        if (!validateInput(document.getElementById('imeiNumber'))) isValid = false;
        if (!validateInput(document.getElementById('purchaseDate'))) isValid = false;

        // Validate email if provided
        const customerEmailInput = document.getElementById('customerEmail');
        if (customerEmailInput.value.trim() && !validateEmail(customerEmailInput.value)) {
            customerEmailInput.classList.add('error');
            showMessage(errorMessage, 'Please enter a valid email address.');
            isValid = false;
        } else {
            customerEmailInput.classList.remove('error');
        }

        // Validate phone number
        if (!validatePhone(document.getElementById('customerPhone').value)) {
            document.getElementById('customerPhone').classList.add('error');
            showMessage(errorMessage, 'Please enter a valid phone number (7-15 digits, optional +, spaces, dashes, parentheses).');
            isValid = false;
        } else {
            document.getElementById('customerPhone').classList.remove('error');
        }

        // Validate phone price and plan selection
        if (selectedPhonePrice === null || isNaN(selectedPhonePrice) || selectedPhonePrice <= 0) {
            phonePriceInput.classList.add('error');
            showMessage(errorMessage, 'Please enter a valid phone price.');
            isValid = false;
        }

        if (!selectedPlanData) {
            planOptionsContainer.classList.add('error');
            showMessage(planSelectionMessage, 'Please select a plan.');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        toggleLoading(true, 'mainForm');

        const formData = {
            action: 'submitWarranty', // Action for doPost in Apps Script
            customerName: document.getElementById('customerName').value,
            customerEmail: customerEmailInput.value,
            customerPhone: document.getElementById('customerPhone').value,
            storeId: currentStoreId, // Use the stored store ID
            productName: document.getElementById('productName').value,
            imeiNumber: document.getElementById('imeiNumber').value,
            purchaseDate: document.getElementById('purchaseDate').value,
            phonePrice: selectedPhonePrice,
            planType: selectedPlanData.planType,
            planPrice: selectedPlanData.planPrice,
            selectedPlanDetails: selectedPlanData.selectedPlanDetails
        };

        try {
            const response = await fetch(APP_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Submission result:', result);

            if (result.status === 'success') {
                showElement(successContainer);
                const pdfUrl = result.url;
                downloadLink.href = pdfUrl;

                // Clear previous QR code (if any)
                qrcodeElement.innerHTML = '';
                new QRious({
                    element: qrcodeElement,
                    value: pdfUrl,
                    size: 150,
                    level: 'H'
                });
            } else {
                showMessage(errorMessage, result.message || 'Submission failed.');
            }
        } catch (error) {
            console.error('Error submitting warranty:', error);
            showMessage(errorMessage, 'An unexpected error occurred: ' + error.message);
        } finally {
            toggleLoading(false, 'mainForm');
        }
    });

    // --- Post Login Setup Function (Exposed to global window for demoauth.js) ---
    window.postLoginSetup = function(storeId) {
        currentStoreId = storeId; // Set the global store ID
        document.getElementById('currentStoreId').textContent = storeId;
        document.getElementById('drawerStoreId').textContent = storeId;

        resetForm(); // Ensure form is clean and date is current
        // Set purchase date to today by default
        document.getElementById('purchaseDate').valueAsDate = new Date();
    };

    // --- Date Picker default to today ---
    document.getElementById('purchaseDate').valueAsDate = new Date();

    // --- Drawer Navigation ---
    drawerItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Close drawer
            appDrawer.classList.remove('open');
            overlay.classList.remove('active');

            // Remove active class from all drawer items
            drawerItems.forEach(i => i.classList.remove('active'));
            // Add active class to the clicked item
            this.classList.add('active');

            const targetSectionId = this.dataset.sectionId;

            // Hide all sub-sections
            subSections.forEach(section => {
                section.classList.remove('active-sub-section');
                hideElement(section); // Ensure hidden class is also applied for proper transitions
            });

            // Show the target sub-section
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                showElement(targetSection);
                targetSection.classList.add('active-sub-section');

                // Clear any previous messages or data in tracking sections when switching
                clearMessages();
                trackingErrorMessages.forEach(el => hideElement(el));
                trackingLoadingMessages.forEach(el => hideElement(el));
            }
        });
    });

    // --- Tracking Functions ---
    async function fetchTrackingData(reportType, fromDateInput, toDateInput, totalSpan, tableBody) {
        const fromDateStr = fromDateInput.value;
        const toDateStr = toDateInput.value;
        const currentTrackingSection = tableBody.closest('.sub-section'); // Get the parent section

        clearMessages(); // Clear main form messages
        trackingErrorMessages.forEach(el => hideElement(el)); // Clear all tracking errors
        trackingLoadingMessages.forEach(el => hideElement(el)); // Clear all tracking loading indicators

        // Basic date validation
        if (!fromDateStr || !toDateStr) {
            showMessage(currentTrackingSection.querySelector('.tracking-error'), 'Please select both From Date and To Date.', true);
            return;
        }

        const fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);

        if (fromDate > toDate) {
            showMessage(currentTrackingSection.querySelector('.tracking-error'), 'From Date cannot be after To Date.', true);
            return;
        }

        toggleLoading(true, currentTrackingSection);

        try {
            const response = await fetch(APP_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getTrackingData', // Action for doPost in Apps Script
                    storeId: currentStoreId,
                    reportType: reportType,
                    fromDateStr: fromDateStr,
                    toDateStr: toDateStr
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`${reportType} Tracking result:`, result);

            if (result.status === 'success') {
                updateTrackingTable(result.records, totalSpan, tableBody, reportType);
            } else {
                showMessage(currentTrackingSection.querySelector('.tracking-error'), result.message || `Failed to fetch ${reportType} data.`, true);
            }
        } catch (error) {
            console.error(`Error fetching ${reportType} data:`, error);
            showMessage(currentTrackingSection.querySelector('.tracking-error'), `An error occurred: ${error.message}`, true);
        } finally {
            toggleLoading(false, currentTrackingSection);
        }
    }

    function updateTrackingTable(records, totalSpan, tableBody, reportType) {
        tableBody.innerHTML = ''; // Clear existing rows
        let totalValue = 0;

        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2" class="no-data-message">No data to display for the selected period.</td></tr>';
        } else {
            records.forEach(record => {
                const row = tableBody.insertRow();
                const dateCell = row.insertCell();
                const valueCell = row.insertCell();
                dateCell.textContent = record.date;

                let displayValue = record.value;
                if (reportType !== 'Submissions') { // Format for currency if not submissions count
                    displayValue = `₹${parseFloat(record.value).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
                }
                valueCell.textContent = displayValue;
                totalValue += parseFloat(record.value);
            });
        }

        if (reportType === 'Submissions') {
            totalSpan.textContent = totalValue.toLocaleString('en-IN');
        } else {
            totalSpan.textContent = totalValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        }
    }

    // Assign event listeners for tracking buttons
    trackSubmissionsButton.addEventListener('click', () => {
        fetchTrackingData('Submissions', submissionsFromDate, submissionsToDate, totalSubmissionsCount, submissionsTableBody);
    });
    trackCommissionButton.addEventListener('click', () => {
        fetchTrackingData('Commission', commissionFromDate, commissionToDate, totalCommissionAmount, commissionTableBody);
    });
    trackPaymentButton.addEventListener('click', () => {
        fetchTrackingData('Payment', paymentFromDate, paymentToDate, totalPaymentAmount, paymentTableBody);
    });
    trackTotalAmountButton.addEventListener('click', () => {
        fetchTrackingData('Total Amount', totalAmountFromDate, totalAmountToDate, grandTotalAmount, totalAmountTableBody);
    });

    // Set default dates for tracking sections to the last 30 days
    function setDefaultTrackingDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29); // 30 days including today

        const formatDateInput = (date) => date.toISOString().split('T')[0];

        submissionsFromDate.value = formatDateInput(thirtyDaysAgo);
        submissionsToDate.value = formatDateInput(today);
        commissionFromDate.value = formatDateInput(thirtyDaysAgo);
        commissionToDate.value = formatDateInput(today);
        paymentFromDate.value = formatDateInput(thirtyDaysAgo);
        paymentToDate.value = formatDateInput(today);
        totalAmountFromDate.value = formatDateInput(thirtyDaysAgo);
        totalAmountToDate.value = formatDateInput(today);
    }
    setDefaultTrackingDates();


    // Expose a reset function for logout if needed by demoauth.js
    window.resetDemoscriptState = function() {
        currentStoreId = '';
        resetForm();
        // Clear tracking tables/summaries
        totalSubmissionsCount.textContent = '0';
        submissionsTableBody.innerHTML = '<tr><td colspan="2" class="no-data-message">No data to display.</td></tr>';
        totalCommissionAmount.textContent = '0';
        commissionTableBody.innerHTML = '<tr><td colspan="2" class="no-data-message">No data to display.</td></tr>';
        totalPaymentAmount.textContent = '0';
        paymentTableBody.innerHTML = '<tr><td colspan="2" class="no-data-message">No data to display.</td></tr>';
        grandTotalAmount.textContent = '0';
        totalAmountTableBody.innerHTML = '<tr><td colspan="2" class="no-data-message">No data to display.</td></tr>';
        setDefaultTrackingDates(); // Reset date ranges
        // Ensure only registration form is visible after logout
        subSections.forEach(section => {
            section.classList.remove('active-sub-section');
            hideElement(section);
        });
        showElement(document.getElementById('registrationFormSection'));
        document.getElementById('registrationFormSection').classList.add('active-sub-section');
    };

    // Dispatch a custom event to signal that demoscript.js has finished loading and set up its global functions
    // This allows demoauth.js to safely call postLoginSetup once this script is ready.
    document.dispatchEvent(new Event('scriptsLoaded'));
});
