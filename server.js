const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/criar-pix', async (req, res) => {
    try {
        const response = await axios.post('https://api.mercadopago.com/v1/orders', {
            type: "qr",
            total_amount: parseFloat(req.body.valor),
            description: "Venda Loja",
            config: { qr: { mode: "static", external_pos_id: "SUC001POS001" } },
            items: [{ title: "Produto", unit_price: parseFloat(req.body.valor), quantity: 1, unit_measure: "unit" }]
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`, // AQUI VAI O SEU APP_USR-...
                'Content-Type': 'application/json',
                'X-Idempotency-Key': Math.random().toString(36).substring(2)
            }
        });

        res.json({
            id: response.data.id,
            qr_data: response.data.type_response.qr_code
        });
    } catch (e) {
        console.error("ERRO:", e.response ? e.response.data : e.message);
        res.status(500).json({ error: "Erro de autenticação ou token" });
    }
});

app.listen(process.env.PORT || 10000, '0.0.0.0');
