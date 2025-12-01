import {Router} from 'express';
import FeedbackController from '../controllers/feedback.controller';
import authenticateMiddleware from '../../middlewares/authMiddleware';
import authorizationMiddleware from '../../middlewares/authorizeMiddleware';

const router = Router();

router.post('/', authenticateMiddleware, FeedbackController.createFeedback);
router.put('/:id', authenticateMiddleware, FeedbackController.updateFeedback);
router.get('/:id', authenticateMiddleware, FeedbackController.getFeedbackById);
router.get('/', authenticateMiddleware, authorizationMiddleware('Admin'), FeedbackController.getAllFeedback);
router.delete('/:id', authenticateMiddleware, authorizationMiddleware('Admin'), FeedbackController.deleteFeedback);

export default router;