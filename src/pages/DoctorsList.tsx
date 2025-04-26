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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Base URL for API
  const API_BASE_URL = 'https://medical-backend-16ms.onrender.com';
  
  const fetchDoctors = () => {
    axios.get(`${API_BASE_URL}/doctors`)
      .then((response) => {
        console.log("API Response:", response.data);
        setDoctors(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
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
    // Set image preview if the doctor has an image
    if (doctor.image_filename) {
      setImagePreview(`${API_BASE_URL}/doctors/images/${doctor.image_filename}`);
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
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`${API_BASE_URL}/doctors/${doctorId}`);
        setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor");
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctors</h1>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {doctor.image_filename ? (
              <img 
                src={`${API_BASE_URL}/doctors/images/${doctor.image_filename}`} 
                alt={doctor.name} 
                className="w-full h-48 object-cover" 
                onError={(e) => {
                  // Fallback image if the doctor image fails to load
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-gray-500">{doctor.phone}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEdit(doctor)} className="text-blue-600 hover:bg-blue-50 rounded px-3 py-1">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => navigate(`/doctors/${doctor.id}/visits`)} className="text-green-600 hover:bg-green-50 rounded px-3 py-1">
                  <Calendar size={16} /> Visits
                </button>
                <button onClick={() => handleDelete(doctor.id)} className="text-red-600 hover:bg-red-50 rounded px-3 py-1 ml-auto">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full p-2 border rounded" 
                required 
              />
              <input 
                type="text" 
                placeholder="Specialization" 
                value={formData.specialization} 
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} 
                className="w-full p-2 border rounded" 
                required 
              />
              <input 
                type="tel" 
                placeholder="Phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                className="w-full p-2 border rounded" 
                required 
              />
              
              {/* Image Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleImageDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-40 mx-auto object-contain" />
                    <button 
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={36} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
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
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save
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