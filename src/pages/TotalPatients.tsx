import React, { useState, useEffect } from 'react';
import { Users, Calendar, Search } from 'lucide-react';
import axios from 'axios';

// Define types
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  image_filename: string | null;
}

interface Visit {
  id: string;
  doctor_id: string;
  date: string;
  totalPatients: number;
}

interface UniquePatient {
  id: string;
  name: string;
  contact: string;
  // fee_status: string;
  doctor_visits: string[];
}

const API_BASE_URL = 'https://medical-backend-16ms.onrender.com';

const TotalPatients: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [uniquePatients, setUniquePatients] = useState<UniquePatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctors
        const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors/`);
        setDoctors(doctorsResponse.data);
        
        // Fetch unique patients
        const patientsResponse = await axios.get(`${API_BASE_URL}/patients/unique/`);
        
        // Make sure all required properties exist
        const patientsWithValidData = patientsResponse.data.map((patient: any) => ({
          ...patient,
          // Handle potential property name inconsistencies
          id: patient.id || '',
          name: patient.name || '',
          contact: patient.contact || '',
          // Handle both potential naming conventions (fee_status or feeStatus)
          // fee_status: patient.fee_status || patient.feeStatus || 'unknown',
          // Handle both potential naming conventions (doctor_visits or doctorVisits)
          doctor_visits: Array.isArray(patient.doctor_visits) 
            ? patient.doctor_visits 
            : (Array.isArray(patient.doctorVisits) ? patient.doctorVisits : [])
        }));
        
        setUniquePatients(patientsWithValidData);
        
        // Fetch all visits for all doctors
        let allVisits: Visit[] = [];
        for (const doctor of doctorsResponse.data) {
          const visitsResponse = await axios.get(`${API_BASE_URL}/visits/${doctor.id}`);
          allVisits = [...allVisits, ...visitsResponse.data];
        }
        setVisits(allVisits);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Get unique patient count for a specific doctor
  const getUniquePatientCount = (doctorId: string) => {
    return uniquePatients.filter(patient => 
      patient && patient.doctor_visits && patient.doctor_visits.includes(doctorId)
    ).length;
  };

  // Get total visits for a specific doctor
  const getTotalVisits = (doctorId: string) => {
    return visits.filter(v => v.doctor_id === doctorId).length;
  };

  // Filter patients based on search term and selected doctor
  const filteredPatients = uniquePatients.filter(patient => {
    // Skip undefined patients or those without doctor_visits
    if (!patient || !patient.doctor_visits) return false;
    
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.includes(searchTerm);
    const matchesDoctor = 
      selectedDoctor === 'all' || 
      patient.doctor_visits.includes(selectedDoctor);
    return matchesSearch && matchesDoctor;
  });

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-64">
      <div className="text-xl font-semibold">Loading patient data...</div>
    </div>;
  }

  if (error) {
    return <div className="p-6 flex justify-center items-center h-64">
      <div className="text-xl font-semibold text-red-500">{error}</div>
    </div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Total Patients</h1>
      
      {/* Stats cards for each doctor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {doctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`${API_BASE_URL}/doctors/images/${doctor.image_filename}`} 
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.specialization}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>{getUniquePatientCount(doctor.id)} Unique Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>{getTotalVisits(doctor.id)} Visits</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient list with search and filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total unique patients count */}
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Users size={24} />
          <span>Total Unique Patients: {uniquePatients.length}</span>
        </div>

        {/* Patients table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visited Doctors
                </th>
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={`${patient.name}-${patient.contact}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.contact}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {patient.doctor_visits.map(doctorId => {
                          const doctor = doctors.find(d => d.id === doctorId);
                          return doctor ? (
                            <div key={doctorId} className="flex items-center bg-gray-100 rounded-full p-1 pr-3">
                              <img
                                src={`${API_BASE_URL}/doctors/images/${doctor.image_filename}`} 
                                alt={doctor.name}
                                className="h-6 w-6 rounded-full mr-2"
                              />
                              <span className="text-sm">{doctor.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No patients found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalPatients;