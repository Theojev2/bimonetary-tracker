
import sqlite3

import datetime

from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

import requests

from bs4 import BeautifulSoup



app = FastAPI(title="Bimonetary Finance API")



app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



DB_PATH = "finance.db"



def init_db():

    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""

    CREATE TABLE IF NOT EXISTS bcv_rates (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        rate REAL NOT NULL,

        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )

    """)

    cursor.execute("""

    CREATE TABLE IF NOT EXISTS expenses (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        category TEXT NOT NULL,

        description TEXT,

        amount_usd REAL NOT NULL,

        amount_ves REAL NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )

    """)

    conn.commit()

    conn.close()



init_db()



class ExpenseCreate(BaseModel):

    category: str

    description: str = ""

    amount: float

    currency: str



def fetch_bcv_rate():

    try:

        url = "https://www.bcv.org.ve"

        response = requests.get(url, verify=False, timeout=10)

        soup = BeautifulSoup(response.content, "html.parser")

        rate_div = soup.find("div", {"id": "dolar"})

        if rate_div:

            rate_text = rate_div.find("strong").text.strip().replace(",", ".")

            rate = float(rate_text)

            

            conn = sqlite3.connect(DB_PATH)

            c = conn.cursor()

            c.execute("INSERT INTO bcv_rates (rate) VALUES (?)", (rate,))

            conn.commit()

            conn.close()

            return rate

    except Exception as e:

        print(f"Error fetching BCV rate: {e}")

    return None



def get_latest_bcv():

    conn = sqlite3.connect(DB_PATH)

    c = conn.cursor()

    c.execute("SELECT rate, fetched_at FROM bcv_rates ORDER BY id DESC LIMIT 1")

    row = c.fetchone()

    conn.close()

    

    if not row:

        rate = fetch_bcv_rate()

        return rate or 36.5, str(datetime.datetime.now())

    return row[0], row[1]



@app.get("/api/bcv-rate")

def get_rate():

    rate, fetched_at = get_latest_bcv()

    return {"rate": rate, "fetched_at": fetched_at}



@app.get("/api/expenses")

def get_expenses():

    conn = sqlite3.connect(DB_PATH)

    c = conn.cursor()

    c.execute("""

        SELECT id, category, description, amount_usd, amount_ves, created_at 

        FROM expenses 

        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')

        ORDER BY id DESC

    """)

    rows = c.fetchall()

    conn.close()

    return [

        {

            "id": r[0],

            "category": r[1],

            "description": r[2],

            "amount_usd": r[3],

            "amount_ves": r[4],

            "created_at": r[5]

        }

        for r in rows

    ]



@app.post("/api/expenses")

def add_expense(item: ExpenseCreate):

    rate, _ = get_latest_bcv()

    if item.currency == "USD":

        amount_usd = item.amount

        amount_ves = item.amount * rate

    else:

        amount_ves = item.amount

        amount_usd = item.amount / rate



    conn = sqlite3.connect(DB_PATH)

    c = conn.cursor()

    c.execute(

        "INSERT INTO expenses (category, description, amount_usd, amount_ves) VALUES (?, ?, ?, ?)",

        (item.category, item.description, amount_usd, amount_ves)

    )

    conn.commit()

    conn.close()

    return {"status": "success"}



@app.delete("/api/expenses/{expense_id}")

def delete_expense(expense_id: int):

    conn = sqlite3.connect(DB_PATH)

    c = conn.cursor()

    c.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))

    conn.commit()

    conn.close()

    return {"status": "deleted"}

