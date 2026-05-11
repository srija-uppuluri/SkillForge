import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('incoming');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const [i, o] = await Promise.all([api.get('/requests/incoming'), api.get('/requests/outgoing')]);
      setIncoming(i.data);
      setOutgoing(o.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/requests/${id}/reject`); fetchRequests(); }
    catch (err) { alert(err.response?.data?.error || 'Failed.'); }
  };

  const handleScheduleAccept = async () => {
    setMessage('');
    if (!scheduledDate || !scheduledTime) {
      setMessage('Please select both date and time.');
      return;
    }
    const scheduled_at = `${scheduledDate}T${scheduledTime}`;
    try {
      await api.put(`/requests/${scheduleModal.request_id}/accept`, { scheduled_at });
      setMessage('Scheduled!');
      setTimeout(() => { setScheduleModal(null); setMessage(''); }, 1000);
      fetchRequests();
    } catch (err) { setMessage(err.response?.data?.error || 'Failed.'); }
  };

  const handleStartSession = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/start`);
      navigate(`/session/${requestId}`);
    } catch (err) { alert(err.response?.data?.error || 'Failed to start session.'); }
  };

  const handleConfirm = async (requestId) => {
    try {
      const res = await api.put(`/requests/${requestId}/confirm`);
      alert(res.data.message);
      fetchRequests();
      refreshUser();
    } catch (err) { alert(err.response?.data?.error || 'Failed.'); }
  };

  const handleFeedback = async () => {
    setMessage('');
    try {
      await api.post('/feedback', { request_id: feedbackModal.request_id, rating, comments });
      setMessage('Feedback submitted!');
      setTimeout(() => { setFeedbackModal(null); setMessage(''); setComments(''); }, 1500);
      fetchRequests();
    } catch (err) { setMessage(err.response?.data?.error || 'Failed.'); }
  };

  const statusConfig = {
    'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'Scheduled': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    'In Progress': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    'Completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    'Rejected': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  };
  const statusIcon = { 'Pending': '⏳', 'Scheduled': '📅', 'In Progress': '📚', 'Completed': '🎉', 'Rejected': '❌' };

  const formatSchedule = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isSessionTime = (scheduledAt) => {
    if (!scheduledAt) return false;
    const scheduled = new Date(scheduledAt).getTime();
    const now = Date.now();
    // Allow joining 5 minutes before scheduled time
    return now >= scheduled - 5 * 60 * 1000;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Requests</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your learning and teaching sessions</p>

      {/* Flow */}
      <div className="mb-8 p-4 card">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Session Flow</p>
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">⏳ Pending</span>
          <span className="text-gray-400">→</span>
          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full font-medium">📅 Scheduled</span>
          <span className="text-gray-400">→</span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">📚 In Progress</span>
          <span className="text-gray-400">→</span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">✅ Both Confirm</span>
          <span className="text-gray-400">→</span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">🎉 Credits Transfer</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setTab('incoming')} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'incoming' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>📥 Incoming ({incoming.length})</button>
        <button onClick={() => setTab('outgoing')} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'outgoing' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>📤 Outgoing ({outgoing.length})</button>
      </div>

      {/* INCOMING — Teacher's view */}
      {tab === 'incoming' && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <div className="text-center py-16 card"><div className="text-5xl mb-4">📭</div><p className="text-gray-500 dark:text-gray-400">No incoming requests.</p></div>
          ) : incoming.map((req, idx) => (
            <div key={req.request_id} className="card p-6 card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{req.skill_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Learner: <span className="font-medium text-gray-700 dark:text-gray-300">{req.learner_name}</span> • {req.hours}h</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(req.request_date).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${statusConfig[req.status]}`}>{statusIcon[req.status]} {req.status}</span>
              </div>

              {/* Pending: Accept (schedule) or Reject */}
              {req.status === 'Pending' && (
                <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setScheduleModal(req); setScheduledDate(''); setScheduledTime(''); }} className="text-sm bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-all active:scale-95">
                    ✓ Accept & Schedule
                  </button>
                  <button onClick={() => handleReject(req.request_id)} className="text-sm bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95">
                    ✕ Reject
                  </button>
                </div>
              )}

              {/* Scheduled: Show time + Start button when it's time */}
              {req.status === 'Scheduled' && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-3 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">📅 Session Scheduled</p>
                    <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mt-1">{formatSchedule(req.scheduled_at)}</p>
                    {!isSessionTime(req.scheduled_at) && (
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">The "Start Session" button will appear at the scheduled time.</p>
                    )}
                  </div>
                  {isSessionTime(req.scheduled_at) && (
                    <button onClick={() => handleStartSession(req.request_id)} className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95">
                      🎬 Start Video Session
                    </button>
                  )}
                </div>
              )}

              {/* In Progress: Join + Confirm */}
              {req.status === 'In Progress' && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" /> Session In Progress
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${req.teacher_confirmed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {req.teacher_confirmed ? '✅ You confirmed' : '⏳ Your confirmation pending'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${req.learner_confirmed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {req.learner_confirmed ? '✅ Learner confirmed' : '⏳ Learner pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigate(`/session/${req.request_id}`)} className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95">
                      📹 Join Session
                    </button>
                    {!req.teacher_confirmed && (
                      <button onClick={() => handleConfirm(req.request_id)} className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95">
                        ✓ Confirm Teaching Done
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* OUTGOING — Learner's view */}
      {tab === 'outgoing' && (
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <div className="text-center py-16 card"><div className="text-5xl mb-4">📭</div><p className="text-gray-500 dark:text-gray-400">No outgoing requests.</p></div>
          ) : outgoing.map((req, idx) => (
            <div key={req.request_id} className="card p-6 card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{req.skill_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teacher: <span className="font-medium text-gray-700 dark:text-gray-300">{req.teacher_name}</span> • {req.hours}h</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(req.request_date).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${statusConfig[req.status]}`}>{statusIcon[req.status]} {req.status}</span>
              </div>

              {/* Scheduled: Show time + join when ready */}
              {req.status === 'Scheduled' && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">📅 Session Scheduled</p>
                    <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mt-1">{formatSchedule(req.scheduled_at)}</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">Be ready at this time. The teacher will start the session.</p>
                  </div>
                </div>
              )}

              {/* In Progress: Join + Confirm */}
              {req.status === 'In Progress' && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" /> Learning In Progress
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${req.teacher_confirmed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {req.teacher_confirmed ? '✅ Teacher confirmed' : '⏳ Teacher pending'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${req.learner_confirmed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {req.learner_confirmed ? '✅ You confirmed' : '⏳ Your confirmation pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigate(`/session/${req.request_id}`)} className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95">
                      📹 Join Session
                    </button>
                    {!req.learner_confirmed && (
                      <button onClick={() => handleConfirm(req.request_id)} className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95">
                        ✓ Confirm Learning Done
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Completed: Leave feedback */}
              {req.status === 'Completed' && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setFeedbackModal(req)} className="text-sm bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95">
                    ⭐ Leave Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="card p-8 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Session</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scheduleModal.skill_name} with {scheduleModal.learner_name}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Pick a date and time when both you and the learner can attend the video session.</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="input-field" />
              </div>
            </div>
            {message && <p className={`text-sm mb-3 text-center font-medium ${message.includes('Scheduled') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
            <div className="flex gap-3">
              <button onClick={handleScheduleAccept} className="flex-1 btn-primary py-3">Accept & Schedule</button>
              <button onClick={() => { setScheduleModal(null); setMessage(''); }} className="flex-1 btn-secondary py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="card p-8 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center mb-6"><div className="text-4xl mb-2">⭐</div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Rate Session</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feedbackModal.skill_name}</p></div>
            <div className="flex gap-2 mb-5 justify-center">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} className={`w-12 h-12 rounded-xl text-xl transition-all ${rating >= n ? 'bg-yellow-400 text-white shadow-lg scale-110' : 'bg-gray-100 dark:bg-gray-800 text-gray-300'}`} aria-label={`${n} stars`}>★</button>
              ))}
            </div>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className="input-field resize-none mb-4" placeholder="How was your experience?" />
            {message && <p className={`text-sm mb-3 text-center font-medium ${message.includes('submitted') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
            <div className="flex gap-3">
              <button onClick={handleFeedback} className="flex-1 btn-primary py-3">Submit</button>
              <button onClick={() => { setFeedbackModal(null); setMessage(''); setComments(''); }} className="flex-1 btn-secondary py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Requests;
