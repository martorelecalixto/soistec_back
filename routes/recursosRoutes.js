const express = require('express');
const router = express.Router();
const recursosController = require('../controllers/recursosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', recursosController.getRecursos);

router.post('/', recursosController.createRecurso);

router.put('/:idrecurso', recursosController.updateRecurso);

router.delete('/:id', recursosController.deleteRecurso);

module.exports = router;
