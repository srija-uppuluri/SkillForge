import React, { useState, useEffect } from 'react';
import api from '../api';

function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form, setForm] = useState({ skill_name: '', category: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchMySkills(); }, []);
  const fetchMySkills = async () => { try { const res = await api.get('/skills/my'); setSkills(res.data); } catch (err) {} finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingSkill) await api.put(`/skills/${editingSkill.skill_id}`, form);
      else await api.post('/skills', form);
      setShowForm(false); setEditingSkill(null); setForm({ skill_name: '', category: '', description: '' }); fetchMySkills();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
  };

  const handleEdit = (skill) => { setEditingSkill(skill); setForm({ skill_name: skill.skill_name, category: skill.category, description: skill.description || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete this skill?')) return; try { await api.delete(`/skills/${id}`); fetchMySkills(); } catch (err) {} };

  const categories = ['Programming', 'Technology', 'Music', 'Art', 'Creative Arts', 'Languages', 'Language', 'Fitness', 'Health & Fitness', 'Lifestyle', 'Communication', 'Education', 'Other'];

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Skills</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Skills you offer to teach</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingSkill(null); setForm({ skill_name: '', category: '', description: '' }); }} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Skill
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="card p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editingSkill ? '✏️ Edit Skill' : '✨ Add New Skill'}</h3>
            {error && <p className="text-red-500 text-sm mb-3 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="skill_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skill Name</label><input id="skill_name" type="text" value={form.skill_name} onChange={(e) => setForm({ ...form, skill_name: e.target.value })} required className="input-field" /></div>
              <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label><select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="input-field"><option value="">Select</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label><textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" /></div>
              <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 btn-primary py-3">{editingSkill ? 'Update' : 'Create'}</button><button type="button" onClick={() => { setShowForm(false); setError(''); }} className="flex-1 btn-secondary py-3">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 card"><div className="text-5xl mb-4">🎯</div><p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No skills yet.</p><button onClick={() => setShowForm(true)} className="text-primary-600 dark:text-primary-400 font-semibold">Add your first skill →</button></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {skills.map((skill, idx) => (
            <div key={skill.skill_id} className="card p-6 card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{skill.skill_name}</h3>
                  <span className="inline-block badge bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 mt-2">{skill.category}</span>
                  {skill.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{skill.description}</p>}
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleEdit(skill)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(skill.skill_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySkills;
