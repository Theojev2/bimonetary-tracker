// Registro agresivo del Service Worker

if ('serviceWorker' in navigator) {

    window.addEventListener('load', () => {

        navigator.serviceWorker.register('/sw.js')

            .then(registration => {

                console.log('ServiceWorker registrado con éxito. Alcance:', registration.scope);

                

                // Forzar actualización si hay cambios en el código

                registration.onupdatefound = () => {

                    const installingWorker = registration.installing;

                    installingWorker.onstatechange = () => {

                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {

                            console.log('Nueva versión disponible. Refresca la página.');

                            // Opcional: Mostrar un botón de "Actualizar App" al usuario

                        }

                    };

                };

            })

            .catch(err => console.error('Error al registrar el ServiceWorker:', err));

    });

}

let currentBcvRate = 0;

let currentAmountStr = "";



document.addEventListener('DOMContentLoaded', () => {

    if ('serviceWorker' in navigator) {

        navigator.serviceWorker.register('sw.js');

    }

    loadData();

});



const iconMap = {

    'Comida': 'restaurant-outline',

    'Casa': 'home-outline',

    'Servicios': 'flash-outline',

    'Transporte': 'car-sport-outline',

    'Otros': 'apps-outline'

};



const catColors = {

    'Comida': '#ff5964',

    'Casa': '#38b000',

    'Servicios': '#f77f00',

    'Transporte': '#48cae4',

    'Otros': '#b5179e'

};



const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];



async function loadData() {

    try {

        const bcvRes = await fetch('http://107.21.60.65:8000/api/bcv-rate');

        const bcvData = await bcvRes.json();

        

        currentBcvRate = bcvData.rate;

        

        const rawDate = bcvData.fetched_at.split(' ')[0];

        const [year, month, day] = rawDate.split('-');

        

        document.getElementById('date-display').innerText = `${parseInt(day)}/${parseInt(month)}/${year}`;

        document.getElementById('rate-display').innerHTML = `<ion-icon name="swap-horizontal"></ion-icon> BCV: Bs. ${bcvData.rate.toFixed(2)}`;



        const mesActual = meses[new Date().getMonth()];

        const titleElement = document.getElementById('list-title');

        if (titleElement) titleElement.innerText = `Gastos de ${mesActual}`;



        const expRes = await fetch('http://107.21.60.65:8000/api/expenses');

        const expenses = await expRes.json();

        const list = document.getElementById('expenses-list');

        list.innerHTML = '';

        

        let totalUsd = 0;

        let totalVes = 0;

        let catTotals = { 'Comida': 0, 'Casa': 0, 'Servicios': 0, 'Transporte': 0, 'Otros': 0 };

        

        if (expenses.length === 0) {

            list.innerHTML = '<p style="color: var(--text-sec); text-align: center; font-size: 14px; margin-top: 20px;">Sin movimientos este mes</p>';

            document.getElementById('category-chart').style.background = `conic-gradient(var(--border) 0% 100%)`;

        } else {

            expenses.forEach(e => {

                totalUsd += e.amount_usd;

                totalVes += e.amount_ves;

                

                const catName = e.category || 'Otros';

                catTotals[catName] = (catTotals[catName] || 0) + e.amount_usd;

                

                const ionName = iconMap[catName] || 'apps-outline';

                const cColor = catColors[catName] || '#8e8e93';

                const descText = e.description ? `<div class="ex-desc">${e.description}</div>` : '';

                

                list.innerHTML += `

                <div class="expense-item">

                    <div class="ex-info">

                        <div class="ex-icon" style="color: ${cColor};"><ion-icon name="${ionName}"></ion-icon></div>

                        <div>

                            <span class="ex-title">${catName}</span>

                            ${descText}

                        </div>

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

            

            let startAngle = 0;

            let gradients = [];

            for (const cat in catTotals) {

                if (catTotals[cat] > 0) {

                    const percentage = (catTotals[cat] / totalUsd) * 100;

                    const endAngle = startAngle + percentage;

                    gradients.push(`${catColors[cat]} ${startAngle}% ${endAngle}%`);

                    startAngle = endAngle;

                }

            }

            if (gradients.length > 0) {

                document.getElementById('category-chart').style.background = `conic-gradient(${gradients.join(', ')})`;

            }

        }

        

        document.getElementById('total-usd').innerText = `$${totalUsd.toFixed(2)}`;

        document.getElementById('total-ves').innerText = `Bs. ${totalVes.toFixed(2)}`;

        

    } catch (error) {

        console.error('Error:', error);

    }

}



window.startVoiceRecognition = function() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Tu navegador no soporta reconocimiento de voz nativo.");

        return;

    }



    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES';

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;



    const micBtn = document.getElementById('voice-trigger');

    micBtn.classList.add('listening');

    micBtn.innerHTML = '<ion-icon name="mic"></ion-icon>';



    recognition.start();



    recognition.onresult = async function(event) {

        const transcript = event.results[0][0].transcript.toLowerCase();

        micBtn.classList.remove('listening');

        micBtn.innerHTML = '<ion-icon name="mic-outline"></ion-icon>';

        parseVoiceCommand(transcript);

    };



    recognition.onerror = function(event) {

        micBtn.classList.remove('listening');

        micBtn.innerHTML = '<ion-icon name="mic-outline"></ion-icon>';

        console.error('Error de voz:', event.error);

    };



    recognition.onend = function() {

        micBtn.classList.remove('listening');

        micBtn.innerHTML = '<ion-icon name="mic-outline"></ion-icon>';

    };

};



async function parseVoiceCommand(text) {

    const numberMatch = text.match(/\d+([.,]\d+)?/);

    if (!numberMatch) {

        alert(`No entendí el monto en: "${text}". Intenta diciendo un número.`);

        return;

    }



    const amount = parseFloat(numberMatch[0].replace(',', '.'));

    

    let currency = 'USD';

    if (text.includes('bolivares') || text.includes('bolívar') || text.includes('bs')) {

        currency = 'VES';

    }



    let category = 'Otros';

    if (text.includes('comida') || text.includes('almuerzo') || text.includes('cena') || text.includes('mercado')) category = 'Comida';

    else if (text.includes('casa') || text.includes('alquiler')) category = 'Casa';

    else if (text.includes('transporte') || text.includes('pasaje') || text.includes('taxi') || text.includes('gasolina')) category = 'Transporte';

    else if (text.includes('luz') || text.includes('internet') || text.includes('servicio')) category = 'Servicios';



    const description = text.replace(numberMatch[0], '').replace('dólares', '').replace('dolares', '').replace('bolívares', '').replace('bolivares', '').replace('bs', '').replace('en', '').trim();



    try {

        const payload = {

            category: category,

            description: description ? (description.charAt(0).toUpperCase() + description.slice(1)) : 'Gasto por voz',

            amount: amount,

            currency: currency

        };



        await fetch('http://107.21.60.65:8000/api/expenses', {

            method: 'POST',

            headers: {'Content-Type': 'application/json'},

            body: JSON.stringify(payload)

        });



        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

        loadData();

    } catch (error) {

        console.error('Error guardando voz:', error);

    }

}



window.pressKey = function(key) {

    if (navigator.vibrate) navigator.vibrate(15);



    if (key === 'del') {

        currentAmountStr = currentAmountStr.slice(0, -1);

    } else if (key === '.') {

        if (!currentAmountStr.includes('.')) {

            currentAmountStr += currentAmountStr === "" ? "0." : ".";

        }

    } else {

        if (currentAmountStr === "0" && key !== ".") {

            currentAmountStr = key;

        } else if (currentAmountStr.includes('.')) {

            const decimals = currentAmountStr.split('.')[1];

            if (decimals.length < 2) currentAmountStr += key;

        } else {

            if (currentAmountStr.length < 7) currentAmountStr += key;

        }

    }

    

    const display = document.getElementById('amount-display');

    if (currentAmountStr === "") {

        display.innerText = "Monto";

        display.classList.add('empty');

    } else {

        display.innerText = currentAmountStr;

        display.classList.remove('empty');

    }

    

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

    currentAmountStr = "";

    const display = document.getElementById('amount-display');

    display.innerText = "Monto";

    display.classList.add('empty');

    document.getElementById('desc-nota').value = '';

    document.getElementById('currency').value = 'USD';

    const btns = document.querySelectorAll('.curr-btn');

    btns[0].classList.add('active');

    btns[1].classList.remove('active');

    document.getElementById('live-calc').innerText = '';

}



document.getElementById('expense-modal').addEventListener('click', function(e) {

    if (e.target === this) closeModal();

});



window.setCurrency = function(curr, element) {

    document.getElementById('currency').value = curr;

    const btns = document.querySelectorAll('.curr-btn');

    btns.forEach(b => b.classList.remove('active'));

    element.classList.add('active');

    updateLiveCalc();

}



function updateLiveCalc() {

    const amount = parseFloat(currentAmountStr);

    const currency = document.getElementById('currency').value;

    const calcDiv = document.getElementById('live-calc');



    if (isNaN(amount) || amount <= 0 || currentBcvRate === 0) {

        calcDiv.innerText = '';

        return;

    }



    if (currency === 'USD') {

        const ves = amount * currentBcvRate;

        calcDiv.innerText = `≈ Bs. ${ves.toFixed(2)}`;

    } else {

        const usd = amount / currentBcvRate;

        calcDiv.innerText = `≈ $${usd.toFixed(2)}`;

    }

}



window.deleteExpense = async function(id) {

    if (confirm("¿Borrar gasto?")) {

        try {

            await fetch(`http://107.21.60.65:8000/api/expenses/${id}`, { method: 'DELETE' });

            loadData();

        } catch (error) {

            console.error('Error:', error);

        }

    }

};



window.saveExpense = async function() {

    const btn = document.getElementById('save-btn');

    const amount = parseFloat(currentAmountStr);



    if (isNaN(amount) || amount <= 0) {

        alert("Ingresa un monto válido.");

        return;

    }



    btn.innerText = 'Guardando...';

    btn.disabled = true;

    

    const payload = {

        category: document.getElementById('category').value,

        description: document.getElementById('desc-nota').value,

        amount: amount,

        currency: document.getElementById('currency').value

    };

    

    await fetch('http://107.21.60.65:8000/api/expenses', {

        method: 'POST',

        headers: {'Content-Type': 'application/json'},

        body: JSON.stringify(payload)

    });

    

    closeModal();

    btn.innerText = 'Guardar Movimiento';

    btn.disabled = false;

    loadData();

};




// Activar caché de PWA

if ('serviceWorker' in navigator) {

    window.addEventListener('load', () => {

        navigator.serviceWorker.register('/sw.js').catch(console.error);

    });

}




// Activar caché de PWA

if ('serviceWorker' in navigator) {

    window.addEventListener('load', () => {

        navigator.serviceWorker.register('/sw.js').catch(console.error);

    });

}

