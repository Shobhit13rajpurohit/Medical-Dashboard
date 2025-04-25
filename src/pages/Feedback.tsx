import React, { useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Feedback as FeedbackType } from '../types';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([
    {
      id: '1',
      patientName: 'Shobhit',
      message: 'Great service! The doctor was very professional.',
      createdAt: new Date().toISOString(),
    },
    // Add more sample feedback
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Patient Feedback</h1>

      <div className="space-y-6">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <MessageSquare size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feedback.patientName}</h3>
                  <p className="text-gray-500 text-sm">
                    {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedFeedback(feedback);
                    setIsReplyModalOpen(true);
                  }}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                >
                  <Send size={20} />
                </button>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <p className="mt-4 text-gray-700">{feedback.message}</p>
            {feedback.reply && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Reply:</p>
                <p className="mt-1 text-gray-700">{feedback.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Reply to Feedback</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Reply</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;