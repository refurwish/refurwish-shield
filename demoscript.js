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

    const planType = document.getElementById('planType');
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

    // Function to populate plan options
    function populatePlanOptions(phonePrice) {
        planOption.innerHTML = '<option value="">-- Select Plan Option --</option>'; // Clear existing options

        const plans = [
            {
                type: 'extended',
                value: 'extended_warranty',
                text: `Extended Warranty (₹${getExtendedWarrantyPrice(phonePrice)})`,
                price: getExtendedWarrantyPrice(phonePrice)
            },
            {
                type: 'screen_protection',
                value: 'screen_protection',
                text: `Screen Protection Plan (₹${Math.round(phonePrice * 0.075)})`,
                price: Math.round(phonePrice * 0.075)
            },
            {
                type: 'total_damage',
                value: 'total_damage_protection',
                text: `Total Damage Protection (₹${Math.round(phonePrice * 0.125)})`,
                price: Math.round(phonePrice * 0.125)
            }
        ];

        // Combo plans
        const extendedPrice = getExtendedWarrantyPrice(phonePrice);
        const screenDamagePrice = Math.round(phonePrice * 0.075);
        const totalDamagePrice = Math.round(phonePrice * 0.125);

        plans.push({
            type: 'combo_screen_extended',
            value: 'combo_screen_extended',
            text: `Combo (Screen Damage + Extended Warranty) (₹${Math.round(screenDamagePrice + (extendedPrice * 0.5))})`,
            price: Math.round(screenDamagePrice + (extendedPrice * 0.5))
        });

        plans.push({
            type: 'combo_total_extended',
            value: 'combo_total_extended',
            text: `Combo (Total Damage Protection + Extended Warranty) (₹${Math.round(totalDamagePrice + (extendedPrice * 0.5))})`,
            price: Math.round(totalDamagePrice + (extendedPrice * 0.5))
        });

        // Add options to planType and planOption
        // First, clear existing options for planType
        planType.innerHTML = '<option value="">-- Select Plan Type --</option>';

        // Use a Set to store unique plan types
        const uniquePlanTypes = new Set();
        plans.forEach(plan => uniquePlanTypes.add(plan.type));

        uniquePlanTypes.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            // Make display names more user-friendly
            if (type === 'extended') opt.textContent = 'Extended Warranty';
            else if (type === 'screen_protection') opt.textContent = 'Screen Protection Plan';
            else if (type === 'total_damage') opt.textContent = 'Total Damage Protection';
            else if (type === 'combo_screen_extended') opt.textContent = 'Combo (Screen Damage + Extended Warranty)';
            else if (type === 'combo_total_extended') opt.textContent = 'Combo (Total Damage Protection + Extended Warranty)';
            planType.appendChild(opt);
        });

        // Add options to planOption based on initial selection (or all if no type selected)
        planType.addEventListener('change', function() {
            const selectedType = planType.value;
            planOption.innerHTML = '<option value="">-- Select Plan Option --</option>'; // Clear existing
            plans.filter(p => p.type === selectedType).forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                opt.setAttribute('data-price', option.price);
                planOption.appendChild(opt);
            });
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
        if (!planType.value || !planOption.value) {
            alert('Please select a Plan Type and Plan Option.');
            planType.classList.add('error');
            planOption.classList.add('error');
            return;
        } else {
            planType.classList.remove('error');
            planOption.classList.remove('error');
        }

        loading.classList.remove('hidden');
        successContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        pdfLinkSection.classList.add('hidden');

        const formData = new FormData(form);
        const selectedPlanOption = planOption.options[planOption.selectedIndex];
        formData.append('planPrice', selectedPlanOption.getAttribute('data-price'));
        formData.append('selectedPlanDetails', selectedPlanOption.textContent); // Send the full text like "Extended Warranty (₹699)"

        // ***** THIS IS THE LINE TO VERIFY/UPDATE FOR YOUR GITHUB REPO *****
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
