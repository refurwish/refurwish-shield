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

    // --- Terms and Conditions Elements ---
    const termsConditionsContainer = document.querySelector('.terms-conditions-container');
    const acceptTermsCheckbox = document.getElementById('acceptTerms');
    const viewTermsLink = document.getElementById('viewTermsLink');
    const termsContent = document.getElementById('termsContent');
    const termItems = document.querySelectorAll('.term-item');

    // --- NEW: Signature Elements ---
    const signatureArea = document.getElementById('signatureArea');
    const signatureCanvas = document.getElementById('signatureCanvas');
    const clearSignatureButton = document.getElementById('clearSignature');
    const customerSignatureImageInput = document.getElementById('customerSignatureImage');
    const generateCertificateButton = document.getElementById('generateCertificateButton');

    // --- DEBUGGING LOGS START ---
    console.log("--- Starting demoscript.js initialization ---");
    console.log("Attempting to find signatureCanvas element...");
    // --- DEBUGGING LOGS END ---

    // Initialize Signature Pad
    let signaturePad;
    // CRITICAL: Ensure SignaturePad constructor is available AND canvas element exists
    if (typeof SignaturePad !== 'undefined' && signatureCanvas) {
        try {
            signaturePad = new SignaturePad(signatureCanvas);
            // --- DEBUGGING LOGS START ---
            console.log("signatureCanvas found:", signatureCanvas);
            console.log("SignaturePad instance created successfully:");
            console.log(signaturePad);
            window.debugSignaturePad = signaturePad; // Make it globally accessible for console debugging
            // --- DEBUGGING LOGS END ---
        } catch (e) {
            // This catch block will tell us if there's an error *during* SignaturePad's own construction
            console.error("ERROR during SignaturePad initialization (caught in try-catch):", e);
            console.error("Please check if the canvas element is valid and SignaturePad library is compatible.");
        }
    } else {
        // This else block will tell us if SignaturePad constructor or canvas was missing
        if (typeof SignaturePad === 'undefined') {
            console.error("CRITICAL ERROR: SignaturePad constructor is UNDEFINED. Is the library loaded correctly?");
        }
        if (!signatureCanvas) {
            console.error("CRITICAL ERROR: signatureCanvas element with ID 'signatureCanvas' was NOT found in the DOM!");
        }
    }

    // --- DEBUGGING LOGS START ---
    console.log("Value of 'signaturePad' variable after initialization block:");
    console.log(signaturePad);
    // --- DEBUGGING LOGS END ---


    // Function to update the visibility and required status of the signature area
    function updateSignatureAreaState() {
        if (acceptTermsCheckbox.checked) {
            signatureArea.classList.remove('hidden');
            setTimeout(() => signatureArea.classList.add('visible'), 10);
        } else {
            signatureArea.classList.remove('visible');
            setTimeout(() => signatureArea.classList.add('hidden'), 300);
            if (signaturePad) { // Safely clear signature if pad exists
                signaturePad.clear();
            }
            customerSignatureImageInput.value = '';
        }
        updateSubmitButtonState();
    }

    // Function to enable/disable the submit button
    function updateSubmitButtonState() {
        const isPlanSelected = selectedPlanValueInput.value !== '';
        const isTermsAccepted = acceptTermsCheckbox.checked;
        let isSignatureDrawn = false;

        // Ensure signaturePad is defined and not null before calling isEmpty()
        if (signaturePad && typeof signaturePad.isEmpty === 'function') {
            isSignatureDrawn = !signaturePad.isEmpty();
        } else {
            console.warn("SignaturePad is not initialized or isEmpty method is missing. isSignatureDrawn will be false.");
            isSignatureDrawn = false;
        }

        if (isPlanSelected && isTermsAccepted && isSignatureDrawn) {
            generateCertificateButton.disabled = false;
        } else {
            generateCertificateButton.disabled = true;
        }
        // --- DEBUGGING LOGS START ---
        console.log("updateSubmitButtonState called:");
        console.log("  isPlanSelected:", isPlanSelected);
        console.log("  isTermsAccepted:", isTermsAccepted);
        console.log("  isSignatureDrawn:", isSignatureDrawn);
        console.log("  generateCertificateButton.disabled set to:", generateCertificateButton.disabled);
        // --- DEBUGGING LOGS END ---
    }


    // --- Drawer and Tracking Elements (unchanged from previous version for brevity) ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mainDrawer = document.getElementById('mainDrawer');
    const drawerCloseButton = document.getElementById('drawerCloseButton');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const logoutButtonDrawer = document.getElementById('logoutButtonDrawer');
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

    // --- Show Password Elements ---
    const loginPasswordInput = document.getElementById('loginPassword');
    const showPasswordToggle = document.getElementById('showPasswordToggle');

    // Define extended warranty base prices
    const extendedWarrantyPrices = [
        { maxPrice: 10000, planText: '₹5,000 - ₹10,000', price: 449 },
        { maxPrice: 15000, planText: '₹10,001 - ₹15,000', price: 649 },
        { maxPrice: 20000, planText: '₹15,001 - ₹20,000', price: 899 },
        { maxPrice: 25000, planText: '₹20,001 - ₹25,000', price: 1199 },
        { maxPrice: 30000, planText: '₹25,001 - ₹30,000', price: 1499 },
        { maxPrice: 40000, planText: '₹30,001 - ₹40,000', price: 1899 },
        { maxPrice: 50000, planText: '₹40,001 - ₹50,000', price: 2199 },
        { maxPrice: 70000, planText: '₹50,001 - ₹70,000', price: 2999 },
        { maxPrice: 80000, planText: '₹70,001 - ₹80,000', price: 3799 },
        { maxPrice: 100000, planText: '₹80,001 - ₹1,00,000', price: 4499 },
        { maxPrice: 120000, planText: '₹1,00,001 - ₹1,20,000', price: 5999 },
        { maxPrice: 150000, planText: '₹1,20,001 - ₹1,50,000', price: 6999 },
        { maxPrice: 175000, planText: '₹1,50,001 - ₹1,75,000', price: 8499 },
        { maxPrice: 200000, planText: '₹1,75,001 - ₹2,00,000', price: 9499 },
        { maxPrice: 250000, planText: '₹2,00,001 - ₹2,50,000', price: 9999 },
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
        const screenDamagePrice = Math.round(phonePrice * 0.06);
        const totalDamagePrice = Math.round(phonePrice * 0.1);

        const allPlans = [
            { value: 'extended_warranty', name: 'Extended Warranty', price: extendedPrice, internalType: 'extended', periodText: '12 Months Extended' },
            { value: 'screen_protection', name: 'Screen Damage Protection', price: screenDamagePrice, internalType: 'screen_protection', periodText: '12 Months' },
            { value: 'total_damage_protection', name: 'Total Damage Protection', price: totalDamagePrice, internalType: 'total_damage', periodText: '12 Months' },
            { value: 'combo_screen_extended', name: 'Combo (Screen Damage Protection + Extended Warranty)', price: Math.round(screenDamagePrice + (extendedPrice * 0.3)), internalType: 'combo_screen_extended', periodText: '24 Months Total' },
            { value: 'combo_total_extended', name: 'Combo (Total Damage Protection + Extended Warranty)', price: Math.round(totalDamagePrice + (extendedPrice * 0.3)), internalType: 'combo_total_extended', periodText: '24 Months Total' }
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
                updateSubmitButtonState();

                updateTermsContentDisplay(plan.internalType);
            });

            planOptionsContainer.appendChild(button);
        });

        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
    }

    function updateTermsContentDisplay(selectedPlanType) {
        termItems.forEach(item => {
            if (item.dataset.plan === selectedPlanType) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        document.querySelector('.general-terms').style.display = 'block';
        document.querySelector('.terms-list ul:last-of-type').style.display = 'block';
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

        const phonePrice = parseFloat(phonePriceInput.value);
        if (isNaN(phonePrice) || phonePrice <= 0) {
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

        if (!validateCustomerAndPhoneDetails()) {
            alert('Please fill in all required details correctly before proceeding to plan selection.');
            const firstErrorField = document.querySelector('.form-group input.error, .form-group select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const phonePrice = parseFloat(phonePriceInput.value);
        if (phonePrice < 5000 || phonePrice > 250000) {
            alert('Please enter phone price between ₹5,000 to ₹2,50,000.');
            phonePriceInput.classList.add('error');
            phonePriceInput.focus();
            phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            phonePriceInput.classList.remove('error');
        }

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
        updateSubmitButtonState();
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

        termsContent.classList.remove('visible');
        termsContent.classList.add('hidden');
        acceptTermsCheckbox.checked = false;
        termsConditionsContainer.classList.remove('error');
        updateSignatureAreaState();

        phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        updateSubmitButtonState();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!selectedPlanValueInput.value) {
            alert('Please select a Plan.');
            planOptionsContainer.classList.add('error');
            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            planOptionsContainer.classList.remove('error');
        }

        if (!acceptTermsCheckbox.checked) {
            alert('You must accept the Terms and Conditions to generate the certificate.');
            termsConditionsContainer.classList.add('error');
            acceptTermsCheckbox.focus();
            termsConditionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            termsConditionsContainer.classList.remove('error');
        }

        // NEW: Validate Signature
        // Check if signaturePad exists and is initialized, and if it's empty
        if (signaturePad && typeof signaturePad.isEmpty === 'function') {
            if (signaturePad.isEmpty()) {
                alert('Please provide your digital signature.');
                signatureArea.classList.add('error');
                signatureArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            } else {
                signatureArea.classList.remove('error');
                customerSignatureImageInput.value = signaturePad.toDataURL('image/png');
            }
        } else {
            console.error("SignaturePad not initialized or isEmpty method missing. Cannot validate signature.");
            alert("An internal error occurred: Signature pad not ready. Please try again or refresh.");
            return;
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
                    document.getElementById('successMessage').textContent = 'Certificate generated successfully!';
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
                    acceptTermsCheckbox.checked = false;
                    termsContent.classList.remove('visible');
                    termsContent.classList.add('hidden');
                    termsConditionsContainer.classList.remove('error');
                    if (signaturePad) {
                        signaturePad.clear();
                    }
                    updateSignatureAreaState();

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

    // --- Terms and Conditions Toggle ---
    viewTermsLink.addEventListener('click', function(e) {
        e.preventDefault();
        termsContent.classList.toggle('hidden');
        termsContent.classList.toggle('visible');
        if (termsContent.classList.contains('visible')) {
            termsContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Event listener for terms checkbox change
    acceptTermsCheckbox.addEventListener('change', function() {
        if (this.checked) {
            termsConditionsContainer.classList.remove('error');
        }
        updateSignatureAreaState();
        updateSubmitButtonState();
    });

    // Signature Pad Event Listeners
    // ONLY assign these if signaturePad was successfully initialized
    if (signaturePad) {
        signaturePad.onBegin = function() {
            signatureArea.classList.remove('error');
        };
        signaturePad.onEnd = function() {
            updateSubmitButtonState();
        };
    } else {
        console.warn("SignaturePad not initialized. Skipping onBegin and onEnd event handlers. Signature validation will rely on explicit checks only.");
    }


    clearSignatureButton.addEventListener('click', function() {
        if (signaturePad) {
            signaturePad.clear();
        }
        customerSignatureImageInput.value = '';
        updateSubmitButtonState();
    });


    // --- Drawer and Tracking Functionality (unchanged for brevity) ---
    function openDrawer() {
        mainDrawer.classList.add('open');
        drawerOverlay.classList.remove('hidden');
        setTimeout(() => drawerOverlay.classList.add('visible'), 10);
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mainDrawer.classList.remove('open');
        drawerOverlay.classList.remove('visible');
        setTimeout(() => drawerOverlay.classList.add('hidden'), 300);
        document.body.style.overflow = '';
        trackingSection.classList.remove('visible');
        trackingSection.classList.add('hidden');
        trackingResults.classList.remove('visible');
        trackingResults.classList.add('hidden');
        trackingError.classList.remove('visible');
        trackingError.classList.add('hidden');
        trackingLoading.classList.remove('visible');
        trackingLoading.classList.add('hidden');
    }

    hamburgerMenu.addEventListener('click', openDrawer);
    drawerCloseButton.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    logoutButtonDrawer.addEventListener('click', () => {
        sessionStorage.removeItem('storeId');

        document.getElementById('loginForm').reset();
        form.reset();

        document.getElementById('loginStoreId').value = '';
        document.getElementById('loginPassword').value = '';
        storeIdInput.value = '';
        document.getElementById('displayedStoreId').textContent = '';

        document.getElementById('warrantySection').classList.remove('visible');
        document.getElementById('warrantySection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
        setTimeout(() => document.getElementById('loginSection').classList.add('visible'), 10);

        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('loginError').classList.remove('visible');
        document.getElementById('loginLoading').classList.add('hidden');
        document.getElementById('loginLoading').classList.remove('visible');
        document.getElementById('loginForm').querySelector('.submit-button').classList.remove('hidden');

        closeDrawer();

        fromDateInput.value = '';
        toDateInput.value = '';

        acceptTermsCheckbox.checked = false;
        termsContent.classList.remove('visible');
        termsContent.classList.add('hidden');
        termsConditionsContainer.classList.remove('error');
        if (signaturePad) {
            signaturePad.clear();
        }
        updateSignatureAreaState();
    });

    openTrackingButton.addEventListener('click', () => {
        trackingSection.classList.toggle('hidden');
        setTimeout(() => {
            trackingSection.classList.toggle('visible');
        }, 10);

        if (!fromDateInput.value || !toDateInput.value) {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
            toDateInput.value = today.toISOString().split('T')[0];
        }

        trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    filterTrackingDataButton.addEventListener('click', fetchTrackingData);

    async function fetchTrackingData() {
        const fromDate = fromDateInput.value;
        const toDate = toDateInput.value;
        const storeId = sessionStorage.getItem('storeId');

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

        const appScriptURL = 'https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec';

        const queryParams = new URLSearchParams({
            action: 'getTrackingData',
            storeId: storeId,
            fromDate: fromDate,
            toDate: toDate
        });

        try {
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

    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    if (showPasswordToggle && loginPasswordInput) {
        showPasswordToggle.addEventListener('change', () => {
            if (showPasswordToggle.checked) {
                loginPasswordInput.type = 'text';
            } else {
                loginPasswordInput.type = 'password';
            }
        });
    }

    // Initial update for submit button state
    updateSubmitButtonState();
});
