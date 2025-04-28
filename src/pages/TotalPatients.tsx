import React, { useState, useEffect } from 'react';
import { Users, Calendar, Search, UserCircle } from 'lucide-react';
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
          id: patient.id || '',
          name: patient.name || '',
          contact: patient.contact || '',
          doctor_visits: Array.isArray(patient.doctor_visits) 
            ? patient.doctor_visits 
            : (Array.isArray(patient.doctorVisits) ? patient.doctorVisits : [])
        }));
        
        setUniquePatients(patientsWithValidData);
        
        // Fetch all visits with error handling
        try {
          let allVisits: Visit[] = [];
          const fetchPromises = doctorsResponse.data.map((doctor: Doctor) => 
            axios.get(`${API_BASE_URL}/visits/${doctor.id}`)
              .then(response => {
                allVisits = [...allVisits, ...response.data];
              })
              .catch(err => {
                console.error(`Error fetching visits for doctor ${doctor.id}:`, err);
                // Continue with other doctors even if one fails
              })
          );
          
          await Promise.all(fetchPromises);
          setVisits(allVisits);
        } catch (err) {
          console.error('Error fetching visits:', err);
          // Continue with partial data
        }
        
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

  // Function to safely render doctor image with fallback
  const renderDoctorImage = (doctor: Doctor, size: "small" | "large") => {
    try {
      const imgClasses = size === "large" 
        ? "w-16 h-16 rounded-full object-cover" 
        : "h-6 w-6 rounded-full mr-2";
      
      return doctor.image_filename ? (
        <img
          src={`${API_BASE_URL}/doctors/images/${doctor.image_filename}`}
          alt={doctor.name}
          className={imgClasses}
          onError={(e) => {
            // Replace with fallback icon on error
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <UserCircle className={`${size === "small" ? "h-6 w-6 mr-2" : "w-16 h-16"} text-gray-400`} />
      );
    } catch (error) {
      return <UserCircle className={`${size === "small" ? "h-6 w-6 mr-2" : "w-16 h-16"} text-gray-400`} />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-64">
        <div className="text-lg md:text-xl font-semibold">Loading patient data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-64">
        <div className="text-lg md:text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Total Patients</h1>
      
      {/* Stats cards for each doctor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {doctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              {renderDoctorImage(doctor, "large")}
              <UserCircle className="w-16 h-16 text-gray-400 hidden" />
              <div>
                <h3 className="text-base md:text-lg font-semibold">{doctor.name}</h3>
                <p className="text-sm md:text-base text-gray-600">{doctor.specialization}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-600 gap-2">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span className="text-sm md:text-base">{getUniquePatientCount(doctor.id)} Unique Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="text-sm md:text-base">{getTotalVisits(doctor.id)} Visits</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient list with search and filter */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-9 md:h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
          <div className="w-full sm:w-48 md:w-64">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full h-9 md:h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm md:text-base"
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
        <div className="mb-4 flex items-center gap-2 text-base md:text-lg font-semibold">
          <Users size={22} />
          <span>Total Unique Patients: {uniquePatients.length}</span>
        </div>

        {/* Patients table */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visited Doctors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={`${patient.id || `${patient.name}-${patient.contact}`}`}>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm">
                      {patient.name}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm">
                      {patient.contact}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {patient.doctor_visits.map(doctorId => {
                          const doctor = doctors.find(d => d.id === doctorId);
                          return doctor ? (
                            <div key={doctorId} className="flex items-center bg-gray-100 rounded-full p-1 pr-2 md:pr-3 text-xs md:text-sm">
                              {renderDoctorImage(doctor, "small")}
                              <UserCircle className="h-6 w-6 mr-1 text-gray-400 hidden" />
                              <span>{doctor.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500 text-sm">
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
