import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white flex items-center justify-center">
      <div className="relative">
        {/* Animated Background */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Loading Animation */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 