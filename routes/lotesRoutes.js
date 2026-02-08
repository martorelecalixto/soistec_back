const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', lotesController.getLotes);

router.post('/', lotesController.createLote);

router.put('/:idlote', lotesController.updateLote);

router.delete('/:idlote', lotesController.deleteLote);

router.get('/', lotesController.getLotesDropDown);

router.get('/porevento/:idevento', lotesController.getLotesByIdEvento);

module.exports = router;
