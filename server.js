const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/criar-pix', async (req, res) => {
    try {
        const valor = parseFloat(req.body.valor);
        if (!valor || valor <= 0) {
            return res.status(400).json({ error: "Valor inválido" });
        }

        // Gera uma chave única simples sem precisar de bibliotecas extras
        const idempotencyKey = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: valor,
            description: "Pagamento Pix",
            payment_method_id: 'pix',
            payer: { email: `cliente_${Date.now()}@gmail.com` }
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            }
        });

        res.json({
            id: response.data.id,
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        const erroDetalhado = e.response ? JSON.stringify(e.response.data) : e.message;
        console.error("ERRO DETALHADO:", erroDetalhado);
        res.status(400).json({ error: erroDetalhado });
    }
});

app.get('/verificar-pix/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
        });
        res.json({ status: response.data.status });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(process.env.PORT || 10000, '0.0.0.0');
