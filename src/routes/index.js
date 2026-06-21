const express = require('express');

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const carroRoutes = require('./carroRoutes');
const motoRoutes = require('./motoRoutes');
const marcaRoupaRoutes = require('./marcaRoupaRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/carros', carroRoutes);
router.use('/motos', motoRoutes);
router.use('/marcas-roupa', marcaRoupaRoutes);

module.exports = router;
