const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configuração rígida de CORS
app.use(cors());
app.use(express.json());

app.post('/criar-pix', async (req, res) => {
    try {
        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: parseFloat(req.body.valor),
            description: 'Pagamento Pix',
            payment_method_id: 'pix',
            payer: { email: 'contato@teste.com' }
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        console.error("Erro no MP:", e.response ? e.response.data : e.message);
        res.status(500).json({ error: e.message });
    }
});

app.listen(process.env.PORT || 10000, '0.0.0.0', () => {
    console.log("Servidor rodando na porta 10000");
});
