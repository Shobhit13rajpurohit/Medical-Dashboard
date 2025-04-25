import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Users, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Define types based on the schemas
interface Visit {
  id: string;
  date: string;
  doctor_id: string;
  totalPatients: number;
}

const API_BASE_URL = 'https://medical-backend-16ms.onrender.com';

const DoctorVisits = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch visits
  const fetchVisits = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching visits for doctor ID: ${doctorId}`);
      const response = await axios.get(`${API_BASE_URL}/visits/${doctorId}`, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("Visits API Response:", response.data);
      setVisits(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Error fetching visits:", error);
      
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("No response received from server. Check if the backend is running.");
      } else {
        setError(`Request error: ${error.message}`);
      }
      
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  // Load visits when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchVisits();
    }
  }, [doctorId]);

  // Create a new visit
  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !newVisitDate) {
      setError("Doctor ID and date are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Creating new visit for doctor ID: ${doctorId}, date: ${newVisitDate}`);
      const response = await axios.post(`${API_BASE_URL}/visits/${doctorId}`, 
        { date: newVisitDate },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log("New visit created:", response.data);
      setIsModalOpen(false);
      setNewVisitDate('');
      await fetchVisits(); // Refresh visits
    } catch (error: any) {
      console.error("Error creating visit:", error);
      
      if (error.response) {
        setError(`Failed to create visit: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("No response received. Please check your connection.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a visit and its patients
  const deleteVisit = async (visitId: string) => {
    if (!window.confirm("This will delete the visit and ALL associated patients. Are you sure?")) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Deleting visit ID: ${visitId}`);
      await axios.delete(`${API_BASE_URL}/visits/${visitId}`);
      
      console.log("Visit deleted successfully");
      await fetchVisits(); // Refresh visits
    } catch (error: any) {
      console.error("Error deleting visit:", error);
      
      if (error.response) {
        setError(`Failed to delete visit: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to patient list page when a visit is clicked
  const handleVisitClick = (visitId: string) => {
    navigate(`/doctors/${doctorId}/visits/${visitId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctor Visits</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/doctors`)} 
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            disabled={loading}
          >
            Back to Doctors
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            disabled={loading}
          >
            <Plus size={20} /> Add Visit
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button className="ml-4 font-bold" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 bg-blue-50 rounded mb-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visits.length > 0 ? (
          visits.map((visit) => (
            <div 
              key={visit.id} 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-colors hover:shadow-lg"
            >
              <div 
                className="flex justify-between items-start"
                onClick={() => handleVisitClick(visit.id)}
              >
                <div className="flex items-center gap-3 text-blue-600 mb-3">
                  <Calendar size={24} />
                  <span className="text-lg font-semibold">{format(new Date(visit.date), 'MMMM d, yyyy')}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteVisit(visit.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  title="Delete visit"
                  disabled={loading}
                >
                  <span className="sr-only">Delete</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div 
                className="flex items-center gap-2 text-gray-600"
                onClick={() => handleVisitClick(visit.id)}
              >
                <Users size={20} />
                <span>{visit.totalPatients} Patients</span>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="col-span-3 text-center py-10 bg-gray-50 rounded">
              <Users size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No visits found. Add a new visit to get started.</p>
            </div>
          )
        )}
      </div>

      {/* Add Visit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Visit</h2>
            <form onSubmit={handleAddVisit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input 
                  type="date" 
                  value={newVisitDate} 
                  onChange={(e) => setNewVisitDate(e.target.value)} 
                  className="mt-1 block w-full p-2 border rounded" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVisits;