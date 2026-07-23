document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('qualification-form');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    
    let currentStep = 1;

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
            s.classList.add('hidden');
        });
        
        const activeStep = document.getElementById(`step-${step}`);
        if (activeStep) {
            activeStep.classList.remove('hidden');
            // Kleiner Timeout, damit die CSS-Transition greift, falls vorhanden
            setTimeout(() => activeStep.classList.add('active'), 10);
            
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
                showError('makler-error', 'Bitte wählen Sie eine Option aus.');
                isValid = false;
            } else if (selected.value === 'makler') {
                // DER MAKLER-FILTER (Kundenwunsch 100% erfüllt)
                showError('makler-error', 'Wir arbeiten ausschließlich mit Endkunden. Ihre Anfrage kann nicht bearbeitet werden.');
                isValid = false;
            }
        }

        if (step === 2) {
            const kaufpreis = document.getElementById('kaufpreisrahmen');
            const eigenkapital = document.getElementById('eigenkapital');

            if (!kaufpreis?.value) {
                showError('kaufpreisrahmen-error', 'Bitte wählen Sie einen Kaufpreisrahmen.');
                isValid = false;
            }
            if (!eigenkapital?.value) {
                showError('eigenkapital-error', 'Bitte geben Sie Ihr Eigenkapital an.');
                isValid = false;
            }
        }

        if (step === 3) {
            const objektart = document.getElementById('objektart');
            const standort = document.getElementById('standort');

            if (!objektart?.value) {
                showError('objektart-error', 'Bitte wählen Sie eine Objektart.');
                isValid = false;
            }
            if (!standort?.value) {
                showError('standort-error', 'Bitte wählen Sie einen Standort.');
                isValid = false;
            }
        }

        if (step === 4) {
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const telefon = document.getElementById('telefon');
            const dsgvo = document.getElementById('dsgvo');
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
            if (!dsgvo?.checked) {
                showError('dsgvo-error', 'Bitte stimmen Sie der Datenschutzerklärung zu.');
                isValid = false;
            }
        }

        return isValid;
    }

    // Globale Funktionen für Buttons
    window.nextStep = function(step) {
        if (validateStep(step)) {
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

        // Simulierte API-Anfrage / Prüfung
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Daten für die Erfolgsmeldung holen
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const standortSelect = document.getElementById('standort');
        const standortText = standortSelect.options[standortSelect.selectedIndex].text;

        // Erfolgsmeldung befüllen
        document.getElementById('success-name').textContent = name.split(' ')[0]; // Nur Vorname
        document.getElementById('success-email').textContent = email;
        document.getElementById('success-standort').textContent = standortText;

        // Formular ausblenden, Erfolg einblenden
        document.querySelectorAll('.form-step').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        document.querySelector('.form-progress').classList.add('hidden');
        
        const successStep = document.getElementById('step-success');
        successStep.classList.remove('hidden');
        setTimeout(() => successStep.classList.add('active'), 10);
    });
});
