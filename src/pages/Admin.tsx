import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { WeeklyReport } from '../lib/types';
import { Trash2, Download, FileText, Eye, Calendar, Save, X } from 'lucide-react';
import { ReportModal } from '../components/ReportModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { startOfWeek, differenceInCalendarWeeks, parseISO, format, addDays } from 'date-fns';

export default function Admin() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [editingDates, setEditingDates] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ start: '', end: '' });

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

  const startEditing = (report: WeeklyReport) => {
    setEditingDates(report.id);
    setEditForm({
      start: report.week_start_date,
      end: report.week_end_date || format(addDays(parseISO(report.week_start_date), 6), 'yyyy-MM-dd')
    });
  };

  const saveDates = async (id: string) => {
    const { error } = await store.updateReport(id, {
      week_start_date: editForm.start,
      week_end_date: editForm.end
    });

    if (error) {
      alert('Failed to update dates: ' + error);
    } else {
      setReports(reports.map(r => r.id === id ? { ...r, week_start_date: editForm.start, week_end_date: editForm.end } : r));
      setEditingDates(null);
    }
  };

  const downloadCSV = (targetReports: WeeklyReport[] = reports, filenameSuffix: string = 'all') => {
    if (targetReports.length === 0) return;

    // Define headers
    const headers = [
      'Lead Name',
      'Committee',
      'Week Start Date',
      'Week End Date',
      'Work Summary',
      'Faculty Meeting Summary',
      'Next Week Plans',
      'Remarks',
      'Status',
      'Submission Date'
    ];

    // Map data to rows
    const rows = targetReports.map(report => [
      report.user_name,
      report.committee,
      report.week_start_date,
      report.week_end_date || '',
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
    link.setAttribute('download', `weekly_reports_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (targetReports: WeeklyReport[] = reports, filenameSuffix: string = 'all') => {
    if (targetReports.length === 0) return;

    const doc = new jsPDF();

    // Calculate Date Range
    const startDates = targetReports.map(r => parseISO(r.week_start_date).getTime());
    const minDateTs = Math.min(...startDates);
    const minDate = new Date(minDateTs);

    const endDatesTs = targetReports.map(r => {
      const end = r.week_end_date ? parseISO(r.week_end_date) : addDays(parseISO(r.week_start_date), 6);
      return end.getTime();
    });
    const maxDateTs = Math.max(...endDatesTs);
    const maxDate = new Date(maxDateTs);

    const fromStr = format(minDate, 'dd MMM yyyy');
    const toStr = format(maxDate, 'dd MMM yyyy');

    // Add title
    doc.setFontSize(18);
    doc.text(`Weekly Reports - ${filenameSuffix}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);

    // Add date range
    doc.text(`Date of Report From: ${fromStr}`, 14, 32);
    doc.text(`Date of Report To: ${toStr}`, 14, 40);

    // Add date/time generated
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated on: ${dateStr}`, 14, 48);

    // Define columns
    const columns = [
      'Lead Name',
      'Committee',
      'Start Date',
      'End Date',
      'Work Summary',
      'Status'
    ];

    // Map data to rows
    const data = targetReports.map(report => [
      report.user_name,
      report.committee,
      report.week_start_date,
      report.week_end_date || format(addDays(parseISO(report.week_start_date), 6), 'yyyy-MM-dd'),
      report.summary || '',
      report.status
    ]);

    // Generate table
    autoTable(doc, {
      startY: 55,
      head: [columns],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        4: { cellWidth: 70 } // Summary column
      }
    });

    doc.save(`weekly_reports_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-red-600">Access Denied</div>;
  }

  // Pre-process reports to group by week
  const groupedByWeek: { [key: string]: WeeklyReport[] } = {};

  if (reports.length > 0) {
    const earliestDate = reports.reduce((earliest, report) => {
      const current = parseISO(report.week_start_date);
      return current < earliest ? current : earliest;
    }, parseISO(reports[0].week_start_date));

    const startOfProject = startOfWeek(earliestDate, { weekStartsOn: 1 });

    reports.forEach(report => {
      const reportDate = parseISO(report.week_start_date);
      const normalizedDate = startOfWeek(reportDate, { weekStartsOn: 1 });
      const weekNum = differenceInCalendarWeeks(normalizedDate, startOfProject, { weekStartsOn: 1 }) + 1;
      const weekKey = `Week ${weekNum}`;

      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = [];
      }
      groupedByWeek[weekKey].push(report);
    });
  }

  const sortedWeekKeys = Object.keys(groupedByWeek).sort((a, b) => {
    const numA = parseInt(a.replace('Week ', ''));
    const numB = parseInt(b.replace('Week ', ''));
    return numB - numA;
  });

  // Set default selected week if not set
  useEffect(() => {
    if (!selectedWeek && sortedWeekKeys.length > 0) {
      setSelectedWeek(sortedWeekKeys[0]);
    }
  }, [sortedWeekKeys, selectedWeek]);

  const currentReports = selectedWeek ? (groupedByWeek[selectedWeek] || []) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Report Management</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Total: {reports.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCSV(currentReports, selectedWeek)}
              disabled={currentReports.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title={`Download CSV for ${selectedWeek}`}
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => downloadPDF(currentReports, selectedWeek)}
              disabled={currentReports.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title={`Download PDF for ${selectedWeek}`}
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Week Tabs */}
        {sortedWeekKeys.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-100 bg-white overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {sortedWeekKeys.map((weekKey) => (
                <button
                  key={weekKey}
                  onClick={() => setSelectedWeek(weekKey)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedWeek === weekKey
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {weekKey}
                  <span className={`ml-2 text-xs ${selectedWeek === weekKey ? 'text-blue-100' : 'text-gray-400'}`}>
                    ({groupedByWeek[weekKey].length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No reports found.</div>
        ) : (
          <div className="p-0">
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
                  {currentReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                        No reports for this week.
                      </td>
                    </tr>
                  ) : (
                    currentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingDates === report.id ? (
                            <div className="flex flex-col gap-1">
                              <input
                                type="date"
                                value={editForm.start}
                                onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                                className="text-xs p-1 border rounded"
                              />
                              <input
                                type="date"
                                value={editForm.end}
                                onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                                className="text-xs p-1 border rounded"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span>{report.week_start_date}</span>
                              {report.week_end_date && (
                                <span className="text-xs text-gray-400">to {report.week_end_date}</span>
                              )}
                            </div>
                          )}
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
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${report.status === 'submitted'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                          >
                            {report.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {editingDates === report.id ? (
                              <>
                                <button
                                  onClick={() => saveDates(report.id)}
                                  className="text-green-600 hover:text-green-900 p-1.5 rounded-full hover:bg-green-50"
                                  title="Save Dates"
                                >
                                  <Save className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setEditingDates(null)}
                                  className="text-gray-600 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-50"
                                  title="Cancel"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(report)}
                                  className="text-amber-600 hover:text-amber-900 p-1.5 rounded-full hover:bg-amber-50"
                                  title="Edit Dates"
                                >
                                  <Calendar className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setSelectedReport(report)}
                                  className="text-blue-600 hover:text-blue-900 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                  title="View Full Report"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(report.id)}
                                  className="text-red-600 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                  title="Delete Report"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
