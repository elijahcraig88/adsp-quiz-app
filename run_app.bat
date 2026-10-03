@echo off
chcp 65001 > nul
cd /d "%~dp0"
title ADsP 마스터 - 기출문제 & 퀴즈 앱
echo ======================================================================
echo          ADsP 마스터 (데이터분석 준전문가 기출문제 & 퀴즈 앱)
echo ======================================================================
echo.
echo [1] 웹 브라우저에서 앱을 자동으로 실행합니다...
echo [2] 주소: http://localhost:8080
echo.
echo * 앱을 종료하시려면 이 창을 닫아주세요.
echo ======================================================================
echo.

start http://localhost:8080
python -m http.server 8080

if errorlevel 1 (
    echo.
    echo [알림] 파이썬 서버 실행 실패 시 기본 브라우저로 직접 index.html을 엽니다.
    start index.html
)
pause
