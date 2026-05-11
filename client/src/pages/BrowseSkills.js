import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function BrowseSkills() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [requestModal, setRequestModal] = useState(null);
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchSkills(); }, [category, searchParams]);

  const fetchCategories = async () => { try { const res = await api.get('/skills/categories'); setCategories(res.data); } catch (err) {} };
  const fetchSkills = async () => {
    setLoading(true);
    try { const params = {}; if (category) params.category = category; if (search) params.search = search; const res = await api.get('/skills', { params }); setSkills(res.data); }
    catch (err) {} finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); const params = {}; if (search) params.search = search; if (category) params.category = category; setSearchParams(params); fetchSkills(); };
  const handleRequest = async () => {
    setMessage('');
    try { await api.post('/requests', { skill_id: requestModal.skill_id, hours }); setMessage('Request sent successfully!'); setTimeout(() => { setRequestModal(null); setMessage(''); }, 1500); }
    catch (err) { setMessage(err.response?.data?.error || 'Failed to send request.'); }
  };

  const emojis = { 'Technology': '💻', 'Programming': '💻', 'Music': '🎵', 'Art': '🎨', 'Creative Arts': '🎨', 'Languages': '🌍', 'Language': '🌍', 'Fitness': '💪', 'Health & Fitness': '🧘', 'Lifestyle': '🍳', 'Communication': '🗣️', 'Education': '📚' };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Skills</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find something new to learn today</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-down">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-12" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-48" aria-label="Filter by category">
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16"><div className="text-5xl mb-4">🔍</div><p className="text-gray-500 dark:text-gray-400 text-lg">No skills found.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, idx) => (
            <div key={skill.skill_id} className="group card p-6 flex flex-col card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{emojis[skill.category] || '📖'}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{skill.skill_name}</h3>
              </div>
              <span className="inline-block w-fit badge bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 mb-3">{skill.category}</span>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 mb-4 leading-relaxed">{skill.description || 'No description.'}</p>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-medium">{skill.teacher_name?.charAt(0)}</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{skill.teacher_name}</span>
                </div>
                {user && user.userId !== skill.user_id && (
                  <button onClick={() => setRequestModal(skill)} className="text-sm btn-primary py-1.5 px-4">Request</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {requestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="card p-8 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{emojis[requestModal.category] || '📖'}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{requestModal.skill_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">with {requestModal.teacher_name}</p>
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hours needed</label>
            <input type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="input-field mb-4" />
            {message && <p className={`text-sm mb-3 text-center font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
            <div className="flex gap-3">
              <button onClick={handleRequest} className="flex-1 btn-primary py-3">Send Request</button>
              <button onClick={() => { setRequestModal(null); setMessage(''); }} className="flex-1 btn-secondary py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseSkills;
