const { MercadoPagoConfig } = require("mercadopago");

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2010795294069726-100312-beca6fb991b0146dd01ee2fb27e1459e-2016484739' });

class PaymentModel {
    static async createPreference(preferenceData) {
        try {
            const preferenceResponse = await client.preferences.create(preferenceData);
            return preferenceResponse.body;
        } catch (error) {
            throw new Error(`Error al crear preferencia: ${error.message}`);
        }
    }

    static async getPaymentStatus(paymentId) {
        try {
            const paymentResponse = await client.payment.get(paymentId);
            return paymentResponse.body;
        } catch (error) {
            throw new Error(`Error al obtener el estado del pago: ${error.message}`);
        }
    }
}

module.exports = PaymentModel;
