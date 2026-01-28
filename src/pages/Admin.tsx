import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { WeeklyReport } from '../lib/types';
import { Trash2 } from 'lucide-react';

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

  if (user?.role !== 'admin') {
    return <div className="p-8 text-red-600">Access Denied</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Report Management</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
          Total: {reports.length}
        </span>
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
