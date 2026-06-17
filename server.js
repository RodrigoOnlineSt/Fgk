const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

app.post('/criar-pix', async (req, res) => {
    const { valor } = req.body;
    try {
        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: parseFloat(valor),
            payment_method_id: 'pix',
            payer: { email: 'cliente@email.com' }
        }, {
            headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
        });
        res.json({
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64,
            qr_code: response.data.point_of_interaction.transaction_data.qr_code
        });
    } catch (e) { res.status(500).json({ error: 'Erro' }); }
});
app.listen(3000);
