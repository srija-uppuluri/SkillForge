import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    refreshUser();
  }, [fetchDashboard]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !data || !data.user) return (
    <div className="page-container">
      <div className="text-center py-16 card">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 dark:text-red-400 text-lg font-medium mb-2">{error || 'Failed to load dashboard.'}</p>
        <button onClick={() => { setLoading(true); setError(''); fetchDashboard(); }} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {data.user.name}! 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-transparent rounded-bl-[50px] -mr-2 -mt-2" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credit Balance</p>
            <p className="text-3xl font-bold gradient-text">{data.user.balance_credits}</p>
          </div>
        </div>

        <div className="stat-card relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-transparent rounded-bl-[50px] -mr-2 -mt-2" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Sessions</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.activeSessions.length}</p>
          </div>
        </div>

        <div className="stat-card relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-transparent rounded-bl-[50px] -mr-2 -mt-2" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transactions</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data.recentTransactions.length}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Sessions */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Sessions</h2>
            <Link to="/requests" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">View all →</Link>
          </div>
          {data.activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No active sessions yet.</p>
              <Link to="/skills" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline mt-1 inline-block">Browse skills →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.activeSessions.map(s => (
                <div key={s.request_id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{s.skill_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.role === 'learning' ? '📖 Learning from' : '🎓 Teaching'} {s.partner_name}</p>
                  </div>
                  <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">{s.hours}h</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Teachers */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">🏆 Top Rated Teachers</h2>
          {data.topTeachers.length === 0 ? (
            <div className="text-center py-8"><div className="text-4xl mb-2">⭐</div><p className="text-gray-500 dark:text-gray-400 text-sm">No ratings yet.</p></div>
          ) : (
            <div className="space-y-3">
              {data.topTeachers.map((t, idx) => (
                <div key={t.user_id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>{idx + 1}</span>
                    <Link to={`/profile/${t.user_id}`} className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t.name}</Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{Number(t.avg_rating).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card p-6 lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">View all →</Link>
          </div>
          {data.recentTransactions.length === 0 ? (
            <div className="text-center py-8"><div className="text-4xl mb-2">💳</div><p className="text-gray-500 dark:text-gray-400 text-sm">No transactions yet.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider"><th className="pb-3">From</th><th className="pb-3">To</th><th className="pb-3">Credits</th><th className="pb-3">Date</th></tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.recentTransactions.map(txn => (
                    <tr key={txn.transaction_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 text-gray-700 dark:text-gray-300">{txn.sender_name}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{txn.receiver_name}</td>
                      <td className="py-3 font-semibold text-primary-600 dark:text-primary-400">{txn.credits}</td>
                      <td className="py-3 text-gray-400 dark:text-gray-500">{new Date(txn.transaction_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
