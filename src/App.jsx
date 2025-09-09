import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Bienvenido a ROKE Industries
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Tu plataforma de hosting tecnológica y moderna
            </p>
            <div className="space-x-4">
              <a 
                href="/login" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </a>
              <a 
                href="/register" 
                className="inline-block bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-600 transition-colors"
              >
                Registrarse
              </a>
            </div>
          </div>
        </div>
      } />
      
      {/* Login Route */}
      <Route path="/login" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
            <p className="text-center text-gray-600">Página de login (sin backend activo)</p>
            <div className="mt-4">
              <a href="/" className="text-blue-600 hover:text-blue-800">← Volver al inicio</a>
            </div>
          </div>
        </div>
      } />
      
      {/* Register Route */}
      <Route path="/register" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Registrarse</h2>
            <p className="text-center text-gray-600">Página de registro (sin backend activo)</p>
            <div className="mt-4">
              <a href="/" className="text-blue-600 hover:text-blue-800">← Volver al inicio</a>
            </div>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;

