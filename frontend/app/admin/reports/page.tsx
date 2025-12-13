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
      const response = await apiClient.get<Report[]>('/reports');
      if (response.data) {
        setReports(Array.isArray(response.data) ? response.data : []);
      }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
        <Button onClick={() => setShowForm(true)} variant="primary">
          Generate Report
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generate New Report</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No reports found. Generate a new report to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold capitalize">{report.reportType} Report</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Period: {new Date(report.startDate).toLocaleDateString()} -{' '}
                    {new Date(report.endDate).toLocaleDateString()}
                  </p>
                  {report.generatedAt && (
                    <p className="text-gray-500 text-xs mt-1">
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
                  <pre className="text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(report.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
