const express = require('express');
const router = express.Router();
const planocontaController = require('../controllers/planocontaController');


router.get('/tempai', planocontaController.temPaiFunc);

router.get('/temirmao', planocontaController.temIrmaoFunc);

router.get('/sempai', planocontaController.semPaiFunc);

router.get('/planocontapai', planocontaController.getPlanoContaPaiDropDown);

router.get('/', planocontaController.getPlanoConta);

router.get('/:idplanoconta', planocontaController.getPlanoContaById);

router.post('/', planocontaController.createPlanoConta);

router.put('/:idplanoconta', planocontaController.updatePlanoConta);

router.delete('/:idplanoconta', planocontaController.deletePlanoConta);

module.exports = router;
