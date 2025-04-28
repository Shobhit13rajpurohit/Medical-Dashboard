import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Users, Plus, Check, X, Trash2, AlertCircle, ArrowLeft, Search, UserCheck, Edit } from 'lucide-react';
import axios from 'axios';

// Define types based on the schemas
interface Visit {
  id: string;
  date: string;
  doctor_id: string;
  totalPatients: number;
}

interface Patient {
  id: string;
  name: string;
  contact: string;
  fee_status: string;
  visit_id: string;
  serial_no: number;
}

const API_BASE_URL = 'https://medical-backend-16ms.onrender.com';

const VisitPatients = () => {
  const { doctorId, visitId } = useParams<{ doctorId: string, visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [newPatient, setNewPatient] = useState({ name: '', contact: '', fee_status: 'due' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  
  // Add state for the edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', contact: '', fee_status: '' });
  
  const patientNameInputRef = useRef<HTMLInputElement>(null);
  const patientListRef = useRef<HTMLDivElement>(null);
  const lastPatientRef = useRef<HTMLTableRowElement>(null);

  // Function to focus on the patient name input
  const focusPatientNameInput = () => {
    if (patientNameInputRef.current) {
      patientNameInputRef.current.focus();
    }
  };

  // Function to scroll to the bottom of the patient list when needed
  useEffect(() => {
    if (shouldScrollToBottom && patientListRef.current && lastPatientRef.current) {
      lastPatientRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShouldScrollToBottom(false);
    }
  }, [patients, shouldScrollToBottom]);

  // Function to fetch visit details
  const fetchVisitDetail = async () => {
    if (!visitId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/visits/detail/${visitId}`, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      setVisit(response.data);
    } catch (error: any) {
      console.error("Error fetching visit detail:", error);
      
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("No response received from server.");
      } else {
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch patients for a visit
  const fetchPatients = async (scrollToBottom = false) => {
    if (!visitId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/${visitId}`, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const fetchedPatients = Array.isArray(response.data) ? response.data : [];
      
      // Ensure serial numbers are sequential (1, 2, 3...)
      // This fixes any gaps that might occur after deletions
      const patientsWithFixedSerials = fetchedPatients.map((patient, index) => ({
        ...patient,
        serial_no: index + 1
      }));
      
      setPatients(patientsWithFixedSerials);
      
      // Update serials on the server if they've changed
      fetchedPatients.forEach((patient, index) => {
        if (patient.serial_no !== index + 1) {
          updatePatientSerial(patient.id, index + 1);
        }
      });
      
      // Only set scroll flag if explicitly requested
      if (scrollToBottom) {
        setShouldScrollToBottom(true);
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("No response received from server.");
      } else {
        setError(`Request error: ${error.message}`);
      }
      
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to update patient serial numbers on the server
  const updatePatientSerial = async (patientId: string, newSerial: number) => {
    try {
      await axios.patch(`${API_BASE_URL}/patients/patient/${patientId}/serial`, 
        { serial_no: newSerial },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error updating patient serial:", error);
      // Silent failure - we don't want to disrupt the user experience
      // for this background operation
    }
  };

  // Load visit details and patients when component mounts
  useEffect(() => {
    if (visitId) {
      fetchVisitDetail();
      fetchPatients();
    }
  }, [visitId]);

  // Create a new patient for a visit
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitId) {
      setError("Visit ID is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/patients/${visitId}`, 
        newPatient,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setNewPatient({ name: '', contact: '', fee_status: 'due' });
      // Fetch patients AND scroll to bottom
      await fetchPatients(true);
      
      // Focus back on the patient name input after adding
      setTimeout(() => {
        focusPatientNameInput();
      }, 100);
    } catch (error: any) {
      console.error("Error adding patient:", error);
      
      if (error.response) {
        setError(`Failed to add patient: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("No response received. Please check your connection.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle patient fee status WITHOUT scrolling to bottom
  const toggleFeeStatus = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`${API_BASE_URL}/patients/patient/${patientId}`);
      await fetchPatients(false); // Don't scroll to bottom
    } catch (error: any) {
      console.error("Error toggling fee status:", error);
      
      if (error.response) {
        setError(`Failed to update fee status: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a patient WITHOUT scrolling to bottom
  const deletePatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/patients/patient/${patientId}`);
      await fetchPatients(false); // Don't scroll to bottom
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      
      if (error.response) {
        setError(`Failed to delete patient: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // New function to open edit modal
  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setEditFormData({
      name: patient.name,
      contact: patient.contact,
      fee_status: patient.fee_status
    });
    setShowEditModal(true);
  };

  // New function to handle edit form changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // New function to submit patient edits
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    setLoading(true);
    setError(null);
    try {
      await axios.put(
        `${API_BASE_URL}/patients/patient/${editingPatient.id}`,
        editFormData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setShowEditModal(false);
      await fetchPatients(false);
    } catch (error: any) {
      console.error("Error updating patient:", error);
      
      if (error.response) {
        setError(`Failed to update patient: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("No response received. Please check your connection.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filter function to search by serial, name, and fee status
  const filteredPatients = patients.filter(patient => 
    patient.serial_no.toString().includes(searchTerm) ||
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.fee_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate the dynamic height for patient list based on viewport
  // Using viewport height to make it responsive
  const getPatientListHeight = () => {
    // We'll use viewport units to make it responsive
    return {
      height: 'calc(100vh - 350px)',
      minHeight: '300px'
    };
  };

  // Function to determine responsive classes for the table
  const getTableClasses = () => {
    return "min-w-full table-auto";
  };

  // Function to handle table display on small screens
  const isSmallScreen = () => {
    // This would typically use a media query or window.innerWidth
    // For demonstration, we'll return false and handle this with CSS
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header Area */}
      <div className="bg-white p-3 md:p-4 shadow-sm sticky top-0 z-10">
        {/* Back button and page title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/doctors/${doctorId}/visits`)} 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors duration-200"
            >
              <ArrowLeft size={18} />
              <span className="text-sm md:text-base">Back</span>
            </button>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">
              {visit && visit.date ? (
                <div className="flex items-center gap-2">
                  <Calendar size={22} className="text-blue-600 hidden sm:inline" />
                  <span className="truncate">
                    Visit: {format(new Date(visit.date), 'MMM d, yyyy')}
                  </span>
                </div>
              ) : (
                'Patient List'
              )}
            </h1>
          </div>
          
          {/* Visit ID display */}
          <div className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Visit ID: <span className="font-mono">{visitId}</span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 flex items-start justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="line-clamp-2">{error}</span>
            </div>
            <button className="ml-2 font-bold" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && !patients.length && (
          <div className="text-center py-3 bg-blue-50 rounded mb-3 text-sm">
            <div className="animate-pulse">Loading...</div>
          </div>
        )}

        {/* Add patient form */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4">
          <form onSubmit={handleAddPatient} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input 
              type="text" 
              value={newPatient.name} 
              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} 
              placeholder="Patient Name" 
              className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-sm md:text-base" 
              required 
              disabled={loading}
              ref={patientNameInputRef}
            />
            <input 
              type="text" 
              value={newPatient.contact} 
              onChange={(e) => setNewPatient({...newPatient, contact: e.target.value})} 
              placeholder="Contact" 
              className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-sm md:text-base" 
              required 
              disabled={loading}
            />
            <button 
              type="submit" 
              className="bg-green-600 text-white px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-green-700 transition-colors duration-200 text-sm md:text-base"
              disabled={loading}
            >
              <Plus size={16} /> Add Patient
            </button>
          </form>
        </div>

        {/* Search bar with patient count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div className="relative flex-grow w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by serial, name or status"
              className="pl-10 p-2 border rounded w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Patient count summary */}
          <div className="bg-blue-50 px-3 py-1 rounded flex items-center gap-1 text-blue-800 w-full sm:w-auto text-sm whitespace-nowrap">
            <UserCheck size={16} />
            <span className="font-medium">Patients: <span className="text-blue-600">{patients.length}</span></span>
            {searchTerm && (
              <span className="text-gray-500 text-xs">
                (Showing {filteredPatients.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Patient List Area */}
      <div className="flex-1 overflow-auto p-3 md:p-4 pt-0">
        <div className="bg-white rounded-lg shadow-md">
          {patients.length > 0 ? (
            <div 
              ref={patientListRef}
              className="overflow-y-auto overflow-x-auto border rounded"
              style={getPatientListHeight()}
            >
              {/* For larger screens - Table view */}
              <div className="hidden md:block">
                <table className={getTableClasses()}>
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-gray-50 border-b">
                      <th className="py-2 px-3 text-left font-semibold text-sm">Serial</th>
                      <th className="py-2 px-3 text-left font-semibold text-sm">Name</th>
                      <th className="py-2 px-3 text-left font-semibold text-sm">Contact</th>
                      <th className="py-2 px-3 text-left font-semibold text-sm">Fee Status</th>
                      <th className="py-2 px-3 text-left font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <tr 
                        key={patient.id} 
                        className="border-b hover:bg-gray-50 transition-colors duration-150"
                        ref={index === filteredPatients.length - 1 ? lastPatientRef : null}
                      >
                        <td className="py-2 px-3 text-sm">{patient.serial_no}</td>
                        <td className="py-2 px-3 text-sm">{patient.name}</td>
                        <td className="py-2 px-3 text-sm">{patient.contact}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs ${patient.fee_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {patient.fee_status}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => toggleFeeStatus(patient.id)} 
                              className={`p-1 rounded ${patient.fee_status === 'paid' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} transition-colors duration-200`}
                              disabled={loading}
                              title={patient.fee_status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
                            >
                              {patient.fee_status === 'paid' ? <X size={14} /> : <Check size={14} />}
                            </button>
                            <button 
                              onClick={() => openEditModal(patient)} 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                              disabled={loading}
                              title="Edit patient"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Delete patient "${patient.name}"?`)) {
                                  deletePatient(patient.id);
                                }
                              }} 
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                              disabled={loading}
                              title="Delete patient"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* For mobile screens - Card view */}
              <div className="md:hidden">
                {filteredPatients.map((patient, index) => (
                  <div 
                    key={patient.id}
                    className="border-b p-3 hover:bg-gray-50"
                    ref={index === filteredPatients.length - 1 ? lastPatientRef : null}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">{patient.contact}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                          #{patient.serial_no}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${patient.fee_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {patient.fee_status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => toggleFeeStatus(patient.id)} 
                        className={`p-1.5 rounded ${patient.fee_status === 'paid' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} transition-colors duration-200 flex items-center gap-1 text-xs`}
                        disabled={loading}
                      >
                        {patient.fee_status === 'paid' ? <><X size={12} /> Unpaid</> : <><Check size={12} /> Paid</>}
                      </button>
                      <button 
                        onClick={() => openEditModal(patient)} 
                        className="p-1.5 bg-blue-100 text-blue-600 rounded transition-colors duration-200 flex items-center gap-1 text-xs"
                        disabled={loading}
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Delete patient "${patient.name}"?`)) {
                            deletePatient(patient.id);
                          }
                        }} 
                        className="p-1.5 bg-red-100 text-red-600 rounded transition-colors duration-200 flex items-center gap-1 text-xs"
                        disabled={loading}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded border">
              {loading ? (
                <div className="animate-pulse">Loading patients...</div>
              ) : (
                <>
                  <Users size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm">No patients added for this visit yet.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Patient Modal - Responsive version */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Edit size={18} className="text-blue-600" />
              Edit Patient
            </h2>
            
            <form onSubmit={handleUpdatePatient}>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="edit-name">
                  Patient Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-sm"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="edit-contact">
                  Contact
                </label>
                <input
                  id="edit-contact"
                  type="text"
                  name="contact"
                  value={editFormData.contact}
                  onChange={handleEditFormChange}
                  className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-sm"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="edit-fee-status">
                  Fee Status
                </label>
                <select
                  id="edit-fee-status"
                  name="fee_status"
                  value={editFormData.fee_status}
                  onChange={handleEditFormChange}
                  className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none text-sm"
                  required
                >
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitPatients;
