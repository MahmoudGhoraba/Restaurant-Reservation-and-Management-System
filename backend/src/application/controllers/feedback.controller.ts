import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { CreateFeedbackDto, UpdateFeedbackDto } from '../../data/dtos';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(dto);
  }

  @Put(':id')
  async updateFeedback(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.updateFeedback(id, dto);
  }

  @Get(':id')
  async getFeedbackById(@Param('id') id: string) {
    return this.feedbackService.getFeedbackById(id);
  }

  @Get()
  async getAllFeedback(@Query() filters: { rating?: number; customer?: string }) {
    return this.feedbackService.getAllFeedback(filters);
  }

  @Get('reference/:referenceType/:referenceId')
  async getFeedbackByReference(
    @Param('referenceType') referenceType: string,
    @Param('referenceId') referenceId: string
  ) {
    return this.feedbackService.getFeedbackByReference(referenceType, referenceId);
  }

  @Delete(':id')
  async deleteFeedback(@Param('id') id: string) {
    await this.feedbackService.deleteFeedback(id);
  }

  @Get('average/:referenceType/:referenceId')
  async getAverageRating(
    @Param('referenceType') referenceType: string,
    @Param('referenceId') referenceId: string
  ) {
    const average = await this.feedbackService.getAverageRating(referenceType, referenceId);
    return { averageRating: average };
  }
}

