import { Router } from 'express';
import reportController from '../controllers/report.controller';
import authenticateMiddleware from '../../middlewares/authMiddleware';
import authorizationMiddleware from '../../middlewares/authorizeMiddleware';
const router = Router();

router.post('/',/* authenticateMiddleware,*/ reportController.generateReport);
router.get('/:id',/* authenticateMiddleware,*/ reportController.getReportById);
router.get('/', /*authenticateMiddleware, authorizationMiddleware('Admin'),*/ reportController.getAllReports);
router.delete('/:id',/* authenticateMiddleware, authorizationMiddleware('Admin'),*/ reportController.deleteReport);
export default router;