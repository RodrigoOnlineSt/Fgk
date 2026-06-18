const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/criar-pix', async (req, res) => {
    try {
        // Garantimos que o valor é um número válido
        const valor = parseFloat(req.body.valor);
        if (!valor || valor <= 0) {
            return res.status(400).json({ error: "Valor inválido" });
        }

        // Criamos um e-mail único e forte para evitar bloqueio por e-mail "fictício"
        const emailPagador = `cliente_${Date.now()}@gmail.com`;

        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: valor,
            description: "Pagamento Pix",
            payment_method_id: 'pix',
            payer: {
                email: emailPagador
            }
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            id: response.data.id, // ID necessário para a verificação
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        // Isso vai imprimir no Log da Render o motivo exato do erro 400
        const erroDetalhado = e.response ? JSON.stringify(e.response.data) : e.message;
        console.error("ERRO DETALHADO DO MERCADO PAGO:", erroDetalhado);
        res.status(400).json({ error: erroDetalhado });
    }
});

// Rota de verificação (Obrigatória para o tempo real)
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
