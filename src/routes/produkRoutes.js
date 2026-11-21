const express                              = require('express');
const router                               = express.Router();
const parseId                              = require('../middlewares/parseId');
const { validateProduk, validatePatchProduk } = require('../middlewares/validateProduk');
const produkCtrl                           = require('../controllers/produkController');

// Urutan penting: route spesifik didaftarkan sebelum route dengan param (:id)
router.get('/',                       produkCtrl.getAll);
router.post('/',  validateProduk,     produkCtrl.create);

router.delete('/:id/permanent', parseId, produkCtrl.hardDeletePermanent);
router.patch('/:id/restore',    parseId, produkCtrl.restore);

router.get('/:id',    parseId,                    produkCtrl.getById);
router.put('/:id',    parseId, validateProduk,     produkCtrl.update);
router.patch('/:id',  parseId, validatePatchProduk, produkCtrl.patch);
router.delete('/:id', parseId,                    produkCtrl.softDelete);

module.exports = router;
