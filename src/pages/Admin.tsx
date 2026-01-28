import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { WeeklyReport } from '../lib/types';
import { Trash2, Download } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    const data = await store.getReports(user);
    setReports(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      await store.deleteReport(id);
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'submitted' ? 'reviewed' : 'submitted';
    await store.updateReportStatus(id, newStatus);
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const downloadCSV = () => {
    if (reports.length === 0) return;

    // Define headers
    const headers = [
      'Lead Name',
      'Committee',
      'Week Date',
      'Work Summary',
      'Faculty Meeting Summary',
      'Next Week Plans',
      'Remarks',
      'Status',
      'Submission Date'
    ];

    // Map data to rows
    const rows = reports.map(report => [
      report.user_name,
      report.committee,
      report.week_start_date,
      `"${report.summary?.replace(/"/g, '""') || ''}"`, // Escape quotes
      `"${report.challenges?.replace(/"/g, '""') || ''}"`,
      `"${report.plans_for_next_week?.replace(/"/g, '""') || ''}"`,
      `"${report.remarks?.replace(/"/g, '""') || ''}"`,
      report.status,
      new Date(report.created_at).toLocaleDateString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `weekly_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-red-600">Access Denied</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Report Management</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            Total: {reports.length}
          </span>
        </div>
        <button
          onClick={downloadCSV}
          disabled={reports.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No reports found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Committee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.week_start_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.committee}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {report.summary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(report.id, report.status)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {report.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
