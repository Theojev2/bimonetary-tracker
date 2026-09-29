# 🪙 Bimonetary PWA Tracker (VES/USD)

![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![PWA](https://img.shields.io/badge/App-PWA_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

Un gestor de gastos ultraligero y de código abierto diseñado específicamente para sobrevivir en economías bimonetarias (como Venezuela). Nacido de la necesidad de abandonar las hojas de Excel y las aplicaciones corporativas pesadas.

## ✨ Por qué usar esto
Llevar las finanzas cuando ganas/gastas en Dólares (USD) pero compras en Bolívares (VES) es un caos. Las calculadoras se quedan cortas y las apps de las tiendas no entienden el contexto de la tasa oficial diaria. Esta PWA resuelve eso con **cero fricción**.

## 🚀 Características Principales

*   🤖 **Tasa Oficial Automática:** El backend hace scraping silencioso del Banco Central (BCV) para mantener la tasa al día sin que muevas un dedo.
*   🎙️ **Registro por Voz (IA Nativa):** "Gasté 15 dólares en pasaje". Toca el micrófono, habla, y la Web Speech API procesa y categoriza el gasto mágicamente.
*   ⌨️ **Teclado Anti-Gboard:** Un teclado numérico integrado en la UI (puro CSS/JS) que bloquea las molestas sugerencias de los teclados móviles.
*   📊 **Dashboard Responsivo:** Gráfico de anillo en dispositivos móviles y diseño de panel dividido en escritorio.
*   ⚡ **Cero Dependencias Pesadas:** Sin React, sin Vue. JS puro para carga instantánea.

## 🛠️ Instalación (Self-Hosted)

Si quieres correr esto en tu propio servidor (VPS) con base de datos real:

### 1. Clonar el repositorio
`git clone https://github.com/Theojev2/bimonetary-tracker.git`
`cd bimonetary-tracker`

### 2. Levantar el Backend (FastAPI)
`cd backend`
`pip install -r requirements.txt`
`uvicorn main:app --host 0.0.0.0 --port 8000`

### 3. Levantar el Frontend
`cd frontend`
`python3 -m http.server 8080`

## 📄 Demo Pública
Si solo quieres probar la interfaz sin instalar nada (versión serverless con LocalStorage), visita el enlace de la demo en mi perfil de TikTok.

---
Distribuido bajo la Licencia MIT. Construido en público por Jorge Millan.
