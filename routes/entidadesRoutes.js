const express = require('express');
const router = express.Router();
const entidadesController = require('../controllers/entidadesController');

router.get('/cliente', entidadesController.getClientesDropDown);

router.get('/fornecedor', entidadesController.getFornecedoresDropDown);

router.get('/seguradora', entidadesController.getSeguradorasDropDown);

router.get('/locadora', entidadesController.getLocadorasDropDown);

router.get('/operadora', entidadesController.getOperadorasDropDown);

router.get('/hotel', entidadesController.getHoteisDropDown);

router.get('/emissor', entidadesController.getEmissoresDropDown);

router.get('/vendedor', entidadesController.getVendedoresDropDown);

router.get('/ciaaerea', entidadesController.getCiasDropDown);


router.get('/endereco/:identidade', entidadesController.getEnderecoByIdEntidade);

router.get('/hotel/:identidade', entidadesController.getHotelById);

router.get('/emissor/:identidade', entidadesController.getEmissorById);

router.get('/vendedor/:identidade', entidadesController.getVendedorById);

router.get('/operadora/:identidade', entidadesController.getOperadoraById);

router.get('/ciaaerea/:identidade', entidadesController.getCiaAereaById);

router.get('/:identidade', entidadesController.getEntidadeById);

router.get('/', entidadesController.getEntidades);


router.post('/endereco', entidadesController.createEndereco);

router.post('/hotel', entidadesController.createHotel);

router.post('/emissor', entidadesController.createEmissor);

router.post('/vendedor', entidadesController.createVendedor);

router.post('/operadora', entidadesController.createOperadora);

router.post('/ciaaerea', entidadesController.createCiaAerea);

router.post('/', entidadesController.createEntidade);



router.put('/endereco/:idendereco', entidadesController.updateEndereco);

router.put('/hotel/:idhotel', entidadesController.updateHotel);

router.put('/emissor/:idemissor', entidadesController.updateEmissor);

router.put('/vendedor/:id', entidadesController.updateVendedor);

router.put('/operadora/:idoperadora', entidadesController.updateOperadora);

router.put('/ciaaerea/:idciaaerea', entidadesController.updateCiaAerea);

router.put('/:identidade', entidadesController.updateEntidade);


router.delete('/endereco/:idendereco', entidadesController.deleteEndereco);

router.delete('/hotel/:idhotel', entidadesController.deleteHotel);

router.delete('/emissor/:idemissor', entidadesController.deleteEmissor);

router.delete('/vendedor/:id', entidadesController.deleteVendedor);

router.delete('/operadora/:idoperadora', entidadesController.deleteOperadora);

router.delete('/ciaaerea/:idciaaerea', entidadesController.deleteCiaAerea);

router.delete('/:identidade', entidadesController.deleteEntidade);



//router.get('/endereco/:idendereco', entidadesController.getEnderecoById);

module.exports = router;
