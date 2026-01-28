import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, FileText, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = () => {
        signOut();
        navigate('/login');
    };

    const navItemClass = (path: string) =>
        clsx(
            "flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-colors",
            location.pathname === path
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
        );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar for Desktop / Bottom Nav for Mobile */}

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800">WeeklyReport</h1>
                    <p className="text-xs text-gray-500 mt-1">Welcome, {user?.full_name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link to="/dashboard" className={navItemClass('/dashboard')}>
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                    </Link>

                    {user?.role === 'lead' && (
                        <Link to="/submit" className={navItemClass('/submit')}>
                            <FileText className="mr-3 h-5 w-5" />
                            Submit Report
                        </Link>
                    )}

                    {user?.role === 'admin' && (
                        <Link to="/admin" className={navItemClass('/admin')}>
                            <Settings className="mr-3 h-5 w-5" />
                            Admin
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
                <span className="font-bold text-lg">WeeklyReport</span>
                <button onClick={handleSignOut} className="p-2 text-gray-500">
                    <LogOut className="h-5 w-5" />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
                <Outlet />
            </main>

            {/* Bottom Nav (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-20 pb-safe">
                <Link to="/dashboard" className="flex flex-col items-center p-2 text-gray-600">
                    <LayoutDashboard className={clsx("h-6 w-6", location.pathname === '/dashboard' && "text-blue-600")} />
                    <span className="text-xs mt-1">Dash</span>
                </Link>

                {user?.role === 'lead' && (
                    <Link to="/submit" className="flex flex-col items-center p-2 text-gray-600">
                        <FileText className={clsx("h-6 w-6", location.pathname === '/submit' && "text-blue-600")} />
                        <span className="text-xs mt-1">Submit</span>
                    </Link>
                )}

                {user?.role === 'admin' && (
                    <Link to="/admin" className="flex flex-col items-center p-2 text-gray-600">
                        <Settings className={clsx("h-6 w-6", location.pathname === '/admin' && "text-blue-600")} />
                        <span className="text-xs mt-1">Admin</span>
                    </Link>
                )}
            </nav>
        </div>
    );
}
