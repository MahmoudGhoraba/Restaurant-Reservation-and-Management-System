import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;

  const mockReports = [
    {
      _id: '1',
      reportType: 'Sales',
      content: { period: { startDate: '2025-01-01', endDate: '2025-01-02' } },
      generatedDate: '2025-01-03T00:00:00.000Z',
    },
  ];

  const mockReportModel = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue(mockReports),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getModelToken('Report'), useValue: mockReportModel },
        { provide: getModelToken('Order'), useValue: {} },
        { provide: getModelToken('Reservation'), useValue: {} },
        { provide: getModelToken('Feedback'), useValue: {} },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all reports', async () => {
    const res = await service.getAllReports();
    expect(res.status).toBe('success');
    expect(res.data).toEqual(mockReports);
    expect(mockReportModel.find).toHaveBeenCalled();
    expect(mockReportModel.populate).toHaveBeenCalledWith('generatedBy', 'name email');
    expect(mockReportModel.sort).toHaveBeenCalledWith({ generatedDate: -1 });
  });
});
