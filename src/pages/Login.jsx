import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoggingIn(true);
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
        setError(err.message);
    } finally {
        setLoggingIn(false);
    }
  }

  return (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: 'var(--bg-primary)' // Use theme variable
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Login</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Controle de Estoque</p>
        </div>

        {error && (
            <div style={{ 
                background: '#fee2e2', 
                color: '#b91c1c', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                fontSize: '0.9rem' 
            }}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="label">Usuário Database</label>
            <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="input" 
                  style={{ paddingLeft: '35px' }}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ex: leitor_user"
                  required 
                />
            </div>
          </div>
          
          <div>
            <label className="label">Senha</label>
            <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input" 
                  style={{ paddingLeft: '35px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="********"
                  required 
                />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loggingIn} style={{ justifyContent: 'center' }}>
            {loggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
