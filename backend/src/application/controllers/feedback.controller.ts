import { Request, Response , NextFunction} from 'express';
import FeedbackService  from '../services/feedback.service';
import catchAsync from '../../infrastructure/utils/catchAsync';
import AppError from '../../infrastructure/utils/appError';

class FeedbackController {
    createFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const feedback = await FeedbackService.createFeedback(req.body);
        res.status(201).json({
            status: 'success',
            data: feedback
        });
    });

    updateFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const feedback = await FeedbackService.updateFeedback(req.params.id, req.body);
        if(!feedback) {
            return next(new AppError('Feedback not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: feedback
        });
    });

    getFeedbackById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const feedback = await FeedbackService.getFeedbackById(req.params.id);
        if(!feedback) {
            return next(new AppError('Feedback not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: feedback
        });
    });

    getAllFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const filters = req.query;
        const feedbacks = await FeedbackService.getAllFeedback(filters);
        res.status(200).json({
            status: 'success',
            results: feedbacks.length,
            data: feedbacks
        });
    });

    deleteFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const feedback = await FeedbackService.deleteFeedback(req.params.id);
        if(!feedback) {
            return next(new AppError('Feedback not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    });
}

export default new FeedbackController();

