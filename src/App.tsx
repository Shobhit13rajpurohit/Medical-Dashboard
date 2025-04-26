import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DoctorsList from './pages/DoctorsList';
import DoctorVisits from './pages/DoctorVisits';
import VisitPatients from './pages/VisitPatients'; 
import TotalPatients from './pages/TotalPatients';
import Feedback from './pages/Feedback';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import ShopGallery from './pages/ShopGallery';
import DoctorSchedule from './pages/DoctorSchedule';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 lg:ml-64 bg-gray-100 min-h-screen">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/doctors" element={<DoctorsList />} />
                  <Route path="/doctors/:doctorId/visits" element={<DoctorVisits />} />
                  <Route path="/doctors/:doctorId/visits/:visitId" element={<VisitPatients />} />
                  <Route path="/total-patients" element={<TotalPatients />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/shop/gallery" element={<ShopGallery />} />
                  <Route path="/doctor-schedule" element={<DoctorSchedule />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
