import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import type { RequestCategory } from '../types';
import { X, Upload, AlertCircle } from 'lucide-react';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const CATEGORIES: RequestCategory[] = [
  'Water and sanitation',
  'Roads and drainage',
  'Street lighting',
  'Garbage collection',
  'Public facilities',
  'Other',
];

export const SubmitRequestModal: React.FC<SubmitRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const [category, setCategory] = useState<RequestCategory>('Water and sanitation');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imagePath = null;

      // 1. Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      // 2. Generate unique reference number (e.g., MCR-8492)
      const referenceNumber = `MCR-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Insert service request into database
      const { error: insertError } = await supabase.from('service_requests').insert({
        reference_number: referenceNumber,
        citizen_id: userId,
        category,
        location,
        description,
        image_path: imagePath,
        status: 'Pending',
      });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: unknown) {
     const errorMessage =
  err instanceof Error
    ? err.message
    : 'An unexpected error occurred while submitting your request.';

setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden shadow-xl border-t-4 border-county-green">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Lodge New Public Service Ticket</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RequestCategory)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-county-green focus:border-county-green sm:text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location / Ward / Landmark</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Makuyu Market, Near Chief's Office"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-county-green focus:border-county-green sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description of Issue</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information regarding the service request..."
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-county-green focus:border-county-green sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attach Photo (Optional)</label>
            <div className="mt-1 flex items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-county-green transition-colors">
              <div className="space-y-1 text-center w-full">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-county-green hover:text-county-dark focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {imageFile ? imageFile.name : 'PNG, JPG, GIF up to 10MB'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-county-green text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-county-dark focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};