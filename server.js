const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ROTA PARA CRIAR O PIX
app.post('/criar-pix', async (req, res) => {
    try {
        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: parseFloat(req.body.valor),
            payment_method_id: 'pix',
            payer: { email: 'contato@teste.com' }
        }, {
            headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
        });
        
        // Enviando o ID e o QR Code para o front-end
        res.json({
            id: response.data.id,
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        console.error("ERRO:", e.response ? e.response.data : e.message);
        res.status(500).json({ error: e.message });
    }
});

// ROTA PARA VERIFICAR O STATUS EM TEMPO REAL
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
