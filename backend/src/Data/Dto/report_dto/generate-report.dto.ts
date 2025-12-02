import { IsEnum, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class GenerateReportDto {
    @IsEnum(['Sales', 'Reservation', 'Staff Performance', 'Feedback'])
    @IsNotEmpty()
    reportType: 'Sales' | 'Reservation' | 'Staff Performance' | 'Feedback';

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsOptional()
    staffId?: string;

    @IsOptional()
    tableId?: string;
}
