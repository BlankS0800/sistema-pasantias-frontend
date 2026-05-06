import React, { useState } from 'react';
import { 
  User, Mail, Lock, Phone, CheckCircle2, AtSign, Briefcase, 
  ChevronRight, ChevronLeft, IdCard, MapPin, GraduationCap 
} from 'lucide-react'; 
import { Link } from 'react-router-dom'; 
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const RegisterPage: React.FC = () => {
  // Estado para controlar el paso del formulario (1 = General, 2 = Específico)
  const [step, setStep] = useState(1);
  
  // Estado para unificar todos los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', usuario: '', tipo_usuario: '',
    correo: '', telefono: '', password: '',
    cargo: '', ci: '', registro_universitario: '', direccion: ''
  });

  // Manejador genérico de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pasar al siguiente paso (validando que haya elegido un rol)
  const nextStep = () => {
    if (!formData.tipo_usuario) {
      alert("Por favor, selecciona un tipo de usuario.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos a enviar al backend:", formData);
    // Aquí iría tu lógica de fetch hacia Laravel
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-gray font-poppins">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="bg-white-main w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-medium-gray/20 flex flex-col md:flex-row">
          
          {/* Panel Lateral Decorativo */}
          <div className="md:w-1/3 bg-main-green p-8 text-white-main flex flex-col justify-center space-y-4">
            <CheckCircle2 size={48} />
            <h2 className="text-2xl font-montserrat font-bold">Únete a la Red</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Forma parte del ecosistema que conecta el talento académico con el mundo profesional.
            </p>
            {/* Indicador de progreso simple */}
            <div className="pt-8 flex gap-2">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-white-main' : 'bg-white-main/30'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-white-main' : 'bg-white-main/30'}`}></div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="md:w-2/3 p-8 space-y-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-institucional-blue font-montserrat">
                {step === 1 ? 'Crear Cuenta' : 'Datos Adicionales'}
              </h3>
              <span className="text-xs font-bold text-medium-gray bg-light-gray px-2 py-1 rounded-md">
                Paso {step} de 2
              </span>
            </div>
            
            {/* ================= PASO 1: DATOS GENERALES ================= */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Fila 1: Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Nombre</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Ej: Juan" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Apellido</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                      <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Ej: Pérez" required />
                    </div>
                  </div>
                </div>

                {/* Fila 2: Usuario y Tipo (Nuevos campos) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Usuario</label>
                    <div className="relative group">
                      <AtSign className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                      <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="juanp123" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Tipo de Usuario</label>
                    <select name="tipo_usuario" value={formData.tipo_usuario} onChange={handleChange} className="w-full px-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors appearance-none cursor-pointer" required>
                      <option value="" disabled>Selecciona un rol...</option>
                      <option value="pasante">Pasante</option>
                      <option value="gerente">Gerente de Empresa</option>
                      {/* Aquí puedes agregar más roles en el futuro (ej: admin, supervisor) */}
                    </select>
                  </div>
                </div>

                {/* Fila 3: Correo y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Correo</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                      <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="juan@correo.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Teléfono</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                      <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Ej: 71234567" required />
                    </div>
                  </div>
                </div>

                {/* Fila 4: Contraseña */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="••••••••" required />
                  </div>
                </div>

                <button type="button" onClick={nextStep} className="w-full bg-institucional-blue hover:bg-secondary-blue text-white-main font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-4">
                  Siguiente Paso <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* ================= PASO 2: DATOS ESPECÍFICOS SEGÚN EL ROL ================= */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Formulario para Gerente */}
                {formData.tipo_usuario === 'gerente' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Cargo en la Empresa</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                        <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Ej: Director de Recursos Humanos" required />
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulario para Pasante */}
                {formData.tipo_usuario === 'pasante' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Cédula de Identidad</label>
                        <div className="relative group">
                          <IdCard className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                          <input type="text" name="ci" value={formData.ci} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Ej: 1234567 LP" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Registro Universitario</label>
                        <div className="relative group">
                          <GraduationCap className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                          <input type="text" name="registro_universitario" value={formData.registro_universitario} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Ej: 1789456" required />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-dark-gray uppercase tracking-wider ml-1">Dirección de Residencia</label>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-2.5 text-medium-gray group-focus-within:text-main-green" size={18} />
                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-light-gray/30 border border-medium-gray/20 rounded-xl focus:border-main-green focus:bg-white-main outline-none transition-colors" placeholder="Zona, Calle, Nro" required />
                      </div>
                    </div>
                  </div>
                )}

                {/* Términos y Botones Finales */}
                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" className="w-4 h-4 rounded text-main-green focus:ring-main-green cursor-pointer" id="terms" required />
                  <label htmlFor="terms" className="text-xs text-dark-gray cursor-pointer">Acepto los términos y condiciones de uso.</label>
                </div>

                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-light-gray hover:bg-medium-gray/20 text-dark-gray font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                    <ChevronLeft size={20} /> Atrás
                  </button>
                  <button type="submit" className="w-2/3 bg-main-green hover:bg-soft-green text-white-main font-bold py-3 rounded-xl transition-all shadow-lg shadow-main-green/20">
                    Completar Registro
                  </button>
                </div>
              </div>
            )}

            {/* Link al Login */}
            <p className="text-center text-sm text-dark-gray pt-2">
              ¿Ya tienes cuenta? <Link to="/login" className="text-secondary-blue font-bold hover:underline">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};