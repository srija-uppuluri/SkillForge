import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [ending, setEnding] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchRequest();
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchRequest = async () => {
    try {
      // Fetch from incoming or outgoing
      const [inc, out] = await Promise.all([
        api.get('/requests/incoming'),
        api.get('/requests/outgoing')
      ]);
      const all = [...inc.data, ...out.data];
      const found = all.find(r => r.request_id === parseInt(id));
      if (found) {
        setRequest(found);
        // Start timer based on session_started_at
        if (found.session_started_at) {
          const startTime = new Date(found.session_started_at).getTime();
          const now = Date.now();
          setElapsed(Math.floor((now - startTime) / 1000));
        }
        startVideo();
        startTimer();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // In a real app, you'd connect to a signaling server here for WebRTC peer connection
      // For demo, we simulate the remote video with a placeholder
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { sender: user.name, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      const res = await api.put(`/requests/${id}/confirm`);
      if (res.data.completed) {
        // Both confirmed, session done
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        refreshUser();
        navigate('/requests');
      } else {
        // Only one party confirmed, stay on page
        alert(res.data.message);
        setShowEndModal(false);
        setEnding(false);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm.');
      setEnding(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-950">
      <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!request) return (
    <div className="flex justify-center items-center h-screen bg-gray-950">
      <div className="text-center">
        <p className="text-white text-lg">Session not found.</p>
        <button onClick={() => navigate('/requests')} className="btn-primary mt-4">Back to Requests</button>
      </div>
    </div>
  );

  const isTeacher = request.teacher_id === user.userId;
  const partnerName = isTeacher ? request.learner_name : (request.teacher_name || 'Partner');

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-semibold">{request.skill_name}</span>
          <span className="text-gray-400 text-sm">• {isTeacher ? 'Teaching' : 'Learning from'} {partnerName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 px-4 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-mono text-sm">{formatTime(elapsed)}</span>
          </div>
          <span className="text-gray-400 text-sm">{request.hours}h session</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Video Area */}
        <div className={`flex-1 flex flex-col ${isChatOpen ? 'mr-80' : ''} transition-all duration-300`}>
          {/* Remote Video (main) */}
          <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
            {/* Simulated remote participant */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <span className="text-white text-5xl font-bold">{partnerName.charAt(0)}</span>
              </div>
              <p className="text-white text-xl font-semibold">{partnerName}</p>
              <p className="text-gray-400 text-sm mt-1">{isTeacher ? 'Learner' : 'Teacher'} • Connected</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-400 text-xs">Audio connected</span>
              </div>
            </div>

            {/* Local Video (small overlay) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-800">
              <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                    <span className="text-white font-bold">{user.name?.charAt(0)}</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">You</div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-900 border-t border-gray-800 px-6 py-4 flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              )}
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isChatOpen ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title="Chat"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>

            {/* End/Confirm Session Button — available for both parties */}
            <button
              onClick={() => setShowEndModal(true)}
              className="ml-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
              Confirm & End
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Session Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-gray-500 text-sm text-center mt-8">No messages yet. Start the conversation!</p>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === user.name ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.sender === user.name ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 border border-gray-700"
              />
              <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-800 animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-white">Confirm Session Complete</h3>
              <p className="text-gray-400 text-sm mt-2">
                Both you and {partnerName} must confirm for credits to transfer.
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Session Duration</span>
                <span className="text-white font-mono">{formatTime(elapsed)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-400">Credits ({isTeacher ? 'you receive' : 'you pay'})</span>
                <span className="text-white font-bold">{isTeacher ? '+' : '-'}{request.hours}</span>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-3 mb-4">
              <p className="text-yellow-300 text-xs font-medium">⚠️ Credits transfer only when BOTH parties confirm.</p>
            </div>

            <label className="block text-sm font-medium text-gray-300 mb-1.5">Session Notes (optional)</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 border border-gray-700 resize-none mb-4"
              placeholder="What was covered in this session?"
            />

            <div className="flex gap-3">
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {ending ? 'Confirming...' : 'I Confirm Session is Complete'}
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Session;
