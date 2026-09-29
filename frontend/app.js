
let currentBcvRate = 43.50; // Tasa est√°tica para la demo

let currentAmountStr = "";



document.addEventListener('DOMContentLoaded', () => {

    loadData();

});



const iconMap = { 'Comida': 'restaurant-outline', 'Casa': 'home-outline', 'Servicios': 'flash-outline', 'Transporte': 'car-sport-outline', 'Otros': 'apps-outline' };

const catColors = { 'Comida': '#ff5964', 'Casa': '#38b000', 'Servicios': '#f77f00', 'Transporte': '#48cae4', 'Otros': '#b5179e' };

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];



// --- SIMULACI√ìN DE BASE DE DATOS (LOCALSTORAGE) ---

function getLocalExpenses() {

    return JSON.parse(localStorage.getItem('demo_expenses')) || [];

}

function saveLocalExpenses(expenses) {

    localStorage.setItem('demo_expenses', JSON.stringify(expenses));

}

// --------------------------------------------------



function loadData() {

    const today = new Date();

    document.getElementById('date-display').innerText = `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;

    document.getElementById('rate-display').innerHTML = `<ion-icon name="swap-horizontal"></ion-icon> BCV: Bs. ${currentBcvRate.toFixed(2)}`;

    

    const mesActual = meses[today.getMonth()];

    const titleElement = document.getElementById('list-title');

    if (titleElement) titleElement.innerText = `Gastos de ${mesActual} (Demo)`;



    const expenses = getLocalExpenses();

    const list = document.getElementById('expenses-list');

    list.innerHTML = '';

    

    let totalUsd = 0; let totalVes = 0;

    let catTotals = { 'Comida': 0, 'Casa': 0, 'Servicios': 0, 'Transporte': 0, 'Otros': 0 };

    

    if (expenses.length === 0) {

        list.innerHTML = '<p style="color: var(--text-sec); text-align: center; font-size: 14px; margin-top: 20px;">Prueba registrar un movimiento Ì†ΩÌ±Ü</p>';

        document.getElementById('category-chart').style.background = `conic-gradient(var(--border) 0% 100%)`;

    } else {

        expenses.forEach(e => {

            totalUsd += e.amount_usd; totalVes += e.amount_ves;

            const catName = e.category || 'Otros';

            catTotals[catName] = (catTotals[catName] || 0) + e.amount_usd;

            const ionName = iconMap[catName] || 'apps-outline';

            const cColor = catColors[catName] || '#8e8e93';

            const descText = e.description ? `<div class="ex-desc">${e.description}</div>` : '';

            

            list.innerHTML += `

            <div class="expense-item">

                <div class="ex-info">

                    <div class="ex-icon" style="color: ${cColor};"><ion-icon name="${ionName}"></ion-icon></div>

                    <div><span class="ex-title">${catName}</span>${descText}</div>

                </div>

                <div class="ex-amount">

                    <div class="ex-usd">-$${e.amount_usd.toFixed(2)}</div>

                    <div class="ex-ves">Bs. ${e.amount_ves.toFixed(2)}</div>

                </div>

                <button class="btn-delete" onclick="deleteExpense(${e.id})">

                    <ion-icon name="trash-outline"></ion-icon>

                </button>

            </div>`;

        });

        

        let startAngle = 0; let gradients = [];

        for (const cat in catTotals) {

            if (catTotals[cat] > 0) {

                const percentage = (catTotals[cat] / totalUsd) * 100;

                const endAngle = startAngle + percentage;

                gradients.push(`${catColors[cat]} ${startAngle}% ${endAngle}%`);

                startAngle = endAngle;

            }

        }

        if (gradients.length > 0) document.getElementById('category-chart').style.background = `conic-gradient(${gradients.join(', ')})`;

    }

    document.getElementById('total-usd').innerText = `$${totalUsd.toFixed(2)}`;

    document.getElementById('total-ves').innerText = `Bs. ${totalVes.toFixed(2)}`;

}



window.startVoiceRecognition = function() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) { alert("Tu navegador no soporta voz nativa en esta demo."); return; }

    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES'; recognition.interimResults = false; recognition.maxAlternatives = 1;

    const micBtn = document.getElementById('voice-trigger');

    micBtn.classList.add('listening'); micBtn.innerHTML = '<ion-icon name="mic"></ion-icon>';

    recognition.start();



    recognition.onresult = function(event) {

        const transcript = event.results[0][0].transcript.toLowerCase();

        micBtn.classList.remove('listening'); micBtn.innerHTML = '<ion-icon name="mic-outline"></ion-icon>';

        parseVoiceCommand(transcript);

    };

    recognition.onerror = function() { micBtn.classList.remove('listening'); micBtn.innerHTML = '<ion-icon name="mic-outline"></ion-icon>'; };

    recognition.onend = function() { micBtn.classList.remove('listening'); micBtn.innerHTML = '<ion-icon name="mic-outline"></ion-icon>'; };

};



function parseVoiceCommand(text) {

    const numberMatch = text.match(/\d+([.,]\d+)?/);

    if (!numberMatch) { alert(`No entend√≠ el monto en: "${text}"`); return; }

    const amount = parseFloat(numberMatch[0].replace(',', '.'));

    let currency = 'USD';

    if (text.includes('bolivares') || text.includes('bol√≠var') || text.includes('bs')) currency = 'VES';

    let category = 'Otros';

    if (text.includes('comida') || text.includes('almuerzo')) category = 'Comida';

    else if (text.includes('casa')) category = 'Casa';

    else if (text.includes('transporte') || text.includes('pasaje')) category = 'Transporte';

    else if (text.includes('luz') || text.includes('servicio')) category = 'Servicios';

    

    const description = text.replace(numberMatch[0], '').replace('d√≥lares', '').replace('bol√≠vares', '').replace('bs', '').replace('en', '').trim();

    saveToLocalDB(category, description || 'Gasto por voz', amount, currency);

}



function saveToLocalDB(category, description, amount, currency) {

    const expenses = getLocalExpenses();

    let amount_usd = amount; let amount_ves = amount * currentBcvRate;

    if (currency === 'VES') { amount_ves = amount; amount_usd = amount / currentBcvRate; }

    

    expenses.unshift({

        id: Date.now(),

        category: category,

        description: description.charAt(0).toUpperCase() + description.slice(1),

        amount_usd: amount_usd,

        amount_ves: amount_ves

    });

    saveLocalExpenses(expenses);

    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

    loadData();

}



window.pressKey = function(key) {

    if (navigator.vibrate) navigator.vibrate(15);

    if (key === 'del') currentAmountStr = currentAmountStr.slice(0, -1);

    else if (key === '.') { if (!currentAmountStr.includes('.')) currentAmountStr += currentAmountStr === "" ? "0." : "."; }

    else {

        if (currentAmountStr === "0" && key !== ".") currentAmountStr = key;

        else if (currentAmountStr.includes('.')) { if (currentAmountStr.split('.')[1].length < 2) currentAmountStr += key; }

        else { if (currentAmountStr.length < 7) currentAmountStr += key; }

    }

    const display = document.getElementById('amount-display');

    if (currentAmountStr === "") { display.innerText = "Monto"; display.classList.add('empty'); } 

    else { display.innerText = currentAmountStr; display.classList.remove('empty'); }

    updateLiveCalc();

}



window.openModal = function(category, iconName, colorCode) {

    document.getElementById('category').value = category;

    const titleEl = document.getElementById('modal-title-text');

    titleEl.innerHTML = `<ion-icon name="${iconName}"></ion-icon> ${category}`;

    titleEl.style.color = colorCode;

    document.getElementById('expense-modal').classList.add('active');

}



window.closeModal = function() {

    document.getElementById('expense-modal').classList.remove('active');

    currentAmountStr = ""; document.getElementById('amount-display').innerText = "Monto"; document.getElementById('amount-display').classList.add('empty');

    document.getElementById('desc-nota').value = ''; document.getElementById('currency').value = 'USD';

    const btns = document.querySelectorAll('.curr-btn'); btns[0].classList.add('active'); btns[1].classList.remove('active');

    document.getElementById('live-calc').innerText = '';

}



document.getElementById('expense-modal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });



window.setCurrency = function(curr, element) {

    document.getElementById('currency').value = curr;

    const btns = document.querySelectorAll('.curr-btn');

    btns.forEach(b => b.classList.remove('active')); element.classList.add('active');

    updateLiveCalc();

}



function updateLiveCalc() {

    const amount = parseFloat(currentAmountStr); const currency = document.getElementById('currency').value;

    const calcDiv = document.getElementById('live-calc');

    if (isNaN(amount) || amount <= 0) { calcDiv.innerText = ''; return; }

    if (currency === 'USD') calcDiv.innerText = `‚âà Bs. ${(amount * currentBcvRate).toFixed(2)}`;

    else calcDiv.innerText = `‚âà $${(amount / currentBcvRate).toFixed(2)}`;

}



window.deleteExpense = function(id) {

    if (confirm("¬øBorrar gasto de prueba?")) {

        let expenses = getLocalExpenses();

        expenses = expenses.filter(e => e.id !== id);

        saveLocalExpenses(expenses);

        loadData();

    }

};



window.saveExpense = function() {

    const amount = parseFloat(currentAmountStr);

    if (isNaN(amount) || amount <= 0) { alert("Monto inv√°lido"); return; }

    const cat = document.getElementById('category').value;

    const desc = document.getElementById('desc-nota').value;

    const curr = document.getElementById('currency').value;

    saveToLocalDB(cat, desc, amount, curr);

    closeModal();

};

