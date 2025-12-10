# Instruções para fazer Push para GitHub

## Pré-requisitos

1. **Instalar Git** (se ainda não tiver):
   - Download: https://git-scm.com/download/win
   - Durante a instalação, certifique-se de selecionar "Add Git to PATH"

2. **Configurar autenticação GitHub**:
   - Opção 1: Usar Personal Access Token (recomendado)
     - Vá a: https://github.com/settings/tokens
     - Crie um novo token com permissões `repo`
     - Use o token como senha quando fizer push
   
   - Opção 2: Usar GitHub CLI
     - Instale: https://cli.github.com/
     - Execute: `gh auth login`

## Método 1: Usar o Script Automático

1. Execute o ficheiro `push_to_github.bat` (duplo clique ou execute no terminal)
2. O script irá:
   - Verificar se o Git está instalado
   - Inicializar o repositório (se necessário)
   - Adicionar o remote do GitHub
   - Fazer commit de todas as alterações
   - Fazer push para o GitHub

## Método 2: Comandos Manuais

Abra o terminal (CMD ou PowerShell) na pasta do projeto e execute:

```bash
# 1. Inicializar repositório (se necessário)
git init

# 2. Adicionar remote
git remote add origin https://github.com/SouVlad/backendcoisamansafinal.git
# OU se já existir, atualizar:
git remote set-url origin https://github.com/SouVlad/backendcoisamansafinal.git

# 3. Adicionar todos os ficheiros
git add .

# 4. Fazer commit
git commit -m "Fix: Corrigir imports, middleware e remover vulnerabilidades"

# 5. Fazer push
git push -u origin master
# OU se a branch for 'main':
git push -u origin main
```

## Alterações que serão enviadas:

✅ Correção dos imports (merchandiseService → merchandise.service)
✅ Correção do middleware de autenticação (decoded.id → decoded.userId)
✅ Remoção do pacote vulnerável 'git'
✅ Correção dos nomes de funções nos controllers
✅ Melhorias no requireAdmin (verificação de superAdmin)

## Resolução de Problemas

### Erro: "fatal: not a git repository"
- Execute: `git init`

### Erro: "remote origin already exists"
- Execute: `git remote set-url origin https://github.com/SouVlad/backendcoisamansafinal.git`

### Erro: "authentication failed"
- Configure um Personal Access Token no GitHub
- Use o token como senha ao fazer push

### Erro: "branch 'master' does not exist"
- Tente: `git push -u origin main`


