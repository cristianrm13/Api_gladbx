const { MercadoPagoConfig } = require('mercadopago');

// Configuración del cliente de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: 'MERCADO_PAGO_ACCESS_TOKEN' 
});

const crearPago = async (req, res) => {
    const { title, unit_price, quantity } = req.body;

    const preference = {
        items: [
            {
                title: title,
                unit_price: parseFloat(unit_price),  // Convertir a número flotante
                quantity: parseInt(quantity),  // Convertir a número entero
            },
        ],
        back_urls: {
            success: "https://a279-200-68-161-197.ngrok-free.app/success",
            failure: "https://a279-200-68-161-197.ngrok-free.app/failure",
            pending: "https://a279-200-68-161-197.ngrok-free.app/pending",
        },
        auto_return: "approved",
    };

    try {
        const response = await client.preferences.create(preference);
        res.status(200).json({ init_point: response.body.init_point });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { crearPago };
