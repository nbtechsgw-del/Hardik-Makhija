import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Register from './pages/Register';
import Signup from './pages/Signup';
import Billing from './pages/Billing';
import Doctor from './pages/Doctor';
import Login from './pages/Login';
import Admission from './pages/Admission';

function App() {
    return ( <
        AuthProvider >
        <
        Router >
        <
        div className = "min-h-screen bg-slate-50 flex flex-col font-sans" >

        <
        Navbar / >

        <
        main className = "flex-grow" >
        <
        Routes >
        <
        Route path = "/login"
        element = { < Login / > }
        /> <
        Route path = "/signup"
        element = { < Signup / > }
        /> <
        Route path = "/dashboard"
        element = { < ProtectedRoute > < Dashboard / > < /ProtectedRoute>} / >
            <
            Route path = "/"
            element = { < Navigate to = "/dashboard" / > }
            /> <
            Route path = "/search"
            element = { <
                ProtectedRoute >
                <
                Search / >
                <
                /ProtectedRoute>
            }
            /> <
            Route path = "/register"
            element = { <
                ProtectedRoute >
                <
                Register / >
                <
                /ProtectedRoute>
            }
            /> <
            Route path = "/admission"
            element = { <
                ProtectedRoute >
                <
                Admission / >
                <
                /ProtectedRoute>
            }
            /> <
            Route path = "/billing"
            element = { <
                ProtectedRoute >
                <
                Billing / >
                <
                /ProtectedRoute>
            }
            /> <
            Route path = "/doctor"
            element = { <
                ProtectedRoute >
                <
                Doctor / >
                <
                /ProtectedRoute>
            }
            /> <
            Route path = "*"
            element = { < Navigate to = "/dashboard" / > }
            /> <
            /Routes> <
            /main>

            <
            footer className = "bg-white border-t border-slate-200 py-4 text-center text-slate-400 text-sm" >
            &
            copy; { new Date().getFullYear() }
            CPRMS - Hospital Management System <
            /footer>

            <
            /div> <
            /Router> <
            /AuthProvider>
        );
    }

    export default App;