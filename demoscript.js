document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    // Removed login-specific DOM references here as they are handled by demoauth.js
    const warrantySection = document.getElementById('warrantySection');
    const warrantyForm = document.getElementById('warrantyForm');
    const logoutButton = document.getElementById('logoutButton'); // Keep logout here
    const displayedStoreId = document.getElementById('displayedStoreId');
    const storeIdInput = document.getElementById('storeId'); // Hidden store ID input in warranty form

    const customerEmailInput = document.getElementById('customerEmail');
    const customerPhoneInput = document.getElementById('customerPhone');
    const imeiNumberInput = document.getElementById('imeiNumber');
    const phonePriceInput = document.getElementById('phonePrice');
    const purchaseDateInput = document.getElementById('purchaseDate');

    const showPlanPricesButton = document.getElementById('showPlanPricesButton');
    const planSelectionSection = document.getElementById('planSelectionSection');
    const backToPhonePriceButton = document.getElementById('backToPhonePriceButton');
    const generateCertificateButton = document.getElementById('generateCertificateButton');
    const planOptionsContainer = document.getElementById('planOptionsContainer');
    const selectedPlanValueInput = document.getElementById('selectedPlanValue');
    const selectedPlanPriceInput = document.getElementById('selectedPlanPrice');
    const selectedPlanTypeInput = document.getElementById('selectedPlanType');
    const selectedPlanDetailsInput = document.getElementById('selectedPlanDetails');

    // Removed login-specific loaders/messages here
    const formLoadingSpinner = document.getElementById('formLoading');
    const successContainer = document.getElementById('successContainer');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');

    // --- Utility Functions ---

    // Show/Hide Elements
    function show(element) { element.classList.remove('hidden'); }
    function hide(element) { element.classList.add('hidden'); }

    // Clear and Show Status Message (for warranty form)
    function showStatusMessage(element, message, isError = false) {
        hide(successContainer); // Always hide both before showing one
        hide(errorMessage);
        if (isError) {
            errorMessage.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
            show(errorMessage);
        } else {
            successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            show(successContainer);
        }
    }

    // --- Input Validation & Styling ---
    function markInvalid(inputElement, isValid) {
        if (isValid) {
            inputElement.classList.remove('error');
        } else {
            inputElement.classList.add('error');
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        // Basic 10-digit numeric validation
        return /^\d{10}$/.test(phone);
    }

    function isValidIMEI(imei) {
        // Basic 15-digit numeric validation
        return /^\d{15}$/.test(imei);
    }

    function validateField(inputElement, validationFn, eventType = 'blur') {
        if (eventType === 'input') { // Validate on input for immediate feedback
            inputElement.addEventListener('input', () => {
                markInvalid(inputElement, validationFn(inputElement.value.trim()));
            });
        }
        inputElement.addEventListener('blur', () => { // Validate on blur for final check
            markInvalid(inputElement, validationFn(inputElement.value.trim()));
        });
    }

    // Apply real-time validation to key fields
    validateField(customerEmailInput, isValidEmail, 'input');
    validateField(customerPhoneInput, isValidPhone, 'input');
    validateField(imeiNumberInput, isValidIMEI, 'input');
    phonePriceInput.addEventListener('input', () => {
        const price = parseFloat(phonePriceInput.value);
        markInvalid(phonePriceInput, !isNaN(price) && price > 0);
    });
    // For other required fields, a simple check on blur is often sufficient
    warrantyForm.querySelectorAll('input[required]:not([type="email"]):not([type="tel"]):not([type="number"]):not([type="date"])').forEach(input => {
        input.addEventListener('blur', () => {
            markInvalid(input, input.value.trim() !== '');
        });
    });
    // Specific validation for purchaseDateInput
    purchaseDateInput.addEventListener('blur', () => {
        markInvalid(purchaseDateInput, purchaseDateInput.value.trim() !== '');
    });


    function validateCustomerAndPhoneDetails() {
        let isValid = true;
        const fieldsToCheck = [
            { element: document.getElementById('customerName'), validator: val => val.trim() !== '' },
            { element: customerEmailInput, validator: isValidEmail },
            { element: customerPhoneInput, validator: isValidPhone },
            { element: document.getElementById('productName'), validator: val => val.trim() !== '' },
            { element: imeiNumberInput, validator: isValidIMEI },
            { element: purchaseDateInput, validator: val => val.trim() !== '' },
            { element: phonePriceInput, validator: val => !isNaN(parseFloat(val)) && parseFloat(val) > 0 }
        ];

        fieldsToCheck.forEach(({ element, validator }) => {
            const fieldIsValid = validator(element.value);
            markInvalid(element, fieldIsValid);
            if (!fieldIsValid) {
                isValid = false;
            }
        });
        return isValid;
    }

    // --- Plan Price Logic ---
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
        planOptionsContainer.classList.remove('error'); // Clear potential error state

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        const allPlans = [
            {
                value: 'extended_warranty',
                text: `Extended Warranty <br/> (₹${extendedPrice})`,
                price: extendedPrice,
                internalType: 'extended',
                periodText: '12 Months Extended'
            },
            {
                value: 'screen_protection',
                text: `Screen Protection Plan <br/> (₹${screenDamagePrice})`,
                price: screenDamagePrice,
                internalType: 'screen_protection',
                periodText: '12 Months'
            },
            {
                value: 'total_damage_protection',
                text: `Total Damage Protection <br/> (₹${totalDamagePrice})`,
                price: totalDamagePrice,
                internalType: 'total_damage',
                periodText: '12 Months'
            },
            {
                value: 'combo_screen_extended',
                text: `Combo (Screen Damage + Extended) <br/> (₹${Math.round(screenDamagePrice + (extendedPrice * 0.5))})`,
                price: Math.round(screenDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_screen_extended',
                periodText: '24 Months Total'
            },
            {
                value: 'combo_total_extended',
                text: `Combo (Total Damage + Extended) <br/> (₹${Math.round(totalDamagePrice + (extendedPrice * 0.5))})`,
                price: Math.round(totalDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_total_extended',
                periodText: '24 Months Total'
            }
        ];

        allPlans.forEach(plan => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('plan-button');
            button.innerHTML = plan.text; // Use innerHTML for <br/> tag

            button.setAttribute('data-value', plan.value);
            button.setAttribute('data-price', plan.price);
            button.setAttribute('data-plantype', plan.internalType);
            button.setAttribute('data-details', plan.text.replace('<br/>', ' - ')); // Store clean text for form data

            button.addEventListener('click', function() {
                const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }
                button.classList.add('selected');

                selectedPlanValueInput.value = plan.value;
                selectedPlanPriceInput.value = plan.price;
                selectedPlanTypeInput.value = plan.internalType;
                selectedPlanDetailsInput.value = button.getAttribute('data-details'); // Use clean text from attribute

                planOptionsContainer.classList.remove('error'); // Clear plan error on selection
            });

            planOptionsContainer.appendChild(button);
        });

        // Reset selected plan inputs
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
    }

    // --- Event Listeners ---

    // Logout Button (Handles visibility logic for login/warranty sections)
    logoutButton.addEventListener('click', function () {
        sessionStorage.removeItem('storeId');
        sessionStorage.removeItem('loggedIn');
        hide(warrantySection); // Hide warranty section
        // Note: demoauth.js should handle showing the login section
        // or a page reload will naturally bring it up as per demoauth.js logic.
        location.reload(); // A simple way to ensure demoauth.js re-initializes
    });

    // "Show Plan Prices" Button Click
    showPlanPricesButton.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent form submission

        // Clear any previous success/error messages
        hide(successContainer);
        hide(errorMessage);
        hide(pdfLinkSection); // Hide QR code section if shown

        if (validateCustomerAndPhoneDetails()) {
            const phonePrice = parseFloat(phonePriceInput.value);
            populatePlanOptions(phonePrice);

            // Animate plan section in
            planSelectionSection.classList.remove('hidden', 'hide-instant');
            planSelectionSection.classList.add('show');

            hide(showPlanPricesButton);
            show(backToPhonePriceButton);

            // Scroll into view after animation has a chance to start
            setTimeout(() => {
                planSelectionSection.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }, 100);
        } else {
            showStatusMessage(errorMessage, 'Please correct the highlighted fields in Customer and Product Details before proceeding.', true);
        }
    });

    // "Change Phone Price" (Back) Button Click
    backToPhonePriceButton.addEventListener('click', function() {
        // Hide plan section instantly
        planSelectionSection.classList.add('hide-instant');
        planSelectionSection.classList.remove('show');

        // Allow a tiny moment for CSS to register transition: none
        setTimeout(() => {
            planSelectionSection.classList.add('hidden');
            planSelectionSection.classList.remove('hide-instant'); // Clean up instant-hide class
        }, 10);

        show(showPlanPricesButton);
        hide(backToPhonePriceButton);

        // Clear selected plan styling and hidden inputs
        const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        planOptionsContainer.classList.remove('error'); // Clear plan error on back click

        // Clear any previous success/error messages
        hide(successContainer);
        hide(errorMessage);
        hide(pdfLinkSection); // Hide QR code section

        // Scroll back to the phone price input field
        phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });


    // Warranty Form Submission
    warrantyForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Final validation before submission
        if (!validateCustomerAndPhoneDetails()) {
            showStatusMessage(errorMessage, 'Please correct the highlighted fields in Customer and Product Details before submitting.', true);
            return;
        }

        if (!selectedPlanValueInput.value) {
            showStatusMessage(errorMessage, 'Please select a Warranty Plan.', true);
            planOptionsContainer.classList.add('error'); // Add error styling to container
            planSelectionSection.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }); // Scroll to highlight
            return;
        } else {
            planOptionsContainer.classList.remove('error');
        }

        show(formLoadingSpinner);
        generateCertificateButton.disabled = true; // Disable button during submission
        hide(successContainer);
        hide(errorMessage);
        hide(pdfLinkSection); // Hide QR code section if shown

        const formData = new FormData(warrantyForm);

        // Replace with your actual Google Apps Script URL for warranty submission
        fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULX/exec', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showStatusMessage(successContainer, 'Warranty certificate generated successfully!', false);
                    downloadLink.href = data.url;
                    qrcodeDiv.innerHTML = ''; // Clear previous QR code
                    new QRCode(qrcodeDiv, {
                        text: data.url,
                        width: 180, // Slightly larger QR code
                        height: 180,
                        colorDark: "#333333", // Darker QR code dots
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });

                    show(pdfLinkSection);
                    warrantyForm.reset(); // Clear form fields

                    // Maintain store ID after reset (fetched from sessionStorage)
                    const storeId = sessionStorage.getItem('storeId');
                    if (storeId) {
                        storeIdInput.value = storeId;
                    }

                    // Reset plan selection UI
                    const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedPlanValueInput.value = '';
                    selectedPlanPriceInput.value = '';
                    selectedPlanTypeInput.value = '';
                    selectedPlanDetailsInput.value = '';

                    // Hide plan section instantly and show "Show Plan Prices" button
                    planSelectionSection.classList.add('hide-instant');
                    planSelectionSection.classList.remove('show');
                    setTimeout(() => {
                        planSelectionSection.classList.add('hidden');
                        planSelectionSection.classList.remove('hide-instant');
                    }, 10);
                    show(showPlanPricesButton);
                    hide(backToPhonePriceButton);

                    // Scroll to the success message
                    successContainer.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            })
            .catch(error => {
                showStatusMessage(errorMessage, `An error occurred: ${error.message}. Please try again.`, true);
            })
            .finally(() => {
                hide(formLoadingSpinner);
                generateCertificateButton.disabled = false; // Re-enable button
            });
    });

    // --- Initial Load Logic ---
    // This function will be called by demoauth.js to populate the store ID
    // and correctly display the warranty section after a successful login.
    // It also sets the default purchase date.
    window.initializeWarrantyForm = function() {
        const storeId = sessionStorage.getItem('storeId');
        if (storeId) {
            displayedStoreId.textContent = storeId;
            storeIdInput.value = storeId;
        }

        // Set today's date as default for purchase date input
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(today.getDate()).padStart(2, '0');
        purchaseDateInput.value = `${yyyy}-${mm}-${dd}`;

        // Ensure form starts in a clean state
        warrantyForm.reset();
        hide(planSelectionSection);
        hide(backToPhonePriceButton);
        show(showPlanPricesButton);
        hide(successContainer);
        hide(errorMessage);
        hide(pdfLinkSection);
        planOptionsContainer.classList.remove('error');
        selectedPlanValueInput.value = '';
    };

    // Call initializeWarrantyForm if already logged in on direct page load
    // This is primarily for when the user refreshes an already logged-in page.
    // In a full SPA, demoauth.js would call this after a successful login.
    if (sessionStorage.getItem('loggedIn') === 'true') {
        window.initializeWarrantyForm();
        show(warrantySection); // Ensure warranty section is visible
        hide(document.getElementById('loginSection')); // Hide login section
    } else {
        hide(warrantySection); // Ensure warranty section is hidden if not logged in
        show(document.getElementById('loginSection')); // Ensure login section is visible
    }
});
