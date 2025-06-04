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

    // Removed planType as it's no longer a separate dropdown
    const planOption = document.getElementById('planOption');

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

    // Function to populate plan options into the single dropdown
    function populatePlanOptions(phonePrice) {
        planOption.innerHTML = '<option value="">-- Select Plan --</option>'; // Clear existing options

        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        const allPlans = [
            {
                // This value will be sent as formData.planOption to the backend
                // The planType will be sent as a separate hidden attribute.
                value: 'extended_warranty',
                text: `Extended Warranty (₹${extendedPrice})`,
                price: extendedPrice,
                internalType: 'extended' // Internal identifier for backend date logic
            },
            {
                value: 'screen_protection',
                text: `Screen Protection Plan (₹${screenDamagePrice})`,
                price: screenDamagePrice,
                internalType: 'screen_protection'
            },
            {
                value: 'total_damage_protection',
                text: `Total Damage Protection (₹${totalDamagePrice})`,
                price: totalDamagePrice,
                internalType: 'total_damage'
            },
            {
                value: 'combo_screen_extended',
                text: `Combo (Screen Damage + Extended Warranty) (₹${Math.round(screenDamagePrice + (extendedPrice * 0.5))})`,
                price: Math.round(screenDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_screen_extended'
            },
            {
                value: 'combo_total_extended',
                text: `Combo (Total Damage Protection + Extended Warranty) (₹${Math.round(totalDamagePrice + (extendedPrice * 0.5))})`,
                price: Math.round(totalDamagePrice + (extendedPrice * 0.5)),
                internalType: 'combo_total_extended'
            }
        ];

        allPlans.forEach(plan => {
            const opt = document.createElement('option');
            opt.value = plan.value;
            opt.textContent = plan.text;
            opt.setAttribute('data-price', plan.price);
            opt.setAttribute('data-plantype', plan.internalType); // Store internal type for backend
            planOption.appendChild(opt);
        });
    }

    // Validate customer and phone details
    function validateCustomerAndPhoneDetails() {
        let isValid = true;
        const requiredFields = [
            'customerName',
            'customerEmail',
            'customerPhone',
            'productName',
            'imeiNumber',
            'purchaseDate',
            'phonePrice'
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

        // Simple email validation
        const email = document.getElementById('customerEmail');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            email.classList.add('error');
            isValid = false;
        }

        // Phone Price validation
        const phonePrice = parseFloat(phonePriceInput.value);
        if (isNaN(phonePrice) || phonePrice <= 0) {
            phonePriceInput.classList.add('error');
            isValid = false;
        } else {
            phonePriceInput.classList.remove('error');
        }

        return isValid;
    }

    // Event listener for "Show Plan Prices" button
    showPlanPricesButton.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default form submission

        if (validateCustomerAndPhoneDetails()) {
            const phonePrice = parseFloat(phonePriceInput.value);
            populatePlanOptions(phonePrice);
            planSelectionSection.classList.remove('hidden');
            showPlanPricesButton.classList.add('hidden'); // Hide "Show Plan Prices" button
        } else {
            alert('Please fill in all customer and phone details correctly before proceeding to plan selection.');
        }
    });

    // Event listener for the form submission (Generate Warranty Certificate)
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent default form submission

        // Validate plan selection
        if (!planOption.value) { // Only check planOption now
            alert('Please select a Plan.');
            planOption.classList.add('error');
            return;
        } else {
            planOption.classList.remove('error');
        }

        loading.classList.remove('hidden');
        successContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        pdfLinkSection.classList.add('hidden');

        const formData = new FormData(form);
        const selectedPlanOption = planOption.options[planOption.selectedIndex];

        // Send the plan price and the internal type for backend logic
        formData.append('planPrice', selectedPlanOption.getAttribute('data-price'));
        formData.append('planType', selectedPlanOption.getAttribute('data-plantype')); // Sending internalType as planType
        formData.append('selectedPlanDetails', selectedPlanOption.textContent); // Send the full text like "Extended Warranty (₹699)"

        // ***** YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL *****
        fetch('YOUR_DEPLOYED_GOOGLE_APPS_SCRIPT_WEB_APP_URL', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('successMessage').textContent = 'Warranty certificate generated successfully!';
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
                    form.reset();

                    // Re-apply store ID after reset
                    const storeId = sessionStorage.getItem('storeId');
                    if (storeId) {
                        storeIdInput.value = storeId;
                    }
                    // Hide plan selection section and show "Show Plan Prices" button again
                    planSelectionSection.classList.add('hidden');
                    showPlanPricesButton.classList.remove('hidden');

                    // Scroll into view
                    pdfLinkSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    throw new Error(data.message || 'Unknown error');
                }
            })
            .catch(error => {
                errorMessage.classList.remove('hidden');
                errorMessage.textContent = 'An error occurred: ' + error.message;
            })
            .finally(() => {
                loading.classList.add('hidden');
            });
    });
});
