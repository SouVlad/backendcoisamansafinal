@echo off
echo ========================================
echo Script para fazer push para GitHub
echo ========================================
echo.

REM Verificar se o Git está instalado
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Git nao esta instalado ou nao esta no PATH
    echo Por favor instale o Git de: https://git-scm.com/download/win
    echo E reinicie o terminal apos a instalacao
    pause
    exit /b 1
)

echo [OK] Git encontrado
echo.

REM Verificar se já é um repositório Git
if not exist ".git" (
    echo Inicializando repositório Git...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao inicializar repositório
        pause
        exit /b 1
    )
)

REM Verificar se o remote já existe
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Adicionando remote origin...
    git remote add origin https://github.com/SouVlad/backendcoisamansafinal.git
) else (
    echo Atualizando remote origin...
    git remote set-url origin https://github.com/SouVlad/backendcoisamansafinal.git
)

echo.
echo Adicionando todos os ficheiros...
git add .

echo.
echo Fazendo commit das alterações...
git commit -m "Fix: Corrigir imports, middleware de autenticação e remover vulnerabilidades de segurança" -m "- Corrigir imports: merchandiseService.js -> merchandise.service.js" -m "- Corrigir imports: cartService.js -> cart.service.js" -m "- Corrigir middleware: decoded.id -> decoded.userId" -m "- Corrigir nomes de funções nos controllers" -m "- Remover pacote vulnerável 'git'" -m "- Adicionar verificação de superAdmin no requireAdmin"

if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Nenhuma alteração para commitar ou commit falhou
)

echo.
echo Fazendo push para GitHub (branch master)...
echo (Pode ser pedido para autenticar)
git push -u origin master

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Falha com branch 'master', tentando com 'main'...
    git push -u origin main
)

echo.
echo ========================================
echo Processo concluido!
echo ========================================
pause
