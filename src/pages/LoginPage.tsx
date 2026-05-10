import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { login } from '../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      const data = await login({
        email: email,
        contrasena: password,
      });

      if (data.redirect) {
        navigate(data.redirect, { replace: true });
        return;
      }

      const abreviacionRol = data.usuario?.rol?.abreviacion;

      if (abreviacionRol === 'GER_EMP') {
        navigate('/gerente/dashboard', { replace: true });
      } else if (abreviacionRol === 'PAS') {
        navigate('/pasante/dashboard', { replace: true });
      } else if (abreviacionRol === 'ENC_PAS') {
        navigate('/jefe/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (error: any) {
      setError(error.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-gray font-poppins">
      <Header />

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="bg-white-main w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-medium-gray/20">

          <div className="bg-institucional-blue p-8 text-center text-white-main">
            <h2 className="text-3xl font-montserrat font-bold mb-2">
              Bienvenido
            </h2>
            <p className="opacity-80 text-sm">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {error && (
              <div className="bg-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-dark-gray ml-1">
                Correo Electrónico
              </label>

              <div className="relative group">
                <Mail
                  className="absolute left-3 top-3.5 text-medium-gray group-focus-within:text-secondary-blue transition-colors"
                  size={20}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@umsa.bo"
                  className="w-full pl-11 pr-4 py-3 bg-light-gray/50 border border-transparent rounded-xl focus:border-secondary-blue focus:bg-white-main outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-dark-gray ml-1">
                Contraseña
              </label>

              <div className="relative group">
                <Lock
                  className="absolute left-3 top-3.5 text-medium-gray group-focus-within:text-secondary-blue transition-colors"
                  size={20}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-light-gray/50 border border-transparent rounded-xl focus:border-secondary-blue focus:bg-white-main outline-none transition-all"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-medium-gray hover:text-dark-gray transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <a href="#" className="text-xs text-secondary-blue hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-institucional-blue hover:bg-secondary-blue text-white-main font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-secondary-blue/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
              <ArrowRight size={20} />
            </button>

            <div className="pt-4 text-center">
              <p className="text-sm text-dark-gray">
                ¿No tienes una cuenta?{' '}
                <a href="/registro" className="text-main-green font-bold hover:underline">
                  Regístrate aquí
                </a>
              </p>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};