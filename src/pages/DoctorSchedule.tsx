import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, X, Calendar, Phone, User, AlertCircle, Stethoscope,  Edit } from 'lucide-react';
import axios from 'axios';

// Interface to match backend response structure from schemas.py DoctorScheduleResponse
interface DoctorSchedule {
  id: number;
  name: string;
  specialization: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  specific_date: string | null;
  contact_number: string | null;
  image_filename: string | null;
}

// Interface for creating/updating schedules
interface ScheduleFormData {
  name: string;
  specialization: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  specific_date: string | null;
  contact_number: string | null;
  image?: File | null;
}

const API_URL = 'https://medical-backend-16ms.onrender.com';

const DoctorSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [useSpecificDate, setUseSpecificDate] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleFormData>({
    name: '',
    specialization: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    is_available: true,
    specific_date: null,
    contact_number: null
  });
  const [editMode, setEditMode] = useState<'create' | 'update'>('create');
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Format time from 24-hour to 12-hour
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Fetch schedules data
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/schedules`);
      setSchedules(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load doctor schedules. Please try again later.');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load schedules on component mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setCurrentSchedule({
        ...currentSchedule,
        image: file
      });
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal to add a new schedule  
  const handleAddNewClick = () => {
    setCurrentSchedule({
      name: '',
      specialization: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      is_available: true,
      specific_date: null,
      contact_number: null,
    });
    setPreviewImage(null);
    setUseSpecificDate(false);
    setEditMode('create');
    setCurrentScheduleId(null);
    setShowScheduleModal(true);
  };

  // Open modal to edit an existing schedule
  const handleEditSchedule = (schedule: DoctorSchedule) => {
    setCurrentSchedule({
      name: schedule.name,
      specialization: schedule.specialization,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_available: schedule.is_available,
      specific_date: schedule.specific_date,
      contact_number: schedule.contact_number
    });
    setPreviewImage(schedule.image_filename ? `${API_URL}/uploads/doctors/${schedule.image_filename}` : null);
    setUseSpecificDate(!!schedule.specific_date);
    setEditMode('update');
    setCurrentScheduleId(schedule.id);
    setShowScheduleModal(true);
  };

  // Submit form - handle both create and update cases
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create FormData for multipart/form-data request (to handle file upload)
      const formData = new FormData();
      formData.append('name', currentSchedule.name);
      formData.append('specialization', currentSchedule.specialization);
      formData.append('day_of_week', useSpecificDate ? '' : currentSchedule.day_of_week);
      formData.append('start_time', currentSchedule.start_time);
      formData.append('end_time', currentSchedule.end_time);
      formData.append('is_available', String(currentSchedule.is_available));
      
      if (useSpecificDate && currentSchedule.specific_date) {
        formData.append('specific_date', currentSchedule.specific_date);
      }
      if (currentSchedule.contact_number) {
        formData.append('contact_number', currentSchedule.contact_number);
      }
      if (currentSchedule.image) {
        formData.append('image', currentSchedule.image);
      }
      
      let response;
      
      if (editMode === 'create') {
        // Create new schedule
        response = await axios.post(`${API_URL}/schedules/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        setSchedules([...schedules, response.data]);
      } else {
        // Update existing schedule
        response = await axios.put(`${API_URL}/schedules/${currentScheduleId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        // Update schedules array
        setSchedules(schedules.map(schedule => 
          schedule.id === currentScheduleId ? response.data : schedule
        ));
      }
      
      setShowScheduleModal(false);
      
    } catch (err) {
      const errorMessage = editMode === 'create' 
        ? 'Failed to create schedule. Please try again.' 
        : 'Failed to update schedule. Please try again.';
      
      console.error(errorMessage, err);
      alert(errorMessage);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`${API_URL}/schedules/${scheduleId}`);
        setSchedules(schedules.filter(s => s.id !== scheduleId));
      } catch (err) {
        console.error('Error deleting schedule:', err);
        alert('Failed to delete schedule. Please try again.');
      }
    }
  };

  // Loading state
  if (loading && schedules.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading doctor schedules...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Doctor Schedules
        </h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'View Mode' : 'Edit Mode'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-3 mb-6">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={20} />
            <h2 className="text-xl font-medium">Available Schedules</h2>
          </div>
          {isEditing && (
            <button
              onClick={handleAddNewClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Schedule
            </button>
          )}
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="mb-4">
              <Calendar size={48} className="mx-auto text-gray-400" />
            </div>
            <p>No doctor schedules found.</p>
            {isEditing && (
              <button
                onClick={handleAddNewClick}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Add your first doctor schedule
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {schedule.image_filename ? (
                      <img 
                        src={`${API_URL}/uploads/doctors/${schedule.image_filename}`} 
                        alt={schedule.name} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{schedule.name}</h3>
                      <div className="flex items-center text-blue-600 mb-3">
                        <Stethoscope className="h-4 w-4 mr-1" />
                        <span>{schedule.specialization}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="bg-blue-50 px-2 py-1 rounded text-sm">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </span>
                        </div>
                        
                        {schedule.specific_date ? (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">{formatDate(schedule.specific_date)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">Weekly on {schedule.day_of_week}</span>
                          </div>
                        )}
                        
                        {schedule.contact_number && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">{schedule.contact_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit schedule"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete schedule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* {!isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 transform hover:scale-105 active:scale-95">
                        Book Appointment
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal - For Add and Edit */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editMode === 'create' ? 'Add Doctor Schedule' : 'Edit Doctor Schedule'}
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                <input
                  type="text"
                  value={currentSchedule.name}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input
                  type="text"
                  value={currentSchedule.specialization}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, specialization: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={currentSchedule.contact_number || ''}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, contact_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor Image</label>
                <div className="mt-1 flex items-center gap-4">
                  {previewImage && (
                    <img 
                      src={previewImage} 
                      alt="Doctor preview" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useSpecificDate"
                  checked={useSpecificDate}
                  onChange={() => setUseSpecificDate(!useSpecificDate)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useSpecificDate" className="ml-2 block text-sm text-gray-900">
                  Schedule for a specific date
                </label>
              </div>
              
              {useSpecificDate ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={currentSchedule.specific_date || ''}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, specific_date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required={useSpecificDate}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                  <select
                    value={currentSchedule.day_of_week}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, day_of_week: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required={!useSpecificDate}
                  >
                    <option value="">Select a day</option>
                    {weekDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={currentSchedule.start_time}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, start_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={currentSchedule.end_time}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, end_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={currentSchedule.is_available}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, is_available: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                  Schedule is available for booking
                </label>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editMode === 'create' ? 'Add Schedule' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;