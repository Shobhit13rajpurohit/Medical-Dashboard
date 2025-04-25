// import React, { useState, useEffect, useRef } from 'react';
// import { Image as ImageIcon, Clock, Plus, Trash2, X, Calendar, Upload } from 'lucide-react';
// import axios from 'axios';

// // Define types based on your backend models
// interface DoctorSchedule {
//   id: number;
//   doctor_id: number;
//   day_of_week: string;
//   start_time: string;
//   end_time: string;
//   is_available: boolean;
//   specific_date: string | null;
// }

// interface Doctor {
//   id: number;
//   name: string;
//   specialization: string;
//   profile_image: string | null; 
//   contact_number: string | null;
// }

// interface GalleryImage {
//   id: number;
//   title: string | null;
//   description: string | null;
//   image_url: string;
//   order_index: number;
//   is_active: boolean;
// }

// const API_URL = 'http://localhost:8000';

// const ShopDetails: React.FC = () => {
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
//   const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [newSchedule, setNewSchedule] = useState<Partial<DoctorSchedule>>({
//     doctor_id: 0,
//     day_of_week: '',
//     start_time: '',
//     end_time: '',
//     is_available: true,
//     specific_date: null
//   });
//   const [showScheduleModal, setShowScheduleModal] = useState(false);
//   const [useSpecificDate, setUseSpecificDate] = useState(false);
  
//   // New states for image upload
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [imageTitle, setImageTitle] = useState<string>('');
//   const [imageDescription, setImageDescription] = useState<string>('');
//   const [isDragging, setIsDragging] = useState<boolean>(false);
  
//   // Refs for file input and drop zone
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const dropZoneRef = useRef<HTMLDivElement>(null);

//   const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   // Fetch doctors, schedules, and gallery data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch doctors - add error handling for each request
//         let doctorsData = [];
//         try {
//           const doctorsResponse = await axios.get(`${API_URL}/doctors`);
//           doctorsData = doctorsResponse.data;
//           setDoctors(doctorsData);
//         } catch (err) {
//           console.error('Error fetching doctors:', err);
//           // Continue with other requests even if this one fails
//         }
        
//         // Fetch all schedules
//         let schedulesData = [];
//         try {
//           const schedulesResponse = await axios.get(`${API_URL}/schedules`);
//           schedulesData = schedulesResponse.data;
//           setSchedules(schedulesData);
//         } catch (err) {
//           console.error('Error fetching schedules:', err);
//           // Continue with other requests
//         }
        
//         // Fetch gallery images
//         try {
//           const galleryResponse = await axios.get(`${API_URL}/gallery`);
//           setGalleryImages(galleryResponse.data);
//         } catch (err) {
//           console.error('Error fetching gallery:', err);
//           // Continue with other requests
//         }
        
//         // Set error only if all requests failed
//         if (doctorsData.length === 0 && schedulesData.length === 0) {
//           setError('Failed to load data. Please try again later.');
//         } else {
//           setError(null);
//         }
//       } catch (err) {
//         setError('Failed to load data. Please try again later.');
//         console.error('Error fetching data:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle paste events for the entire document
//   useEffect(() => {
//     const handlePaste = (e: ClipboardEvent) => {
//       if (!isEditing || !showImageModal) return;
      
//       if (e.clipboardData && e.clipboardData.files.length) {
//         const file = e.clipboardData.files[0];
//         if (file.type.startsWith('image/')) {
//           e.preventDefault();
//           handleFileSelected(file);
//         }
//       }
//     };
    
//     document.addEventListener('paste', handlePaste);
//     return () => document.removeEventListener('paste', handlePaste);
//   }, [isEditing, showImageModal]);

//   const handleAddSchedule = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (newSchedule.doctor_id && 
//         newSchedule.start_time && 
//         newSchedule.end_time && 
//         (newSchedule.day_of_week || useSpecificDate && newSchedule.specific_date)) {
//       try {
//         const scheduleData = {
//           doctor_id: newSchedule.doctor_id,
//           day_of_week: useSpecificDate ? '' : newSchedule.day_of_week,
//           start_time: newSchedule.start_time,
//           end_time: newSchedule.end_time,
//           is_available: true,
//           specific_date: useSpecificDate ? newSchedule.specific_date : null
//         };
        
//         const response = await axios.post(`${API_URL}/schedules`, scheduleData);
        
//         setSchedules([...schedules, response.data]);
//         setShowScheduleModal(false);
//         setNewSchedule({ 
//           doctor_id: 0, 
//           day_of_week: '', 
//           start_time: '', 
//           end_time: '', 
//           is_available: true,
//           specific_date: null 
//         });
//         setUseSpecificDate(false);
//       } catch (err) {
//         console.error('Error adding schedule:', err);
//         alert('Failed to add schedule. Please try again.');
//       }
//     }
//   };

//   const handleDeleteSchedule = async (scheduleId: number) => {
//     try {
//       await axios.delete(`${API_URL}/schedules/${scheduleId}`);
//       setSchedules(schedules.filter(s => s.id !== scheduleId));
//     } catch (err) {
//       console.error('Error deleting schedule:', err);
//       alert('Failed to delete schedule. Please try again.');
//     }
//   };

//   const handleDeleteImage = async (imageId: number) => {
//     try {
//       await axios.delete(`${API_URL}/gallery/${imageId}`);
//       setGalleryImages(galleryImages.filter(img => img.id !== imageId));
//     } catch (err) {
//       console.error('Error deleting image:', err);
//       alert('Failed to delete image. Please try again.');
//     }
//   };

//   // New function to handle file selection
//   const handleFileSelected = (file: File) => {
//     if (file && file.type.startsWith('image/')) {
//       setImageFile(file);
//       const reader = new FileReader();
//       reader.onload = () => {
//         setPreviewUrl(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle file input change
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       handleFileSelected(e.target.files[0]);
//     }
//   };

//   // Handle drag enter event
//   const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   };

//   // Handle drag leave event
//   const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };

//   // Handle drag over event
//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   // Handle drop event
//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const file = e.dataTransfer.files[0];
//       if (file.type.startsWith('image/')) {
//         handleFileSelected(file);
//       }
//     }
//   };

//   // Handle image upload
//   const handleUploadImage = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!imageFile) {
//       alert('Please select an image to upload');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('image', imageFile);
//       formData.append('title', imageTitle);
//       formData.append('description', imageDescription);
      
//       const response = await axios.post(`${API_URL}/gallery`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
      
//       setGalleryImages([...galleryImages, response.data]);
//       resetImageForm();
//     } catch (err) {
//       console.error('Error uploading image:', err);
//       alert('Failed to upload image. Please try again.');
//     }
//   };

//   // Reset image form
//   const resetImageForm = () => {
//     setImageFile(null);
//     setPreviewUrl(null);
//     setImageTitle('');
//     setImageDescription('');
//     setShowImageModal(false);
//   };

//   // Format time from 24-hour to 12-hour
//   const formatTime = (timeString: string): string => {
//     const [hours, minutes] = timeString.split(':');
//     const hour = parseInt(hours);
//     const suffix = hour >= 12 ? 'PM' : 'AM';
//     const displayHour = hour % 12 || 12;
//     return `${displayHour}:${minutes} ${suffix}`;
//   };

//   // Format date for display
//   const formatDate = (dateString: string | null): string => {
//     if (!dateString) return '';
    
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   if (loading) {
//     return (
//       <div className="text-center py-10">
//         <div className="spinner-border text-blue-600" role="status">
//           <span className="sr-only">Loading...</span>
//         </div>
//         <p className="mt-2">Loading data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Shop Details</h1>
//         <button
//           onClick={() => setIsEditing(!isEditing)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           {isEditing ? 'Save Changes' : 'Edit Details'}
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2 text-gray-600">
//               <ImageIcon size={20} />
//               <h2 className="font-medium">Shop Gallery</h2>
//             </div>
//             {isEditing && (
//               <button
//                 onClick={() => setShowImageModal(true)}
//                 className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
//               >
//                 <Plus size={20} />
//                 <span>Add Image</span>
//               </button>
//             )}
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {galleryImages.map((image) => (
//               <div key={image.id} className="relative">
//                 <img
//                   src={`${API_URL}${image.image_url}`}
//                   alt={image.title || `Gallery image ${image.id}`}
//                   className="w-full h-48 object-cover rounded-lg"
//                 />
//                 {isEditing && (
//                   <button
//                     onClick={() => handleDeleteImage(image.id)}
//                     className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 )}
//                 {image.title && (
//                   <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
//                     <h3 className="text-sm font-medium">{image.title}</h3>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
          
//       </div>

//       <div className="mt-8 bg-white rounded-lg shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2 text-gray-600">
//             <Clock size={20} />
//             <h2 className="text-xl font-medium">Doctor Schedules</h2>
//           </div>
//           {isEditing && (
//             <button
//               onClick={() => setShowScheduleModal(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
//             >
//               <Plus size={20} />
//               Add Schedule
//             </button>
//           )}
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Doctor
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Schedule Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Time
//                 </th>
//                 {isEditing && (
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {schedules.map((schedule) => {
//                 const doctor = doctors.find(d => d.id === schedule.doctor_id);
//                 return (
//                   <tr key={schedule.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         {doctor?.profile_image ? (
//                           <img
//                             src={`${API_URL}${doctor.profile_image}`}
//                             alt={doctor.name}
//                             className="h-8 w-8 rounded-full mr-3"
//                           />
//                         ) : (
//                           <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
//                             <span className="text-gray-500 text-xl">{doctor?.name.charAt(0)}</span>
//                           </div>
//                         )}
//                         <div>
//                           <div className="font-medium">{doctor?.name}</div>
//                           <div className="text-sm text-gray-500">{doctor?.specialization}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {schedule.specific_date ? (
//                         <div className="flex items-center">
//                           <Calendar size={16} className="mr-2 text-blue-500" />
//                           <span>{formatDate(schedule.specific_date)}</span>
//                         </div>
//                       ) : (
//                         <div className="flex items-center">
//                           <Clock size={16} className="mr-2 text-blue-500" />
//                           <span>Weekly on {schedule.day_of_week}</span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
//                     </td>
//                     {isEditing && (
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <button
//                           onClick={() => handleDeleteSchedule(schedule.id)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </td>
//                     )}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Schedule Modal */}
//       {showScheduleModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold">Add Doctor Schedule</h2>
//               <button
//                 onClick={() => setShowScheduleModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleAddSchedule} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Doctor</label>
//                 <select
//                   value={newSchedule.doctor_id || 0}
//                   onChange={(e) => setNewSchedule({ ...newSchedule, doctor_id: parseInt(e.target.value) })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   required
//                 >
//                   <option value={0}>Select a doctor</option>
//                   {doctors.map((doctor) => (
//                     <option key={doctor.id} value={doctor.id}>
//                       {doctor.name} - {doctor.specialization}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="flex items-center mb-4">
//                 <input
//                   type="checkbox"
//                   id="useSpecificDate"
//                   checked={useSpecificDate}
//                   onChange={() => setUseSpecificDate(!useSpecificDate)}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="useSpecificDate" className="ml-2 block text-sm text-gray-900">
//                   Schedule for a specific date
//                 </label>
//               </div>
              
//               {useSpecificDate ? (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Date</label>
//                   <input
//                     type="date"
//                     value={newSchedule.specific_date || ''}
//                     onChange={(e) => setNewSchedule({ ...newSchedule, specific_date: e.target.value })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     required={useSpecificDate}
//                   />
//                 </div>
//               ) : (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Day</label>
//                   <select
//                     value={newSchedule.day_of_week}
//                     onChange={(e) => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     required={!useSpecificDate}
//                   >
//                     <option value="">Select a day</option>
//                     {weekDays.map((day) => (
//                       <option key={day} value={day}>
//                         {day}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Start Time</label>
//                   <input
//                     type="time"
//                     value={newSchedule.start_time}
//                     onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">End Time</label>
                  
//                   <input
//                     type="time"
//                     value={newSchedule.end_time}
//                     onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-2 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowScheduleModal(false)}
//                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                 >
//                   Add Schedule
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Add Image Modal */}
//       {showImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold">Add Gallery Image</h2>
//               <button
//                 onClick={resetImageForm}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleUploadImage} className="space-y-4">
//               {/* Image Drop Zone */}
//               <div
//                 ref={dropZoneRef}
//                 className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
//                   isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
//                 }`}
//                 onClick={() => fileInputRef.current?.click()}
//                 onDragEnter={handleDragEnter}
//                 onDragLeave={handleDragLeave}
//                 onDragOver={handleDragOver}
//                 onDrop={handleDrop}
//               >
//                 {previewUrl ? (
//                   <div className="relative">
//                     <img
//                       src={previewUrl}
//                       alt="Preview"
//                       className="max-h-64 mx-auto rounded"
//                     />
//                     <button
//                       type="button"
//                       className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setImageFile(null);
//                         setPreviewUrl(null);
//                       }}
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <Upload className="mx-auto text-gray-400" size={40} />
//                     <p className="text-gray-500">
//                       Click to browse or drag an image here
//                     </p>
//                     <p className="text-gray-400 text-sm">
//                       You can also paste images from clipboard
//                     </p>
//                   </div>
//                 )}
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleFileChange}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Image Title</label>
//                 <input
//                   type="text"
//                   value={imageTitle}
//                   onChange={(e) => setImageTitle(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   placeholder="Enter image title"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Description</label>
//                 <textarea
//                   value={imageDescription}
//                   onChange={(e) => setImageDescription(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   rows={3}
//                   placeholder="Enter image description"
//                 />
//               </div>

//               <div className="flex justify-end gap-2 mt-6">
//                 <button
//                   type="button"
//                   onClick={resetImageForm}
//                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={!imageFile}
//                   className={`px-4 py-2 rounded-md ${
//                     !imageFile
//                       ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       : 'bg-blue-600 text-white hover:bg-blue-700'
//                   }`}
//                 >
//                   Upload Image
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShopDetails;