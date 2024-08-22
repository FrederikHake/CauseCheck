# CauseCheck
Processmining web application for adding deviations to an event log to create a ground truth

The corresponding video is provided in this git repository and can be accessed using this link: 

# README


# How to install? 
1. Having npm / node.js installed: 
Manual:
```
https://kinsta.com/blog/how-to-install-node-js/
```

**Download & install node js from here**
```
https://nodejs.org/en/download
```
2. verify node / npm (node package manager)
```
npm --version
Node --version
```

3. Install graphviz executables 
    According to the OS you are using follow the steps listed on the following page: https://stackoverflow.com/questions/35064304/runtimeerror-make-sure-the-graphviz-executables-are-on-your-systems-path-aft

4. Have Python version 3.9+ installed (3.8+ may also be fine)
5. Run the setup.bat
The run setup batch installs all npm dependencies and pip modules that are needed. 
If the python modules should not be added to the global python libraries create a venv for the folder src/backend
6. Start the application

To start the application locally use the start.bat file. This file opens two terminals one for the frontend and one for the backend.

If the applications should be run independently use for the backend in the foldersrc/backend:
'''
python -m flask --app main run
''
and for the fronend in the folder src/frontend:
''
npm start
'''
