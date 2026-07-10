import { useAuth } from '../../context/AuthContext';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Task Manager <span className="text-indigo-400">Pro</span></h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <UserCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          id="logout-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
