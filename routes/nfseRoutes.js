// routes/nfseRoutes.js
const express = require('express');
const router = express.Router();
const nfseController = require('../controllers/nfseController');

// Importar lista de NFs (recebe JSON com array de notas)
router.post('/importar', nfseController.importarNfse);

// Listar NFs
router.get('/', nfseController.getNfse);

// Obter por id
router.get('/:id', nfseController.getNfseById);

// Atualizar
router.put('/:id', nfseController.updateNfse);

// Deletar (remove nf + itensnf + titulosreceber)
router.delete('/:id', nfseController.deleteNfse);

module.exports = router;
