# Sistema de Pagamento com Stripe

## 📋 Configuração

### 1. Obter Chaves do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Crie uma conta ou faça login
3. Vá em **Developers > API Keys**
4. Copie as chaves:
   - **Secret Key** (sk_test_...)
   - **Publishable Key** (pk_test_...)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e adicione suas chaves do Stripe:

```env
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_AQUI
FRONTEND_URL=http://localhost:3000
```

## 🔌 Rotas da API

### **POST** `/api/payment/checkout`
Cria uma sessão de checkout no Stripe.

**Headers:**
```
Authorization: Bearer SEU_TOKEN
```

**Resposta:**
```json
{
  "message": "Sessão de checkout criada com sucesso.",
  "sessionId": "cs_test_...",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### **GET** `/api/payment/success?session_id={SESSION_ID}`
Processa o pagamento após sucesso.

**Resposta:**
```json
{
  "message": "Pagamento processado com sucesso!",
  "order": {
    "orderId": 1,
    "status": "COMPLETED",
    "total": 49.99,
    "items": [...],
    "paymentId": "pi_..."
  }
}
```

### **GET** `/api/payment/cancel`
Callback quando o pagamento é cancelado.

### **GET** `/api/payment/status/:sessionId`
Verifica o status de um pagamento.

**Headers:**
```
Authorization: Bearer SEU_TOKEN
```

**Resposta:**
```json
{
  "sessionId": "cs_test_...",
  "paymentStatus": "paid",
  "amountTotal": 49.99,
  "currency": "eur"
}
```

### **POST** `/api/payment/refund/:sessionId` 🔒 (Admin)
Processa um reembolso.

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Resposta:**
```json
{
  "message": "Reembolso processado com sucesso.",
  "refund": {
    "refundId": "re_...",
    "status": "succeeded",
    "amount": 49.99
  }
}
```

## 📝 Fluxo de Pagamento

1. **Cliente adiciona items ao carrinho**
   ```
   POST /api/cart/items
   ```

2. **Cliente inicia checkout**
   ```
   POST /api/payment/checkout
   ```
   - Retorna URL do Stripe Checkout
   - Cliente é redirecionado para página de pagamento do Stripe

3. **Cliente preenche dados do cartão no Stripe**
   - Usa a página segura do Stripe
   - Nenhum dado de cartão passa pelo seu servidor

4. **Stripe processa o pagamento**
   - Sucesso → redireciona para `/api/payment/success?session_id=...`
   - Cancelado → redireciona para `/api/payment/cancel`

5. **Sistema processa o pedido**
   - Atualiza status do carrinho para COMPLETED
   - Stock já foi decrementado ao adicionar ao carrinho

## 🧪 Testar com Cartões de Teste

Use estes números de cartão na página do Stripe Checkout:

| Tipo | Número | CVV | Data | Resultado |
|------|--------|-----|------|-----------|
| Sucesso | 4242 4242 4242 4242 | Qualquer | Futuro | Pagamento aprovado |
| Falha | 4000 0000 0000 0002 | Qualquer | Futuro | Cartão recusado |
| 3D Secure | 4000 0027 6000 3184 | Qualquer | Futuro | Requer autenticação |

## 🔔 Webhooks (Opcional)

Para receber notificações automáticas do Stripe:

1. No Stripe Dashboard, vá em **Developers > Webhooks**
2. Adicione endpoint: `https://seu-dominio.com/api/payment/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copie o **Webhook Secret** e adicione ao `.env`

## 💡 Exemplo Completo com Postman

### 1. Adicionar item ao carrinho
```
POST http://localhost:3000/api/cart/items
Headers: Authorization: Bearer SEU_TOKEN
Body: {
  "merchandiseId": 1,
  "quantity": 2
}
```

### 2. Criar checkout
```
POST http://localhost:3000/api/payment/checkout
Headers: Authorization: Bearer SEU_TOKEN
```

### 3. Abrir a URL retornada no navegador
A URL `checkoutUrl` abre a página de pagamento do Stripe.

### 4. Verificar status
```
GET http://localhost:3000/api/payment/status/cs_test_SESSION_ID
Headers: Authorization: Bearer SEU_TOKEN
```

## 🛡️ Segurança

- ✅ Chaves secretas no `.env` (nunca commitar)
- ✅ Pagamentos processados no servidor Stripe
- ✅ Nenhum dado de cartão passa pelo seu servidor
- ✅ Webhooks validados com assinatura
- ✅ Apenas admins podem fazer reembolsos

## 🚨 Importante

- **Modo Test**: Use chaves `sk_test_` e `pk_test_`
- **Modo Produção**: Ative no Stripe Dashboard e use chaves `sk_live_` e `pk_live_`
- **Nunca** exponha sua `STRIPE_SECRET_KEY` no frontend
