Step 1 — Open Project in PyCharm

Open your project folder.

Step 2 — Open Terminal

Inside PyCharm:

View → Tool Windows → Terminal
Step 3 — Go to Backend Folder
cd backend
Step 4 — Create Virtual Environment
python -m venv venv

Activate it:

Windows
venv\Scripts\activate

If activated successfully, you will see:

(venv)
Step 5 — Install Required Packages
pip install -r requirements.txt

If requirements.txt does not exist:

pip install flask fastapi uvicorn pandas numpy scikit-learn joblib python-dotenv tldextract flask-cors
Step 6 — Add Dataset

Place your phishing dataset CSV file inside:

backend/datasets/

Example:

backend/datasets/phishing_dataset.csv

Dataset format:

URL	label
https://google.com	0
http://fake-login.ml	1

Correct labels:

0 = legitimate
1 = phishing
Step 7 — Train the ML Model

Run:

python -m app.ml.model_trainer

After training, these files should be created:

backend/models/phishing_model.pkl
backend/models/scaler.pkl
Step 8 — Start Backend Server

If using Flask:

python app.py

If using FastAPI:

uvicorn app.main:app --reload

Server will start on:

http://localhost:8000

or

http://127.0.0.1:8000
Step 9 — Run Frontend

Open NEW terminal.

Go to frontend folder:

cd frontend

Install packages:

npm install

Start frontend:

npm run dev

Frontend runs on:

http://localhost:5173

Open this in browser.

Step 10 — Test URL Prediction

Example test URL:

http://banking-secure-login-alert.ml

Expected:

High risk score
Phishing detection
Common Errors
1. No module named dotenv

Fix:

pip install python-dotenv
2. Ollama Port Already Running

Check:

ollama list

Stop Ollama:

taskkill /F /IM ollama.exe
3. Frontend Not Opening

Install Node.js from:

Node.js Official Website

Then restart terminal.

Important Fix You Must Apply

Inside prediction logic:

DON’T use:

risk_score = phishing_prob

Use hybrid scoring instead.

Correct Label Mapping

Very important:

0 = legitimate
1 = phishing
