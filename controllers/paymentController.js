const PaymentModel = require("../models/paymentModel");

class PaymentController {
    static async processPayment(req, res) {
        const preferenceData = req.body;

        try {
            const preference = await PaymentModel.createPreference(preferenceData);
            return res.status(200).json({
                init_point: preference.init_point,
                preference_id: preference.id,
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    static async handleWebhook(req, res) {
        const notification = req.body;

        try {
            const topic = notification.topic;
            if (topic === "payment") {
                const paymentId = notification.id;
                const payment = await PaymentModel.getPaymentStatus(paymentId);

                return res.status(200).json({
                    operation_id: payment.id,
                    status: payment.status,
                    status_detail: payment.status_detail,
                });
            }

            return res.status(200).json({ status: "ok" });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

module.exports = PaymentController;
