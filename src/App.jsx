import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Layout from "./Pages/Layout";
import AllDoctors from "./Pages/AllDoctors";
import { ToastContainer } from "react-toastify";
import AdminLayout from "./admin/AdminLayout";
import DoctorsList from "./admin/DoctorsList";
import AllManagers from "./admin/AllManagers";
import AdminDashboard from "./admin/adminDashboard";
import AllDoctorsList from "./admin/AllDoctorsList";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/all-doctors" element={<AllDoctors />} />
          </Route>


          <Route element={<AdminLayout/>}>
            <Route path="/doctors/:id" element={<DoctorsList/>}/>
            <Route path="/all-managers" element={<AllManagers/>}/>
            <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
            <Route path="/all-doctors-list" element={<AllDoctorsList />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />



    </>
  );
}

export default App;
