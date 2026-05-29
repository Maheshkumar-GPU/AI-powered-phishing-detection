PhishGuard AI

AI-powered phishing URL detection with a cybersecurity chatbot assistant.
What's Included
File	What it is
phishing_backend.tar.gz	Python FastAPI backend — runs on your machine
phishguard-frontend.tar.gz	Standalone React frontend — open in browser via PyCharm or any terminal
Quick Start
Step 1 — Set Up the Python Backend

Requirements: Python 3.10+, pip


# Install dependencies
pip install -r requirements.txt
# Start the server
python run.py

The API will be live at http://localhost:8000

    Optional — Train the ML model (skip this to use the rule-based predictor):

    python run.py --train --dataset "path/to/your/dataset.csv"

    Dataset used: PhiUSIIL_Phishing_URL_Dataset.csv

    Optional — Enable AI chat analysis (requires Ollama):

    ollama pull llama3
    ollama serve

Step 2 — Set Up the Frontend

Requirements: Node.js 18+


# Install dependencies
npm install
# Start the app
npm run dev

Open http://localhost:5173 in your browser.
Features
Page	What it does
Dashboard	Live scan activity, risk overview, threat feed
Scanner	Paste any URL → get ML + AI threat analysis instantly
AI Assistant	Chat with a cybersecurity SOC analyst powered by Ollama
History	Browse, search, filter and delete past scans
Reports	Auto-generated forensic reports per scan
Analytics	Risk distribution charts, top phishing TLDs, model status
API Endpoints

Base URL: http://localhost:8000
Method	Path	Description
GET	/api/health	Health check
POST	/api/scanner/scan	Scan a URL
GET	/api/scanner/scan/{id}	Get scan result by ID
GET	/api/history	List scan history
DELETE	/api/history/{id}	Delete a scan
POST	/api/chatbot/message	Send chat message
GET	/api/chatbot/history/{session_id}	Get chat history
GET	/api/analytics/summary	Analytics overview
GET	/api/reports	List reports

Full interactive docs: http://localhost:8000/docs
Folder Structure

backend/
├── run.py                  ← entry point
├── requirements.txt
└── app/
    ├── main.py             ← FastAPI app, CORS, routes
    ├── config.py           ← settings (ports, paths, model config)
    ├── database.py         ← SQLite setup
    ├── ml/
    │   ├── feature_extractor.py   ← URL feature engineering
    │   ├── predictor.py           ← ML + rule-based prediction + whitelist
    │   └── model_trainer.py       ← train RandomForest from dataset
    └── routes/
        ├── scanner.py
        ├── chatbot.py
        ├── history.py
        ├── reports.py
        └── analytics.py
phishguard-frontend/
├── package.json
├── vite.config.ts          ← dev server on port 5173
└── src/
    ├── main.tsx            ← sets API base to localhost:8000
    ├── lib/api-client/     ← all API hooks
    ├── pages/              ← Dashboard, Scanner, Chatbot, History, Reports, Analytics
    └── components/         ← UI, layout, shared components

Troubleshooting

"Backend API offline" banner showing → Make sure python run.py is running and the terminal shows Uvicorn running on http://0.0.0.0:8000

Model predicts legitimate sites as phishing → The fixed predictor.py includes a whitelist of 50+ trusted domains (Google, GitHub, ChatGPT, etc.) that always return legitimate. To add more, open backend/app/ml/predictor.py and add to the TRUSTED_DOMAINS set.

Chatbot gives no response / AI analysis missing → Ollama is not running. Either start it (ollama serve) or use the scanner without AI — the ML prediction still works.

Port already in use → Change the port in backend/app/config.py (default: 8000) and update src/main.tsx in the frontend to match.
