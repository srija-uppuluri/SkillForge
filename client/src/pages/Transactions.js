import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { (async () => { try { const res = await api.get('/transactions'); setTransactions(res.data); } catch (err) {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transactions</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Your credit transfer history</p>

      {transactions.length === 0 ? (
        <div className="text-center py-16 card"><div className="text-5xl mb-4">💳</div><p className="text-gray-500 dark:text-gray-400 text-lg">No transactions yet.</p></div>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn, idx) => {
            const isSender = txn.sender_id === user.userId;
            return (
              <div key={txn.transaction_id} className="card p-5 flex items-center justify-between card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSender ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    {isSender ? <span className="text-xl">📤</span> : <span className="text-xl">📥</span>}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{isSender ? `Paid to ${txn.receiver_name}` : `Received from ${txn.sender_name}`}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{new Date(txn.transaction_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${isSender ? 'text-red-500' : 'text-green-500'}`}>{isSender ? '-' : '+'}{txn.credits}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">credits</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Transactions;
