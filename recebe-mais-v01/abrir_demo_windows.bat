@echo off
setlocal
cd /d "%~dp0public"
set "PYTHON_EXE=C:\Users\joao.caldas\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\python.exe"
if not exist "%PYTHON_EXE%" (
    echo [ERRO] Python nao encontrado no caminho configurado.
    echo Confirme o local da instalacao do Python 3.13.14.
    pause
    exit /b 1
)
echo.
echo    RECEBE+ OUVIDORIA - DEMONSTRACAO 0.1
 echo    Nenhum arquivo sera enviado ou armazenado.
echo.
echo Abrindo http://127.0.0.1:8000/
start "" "http://127.0.0.1:8000/"
"%PYTHON_EXE%" -m http.server 8000 --bind 127.0.0.1
if errorlevel 1 (
    echo.
    echo Nao foi possivel iniciar a porta 8000. Verifique se ja esta sendo usada.
    pause
)
endlocal
