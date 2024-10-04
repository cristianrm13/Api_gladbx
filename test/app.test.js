const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const router = require('../adapters/routes/router'); // Asegúrate de que la ruta sea correcta para tu proyecto
require('dotenv').config();

// Configurar la aplicación de Express para las pruebas
const app = express();
app.use(express.json());
app.use('/api', router);

// Aumentar el tiempo de espera para Jest
jest.setTimeout(10000); // 10 segundos

// Pruebas
describe('API tests', () => {
  // Conectar a la base de datos antes de todas las pruebas
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
    } catch (error) {
      console.error("Error conectando a MongoDB:", error);
      throw error; // Lanza el error para detener las pruebas si no se conecta
    }
  });

  // Cerrar la conexión después de todas las pruebas
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Ejemplo de prueba para una ruta GET
  it('GET /api/status debería devolver estado 200', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'API funcionando');
  });

  // Puedes agregar más pruebas para diferentes rutas y funcionalidades
});
