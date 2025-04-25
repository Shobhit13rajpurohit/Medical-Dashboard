import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, X, Upload } from 'lucide-react';
import axios from 'axios';

// Define types
interface GalleryImage {
  id: number;
  title: string | null;
  description: string | null;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

const API_URL = 'https://medical-backend-16ms.onrender.com';

const ShopGallery: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // States for image upload
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');
  const [imageDescription, setImageDescription] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Refs for file input and drop zone
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Fetch gallery data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch gallery images
        try {
          const galleryResponse = await axios.get(`${API_URL}/gallery`);
          setGalleryImages(galleryResponse.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching gallery:', err);
          setError('Failed to load gallery images. Please try again later.');
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle paste events for the entire document
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isEditing || !showImageModal) return;
      
      if (e.clipboardData && e.clipboardData.files.length) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          handleFileSelected(file);
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isEditing, showImageModal]);

  const handleDeleteImage = async (imageId: number) => {
    try {
      await axios.delete(`${API_URL}/gallery/${imageId}`);
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Failed to delete image. Please try again.');
    }
  };

  // Handle file selection
  const handleFileSelected = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Handle drag enter event
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle drag leave event
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelected(file);
      }
    }
  };

  // Handle image upload
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert('Please select an image to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', imageTitle);
      formData.append('description', imageDescription);
      
      const response = await axios.post(`${API_URL}/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setGalleryImages([...galleryImages, response.data]);
      resetImageForm();
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    }
  };

  // Reset image form
  const resetImageForm = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setImageTitle('');
    setImageDescription('');
    setShowImageModal(false);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border text-blue-600" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shop Gallery</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isEditing ? 'Save Changes' : 'Edit Gallery'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <ImageIcon size={20} />
            <h2 className="font-medium">Shop Gallery</h2>
          </div>
          {isEditing && (
            <button
              onClick={() => setShowImageModal(true)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={20} />
              <span>Add Image</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center py-10">
              No gallery images found. Click "Add Image" to upload your first image.
            </p>
          ) : (
            galleryImages.map((image) => (
              <div key={image.id} className="relative group overflow-hidden rounded-lg shadow-md">
                <img
                  src={`${API_URL}${image.image_url}`}
                  alt={image.title || `Gallery image ${image.id}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isEditing && (
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                {(image.title || image.description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 rounded-b-lg transform translate-y-0 transition-transform duration-300">
                    {image.title && <h3 className="text-sm font-medium">{image.title}</h3>}
                    {image.description && <p className="text-xs mt-1 text-gray-300">{image.description}</p>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Gallery Image</h2>
              <button
                onClick={resetImageForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUploadImage} className="space-y-4">
              {/* Image Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-gray-400" size={40} />
                    <p className="text-gray-500">
                      Click to browse or drag an image here
                    </p>
                    <p className="text-gray-400 text-sm">
                      You can also paste images from clipboard
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image Title</label>
                <input
                  type="text"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter image title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter image description"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetImageForm}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageFile}
                  className={`px-4 py-2 rounded-md ${
                    !imageFile
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Upload Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopGallery;
