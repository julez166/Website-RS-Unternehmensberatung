document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('qualification-form');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    
    let currentStep = 1;
    const totalSteps = 4;

    // Dynamische Felder basierend auf Anliegen
    const anliegenRadios = document.querySelectorAll('input[name="anliegen"]');
    const fieldsImmobilie = document.getElementById('fields-immobilie');
    const fieldsKmu = document.getElementById('fields-kmu');

    anliegenRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'immobilie') {
                fieldsImmobilie.classList.remove('hidden');
                fieldsKmu.classList.add('hidden');
                setRequired('kaufpreisrahmen', true);
                setRequired('eigenkapital', true);
                setRequired('kreditsumme', false);
                setRequired('selbststaendig_seit', false);
                setRequired('bwa_upload', false);
            } else if (e.target.value === 'kmu') {
                fieldsKmu.classList.remove('hidden');
                fieldsImmobilie.classList.add('hidden');
                setRequired('kaufpreisrahmen', false);
                setRequired('eigenkapital', false);
                setRequired('kreditsumme', true);
                setRequired('selbststaendig_seit', true);
                setRequired('bwa_upload', true);
            }
        });
    });

    function setRequired(elementId, required) {
        const element = document.getElementById(elementId);
        if (element) {
            element.required = required;
        }
    }

    // File Upload UI
    const fileInput = document.getElementById('bwa_upload');
    const fileNameDisplay = document.getElementById('file-name');
    
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // Schritt-Indikator aktualisieren
    function updateStepIndicator() {
        stepIndicators.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
                step.querySelector('.step-number').innerHTML = '✓';
            } else {
                step.querySelector('.step-number').textContent = stepNum;
            }
        });
    }

    // Schritt anzeigen
    function showStep(step) {
        steps.forEach(s => {
            s.classList.remove('active');
        });
        
        const activeStep = document.getElementById(`step-${step}`);
        if (activeStep) {
            activeStep.classList.add('active');
            // Scroll zum Formular auf Mobile
            if (window.innerWidth < 1024) {
                activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        updateStepIndicator();
    }

    // Fehler anzeigen
    function showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
        }
        const inputEl = document.getElementById(elementId.replace('-error', ''));
        if (inputEl) {
            inputEl.style.borderColor = 'var(--color-error)';
        }
    }

    // Fehler zurücksetzen
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input, .form-select').forEach(el => {
            el.style.borderColor = 'var(--color-border)';
        });
    }

    // Validierung
    function validateStep(step) {
        clearErrors();
        let isValid = true;

        if (step === 1) {
            const selected = document.querySelector('input[name="anliegen"]:checked');
            if (!selected) {
                alert('Bitte wählen Sie ein Anliegen aus.');
                isValid = false;
            }
        }

        if (step === 2) {
            const anliegen = document.querySelector('input[name="anliegen"]:checked')?.value;
            
            if (anliegen === 'kmu') {
                const selbststaendig = document.getElementById('selbststaendig_seit');
                if (selbststaendig?.value === 'unter_6') {
                    showError('kmu-error', 'Für eine KMU-Finanzierung ist eine Selbstständigkeit von mindestens 6 Monaten erforderlich.');
                    isValid = false;
                }

                const file = document.getElementById('bwa_upload').files[0];
                if (!file) {
                    showError('file-error', 'Bitte laden Sie Ihre aktuelle BWA oder Bilanz hoch.');
                    isValid = false;
                } else {
                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    const maxSize = 5 * 1024 * 1024;
                    
                    if (!allowedTypes.includes(file.type)) {
                        showError('file-error', 'Nur PDF, JPG oder PNG sind erlaubt.');
                        isValid = false;
                    }
                    if (file.size > maxSize) {
                        showError('file-error', 'Die Datei darf maximal 5 MB groß sein.');
                        isValid = false;
                    }
                }
            }
        }

        if (step === 3) {
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const telefon = document.getElementById('telefon');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!name?.value.trim()) {
                showError('name-error', 'Bitte geben Sie Ihren Namen ein.');
                isValid = false;
            }

            if (!email?.value.trim() || !emailRegex.test(email.value)) {
                showError('email-error', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                isValid = false;
            }

            if (!telefon?.value.trim()) {
                showError('telefon-error', 'Bitte geben Sie Ihre Telefonnummer ein.');
                isValid = false;
            }
        }

        if (step === 4) {
            const dsgvo = document.getElementById('dsgvo');
            if (!dsgvo?.checked) {
                showError('dsgvo-error', 'Bitte stimmen Sie der Datenschutzerklärung zu.');
                isValid = false;
            }
        }

        return isValid;
    }

    // Zusammenfassung erstellen
    function populateSummary() {
        const summaryList = document.getElementById('summary-list');
        summaryList.innerHTML = '';
        const anliegen = document.querySelector('input[name="anliegen"]:checked')?.value;
        
        const addSummaryItem = (label, value) => {
            if (value) {
                const div = document.createElement('div');
                div.className = 'summary-item';
                div.innerHTML = `
                    <span class="summary-label">${label}</span>
                    <span class="summary-value">${value}</span>
                `;
                summaryList.appendChild(div);
            }
        };

        addSummaryItem('Anliegen', anliegen === 'immobilie' ? 'Immobilie kaufen' : 'KMU-Kredit');
        
        if (anliegen === 'immobilie') {
            const kp = document.getElementById('kaufpreisrahmen');
            const ek = document.getElementById('eigenkapital');
            addSummaryItem('Kaufpreisrahmen', kp?.options[kp.selectedIndex]?.text);
            addSummaryItem('Eigenkapital', ek?.options[ek.selectedIndex]?.text);
        } else {
            const ks = document.getElementById('kreditsumme');
            const ss = document.getElementById('selbststaendig_seit');
            const file = document.getElementById('bwa_upload').files[0];
            addSummaryItem('Kreditsumme', ks?.options[ks.selectedIndex]?.text);
            addSummaryItem('Selbstständig seit', ss?.options[ss.selectedIndex]?.text);
            addSummaryItem('Dokument', file ? file.name : '-');
        }

        addSummaryItem('Name', document.getElementById('name')?.value);
        addSummaryItem('E-Mail', document.getElementById('email')?.value);
        addSummaryItem('Telefon', document.getElementById('telefon')?.value);
    }

    // Globale Funktionen
    window.nextStep = function(step) {
        if (validateStep(step)) {
            if (step === 3) {
                populateSummary();
            }
            currentStep = step + 1;
            showStep(currentStep);
        }
    };

    window.prevStep = function(step) {
        currentStep = step - 1;
        showStep(currentStep);
    };

    // Formular absenden
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateStep(4)) return;

        const submitBtn = form.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.disabled = true;

        // Simulierte API-Anfrage
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Erfolg anzeigen
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        document.querySelector('.form-header').classList.add('hidden');
        document.querySelector('.form-footer')?.classList.add('hidden');
        
        const successStep = document.getElementById('step-success');
        successStep.classList.remove('hidden');
        successStep.classList.add('active');
    });
});
