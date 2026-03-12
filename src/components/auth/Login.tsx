import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Stethoscope, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Normalizar el email (Supabase requiere formato email)
    const loginEmail = email.includes('@') ? email : `${email}@clinica.com`;

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: loginEmail,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('profiles').upsert({ 
            id: authData.user.id, 
            role: 'doctor', 
            full_name: email 
          });
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          setIsSignUp(false);
        }
      } else {
        // Intentar Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        // Si el usuario no existe y es una de las credenciales solicitadas, intentar registrarlo automáticamente
        const demoUsers = {
          'ortopedista': 'doctor',
          'asistente': 'assistant',
          'ortopedia': 'doctor' // mantener compatibilidad anterior
        };

        const demoRole = demoUsers[email.toLowerCase() as keyof typeof demoUsers];

        if (authError && (authError.message.includes('Invalid login credentials') || authError.status === 400) && demoRole) {
          console.log(`Intentando auto-registro para cuenta demo: ${email}...`);
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: loginEmail,
            password,
          });
          
          if (!signUpError && signUpData.user) {
            await supabase.from('profiles').upsert({ 
              id: signUpData.user.id, 
              role: demoRole, 
              full_name: email === 'ortopedista' ? 'Dr. Ortopedista' : 
                         email === 'asistente' ? 'Asistente Clínica' : 'Especialista Ortopedia'
            });
            // Re-intentar login
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: loginEmail,
              password,
            });
            if (!retryError && retryData.user) {
              if (demoRole === 'doctor') {
                navigate('/admin');
              } else {
                navigate('/agenda');
              }
              return;
            }
          } else if (signUpError && signUpError.message.includes('User already registered')) {
            // Si ya existe pero falló el login inicial, probablemente la contraseña es incorrecta
            throw new Error('Contraseña incorrecta para este usuario demo.');
          }
        }

        if (authError) throw authError;

        if (authData.user) {
          // Obtener Rol
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();

          if (profile?.role === 'doctor') {
            navigate('/admin');
          } else if (profile?.role === 'assistant') {
            navigate('/agenda');
          } else {
            // Fallback por si no hay perfil
            navigate('/admin');
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message === 'Email not confirmed' 
        ? 'Por favor revisa tu correo para confirmar la cuenta (o desactiva la confirmación en Supabase).' 
        : error.message || 'Credenciales inválidas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-4 p-2">
            <img 
              src="https://appdesignproyectos.com/ortopedialogo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Ortopedia AI</h2>
          <p className="text-slate-500 text-sm">Acceso al portal médico</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-start gap-3 text-sm">
            <AlertCircle className="shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario o Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: ortopedista"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:text-primary-hover font-bold"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Credenciales de acceso:<br/>
            <b>ortopedista / 123prueba</b><br/>
            <b>asistente / 123prueba</b>
          </p>
        </div>
      </div>
    </div>
  );
}
