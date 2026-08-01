import { ToastContainer} from 'react-toastify';
import{ BrowserRouter, Routes,Route } from "react-router-dom";
import Guard from "./Guard";
import {lazy} from 'react';
import {Suspense} from 'react';
import Loader from './components/Shared/Loader';

const Adminlayout= lazy(() => import("./components/Admin/Adminlayout"));
const PageNotFound= lazy(() => import("./components/PageNotFound"));
const Signup = lazy(() => import("./components/Home/Signup"));
const Userlayout = lazy(() => import("./components/User/Userlayout"));
const ForgotPassword = lazy(() => import("./components/Home/ForgotPassword"));
const Homepage = lazy(() => import("./components/Home"));
const Dashboard = lazy(() => import("./components/Shared/Dashboard"));
const Report = lazy(() => import("./components/Shared/Report"));
const Transactions = lazy(() => import("./components/Shared/Transactions"));
const Users = lazy(() => import("./components/Shared/Users"));
const Settings = lazy(() => import("./components/Admin/Settings"));
const Analytics = lazy(() => import("./components/Admin/Analytics"));
const ExportTransactions = lazy(() => import("./components/Admin/Export"));


const App = () => {
  return (
    <BrowserRouter>
    <Suspense fallback={<Loader/>}>
    <Routes>
      <Route path="/" element={<Homepage/>}/>
            <Route path="/Signup" element={<Signup/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            {/* Admin related Routes */}
            <Route path="/app/admin"
            element= {<Guard
                endpoint="/api/user/session"
                role="admin"

            >
              <Adminlayout/>
            </Guard>}
            >
            <Route index element={<Dashboard/>}/>
                        <Route path="dashboard" element={<Dashboard/>}/>

            <Route path="report" element={<Report/>}/>
            <Route path="export" element={<ExportTransactions/>}/>
            <Route path="transactions" element={<Transactions/>}/>
            <Route path="analytics" element={<Analytics/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="users" element={<Users/>}/>
            </Route>
            


                        {/* User related Routes */}


            <Route path="/app/user"
            element= {<Guard
                endpoint="/api/user/session"
                role="user"

            >
              <Userlayout/>
            </Guard>}
            >
            <Route index element={<Dashboard/>}/>
                        <Route path="dashboard" element={<Dashboard/>}/>

            <Route path="report" element={<Report/>}/>
            <Route path="transactions" element={<Transactions/>}/>
            </Route>
                        <Route path="/*" element={<PageNotFound/>}/>


    </Routes>
    </Suspense>
    <ToastContainer/>
    </BrowserRouter>
  )
}
export default App;