const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const Pago = require('../models/pago');
const router = require('../adapters/routes/router'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Verificar si el Access Token está configurado
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.error('ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado.');
  process.exit(1);
}

// Configurar Mongoose
mongoose.connect(process.env.MONGODB_URL || '')
  .then(() => {
    console.log('Conectado a la base de datos MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos MongoDB', error);
  });

app.use(cors());
app.use(express.json());

// Endpoint para enviar mensaje por WhatsApp
app.post('/send-whatsapp-template', async (req, res) => {
  const { recipientPhoneNumber } = req.body; // El número de teléfono del destinatario debería ser parte del cuerpo de la solicitud
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN; // Token desde .env
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // Phone ID desde .env

  try {
      const response = await axios({
          method: 'POST',
          url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
          },
          data: {
              messaging_product: "whatsapp",
              to: recipientPhoneNumber,
              type: "template",
              template: {
                  name: "hello_world", // Asegúrate de que este nombre sea correcto
                  language: {
                      code: "en_US"
                  }
              }
          }
      });

      res.status(200).send(response.data);
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send(error.response ? error.response.data : 'Error sending message');
  }
});
// Ruta para procesar el pago
app.post('/api/pago', async (req, res) => {
  try {
    const ngrokUrl = 'https://a279-200-68-161-197.ngrok-free.app';

    const preferenceData = {
      ...req.body,
      back_urls: {
        success: `${ngrokUrl}/success`,
        failure: `${ngrokUrl}/failure`,
        pending: `${ngrokUrl}/pending`
      },
      notification_url: `${ngrokUrl}/api/webhook` 
    };
    console.log('Recibido preferenceData:', preferenceData);

    // Crea una preferencia de pago usando la API de Mercado Pago
    const preferenceResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    if (preferenceResponse.status !== 200 && preferenceResponse.status !== 201) {
      console.error('Error en la respuesta de Mercado Pago:', preferenceResponse.data);
      return res.status(preferenceResponse.status).json({ detail: preferenceResponse.data });
    }

    const preference = preferenceResponse.data;
    console.log('Respuesta de la preferencia:', preference);

    // Devolver la respuesta al cliente con el link de pago válido
    return res.json({
      init_point: preference.init_point,
      preference_id: preference.id
    });
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json({ detail: error.response.data });
    } else if (error.request) {
      console.error('No se recibió respuesta de Mercado Pago:', error.request);
      res.status(500).json({ detail: 'No se recibió respuesta del servidor de Mercado Pago.' });
    } else {
      console.error('Error message:', error.message);
      res.status(500).json({ detail: error.message });
    }
  }
});

// Webhook para recibir notificaciones de MercadoPago
app.post('/api/webhook', async (req, res) => {
  console.log('Webhook recibido:', req.body);

  try {
      const notificacion = req.body;
      const topic = notificacion.topic;

      if (topic === 'payment') {
          const paymentId = notificacion.data.id;

          const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: {
                  'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
              }
          });

          if (paymentResponse.status !== 200) {
              console.error('Error al obtener el pago:', paymentResponse.data);
              return res.status(paymentResponse.status).json({ detail: paymentResponse.data });
          }

          const payment = paymentResponse.data;

          // Crear un nuevo objeto de pago
          const nuevoPago = new Pago({
              paymentId: payment.id,
              status: payment.status,
              statusDetail: payment.status_detail,
              amount: payment.transaction_amount,
              dateApproved: payment.date_approved ? new Date(payment.date_approved) : null,
              payerEmail: payment.payer.email,
              description: payment.description
          });

          // Guardar el pago en MongoDB
          try {
              await nuevoPago.save();
              console.log('Pago guardado en la base de datos:', nuevoPago);
          } catch (error) {
              console.error('Error al guardar el pago en la base de datos:', error);
          }

          // Enviar mensaje de WhatsApp (opcional)
          const whatsappResponse = await axios.post('http://localhost:3000/send-whatsapp-template', {
              recipientPhoneNumber: payment.payer.phone.number, // Asegúrate de que el número esté disponible
          });

          console.log('Respuesta de WhatsApp:', whatsappResponse.data);

          return res.json({
              operation_id: payment.id,
              status: payment.status,
              status_detail: payment.status_detail
          });
      }

      return res.json({ status: 'ok' });
  } catch (error) {
      console.error('Error al recibir la notificación:', error);
      if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', error.response.data);
          res.status(error.response.status).json({ detail: error.response.data });
      } else if (error.request) {
          console.error('No se recibió respuesta de Mercado Pago:', error.request);
          res.status(500).json({ detail: 'No se recibió respuesta del servidor de Mercado Pago.' });
      } else {
          console.error('Error message:', error.message);
          res.status(500).json({ detail: error.message });
      }
  }
});

app.use('/api', router);

app.get('/', (req, res) => {
  res.send('API is working!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
