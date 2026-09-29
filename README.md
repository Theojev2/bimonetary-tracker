# Ì†æÌ∫ô Bimonetary PWA Tracker (VES/USD)



![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

![PWA](https://img.shields.io/badge/App-PWA_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)



Un gestor de gastos ultraligero y de c√≥digo abierto dise√±ado espec√≠ficamente para sobrevivir en econom√≠as bimonetarias (como Venezuela). Nacido de la necesidad de abandonar las hojas de Excel y las aplicaciones corporativas pesadas.



## ‚ú® Por qu√© usar esto

Llevar las finanzas cuando ganas/gastas en D√≥lares (USD) pero compras en Bol√≠vares (VES) es un caos. Las calculadoras se quedan cortas y las apps de las tiendas no entienden el contexto de la tasa oficial diaria. Esta PWA resuelve eso con **cero fricci√≥n**.



## Ì†ΩÌ∫Ä Caracter√≠sticas Principales



*   Ì†æÌ¥ñ **Tasa Oficial Autom√°tica:** El backend hace scraping silencioso del Banco Central (BCV) para mantener la tasa al d√≠a sin que muevas un dedo.

*   Ì†ºÌæôÔ∏è **Registro por Voz (IA Nativa):** "Gast√© 15 d√≥lares en pasaje". Toca el micr√≥fono, habla, y la Web Speech API procesa y categoriza el gasto m√°gicamente.

*   ‚å®Ô∏è **Teclado Anti-Gboard:** Un teclado num√©rico integrado en la UI (puro CSS/JS) que bloquea las molestas sugerencias de los teclados m√≥viles.

*   Ì†ΩÌ≥ä **Dashboard Responsivo:** Gr√°fico de anillo en dispositivos m√≥viles y dise√±o de panel dividido en escritorio.

*   ‚ö° **Cero Dependencias Pesadas:** Sin React, sin Vue. JS puro para carga instant√°nea.



## Ì†ΩÌª†Ô∏è Instalaci√≥n (Self-Hosted)



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



## Ì†ΩÌ≥Ñ Demo P√∫blica

Si solo quieres probar la interfaz sin instalar nada (versi√≥n serverless con LocalStorage), visita el enlace de la demo en mi perfil de TikTok.



---

Distribuido bajo la Licencia MIT. Construido en p√∫blico por Jorge Millan.
