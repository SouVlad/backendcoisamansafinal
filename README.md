# ProjetocoisaMansaFix2

Resumo das alterações e passos para executar o projeto localmente.

O que foi feito
- Corrigi `package.json` e actualizei `prisma` e `@prisma/client` para v4.16.0.
- Padrinizei uma única instância do Prisma em `src/prisma.js` e actualizei módulos que criavam `new PrismaClient()`.
- Instalei as dependências necessárias para autenticação, jobs e envio de email (`bcryptjs`, `node-cron`, `nodemailer`, `googleapis`, etc.).
- GereI o Prisma Client (v4) e sincronizei o esquema com a BD SQLite (`dev.db`).
- Ajustei `prisma/schema.prisma` para uso com SQLite (adicionado `url = "file:./dev.db"` e transformado `role` em `String`).
- Durante debugging criei ficheiros temporários dentro de `node_modules` para testar abordagens; esses ficheiros e mudanças temporárias foram removidos e o `node_modules` actual final resultante é o que `npm install` produz (limpo).

Como correr localmente
1. Instalar dependências:

```cmd
npm install
```

2. Gerar Prisma Client (após qualquer alteração ao `schema.prisma`):

```cmd
npx prisma generate
```

3. Aplicar schema à base de dados SQLite (cria `dev.db` e tabelas):

```cmd
npx prisma db push --schema prisma/schema.prisma
```

4. Arrancar a aplicação:

```cmd
npm run dev
```

Rotas de teste
- `GET /` — health, devolve texto simples.
- `POST /auth/register` — registar utilizador (JSON: `username,email,password`).
- `POST /auth/login` — obter token JWT (JSON: `email,password`).

Notas e recomendações
- Eu converti `role` para `String` por compatibilidade com SQLite; se quiseres usar `enum` volta a considerar Postgres e actualizar `DATABASE_URL`.
- Se preferires, posso: (a) reverter `role` para enum e migrar para Postgres, (b) adicionar scripts de teste automatizados ou (c) limpar mais alguns artefactos temporários se ainda existirem.

Contacto
- Se precisares que eu faça commit destas mudanças ou rode testes adicionais, diz-me qual o próximo passo.
