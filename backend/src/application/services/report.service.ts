import Report, { IReport } from "../../data/models/report.schema";
import { Types } from "mongoose";

interface GenerateReportInput {
    generatedBy: Types.ObjectId;
    reportType: "Sales" | "Reservation" | "Staff Performance" | "Feedback";
    content: any;
}

class ReportService {
    async generateReport(input: GenerateReportInput): Promise<IReport> {
        const report = new Report({
            generatedBy: input.generatedBy,
            reportType: input.reportType,
            content: input.content
        });
        return await report.save();
    }
    async getReportById(reportId: string): Promise<IReport | null> {
        return Report.findById(reportId).populate('generatedBy', 'name email');
    }
    async getAllReports(filters: any = {}) {
        const query: any = {};
        if (filters.reportType) {
            query.reportType = filters.reportType;
        }
        if (filters.generatedBy) {
            query.generatedBy = filters.generatedBy;
        }
        return Report.find(query).populate('generatedBy', 'name email').sort({ generatedDate: -1 });
    }
    async deleteReport(reportId: string): Promise<IReport | null> {
        return Report.findByIdAndDelete(reportId);
    }

}
export default new ReportService;