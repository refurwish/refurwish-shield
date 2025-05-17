    document.getElementById('warrantyForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const loading = document.getElementById('loading');
      const successContainer = document.getElementById('successContainer');
      const errorMessage = document.getElementById('errorMessage');
      const qrcodeDiv = document.getElementById('qrcode');
      const downloadLink = document.getElementById('downloadLink');
      const pdfLinkSection = document.getElementById('pdfLinkSection');

      loading.classList.remove('hidden');
      successContainer.classList.add('hidden');
      errorMessage.classList.add('hidden');
      pdfLinkSection.classList.add('hidden');

      const formData = new FormData(this);

      fetch('https://script.google.com/macros/s/AKfycbzZa98mRP17OJSQcexujFtedgTenuiVI5NwOpMovy9kR_de02-ptyt6CxamK6ft27o/exec', {
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
            e.target.reset();

               // Scroll down to the QR code section
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
