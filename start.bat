
cd /d "%~dp0"
cd src
cd frontend
start cmd /k "npm start"

cd /d "%~dp0"
cd src
cd backend
python -m flask --app main run


