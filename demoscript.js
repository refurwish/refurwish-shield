document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('warrantyForm');
    const loading = document.getElementById('loading');
    const successContainer = document.getElementById('successContainer');
    const errorMessage = document.getElementById('errorMessage');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadLink = document.getElementById('downloadLink');
    const pdfLinkSection = document.getElementById('pdfLinkSection');
    const storeIdInput = document.getElementById('storeId');

    const phonePriceInput = document.getElementById('phonePrice');
    const showPlanPricesButton = document.getElementById('showPlanPricesButton');
    const planSelectionSection = document.getElementById('planSelectionSection');
    const generateCertificateButton = document.getElementById('generateCertificateButton');

    const planOptionsContainer = document.getElementById('planOptionsContainer');
    const selectedPlanValueInput = document.getElementById('selectedPlanValue');
    const selectedPlanPriceInput = document.getElementById('selectedPlanPrice');
    const selectedPlanTypeInput = document.getElementById('selectedPlanType');
    const selectedPlanDetailsInput = document.getElementById('selectedPlanDetails');

    const backToPhonePriceButton = document.getElementById('backToPhonePriceButton');

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

    // Function to calculate extended warranty price based on phone price
    function getExtendedWarrantyPrice(phonePrice) {
        for (const plan of extendedWarrantyPrices) {
            if (phonePrice <= plan.maxPrice) {
                return plan.price;
            }
        }
        // If phone price exceeds max defined range, return price of the highest slab
        return extendedWarrantyPrices[extendedWarrantyPrices.length - 1].price;
    }

    // Function to populate plan options as buttons
    function populatePlanOptions(phonePrice) {
        planOptionsContainer.innerHTML = ''; // Clear existing buttons

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        const allPlans = [
            {
                value: 'extended_warranty',
                name: 'Extended Warranty', // New: Separated name for display
                price: extendedPrice,
                internalType: 'extended',
                periodText: '12 Months Extended'
            },
            {
                value: 'screen_protection',
                name: 'Screen Protection Plan',
                price: screenDamagePrice,
                internalType: 'screen_protection',
                periodText: '12 Months'
            },
            {
                value: 'total_damage_protection',
                name: 'Total Damage Protection',
                price: totalDamagePrice,
                internalType: 'total_damage',
                periodText: '12 Months'
            },
            {
                value: 'combo_screen_extended',
                name: 'Combo (Screen Damage + Extended Warranty)',
                price: Math.round(screenDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_screen_extended',
                periodText: '24 Months Total'
            },
            {
                value: 'combo_total_extended',
                name: 'Combo (Total Damage Protection + Extended Warranty)',
                price: Math.round(totalDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_total_extended',
                periodText: '24 Months Total'
            }
        ];

        allPlans.forEach(plan => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('plan-button');
            // Use innerHTML to separate name and price for better styling
            button.innerHTML = `<span class="plan-text">${plan.name}</span><span class="plan-price">₹${plan.price}</span>`;

            button.setAttribute('data-value', plan.value);
            button.setAttribute('data-price', plan.price);
            button.setAttribute('data-plantype', plan.internalType);
            // Use the full text including period for details
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
                selectedPlanDetailsInput.value = button.getAttribute('data-details'); // Get the structured details

                planOptionsContainer.classList.remove('error'); // Remove error highlight on selection
            });

            planOptionsContainer.appendChild(button);
        });

        // Clear selected plan inputs when re-populating options
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

        const phonePrice = parseFloat(phonePriceInput.value);
        if (isNaN(phonePrice) || phonePrice <= 0) {
            phonePriceInput.classList.add('error');
            isValid = false;
        } else {
            phonePriceInput.classList.remove('error');
        }

        // Basic IMEI and Phone number validation (more robust can be added server-side)
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

        if (validateCustomerAndPhoneDetails()) {
            const phonePrice = parseFloat(phonePriceInput.value);
            populatePlanOptions(phonePrice);
            // Animate transition
            showPlanPricesButton.classList.add('hidden');
            backToPhonePriceButton.classList.remove('hidden'); // Show back button
            planSelectionSection.classList.remove('hidden');
            setTimeout(() => { // Delay adding 'visible' to allow hidden transition
                planSelectionSection.classList.add('visible');
                backToPhonePriceButton.classList.add('visible');
            }, 10);
            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to center of plans
        } else {
            // Optional: A more elegant error display instead of alert
            // e.g., A temporary toast notification or scrolling to the first error field
            alert('Please fill in all customer and product details correctly before proceeding to plan selection.');
            // Scroll to the first error field
            const firstErrorField = document.querySelector('.form-group input.error, .form-group select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    backToPhonePriceButton.addEventListener('click', function() {
        // Animate transition back
        planSelectionSection.classList.remove('visible');
        backToPhonePriceButton.classList.remove('visible');
        setTimeout(() => {
            planSelectionSection.classList.add('hidden');
            backToPhonePriceButton.classList.add('hidden');
            showPlanPricesButton.classList.remove('hidden');
            showPlanPricesButton.classList.add('visible'); // Make it visible with animation
            phonePriceInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400); // Match CSS transition duration

        const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        selectedPlanValueInput.value = '';
        selectedPlanPriceInput.value = '';
        selectedPlanTypeInput.value = '';
        selectedPlanDetailsInput.value = '';
        planOptionsContainer.classList.remove('error'); // Clear any error highlighting
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate plan selection (check if hidden inputs have values)
        if (!selectedPlanValueInput.value) {
            alert('Please select a Plan.');
            planOptionsContainer.classList.add('error'); // Highlight the container
            planOptionsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            planOptionsContainer.classList.remove('error');
        }

        // Hide previous messages and show loading
        successContainer.classList.remove('visible');
        errorMessage.classList.remove('visible');
        pdfLinkSection.classList.remove('visible'); // Hide PDF section if visible
        
        loading.classList.remove('hidden');
        setTimeout(() => loading.classList.add('visible'), 10); // Animate loading in

        const formData = new FormData(form);

        fetch('https://script.google.com/macros/s/AKfycbzs4pDbrUTXRDnEHaL7CNrHOQ1OuCvc7G2JCeq6i1d5fqMtRSk-JNsElkgJAxvX_ULV/exec', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                loading.classList.remove('visible'); // Hide loading
                loading.classList.add('hidden'); // Fully hide loading

                if (data.status === 'success') {
                    document.getElementById('successMessage').textContent = 'Warranty certificate generated successfully!';
                    downloadLink.href = data.url;
                    qrcodeDiv.innerHTML = ''; // Clear previous QR
                    new QRCode(qrcodeDiv, {
                        text: data.url,
                        width: 150,
                        height: 150,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });

                    // Show success and PDF section with animation
                    pdfLinkSection.classList.remove('hidden');
                    successContainer.classList.remove('hidden');
                    setTimeout(() => {
                        pdfLinkSection.classList.add('visible');
                        successContainer.classList.add('visible');
                    }, 10);

                    form.reset(); // Reset form fields
                    // Re-populate store ID after reset
                    const storeId = sessionStorage.getItem('storeId');
                    if (storeId) {
                        storeIdInput.value = storeId;
                    }
                    
                    // Hide plan selection section and show "Show Plan Prices" button again with animation
                    planSelectionSection.classList.remove('visible');
                    backToPhonePriceButton.classList.remove('visible');
                    setTimeout(() => {
                        planSelectionSection.classList.add('hidden');
                        backToPhonePriceButton.classList.add('hidden');
                        showPlanPricesButton.classList.remove('hidden');
                        showPlanPricesButton.classList.add('visible');
                    }, 400);

                    // Clear selected plan styling and hidden inputs
                    const currentSelected = planOptionsContainer.querySelector('.plan-button.selected');
                    if (currentSelected) {
                        currentSelected.classList.remove('selected');
                    }
                    selectedPlanValueInput.value = '';
                    selectedPlanPriceInput.value = '';
                    selectedPlanTypeInput.value = '';
                    selectedPlanDetailsInput.value = '';

                    // Scroll into view
                    pdfLinkSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            })
            .catch(error => {
                errorMessage.textContent = 'An error occurred: ' + error.message;
                errorMessage.classList.remove('hidden');
                setTimeout(() => errorMessage.classList.add('visible'), 10); // Animate error in
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            })
            .finally(() => {
                // No need to hide loading here, as success/error handling already takes care of it
            });
    });
});
