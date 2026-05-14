import React, { useState } from 'react';
import { MessageSquare, X, Send, UserCircle } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mensajeChat, setMensajeChat] = useState('');
  const [mensajes, setMensajes] = useState([
    { id: 1, texto: '¡Hola! Bienvenido a tu pasantía. Cualquier duda escríbeme por aquí.', remitente: 'jefe', hora: '09:00 AM' }
  ]);

  const handleEnviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensajeChat.trim()) return;
    setMensajes([...mensajes, { id: Date.now(), texto: mensajeChat, remitente: 'yo', hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMensajeChat('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isChatOpen && (
        <div className="bg-white-main w-80 h-96 rounded-2xl shadow-2xl border border-light-gray/50 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-institucional-blue p-4 text-white-main flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <UserCircle size={28} className="text-main-green" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-main-green rounded-full border-2 border-institucional-blue"></span>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Jefe de Pasantes</p>
                <p className="text-xs text-white-main/70">En línea</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white-main/70 hover:text-white-main transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-light-gray/30 space-y-3">
            <p className="text-center text-[10px] text-medium-gray font-semibold mb-4">Hoy</p>
            {mensajes.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.remitente === 'yo' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.remitente === 'yo' ? 'bg-institucional-blue text-white-main rounded-tr-sm shadow-sm' : 'bg-white-main border border-light-gray/50 text-dark-gray rounded-tl-sm shadow-sm'}`}>
                  {msg.texto}
                </div>
                <span className="text-[10px] text-medium-gray mt-1 font-medium">{msg.hora}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleEnviarMensaje} className="p-3 border-t border-light-gray/50 bg-white-main flex gap-2">
            <input type="text" value={mensajeChat} onChange={(e) => setMensajeChat(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-light-gray/40 border border-transparent rounded-xl px-3 py-2 text-sm focus:bg-white-main focus:border-secondary-blue outline-none transition-all" />
            <button type="submit" disabled={!mensajeChat.trim()} className="bg-main-green hover:bg-soft-green text-white-main p-2.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setIsChatOpen(!isChatOpen)} className={`${isChatOpen ? 'bg-secondary-blue' : 'bg-institucional-blue'} hover:bg-secondary-blue text-white-main p-4 rounded-full shadow-lg transition-all transform hover:scale-105 duration-200 flex items-center justify-center`}>
        {isChatOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>
    </div>
  );
};