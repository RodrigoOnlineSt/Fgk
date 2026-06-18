const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/criar-pix', async (req, res) => {
    try {
        const valor = parseFloat(req.body.valor);
        if (!valor || valor <= 0) return res.status(400).json({ error: "Valor inválido" });

        const response = await axios.post('https://api.mercadopago.com/v1/orders', {
            type: "qr",
            total_amount: valor,
            description: "Venda Loja",
            config: { qr: { mode: "static", external_pos_id: "SUC001POS001" } },
            items: [{ title: "Produto", unit_price: valor, quantity: 1, unit_measure: "unit" }]
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': Math.random().toString(36).substring(2)
            }
        });

        res.json({
            id: response.data.id,
            qr_data: response.data.type_response.qr_code // Ajustado para capturar o campo correto
        });
    } catch (e) {
        // ESSA LINHA É A CHAVE: ela vai logar no painel da Render o erro real
        const detalheErro = e.response ? e.response.data : e.message;
        console.error("ERRO COMPLETO DO MERCADO PAGO:", JSON.stringify(detalheErro));
        res.status(500).json({ error: "Erro no servidor: " + JSON.stringify(detalheErro) });
    }
});

app.listen(process.env.PORT || 10000, '0.0.0.0');
