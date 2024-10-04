const path = require('path');
const router = require('express').Router();
const { crearPago } = require("../../../controllers/pago");
const { crearQueja, obtenerQueja, actualizarQueja, eliminarQueja, getQuejaByCategory } = require('../../../controllers/quejas');
const { crearUser, obtenerUser, actualizarUser, eliminarUser, getUserByCategory } = require('../../../controllers/usuario');

// Ruta para verificar el estado de la API
router.get('/status', (req, res) => {
  res.status(200).json({ status: 'API funcionando' });
});


// Ruta para nuevo usuario
router.post('/usuarios', crearUser);
router.get('/usuarios', obtenerUser);
router.get('/usuarios/categoria/:nombre', getUserByCategory);
router.put('/usuarios/:id', actualizarUser);
router.delete('/usuarios/:id', eliminarUser);
// Rutas para quejas
router.post('/quejas', crearQueja);
router.get('/quejas', obtenerQueja);
router.get('/quejas/categoria/:category', getQuejaByCategory);
router.put('/quejas/:id', actualizarQueja);
router.delete('/quejas/:id', eliminarQueja);

router.post("/pago", crearPago); 

module.exports = router;
