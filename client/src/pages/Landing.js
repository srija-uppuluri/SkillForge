import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section — bright, high contrast */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-down">
            {/* SkillForge Logo + Name — highlighted */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-2xl">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                SkillForge
              </h2>
            </div>
            <span className="inline-block px-5 py-2 bg-white/25 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-8 border border-white/40 shadow-lg">
              ✨ No money needed — just your time & talent
            </span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-white mb-8 animate-fade-in-up leading-tight drop-shadow-lg"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Learn & Teach
            <br />
            <span className="text-yellow-300 drop-shadow-md" style={{ textShadow: '0 4px 20px rgba(234,179,8,0.4)' }}>
              with Time Credits
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-white font-medium mb-12 max-w-3xl mx-auto animate-fade-in-up leading-relaxed drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
            Exchange skills without money. Teach 1 hour = earn 1 credit.
            <br className="hidden sm:block" />
            Use credits to learn anything from anyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="group inline-flex items-center justify-center px-10 py-4 bg-white text-blue-700 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-white/40 transition-all duration-300 hover:-translate-y-1 active:scale-95">
              Get Started Free
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/skills" className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white rounded-2xl text-lg font-bold hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 active:scale-95">
              Browse Skills
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {[
              { value: '10+', label: 'Skills' },
              { value: '5+', label: 'Teachers' },
              { value: '∞', label: 'Possibilities' }
            ].map(stat => (
              <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl py-4 px-2 border border-white/20">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-white/70 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-3">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🎯', title: 'List Your Skills', desc: 'Share what you can teach — programming, music, languages, cooking, and more.', color: 'from-blue-500 to-cyan-400' },
              { step: '02', icon: '⏰', title: 'Teach & Earn Credits', desc: 'Every hour you teach earns you 1 time credit. Build your balance by sharing knowledge.', color: 'from-purple-500 to-pink-400' },
              { step: '03', icon: '🚀', title: 'Learn Anything', desc: 'Spend your credits to learn from others. No money needed — just your time and skills.', color: 'from-orange-500 to-yellow-400' }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 card-hover animate-fade-in-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                <div className="absolute top-6 right-6 text-5xl font-bold text-gray-100 dark:text-gray-800 group-hover:text-primary-100 dark:group-hover:text-primary-900 transition-colors">
                  {item.step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">Explore</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-3">Popular Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Technology', emoji: '💻' },
              { name: 'Music', emoji: '🎵' },
              { name: 'Creative Arts', emoji: '🎨' },
              { name: 'Language', emoji: '🌍' },
              { name: 'Health & Fitness', emoji: '🧘' },
              { name: 'Lifestyle', emoji: '🍳' }
            ].map((cat, idx) => (
              <Link
                key={cat.name}
                to={`/skills?category=${cat.name}`}
                className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center card-hover border border-gray-100 dark:border-gray-700 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{cat.emoji}</div>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">Ready to Start Swapping Skills?</h2>
          <p className="text-white/90 text-lg mb-10 font-medium">Join our community and start learning today. No credit card required.</p>
          <Link to="/register" className="inline-flex items-center px-10 py-4 bg-white text-blue-700 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:-translate-y-1 active:scale-95">
            Create Free Account 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">SkillForge</span>
          </div>
          <p className="text-gray-500">Time-Based Learning Exchange Platform</p>
          <p className="text-gray-600 text-sm mt-4">© 2026 SkillForge. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
