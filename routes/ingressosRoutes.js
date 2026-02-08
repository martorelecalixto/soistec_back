const express = require('express');
const router = express.Router();
const ingressosController = require('../controllers/ingressosController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', ingressosController.getIngressos);

router.post('/', ingressosController.createIngresso);

router.put('/:idingresso', ingressosController.updateIngresso);

router.delete('/:idingresso', ingressosController.deleteIngresso);

router.get('/', ingressosController.getIngressosDropDown);

router.get('/porlote/:idlote', ingressosController.getIngressosByIdLote);

module.exports = router;
