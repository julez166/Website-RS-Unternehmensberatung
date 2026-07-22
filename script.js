document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('qualification-form');
    const steps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const formTitle = document.getElementById('form-title');
    
    let currentStep = 1;
    const totalSteps = 4;

    // Dynamische Felder-Steuerung basierend auf Schritt 1 Auswahl
    const anliegenRadios = document.querySelectorAll('input[name="anliegen"]');
    const fieldsImmobilie = document.getElementById('fields-immobilie');
    const fieldsKmu = document.getElementById('fields-kmu');

    anliegenRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'immobilie') {
                fieldsImmobilie.classList.remove('hidden');
                fieldsKmu.classList.add('hidden');
                // Required-Attribute dynamisch setzen
                document.getElementById('kaufpreisrahmen').required = true;
                document.getElementById('eigenkapital').required = true;
                document.getElementById('kreditsumme').required = false;
                document.getElementById('selbststaendig_seit').required = false;
                document.getElementById('bwa_upload').required = false;
            } else if (e.target.value === 'kmu') {
                fieldsKmu.classList.remove('hidden');
                fieldsImmobilie.classList.add('hidden');
                document.getElementById('kaufpreisrahmen').required = false;
                document.getElementById('eigenkapital').required = false;
                document.getElementById('kreditsumme').required = true;
                document.getElementById('selbststaendig_seit').required = true;
                document.getElementById('bwa_upload').required = true;
            }
        });
    });

    // Datei-Upload UI Update
    const fileInput = document.getElementById('bwa_upload');
    const fileNameDisplay = document.getElementById('file-name');
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.style.color = 'var(--color-primary)';
            fileNameDisplay.style.fontWeight = '600';
        } else {
            fileNameDisplay.textContent = 'Datei auswählen oder hierher ziehen';
            fileNameDisplay.style.color = 'var(--color-text-muted)';
            fileNameDisplay.style.fontWeight = '400';
        }
    });

    // Titel-Update pro Schritt
    const stepTitles = {
        1: 'Anliegen auswählen',
        2: 'Qualifizierungsdetails',
        3: 'Ihre Kontaktdaten',
        4: 'Überprüfung & Absenden'
    };

    function updateStepIndicator() {
        stepDots.forEach((dot, index) => {
            const stepNum = index + 1;
            dot.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                dot.classList.add('active');
            } else if (stepNum < currentStep) {
                dot.classList.add('completed');
                dot.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            } else {
                dot.textContent = stepNum;
            }
        });
        formTitle.textContent = stepTitles[currentStep];
    }

    function showStep(step) {
        steps.forEach(s => {
            s.classList.remove('active');
            s.setAttribute('aria-hidden', 'true');
        });
        
        const activeStep = document.getElementById(`step-${step}`);
        if (activeStep) {
            activeStep.classList.add('active');
            activeStep.setAttribute('aria-hidden', 'false');
            // Fokus auf das erste fokussierbare Element im neuen Schritt setzen (Accessibility)
            const firstInput = activeStep.querySelector('input, select, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        updateStepIndicator();
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('input, select').forEach(el => el.classList.remove('error'));
    }

    function showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
        }
        // Finde das zugehörige Input-Feld und markiere es
        const inputEl = document.querySelector(`[aria-describedby="${elementId}"]`) || 
                        document.querySelector(`#${elementId.replace('-error', '')}`);
        if (inputEl) {
            inputEl.classList.add('error');
        }
    }

    function validateStep(step) {
        clearErrors();
        let isValid = true;

        if (step === 1) {
            const selected = document.querySelector('input[name="anliegen"]:checked');
            if (!selected) {
                showError('anliegen-error', 'Bitte wählen Sie ein Anliegen aus.');
                isValid = false;
            }
        }

        if (step === 2) {
            const anliegen = document.querySelector('input[name="anliegen"]:checked')?.value;
            
            if (anliegen === 'immobilie') {
                const kaufpreis = document.getElementById('kaufpreisrahmen');
                const eigenkapital = document.getElementById('eigenkapital');
                
                if (!kaufpreis.value) {
                    showError('kaufpreisrahmen-error', 'Bitte wählen Sie einen Kaufpreisrahmen.');
                    kaufpreis.classList.add('error');
                    isValid = false;
                }
                if (!eigenkapital.value) {
                    showError('eigenkapital-error', 'Bitte geben Sie Ihr verfügbares Eigenkapital an.');
                    eigenkapital.classList.add('error');
                    isValid = false;
                }
            } else if (anliegen === 'kmu') {
                const selbsstaendig = document.getElementById('selbststaendig_seit');
                const file = document.getElementById('bwa_upload').files[0];
                
                if (!selbsstaendig.value) {
                    showError('selbststaendig_seit-error', 'Bitte wählen Sie einen Zeitraum aus.');
                    selbsstaendig.classList.add('error');
                    isValid = false;
                } else if (selbsstaendig.value === 'unter_6') {
                    showError('kmu-error', 'Für eine KMU-Finanzierung ist eine Selbstständigkeit von mindestens 6 Monaten erforderlich.');
                    isValid = false;
                }

                if (!file) {
                    showError('file-error', 'Bitte laden Sie Ihre aktuelle BWA oder Bilanz hoch.');
                    isValid = false;
                } else {
                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    
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
            const phoneRegex = /^[0-9\s\-\+\(\)]{8,20}$/;

            if (!name.value.trim()) {
                showError('name-error', 'Bitte geben Sie Ihren Namen ein.');
                name.classList.add('error');
                isValid = false;
            }

            if (!email.value.trim() || !emailRegex.test(email.value)) {
                showError('email-error', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                email.classList.add('error');
                isValid = false;
            }

            if (!telefon.value.trim() || !phoneRegex.test(telefon.value)) {
                showError('telefon-error', 'Bitte geben Sie eine gültige Telefonnummer ein.');
                telefon.classList.add('error');
                isValid = false;
            }
        }

        if (step === 4) {
            const dsgvo = document.getElementById('dsgvo');
            if (!dsgvo.checked) {
                showError('dsgvo-error', 'Bitte stimmen Sie der Datenschutzerklärung zu.');
                isValid = false;
            }
        }

        return isValid;
    }

    function populateSummary() {
        const summaryList = document.getElementById('summary-list');
        summaryList.innerHTML = '';
        const anliegen = document.querySelector('input[name="anliegen"]:checked')?.value;
        
        const addSummaryItem = (label, value) => {
            if (value) {
                const li = document.createElement('li');
                li.innerHTML = `<span>${label}</span><span>${value}</span>`;
                summaryList.appendChild(li);
            }
        };

        addSummaryItem('Anliegen', anliegen === 'immobilie' ? 'Offmarket Immobilie' : 'KMU-Kredit');
        
        if (anliegen === 'immobilie') {
            const kp = document.getElementById('kaufpreisrahmen');
            const ek = document.getElementById('eigenkapital');
            addSummaryItem('Kaufpreisrahmen', kp.options[kp.selectedIndex].text);
            addSummaryItem('Eigenkapital', ek.options[ek.selectedIndex].text);
        } else {
            const ks = document.getElementById('kreditsumme');
            const ss = document.getElementById('selbststaendig_seit');
            const file = document.getElementById('bwa_upload').files[0];
            addSummaryItem('Kreditsumme', ks.options[ks.selectedIndex].text);
            addSummaryItem('Selbstständig seit', ss.options[ss.selectedIndex].text);
            addSummaryItem('Dokument', file ? file.name : 'Keines');
        }

        addSummaryItem('Name', document.getElementById('name').value);
        addSummaryItem('E-Mail', document.getElementById('email').value);
        addSummaryItem('Telefon', document.getElementById('telefon').value);
    }

    // Globale Funktionen für HTML onclick-Attribute
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

    // Formular-Absendung
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateStep(4)) return;

        const submitBtn = form.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // UI in Ladezustand versetzen
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.disabled = true;

        // Simulierte API-Anfrage (hier würde der echte Fetch/POST stehen)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Erfolg anzeigen
        form.classList.add('hidden');
        document.querySelector('.form-header').classList.add('hidden');
        const successStep = document.getElementById('step-success');
        successStep.classList.remove('hidden');
        successStep.setAttribute('aria-hidden', 'false');
        
        // Fokus auf Erfolgsmeldung für Screenreader
        successStep.focus();
    });

    // Initialisierung
    updateStepIndicator();
});
