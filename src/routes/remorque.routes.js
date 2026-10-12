const express = require('express');
const router = express.Router();
const remorqueController = require('../controllers/remorque.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createRemorqueSchema } = require('../validations/remorque.validation');

router.use(verifyAccessToken);
router.use(restrictTo('admin'));

router.post('/', validate(createRemorqueSchema), remorqueController.createRemorque);
router.get('/', remorqueController.getAllRemorques);
router.get('/:id', remorqueController.getRemorqueById);
router.put('/:id', remorqueController.updateRemorque);
router.patch('/:id/archive', remorqueController.archiverRemorque);

module.exports = router;