import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const profileId = id || user?.userId;

  useEffect(() => { if (profileId) fetchProfile(); }, [profileId]);
  const fetchProfile = async () => { try { const res = await api.get(id ? `/users/${id}` : '/users/me'); setProfile(res.data); const fb = await api.get(`/feedback/teacher/${profileId}`); setFeedback(fb.data); } catch (err) {} finally { setLoading(false); } };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!profile) return <div className="text-center py-12 text-red-500">Profile not found.</div>;

  return (
    <div className="page-container">
      <div className="relative card overflow-hidden mb-8 animate-fade-in-up">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-gray-900">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center bg-primary-50 dark:bg-primary-900/30 px-5 py-3 rounded-2xl border border-primary-100 dark:border-primary-800">
                <p className="text-2xl font-bold gradient-text">{profile.balance_credits}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
              </div>
              {profile.avg_rating && (
                <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 px-5 py-3 rounded-2xl border border-yellow-100 dark:border-yellow-800">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">★ {Number(profile.avg_rating).toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{profile.total_reviews} reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {profile.skills?.length > 0 && (
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Skills Offered</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.skills.map(s => (
              <div key={s.skill_id} className="card p-5 card-hover">
                <h3 className="font-semibold text-gray-900 dark:text-white">{s.skill_name}</h3>
                <span className="inline-block badge bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mt-1">{s.category}</span>
                {s.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{s.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💬 Reviews</h2>
        {feedback.length === 0 ? (
          <div className="text-center py-12 card"><div className="text-4xl mb-2">📝</div><p className="text-gray-500 dark:text-gray-400">No reviews yet.</p></div>
        ) : (
          <div className="space-y-4">
            {feedback.map(fb => (
              <div key={fb.feedback_id} className="card p-6 card-hover">
                <div className="flex justify-between items-start">
                  <div><p className="font-semibold text-gray-900 dark:text-white">{fb.skill_name}</p><p className="text-sm text-gray-500 dark:text-gray-400">by {fb.learner_name}</p></div>
                  <div className="flex">{[...Array(5)].map((_, i) => <span key={i} className={`text-lg ${i < fb.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}>★</span>)}</div>
                </div>
                {fb.comments && <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">{fb.comments}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
