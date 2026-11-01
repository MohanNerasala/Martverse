@echo off
title Martverse Backend Server (Port 8080)
echo ========================================================
echo  Starting Martverse Spring Boot Backend on Port 8080
echo ========================================================
cd /d "%~dp0"
mvn spring-boot:run
pause
