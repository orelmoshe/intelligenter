import express from 'express';
import Controller from '../controllers';

const router = express.Router({ strict: true });

const controller = new Controller();

router.get('/getResultsByDomain', controller.getResultsByDomain);

router.post('/scanDomain', controller.scanDomain);

export default router;
