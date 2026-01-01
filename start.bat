@echo off
title Running Odera Backend and Frontend

:: Start the Backend in a new window
start "Backend" cmd /k "cd odera-Backend && npm start"

:: Start the Frontend in a new window
start "Frontend" cmd /k "cd odera-Frontend && npm start"

echo Both processes are starting in separate windows...
pause