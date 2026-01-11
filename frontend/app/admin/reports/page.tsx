'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Report {
  _id?: string;
  reportType: string;
  startDate: string;
  endDate: string;
  generatedAt?: string;
  data?: any;
}

const REPORT_TYPES = ['Sales', 'Reservation', 'Staff Performance', 'Feedback'];

const renderReportContent = (reportType: string, data: any) => {
  if (!data) return <p className="text-sm opacity-70">No data available</p>;

  switch (reportType) {
    case 'Sales':
      return renderSalesReport(data);
    case 'Reservation':
      return renderReservationReport(data);
    case 'Staff Performance':
      return renderStaffPerformanceReport(data);
    case 'Feedback':
      return renderFeedbackReport(data);
    default:
      return (
        <pre className="text-sm overflow-x-auto" style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
};

const renderSalesReport = (data: any) => {
  const summary = data.summary || {};
  const byOrderType = data.byOrderType || [];
  const byPaymentType = data.byPaymentType || [];
  const dailyBreakdown = data.dailyBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-700">
            ${summary.totalRevenue?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-900">Total Orders</p>
          <p className="text-2xl font-bold text-green-700">{summary.totalOrders || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-900">Avg Order Value</p>
          <p className="text-2xl font-bold text-purple-700">
            ${summary.avgOrderValue?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {byOrderType.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Sales by Order Type</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byOrderType.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{item._id || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{item.count || 0}</td>
                    <td className="px-4 py-2 text-sm">${item.revenue?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {byPaymentType.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Sales by Payment Type</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byPaymentType.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{item._id || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{item.count || 0}</td>
                    <td className="px-4 py-2 text-sm">${item.revenue?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dailyBreakdown.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Daily Sales</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyBreakdown.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{item._id}</td>
                    <td className="px-4 py-2 text-sm">{item.orders || 0}</td>
                    <td className="px-4 py-2 text-sm">${item.revenue?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const renderReservationReport = (data: any) => {
  const summary = data.summary || {};
  const byStatus = data.byStatus || [];
  const dailyBreakdown = data.dailyBreakdown || [];
  const peakHours = data.peakHours || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Total Reservations</p>
          <p className="text-2xl font-bold text-blue-700">{summary.totalReservations || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-900">Avg Party Size</p>
          <p className="text-2xl font-bold text-green-700">
            {summary.avgPartySize?.toFixed(1) || '0.0'}
          </p>
        </div>
      </div>

      {byStatus.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Reservations by Status</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byStatus.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm capitalize">{item._id || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{item.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dailyBreakdown.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Daily Reservations</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Guests</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyBreakdown.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{item._id}</td>
                    <td className="px-4 py-2 text-sm">{item.count || 0}</td>
                    <td className="px-4 py-2 text-sm">{item.totalGuests || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {peakHours.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Peak Reservation Hours</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hour</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reservations</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {peakHours.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{item._id}:00</td>
                    <td className="px-4 py-2 text-sm">{item.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const renderStaffPerformanceReport = (data: any) => {
  const staffPerformance = data.staffPerformance || [];

  return (
    <div className="space-y-6">
      {staffPerformance.length > 0 ? (
        <div>
          <h4 className="font-semibold mb-3">Staff Performance</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders Handled</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffPerformance.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">
                      {item.staffDetails?.name || item._id || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm">{item.ordersHandled || 0}</td>
                    <td className="px-4 py-2 text-sm">${item.totalRevenue?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2 text-sm">${item.avgOrderValue?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm opacity-70">No staff performance data available for this period</p>
      )}
    </div>
  );
};

const renderFeedbackReport = (data: any) => {
  const summary = data.summary || {};
  const ratingDistribution = data.ratingDistribution || [];
  const recentFeedback = data.recentFeedback || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Total Feedback</p>
          <p className="text-2xl font-bold text-blue-700">{summary.totalFeedback || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-900">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-700">
            {summary.avgRating?.toFixed(1) || '0.0'} / 5.0
          </p>
        </div>
      </div>

      {ratingDistribution.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Rating Distribution</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ratingDistribution.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">
                      {'⭐'.repeat(item._id || 0)}
                    </td>
                    <td className="px-4 py-2 text-sm">{item.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentFeedback.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Recent Feedback</h4>
          <div className="space-y-3">
            {recentFeedback.map((feedback: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium">
                    {feedback.customer?.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {'⭐'.repeat(feedback.rating || 0)}
                  </p>
                </div>
                {feedback.comments && (
                  <p className="text-sm text-gray-700">{feedback.comments}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(feedback.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reportType: 'Sales',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = auth.getUser();
    if (user?.role?.toLowerCase() !== 'admin') {
      router.push('/');
      return;
    }

    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    try {
      const response = await apiClient.get<any>('/reports');
      const maybeReports = response.data?.data ?? response.data ?? [];

      const normalized = (Array.isArray(maybeReports) ? maybeReports : []).map((r: any) => ({
        _id: r._id,
        reportType: r.reportType,
        // backend puts the period in content.period.startDate/endDate
        startDate: r.content?.period?.startDate ?? r.startDate ?? '',
        endDate: r.content?.period?.endDate ?? r.endDate ?? '',
        // backend uses generatedDate field
        generatedAt: r.generatedDate ?? r.generatedAt ?? r.createdAt ?? null,
        // put the actual report payload into `data` for the UI
        data: r.content ?? r.data ?? null,
      }));

      setReports(normalized);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      const response = await apiClient.post<Report>('/reports', {
        reportType: formData.reportType,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setShowForm(false);
        setFormData({
          reportType: 'Sales',
          startDate: '',
          endDate: '',
        });
        fetchReports();
      }
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await apiClient.delete<{ status: string }>(`/reports/${id}`);
      if (response.error) {
        setError(response.error);
        return;
      }
      fetchReports();
    } catch (err) {
      setError('Failed to delete report');
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reports</h1>
        <Button onClick={() => setShowForm(true)} variant="primary">
          Generate Report
        </Button>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generate New Report</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="form-label">
                Report Type
              </label>
              <select
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                className="form-select"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Generate
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    reportType: 'Sales',
                    startDate: '',
                    endDate: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12 card">
          <p>No reports found. Generate a new report to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold capitalize">{report.reportType} Report</h3>
                  <p className="text-sm mt-1">
                    Period: {new Date(report.startDate).toLocaleDateString()} -{' '}
                    {new Date(report.endDate).toLocaleDateString()}
                  </p>
                  {report.generatedAt && (
                    <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                      Generated: {new Date(report.generatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(report._id!)}
                >
                  Delete
                </Button>
              </div>
              {report.data && (
                <div className="border-t pt-4">
                  {renderReportContent(report.reportType, report.data)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
