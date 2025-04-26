import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Calendar, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  image_filename: string | null;
}

const DoctorsList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Base URL for API
  const API_BASE_URL = 'https://medical-backend-16ms.onrender.com';
  
  // Define consistent image paths
  const IMAGE_PATH = `${API_BASE_URL}/uploads/doctor_images/`;

  
  const fetchDoctors = () => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/doctors`)
      .then((response) => {
        console.log("API Response:", response.data);
        setDoctors(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      phone: doctor.phone
    });
    // Set image preview if the doctor has an image - use consistent path
    if (doctor.image_filename) {
      setImagePreview(`${IMAGE_PATH}${doctor.image_filename}`);
    } else {
      setImagePreview(null);
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setFormData({ name: '', specialization: '', phone: '' });
    setSelectedImage(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (doctorId: string) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/doctors/${doctorId}`);
        setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('phone', formData.phone);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      if (selectedDoctor) {
        // Update existing doctor
        await axios.put(
          `${API_BASE_URL}/doctors/${selectedDoctor.id}`, 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // Create new doctor
        await axios.post(
          `${API_BASE_URL}/doctors`, 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      
      // Fetch the updated list of doctors
      fetchDoctors();
      
      // Close the modal and reset form
      setIsModalOpen(false);
      setFormData({ name: '', specialization: '', phone: '' });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert("Failed to save doctor");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            break;
          }
        }
      }
    }
  };

  // Image loading fallback handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.target as HTMLImageElement;
    imgElement.style.display = 'none'; // Hide the broken image
    
    // Get the parent element which should be the container div
    const container = imgElement.parentElement;
    if (container) {
      // Create a fallback div
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center';
      
      // Add text to the fallback div
      const textSpan = document.createElement('span');
      textSpan.className = 'text-gray-500';
      textSpan.textContent = 'No Image';
      
      fallbackDiv.appendChild(textSpan);
      container.appendChild(fallbackDiv);
    }
  };

  return (
    <div className="w-full p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Doctors</h1>
        <button 
          onClick={handleAdd} 
          className="w-full sm:w-auto bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isLoading}
        >
          <Plus size={18} /> <span>Add Doctor</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="relative w-full pt-[56.25%]">
              {doctor.image_filename ? (
                <img 
                 src={`${API_BASE_URL}/uploads/doctor_images/${doctor.image_filename}`}

                  alt={doctor.name} 
                  className="absolute top-0 left-0 w-full h-full object-cover" 
                  onError={handleImageError}
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 flex-grow">
              <h3 className="text-lg sm:text-xl font-semibold line-clamp-1">{doctor.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{doctor.specialization}</p>
              <p className="text-gray-500 text-sm sm:text-base">{doctor.phone}</p>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleEdit(doctor)} 
                  className="text-blue-600 hover:bg-blue-50 rounded px-2 py-1 text-sm flex items-center gap-1 disabled:text-blue-400"
                  disabled={isLoading}
                >
                  <Edit size={16} /> <span className="hidden xs:inline">Edit</span>
                </button>
                <button 
                  onClick={() => navigate(`/doctors/${doctor.id}/visits`)} 
                  className="text-green-600 hover:bg-green-50 rounded px-2 py-1 text-sm flex items-center gap-1 disabled:text-green-400"
                  disabled={isLoading}
                >
                  <Calendar size={16} /> <span className="hidden xs:inline">Visits</span>
                </button>
                <button 
                  onClick={() => handleDelete(doctor.id)} 
                  className="text-red-600 hover:bg-red-50 rounded px-2 py-1 text-sm flex items-center gap-1 ml-auto disabled:text-red-400"
                  disabled={isLoading}
                >
                  <Trash2 size={16} /> <span className="hidden xs:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full p-2 border rounded" 
                required 
                disabled={isLoading}
              />
              <input 
                type="text" 
                placeholder="Specialization" 
                value={formData.specialization} 
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} 
                className="w-full p-2 border rounded" 
                required 
                disabled={isLoading}
              />
              <input 
                type="tel" 
                placeholder="Phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                className="w-full p-2 border rounded" 
                required 
                disabled={isLoading}
              />
              
              {/* Image Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => !isLoading && fileInputRef.current?.click()}
                onDrop={handleImageDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-32 sm:h-40 mx-auto object-contain" />
                    <button 
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:bg-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoading) {
                          setImagePreview(null);
                          setSelectedImage(null);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={28} className="text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      Click to select an image, or drag and drop, paste
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports: JPEG, PNG, GIF, WEBP
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm sm:text-base disabled:text-gray-400"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base disabled:bg-blue-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
