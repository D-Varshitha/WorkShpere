import { useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const EmployeeFeedback = () => {
  const [feedback, setFeedback] = useState({
    type: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/feedback', feedback);
      setSubmitted(true);
      setFeedback({ type: 'general', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Share Your Feedback</h1>
        <p className="text-gray-500">Your thoughts help us improve. Submit suggestions or report incidents.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Thank You!</h2>
            <p className="text-gray-500">Your feedback has been submitted to the admin team.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-blue-600 font-medium hover:underline"
            >
              Send another feedback
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['general', 'suggestion', 'incident'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFeedback({ ...feedback, type })}
                  className={`py-3 px-4 rounded-xl border-2 transition-all font-bold capitalize ${
                    feedback.type === type 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Detailed Message</label>
              <textarea
                required
                rows="6"
                className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="What's on your mind? Please provide details..."
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
              ></textarea>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Default Format:</strong> Please be specific about the issue or suggestion. 
                Include any relevant project names or department contexts if applicable.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
          <h3 className="font-bold text-purple-900 mb-2">Anonymous Reports</h3>
          <p className="text-sm text-purple-700">Incidents can be reported for internal review. Admins will handle these with strict confidentiality.</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <h3 className="font-bold text-orange-900 mb-2">Suggestion Box</h3>
          <p className="text-sm text-orange-700">Have an idea to improve the workplace? We're all ears! Top suggestions are reviewed monthly.</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFeedback;
