const express          = require('express');
const router           = express.Router();
const parseId          = require('../middlewares/parseId');
const validateKategori = require('../middlewares/validateKategori');
const kategoriCtrl     = require('../controllers/kategoriController');

router.get('/',    kategoriCtrl.getAll);
router.get('/:id', parseId, kategoriCtrl.getById);
router.post('/',   validateKategori, kategoriCtrl.create);
router.delete('/:id', parseId, kategoriCtrl.deleteById);

module.exports = router;
