import { WeeklyReport } from '../lib/types';
import { X, Calendar, User, Briefcase, FileCheck } from 'lucide-react';

interface ReportModalProps {
    report: WeeklyReport;
    onClose: () => void;
}

export function ReportModal({ report, onClose }: ReportModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Weekly Report Details</h2>
                        <p className="text-sm text-gray-500 mt-1">Full summary and progress overview</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                            <div className="bg-blue-100 p-3 rounded-md text-blue-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Lead Name</p>
                                <p className="text-lg font-bold text-gray-900">{report.user_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                            <div className="bg-purple-100 p-3 rounded-md text-purple-600">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Committee</p>
                                <p className="text-lg font-bold text-gray-900">{report.committee}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                            <div className="bg-green-100 p-3 rounded-md text-green-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Reporting Date</p>
                                <p className="text-lg font-bold text-gray-900">{report.week_start_date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                            <div className="bg-orange-100 p-3 rounded-md text-orange-600">
                                <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Status</p>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${report.status === 'submitted' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                                    }`}>
                                    {report.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Report Sections */}
                    <div className="space-y-6">
                        <section className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Work Summary
                            </h3>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{report.summary}</p>
                        </section>

                        <section className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                Faculty Meeting Summary
                            </h3>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{report.challenges}</p>
                        </section>

                        <section className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                Plans for Next Week / Pending Work
                            </h3>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{report.plans_for_next_week}</p>
                        </section>

                        {report.remarks && (
                            <section className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                                    Additional Remarks
                                </h3>
                                <p className="text-gray-800 leading-relaxed italic">"{report.remarks}"</p>
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md active:scale-95"
                    >
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
}
