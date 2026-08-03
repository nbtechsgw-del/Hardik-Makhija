import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const hiddenPaths = ['/login', '/signup'];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const linkClass = ({ isActive }) =>
    `transition pb-1 hover:text-slate-200 ${isActive ? 'border-b-2 border-white' : ''}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="relative z-50 bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 text-white shadow-xl">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-xl font-bold tracking-widest text-white shadow-sm shadow-slate-900/20">
            CP
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">CPRMS Healthcare</p>
            <p className="text-base font-semibold text-white">Patient Records Dashboard</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admission" className={linkClass}>
            Admissions
          </NavLink>
          <NavLink to="/search" className={linkClass}>
            Search Records
          </NavLink>
          <NavLink to="/register" className={linkClass}>
            Register Patient
          </NavLink>
          <NavLink to="/billing" className={linkClass}>
            Billing
          </NavLink>
          <NavLink to="/doctor" className={linkClass}>
            Doctor Portal
          </NavLink>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 text-sm text-slate-100">
          <div>
            <p className="font-semibold">CPRMS System</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
