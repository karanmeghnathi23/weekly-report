import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { WeeklyReport } from '../lib/types';

export default function Dashboard() {
    const { user } = useAuth();
    const [reports, setReports] = useState<WeeklyReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (!user) return;
            const data = await store.getReports(user);
            setReports(data);
            setLoading(false);
        };
        fetchReports();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                {user?.role !== 'member' && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {user?.committee} Team
                    </span>
                )}
            </div>

            {loading ? (
                <div className="text-center py-10">Loading reports...</div>
            ) : reports.length === 0 ? (
                <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-100">
                    <p className="text-gray-500">No reports submitted yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map(report => (
                        <div key={report.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{report.user_name}</h3>
                                    <p className="text-xs text-gray-500">{report.committee}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                    {report.status}
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 mb-3">
                                Week of {report.week_start_date}
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                                {report.summary}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
