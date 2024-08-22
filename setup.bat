cd /d "%~dp0"
cd src
cd frontend
start cmd /k "npm install"

cd /d "%~dp0"
cd src
cd backend
python -m pip install -r requirements.txt
