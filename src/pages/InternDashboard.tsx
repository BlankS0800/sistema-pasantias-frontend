import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, UserCircle, Search, FileCheck, ListTodo, BookOpen, 
  LogOut, Menu, X, Bell, Briefcase, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo_icon.png'; 

type InternModule = 'dashboard' | 'perfil' | 'explorar' | 'mis-postulaciones' | 'seguimiento' | 'informe';

// URL base de tu API en Laravel
const API_URL = 'http://localhost:9001/api/pasante';

export const InternDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InternModule>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Estados para almacenar la información del backend
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [perfilData, setPerfilData] = useState<any>(null);
  const [pasantiasDisponibles, setPasantiasDisponibles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Función genérica para obtener el token guardado en el login
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Asumiendo que guardas el token aquí en el Login
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Efecto principal: Se ejecuta cada vez que el usuario cambia de pestaña
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'dashboard') {
          // Conecta con: Route::get('/dashboard', [PasanteDashboardController::class, 'index']);
          const response = await fetch(`${API_URL}/dashboard`, { headers: getAuthHeaders() });
          if (response.ok) setDashboardData(await response.json());
        } 
        else if (activeTab === 'perfil') {
          // Conecta con: Route::get('/perfil', [PerfilPasanteController::class, 'show']);
          const response = await fetch(`${API_URL}/perfil`, { headers: getAuthHeaders() });
          if (response.ok) setPerfilData(await response.json());
        }
        else if (activeTab === 'explorar') {
          // Conecta con: Route::get('/pasantias', [PasantiaPasanteController::class, 'index']);
          const response = await fetch(`${API_URL}/pasantias`, { headers: getAuthHeaders() });
          if (response.ok) setPasantiasDisponibles(await response.json());
        }
        // ... Aquí puedes agregar los fetch para 'actividades', 'boleta', etc.
      } catch (error) {
        console.error("Error conectando con Laravel:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      // Conecta con: Route::post('/logout', [AuthController::class, 'logout']);
      await fetch('http://localhost:8000/api/logout', { 
        method: 'POST', 
        headers: getAuthHeaders() 
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
    { id: 'perfil', label: 'Mi Perfil y CV', icon: UserCircle },
    { id: 'explorar', label: 'Buscar Pasantías', icon: Search },
    { id: 'mis-postulaciones', label: 'Boleta e Inscripción', icon: FileCheck },
    { id: 'seguimiento', label: 'Actividades y Bitácora', icon: ListTodo },
    { id: 'informe', label: 'Informe Final', icon: BookOpen },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><p className="text-institucional-blue font-semibold animate-pulse">Cargando datos del servidor...</p></div>;
    }

    switch (activeTab) {
      case 'dashboard':
        // Usamos los datos reales si existen, sino mostramos 0
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Bienvenido, {dashboardData?.nombre_usuario || 'Estudiante'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray flex flex-col justify-between">
                <div>
                  <p className="text-sm text-medium-gray font-semibold">Estado Actual</p>
                  <p className="text-xl font-bold text-secondary-blue mt-2">{dashboardData?.estado || 'Buscando Pasantía'}</p>
                </div>
                <Briefcase className="self-end text-light-gray w-12 h-12 mt-2" />
              </div>
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray flex flex-col justify-between">
                <div>
                  <p className="text-sm text-medium-gray font-semibold">Postulaciones Activas</p>
                  <p className="text-3xl font-bold text-main-green mt-2">{dashboardData?.postulaciones_activas || 0}</p>
                </div>
                <FileText className="self-end text-light-gray w-12 h-12 mt-2" />
              </div>
              <div className="bg-white-main p-6 rounded-xl shadow-sm border border-light-gray flex flex-col justify-between">
                <div>
                  <p className="text-sm text-medium-gray font-semibold">Actividades Pendientes</p>
                  <p className="text-3xl font-bold text-dark-gray mt-2">{dashboardData?.actividades_pendientes || 0}</p>
                </div>
                <ListTodo className="self-end text-light-gray w-12 h-12 mt-2" />
              </div>
            </div>
          </div>
        );

      case 'perfil':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Perfil Profesional</h2>
            
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray space-y-4">
              <h3 className="text-lg font-bold text-dark-gray border-b pb-2">Datos Básicos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-dark-gray mb-4">
                <p><strong>Nombre:</strong> {perfilData?.nombre}</p>
                <p><strong>Carrera:</strong> {perfilData?.carrera}</p>
                <p><strong>Email:</strong> {perfilData?.email}</p>
                <p><strong>Teléfono:</strong> {perfilData?.telefono}</p>
              </div>
              {/* Esta acción debería abrir un modal que llame a: Route::put('/perfil', ...) */}
              <button className="bg-secondary-blue hover:bg-institucional-blue text-white-main px-4 py-2 rounded-lg text-sm transition-colors font-medium">
                Actualizar datos básicos
              </button>
            </div>

            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray space-y-4">
              <h3 className="text-lg font-bold text-dark-gray border-b pb-2">Hoja de Vida (CV)</h3>
              <p className="text-sm text-medium-gray">Gestiona tu currículum para que las empresas puedan evaluar tu perfil.</p>
              <div className="flex gap-4">
                {/* Llama a: Route::post('/hoja-vida', ...) */}
                <button className="bg-main-green hover:bg-soft-green text-white-main px-4 py-2 rounded-lg text-sm transition-colors font-medium">
                  Registrar hoja de vida
                </button>
                {/* Llama a: Route::put('/hoja-vida', ...) */}
                <button className="border border-medium-gray text-dark-gray hover:bg-light-gray px-4 py-2 rounded-lg text-sm transition-colors font-medium">
                  Editar hoja de vida
                </button>
              </div>
            </div>
          </div>
        );

      case 'explorar':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-montserrat font-bold text-institucional-blue">Pasantías Disponibles</h2>
            <div className="bg-white-main p-8 rounded-xl shadow-sm border border-light-gray space-y-4">
              {pasantiasDisponibles.length > 0 ? (
                <ul className="space-y-3">
                  {pasantiasDisponibles.map((pasantia: any) => (
                    <li key={pasantia.id} className="border-b pb-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-institucional-blue">{pasantia.titulo}</p>
                        <p className="text-sm text-medium-gray">{pasantia.empresa_nombre}</p>
                      </div>
                      {/* Llama a: Route::post('/inscripcion/{id_pasantia}', ...) */}
                      <button className="bg-institucional-blue hover:bg-secondary-blue text-white-main px-4 py-2 rounded-lg text-sm font-medium">
                        Inscribirse
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-dark-gray text-sm">No hay pasantías disponibles en este momento.</p>
              )}
            </div>
          </div>
        );

      // ... (El resto de los cases se mantienen igual estructuralmente, pero ya sabes que aquí llamarías a tus rutas de actividades, bitácora e informes)
      
      default:
        return <p>Selecciona un módulo</p>;
    }
  };

  return (
    <div className="flex h-screen bg-light-gray font-poppins overflow-hidden">
      {/* Sidebar y Header se mantienen igual */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-institucional-blue text-white-main rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-institucional-blue text-white-main transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-xl`}>
        <div className="h-20 flex items-center justify-center border-b border-white-main/10 px-6">
          <img src={logoIcon} alt="Icono" className="h-10 w-auto mr-3 brightness-0 invert opacity-90" />
          <span className="font-montserrat font-bold text-lg tracking-wide">Pasante</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as InternModule);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-main-green text-white-main shadow-md' 
                    : 'text-white-main/70 hover:bg-white-main/10 hover:text-white-main'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-white-main' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white-main/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white-main/70 hover:bg-white-main/10 hover:text-white-main hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white-main shadow-sm flex items-center justify-end px-8 z-10 border-b border-light-gray shrink-0">
          <div className="flex items-center gap-6">
            <button className="text-medium-gray hover:text-institucional-blue transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-main-green rounded-full border-2 border-white-main"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-light-gray pl-6">
              <div className="text-right hidden md:block">
                {/* Se alimenta de la ruta /me o /dashboard */}
                <p className="text-sm font-bold text-institucional-blue">{dashboardData?.nombre_usuario || 'Cargando...'}</p>
                <p className="text-xs text-medium-gray">Estudiante - Informática</p>
              </div>
              <UserCircle size={40} className="text-main-green" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};