import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { cn } from '../lib/utils';
import { Send, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmitReport() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Default to today
    const defaultWeekStart = format(new Date(), 'yyyy-MM-dd');

    const [formData, setFormData] = useState({
        week_start_date: defaultWeekStart,
        summary: '',
        challenges: '',
        plans_for_next_week: '',
        remarks: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError(null);

        try {
            const { error } = await store.submitReport({
                user_id: user.id,
                user_name: user.full_name,
                committee: user.committee,
                ...formData
            });

            if (error) {
                setError(error);
            } else {
                setSuccess(true);
                // Redirect after short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-lg min-h-[50vh]">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-green-800">Report Submitted!</h2>
                <p className="text-green-600 mt-2">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Submit Weekly Report</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {user?.full_name} • {user?.committee} Team
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                {/* Date Section */}
                <div>
                    <label htmlFor="week_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Reporting Date
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="date"
                            name="week_start_date"
                            id="week_start_date"
                            required
                            readOnly
                            value={formData.week_start_date}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm p-2 border"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">The date of the report.</p>
                </div>

                {/* Summary */}
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                        Work Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="summary"
                        id="summary"
                        rows={4}
                        required
                        placeholder="Key achievements and tasks completed this week..."
                        value={formData.summary}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                    />
                </div>

                {/* Challenges */}
                <div>
                    <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-1">
                        Faculty Meeting Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="challenges"
                        id="challenges"
                        rows={3}
                        required
                        placeholder="Points to discuss in faculty meet..."
                        value={formData.challenges}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                    />
                </div>

                {/* Plans */}
                <div>
                    <label htmlFor="plans_for_next_week" className="block text-sm font-medium text-gray-700 mb-1">
                        Plans for Next Week / Pending Work <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="plans_for_next_week"
                        id="plans_for_next_week"
                        rows={3}
                        required
                        placeholder="Goals and priorities for the upcoming week..."
                        value={formData.plans_for_next_week}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                    />
                </div>

                {/* Remarks */}
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Remarks (Optional)
                    </label>
                    <input
                        type="text"
                        name="remarks"
                        id="remarks"
                        placeholder="Any other comments..."
                        value={formData.remarks}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                            "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all",
                            submitting && "opacity-75 cursor-not-allowed"
                        )}
                    >
                        {submitting ? 'Submitting...' : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Submit Report
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
