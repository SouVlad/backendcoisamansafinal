# ProjetocoisaMansaFix2

Resumo das alterações e passos para executar o projeto localmente.

O que foi feito
- Configurei `package.json` e `prisma` e `@prisma/client` para v6.18.0.
- Padrinizei uma única instância do Prisma em `src/prisma.js` e actualizei módulos que criavam `new PrismaClient()`.
- Instalei as dependências necessárias para autenticação, jobs e envio de email (`bcryptjs`, `node-cron`, `nodemailer`, `googleapis`, etc.).
- Configurei o projeto para usar PostgreSQL como base de dados.
- Corrigi um erro de validação no `schema.prisma`.

Como correr localmente
1. Instalar dependências:

```cmd
npm install
```

2. Configurar a variável de ambiente `DATABASE_URL` no ficheiro `.env` com a connection string da sua base de dados PostgreSQL.

3. Gerar Prisma Client (após qualquer alteração ao `schema.prisma`):

```cmd
npx prisma generate
```

4. Aplicar o schema à base de dados PostgreSQL:

```cmd
npx prisma db push --schema prisma/schema.prisma
```

5. Arrancar a aplicação:

```cmd
npm run dev
```

Rotas de teste
- `GET /` — health, devolve texto simples.
- `POST /auth/register` — registar utilizador (JSON: `username,email,password`).
- `POST /auth/login` — obter token JWT (JSON: `email,password`).

Notas e recomendações
- O projeto está agora configurado para PostgreSQL.
- Se precisares que eu faça commit destas mudanças ou rode testes adicionais, diz-me qual o próximo passo.
