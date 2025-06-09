document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('warrantyForm');
    const loading = document.getElementById('loading');
    const successContainer = document.getElementById('successContainer');
    const errorMessage = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const storeIdInput = document.getElementById('storeId');

    const phonePriceGroup = document.getElementById('phonePriceGroup');
    const phonePriceInput = document.getElementById('phonePrice');
    const confirmedPhonePriceDisplay = document.getElementById('confirmedPhonePrice');
    const showPlanPricesButton = document.getElementById('showPlanPricesButton');
    const planSelectionSection = document.getElementById('planSelectionSection');

    const planOptionsContainer = document.getElementById('planOptionsContainer');
    const selectedPlanValueInput = document.getElementById('selectedPlanValue');
    const selectedPlanPriceInput = document.getElementById('selectedPlanPrice');
    const selectedPlanTypeInput = document.getElementById('selectedPlanType');
    const selectedPlanDetailsInput = document.getElementById('selectedPlanDetails');
    const backToPhonePriceButton = document.getElementById('backToPhonePriceButton');

    // --- Drawer and Tracking Elements ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mainDrawer = document.getElementById('mainDrawer');
    const drawerCloseButton = document.getElementById('drawerCloseButton');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const logoutButtonDrawer = document.getElementById('logoutButtonDrawer'); // New logout button in drawer
    const openTrackingButton = document.getElementById('openTrackingButton');
    const trackingSection = document.getElementById('trackingSection');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const filterTrackingDataButton = document.getElementById('filterTrackingDataButton');
    const trackingLoading = document.getElementById('trackingLoading');
    const trackingError = document.getElementById('trackingError');
    const trackingResults = document.getElementById('trackingResults');
    const trackingDateRangeDisplay = document.getElementById('trackingDateRange');
    const totalSubmissionsDisplay = document.getElementById('totalSubmissions');
    const totalCommissionDisplay = document.getElementById('totalCommission');
    const totalPaymentDisplay = document.getElementById('totalPayment');
    const totalAmountDisplay = document.getElementById('totalAmount');

    // Define extended warranty base prices
    const extendedWarrantyPrices = [
        { maxPrice: 15000, planText: 'Under ₹15,000', price: 699 },
        { maxPrice: 25000, planText: '₹15,001 - ₹25,000', price: 799 },
        { maxPrice: 35000, planText: '₹25,001 - ₹35,000', price: 899 },
        { maxPrice: 45000, planText: '₹35,001 - ₹45,000', price: 999 },
        { maxPrice: 60000, planText: '₹45,001 - ₹60,000', price: 1299 },
        { maxPrice: 75000, planText: '₹60,001 - ₹75,000', price: 1599 },
        { maxPrice: 100000, planText: '₹75,001 - ₹1,00,000', price: 1999 },
        { maxPrice: 150000, planText: '₹1,00,001 - ₹1,50,000', price: 2499 },
        { maxPrice: 200000, planText: '₹1,50,001 - ₹2,00,000', price: 2999 },
        { maxPrice: 250000, planText: '₹2,00,001 - ₹2,50,000', price: 3499 },
    ];

    function getExtendedWarrantyPrice(phonePrice) {
        for (const plan of extendedWarrantyPrices) {
            if (phonePrice <= plan.maxPrice) {
                return plan.price;
            }
        }
        return extendedWarrantyPrices[extendedWarrantyPrices.length - 1].price;
    }

    function populatePlanOptions(phonePrice) {
        planOptionsContainer.innerHTML = '';

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        const allPlans = [
            { value: 'extended_warranty', name: 'Extended Warranty', price: extendedPrice, internalType: 'extended', periodText: '12 Months Extended' },
            { value: 'screen_protection', name: 'Screen Protection Plan', price: screenDamagePrice, internalType: 'screen_protection', periodText: '12 Months' },
            { value: 'total_damage_protection', name: 'Total Damage Protection', price: totalDamagePrice, internalType: 'total_damage', periodText: '12 Months' },
            { value: 'combo_screen_extended', name: 'Combo (Screen Damage + Extended Warranty)', price: Math.round(screenDamagePrice + (extendedPrice * 0.5)), internalType: 'combo_screen_extended', periodText: '24 Months Total' },
            { value: 'combo_total_extended', name: 'Combo (Total Damage Protection + Extended Warranty)', price: Math.round(totalDamagePrice + (extendedPrice * 0.5)), internalType: 'combo_total_extended', periodText: '24 Months Total' }
        ];

        allPlans.forEach(plan => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('plan-button');
            button.innerHTML = `<span class="plan-text">${plan.name}</span><span class="plan-price">₹${plan.price}</span>`;

            button.setAttribute('data-value', plan.value);
            button.setAttribute('data-price', plan.price);
            button.setAttribute('data-plantype', plan.internalType);
            button.setAttribute('data-details', `${plan.name} (${plan.periodText})`);

            button.addEventListener('click', function() {
                const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }
                button.classList.add('selected');

                selectedPlanValueInput.value = plan.value;
                selectedPlanPriceInput.value = plan.price;
                selectedPlanTypeInput.value = plan.internalType;
                selectedPlanDetailsInput.value = button.getAttribute('data-details');

                planOptionsContainer.classList.remove('error');
            });

            planOptionsContainer.appendChild(button);
        });

        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
    }

    function validateCustomerAndPhoneDetails() {
        let isValid = true;
        const requiredFields = [
            'customerName', 'customerEmail', 'customerPhone',
            'productName', 'imeiNumber', 'purchaseDate', 'phonePrice'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        const email = document.getElementById('customerEmail');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            email.classList.add('error');
            isValid = false;
        }

        // Keep the phone price validation here for general form validity,
        // but the specific alert will be handled in showPlanPricesButton click.
        const phonePrice = parseFloat(phonePriceInput.value);
        if (isNaN(phonePrice) || phonePrice <= 0) { // This handles empty or non-numeric/zero values
            phonePriceInput.classList.add('error');
            isValid = false;
        } else {
            phonePriceInput.classList.remove('error');
        }

        const imeiNumber = document.getElementById('imeiNumber');
        if (imeiNumber.value.trim().length !== 15 || !/^[0-9]+$/.test(imeiNumber.value.trim())) {
            imeiNumber.classList.add('error');
            isValid = false;
        }

        const customerPhone = document.getElementById('customerPhone');
        if (customerPhone.value.trim().length !== 10 || !/^[0-9]+$/.test(customerPhone.value.trim())) {
            customerPhone.classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    showPlanPricesButton.addEventListener('click', function (e) {
        e.preventDefault();

        // First, validate all fields generally
        if (!validateCustomerAndPhoneDetails()) {
            alert('Please fill in all required details correctly before proceeding to plan selection.');
            const firstErrorField = document.querySelector('.form-group input.error, .form-group select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return; // Stop if basic validation fails
        }

        // THEN, specifically check the phone price range
        const phonePrice = parseFloat(phonePriceInput.value);
        if (phonePrice < 5000 || phonePrice > 250000) {
            alert('Please enter phone price between ₹5,000 to ₹2,50,000.');
            phonePriceInput.classList.add('error'); // Highlight the field
            phonePriceInput.focus(); // Bring focus to the field
            phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; // Stop the function here
        } else {
            phonePriceInput.classList.remove('error'); // Ensure no error class if it was there
        }


        // If all validations pass, proceed to show plan prices
        populatePlanOptions(phonePrice);
        confirmedPhonePriceDisplay.textContent = `₹${phonePrice.toLocaleString('en-IN')}`;

        phonePriceGroup.classList.remove('visible');
        phonePriceGroup.classList.add('hidden');

        showPlanPricesButton.classList.remove('visible');
        showPlanPricesButton.classList.add('hidden');

        successContainer.classList.remove('visible');
        successContainer.classList.add('hidden');
        pdfLinkSection.classList.remove('visible');
        pdfLinkSection.classList.add('hidden');

        planSelectionSection.classList.remove('hidden');
        setTimeout(() => {
            planSelectionSection.classList.add('visible');
        }, 10);

        planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    backToPhonePriceButton.addEventListener('click', function() {
        planSelectionSection.classList.remove('visible');
        setTimeout(() => {
            planSelectionSection.classList.add('hidden');
        }, 400);

        phonePriceGroup.classList.remove('hidden');
        setTimeout(() => phonePriceGroup.classList.add('visible'), 400);

        showPlanPricesButton.classList.remove('hidden');
        setTimeout(() => showPlanPricesButton.classList.add('visible'), 400);

        const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        planOptionsContainer.classList.remove('error');

        phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!selectedPlanValueInput.value) {
            alert('Please select a Plan.'); // Retaining alert for now, consider custom UI
            planOptionsContainer.classList.add('error');
            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            planOptionsContainer.classList.remove('error');
        }

        successContainer.classList.remove('visible');
        successContainer.classList.add('hidden');
        errorMessage.classList.remove('visible');
        errorMessage.classList.add('hidden');
        pdfLinkSection.classList.remove('visible');
        pdfLinkSection.classList.add('hidden');

        loading.classList.remove('hidden');
        setTimeout(() => loading.classList.add('visible'), 10);

        const formData = new FormData(form);
        // The URL for warranty submission is fixed, as per your original code.gs logic.
        const appScriptWarrantyURL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec';

        fetch(appScriptWarrantyURL, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loading.classList.remove('visible');
                loading.classList.add('hidden');

                if (data.status === 'success') {
                    document.getElementById('successMessage').textContent = 'Certificate generated successfully!'; // This line was updated in the previous turn
                    downloadLink.href = data.url;
                    qrcodeDiv.innerHTML = '';
                    new QRCode(qrcodeDiv, {
                        text: data.url,
                        width: 150,
                        height: 150,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });

                    pdfLinkSection.classList.remove('hidden');
                    successContainer.classList.remove('hidden');
                    setTimeout(() => {
                        pdfLinkSection.classList.add('visible');
                        successContainer.classList.add('visible');
                    }, 10);

                    form.reset();
                    const storeId = sessionStorage.getItem('storeId');
                    if (storeId) {
                        storeIdInput.value = storeId;
                    }

                    planSelectionSection.classList.remove('visible');
                    planSelectionSection.classList.add('hidden');

                    phonePriceGroup.classList.remove('hidden');
                    phonePriceGroup.classList.add('visible');

                    showPlanPricesButton.classList.remove('hidden');
                    showPlanPricesButton.classList.add('visible');

                    const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedPlanValueInput.value = '';
                    selectedPlanPriceInput.value = '';
                    selectedPlanTypeInput.value = '';
                    selectedPlanDetailsInput.value = '';

                    pdfLinkSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            })
            .catch(error => {
                errorMessage.textContent = 'An error occurred: ' + error.message;
                errorMessage.classList.remove('hidden');
                setTimeout(() => errorMessage.classList.add('visible'), 10);
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
    });

    // --- Drawer and Tracking Functionality ---

    // Function to open the drawer
    function openDrawer() {
        mainDrawer.classList.add('open');
        drawerOverlay.classList.remove('hidden');
        setTimeout(() => drawerOverlay.classList.add('visible'), 10);
        document.body.style.overflow = 'hidden'; // Prevent scrolling main content
    }

    // Function to close the drawer
    function closeDrawer() {
        mainDrawer.classList.remove('open');
        drawerOverlay.classList.remove('visible');
        setTimeout(() => drawerOverlay.classList.add('hidden'), 300); // Match CSS transition
        document.body.style.overflow = ''; // Allow scrolling main content
        // Hide tracking section when drawer closes
        trackingSection.classList.remove('visible');
        trackingSection.classList.add('hidden');
        trackingResults.classList.remove('visible');
        trackingResults.classList.add('hidden');
        trackingError.classList.remove('visible');
        trackingError.classList.add('hidden');
        trackingLoading.classList.remove('visible');
        trackingLoading.classList.add('hidden');
    }

    // Event listeners for drawer
    hamburgerMenu.addEventListener('click', openDrawer);
    drawerCloseButton.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // Logout button inside the drawer
    logoutButtonDrawer.addEventListener('click', () => {
        // Clear session storage
        sessionStorage.removeItem('storeId');

        // Reset forms (manual reset for mobile autofill issues)
        document.getElementById('loginForm').reset();
        form.reset(); // This is the warrantyForm

        // Manually clear the form fields to prevent autofill issues on mobile
        document.getElementById('loginStoreId').value = '';
        document.getElementById('loginPassword').value = '';
        storeIdInput.value = '';
        document.getElementById('displayedStoreId').textContent = '';

        // Switch views with animation (from auth.js's logic)
        // Since auth.js handles this, we'll simulate its showSection logic if needed
        // or just directly apply classes assuming it will be re-initialized on next load.
        // For simplicity, we'll directly hide/show sections as per original auth.js.
        document.getElementById('warrantySection').classList.remove('visible');
        document.getElementById('warrantySection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
        setTimeout(() => document.getElementById('loginSection').classList.add('visible'), 10); // Animate in

        // Ensure login form is in its initial state (no loading/error messages)
        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('loginError').classList.remove('visible');
        document.getElementById('loginLoading').classList.add('hidden');
        document.getElementById('loginLoading').classList.remove('visible');
        document.getElementById('loginForm').querySelector('.submit-button').classList.remove('hidden');

        // Close the drawer after logout
        closeDrawer();

        // Also reset tracking section inputs
        fromDateInput.value = '';
        toDateInput.value = '';
    });

    // Tracking Data functionality
    openTrackingButton.addEventListener('click', () => {
        // Toggle visibility of tracking section
        trackingSection.classList.toggle('hidden');
        setTimeout(() => {
            trackingSection.classList.toggle('visible');
        }, 10); // Small delay for animation

        // Set default dates if not already set
        if (!fromDateInput.value || !toDateInput.value) {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            // Format dates to YYYY-MM-DD for input type="date"
            fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
            toDateInput.value = today.toISOString().split('T')[0];
        }

        // Scroll to tracking section in drawer
        trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    filterTrackingDataButton.addEventListener('click', fetchTrackingData);

    async function fetchTrackingData() {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const storeId = sessionStorage.getItem('storeId'); // Get current logged-in store ID

        if (!storeId) {
            trackingError.textContent = 'Store ID not found. Please log in again.';
            trackingError.classList.remove('hidden');
            setTimeout(() => trackingError.classList.add('visible'), 10);
            return;
        }

        if (!fromDate || !toDate) {
            trackingError.textContent = 'Please select both From and To dates.';
            trackingError.classList.remove('hidden');
            setTimeout(() => trackingError.classList.add('visible'), 10);
            return;
        }

        trackingError.classList.remove('visible');
        trackingError.classList.add('hidden');
        trackingResults.classList.remove('visible');
        trackingResults.classList.add('hidden');
        trackingLoading.classList.remove('hidden');
        setTimeout(() => trackingLoading.classList.add('visible'), 10);

        // Your App Script URL for this project (the one handling warranty submissions and now tracking)
        // This is the URL that corresponds to the code.gs you provided for warranty, not the login one.
        const appScriptURL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec';

        const queryParams = new URLSearchParams({
            action: 'getTrackingData', // New action to request tracking data
            storeId: storeId,
            fromDate: fromDate,
            toDate: toDate
        });

        try {
            // Use GET method as per the doGet function in code.gs
            const response = await fetch(`${appScriptURL}?${queryParams.toString()}`, {
                method: 'GET'
            });
            const data = await response.json();

            trackingLoading.classList.remove('visible');
            trackingLoading.classList.add('hidden');

            if (data.status === 'success') {
                totalSubmissionsDisplay.textContent = data.submissions;
                totalCommissionDisplay.textContent = `₹${data.commission.toLocaleString('en-IN')}`;
                totalPaymentDisplay.textContent = `₹${data.payment.toLocaleString('en-IN')}`;
                totalAmountDisplay.textContent = `₹${data.totalAmount.toLocaleString('en-IN')}`;
                trackingDateRangeDisplay.textContent = `${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`;

                trackingResults.classList.remove('hidden');
                setTimeout(() => trackingResults.classList.add('visible'), 10);
            } else {
                trackingError.textContent = data.message || 'Failed to fetch tracking data.';
                trackingError.classList.remove('hidden');
                setTimeout(() => trackingError.classList.add('visible'), 10);
            }
        } catch (error) {
            trackingLoading.classList.remove('visible');
            trackingLoading.classList.add('hidden');
            trackingError.textContent = 'An error occurred while fetching tracking data: ' + error.message;
            trackingError.classList.remove('hidden');
            setTimeout(() => trackingError.classList.add('visible'), 10);
        }
    }

    // Helper function to format dates for display (e.g., for "Summary for ...")
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
});
