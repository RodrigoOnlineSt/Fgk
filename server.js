const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' })); // ISSO LIBERA O BLOGGER DE QUALQUER LUGAR
app.use(express.json());

app.post('/criar-pix', async (req, res) => {
    try {
        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: parseFloat(req.body.valor),
            payment_method_id: 'pix',
            payer: { email: 'contato@teste.com' }
        }, {
            headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
        });
        res.json({
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(process.env.PORT || 10000, '0.0.0.0');
