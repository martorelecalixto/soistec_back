// routes/nfseRoutes.js
const express = require('express');
const router = express.Router();
const nfseController = require('../controllers/nfseController');

/*BLOCO DE CODIGOS PARA IMPORTAR XML DAS NFSe*/

// Importar lista de NFs (recebe JSON com array de notas)
router.post('/importar', nfseController.importarNfse);

// Buscar Filial
router.get('/buscarfilial', nfseController.getIdFilial);

// Buscar Cliente
router.get('/buscarcliente', nfseController.getIdCliente);

// Buscar nf
router.get('/buscarnf', nfseController.getExistNF);

// Listar NFs
router.get('/', nfseController.getNfse);

// Obter por id
router.get('/:id', nfseController.getNfseById);

// Atualizar
router.put('/:id', nfseController.updateNfse);

// Deletar (remove nf + itensnf + titulosreceber)
router.delete('/:id', nfseController.deleteNfse);

/****************************************************************/



/*BLOCO DE CODIGO PARA PORTAL NACIONAL NFSE*/

router.post('/autenticar', nfseController.autenticar);

router.post('/emitir', nfseController.emitir);

router.get('/consultar', nfseController.consultar);

router.post('/cancelar', nfseController.cancelar);

/****************************************************************/


module.exports = router;
