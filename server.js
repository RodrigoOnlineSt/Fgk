app.post('/criar-pix', async (req, res) => {
    try {
        const valor = parseFloat(req.body.valor);
        
        // Verifica se o valor é um número válido antes de enviar
        if (isNaN(valor) || valor <= 0) {
            return res.status(400).json({ error: "Valor inválido" });
        }

        const response = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: valor,
            description: "Pagamento via Pix",
            payment_method_id: 'pix',
            payer: {
                email: 'cliente_teste@exemplo.com' // Use um e-mail com formato válido
            }
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            id: response.data.id,
            qr_code_base64: response.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (e) {
        // ESSA LINHA VAI MOSTRAR NO LOG DA RENDER O MOTIVO REAL DO ERRO 400
        console.error("DETALHE DO ERRO 400:", e.response ? e.response.data : e.message);
        res.status(500).json({ error: "Erro na API do Mercado Pago" });
    }
});
