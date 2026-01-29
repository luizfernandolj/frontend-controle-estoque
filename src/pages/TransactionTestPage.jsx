import React, { useState } from 'react';
import { api } from '../services/api';
import { Database, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransactionTestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const handleTest = async (type) => {
    setLoading(true);
    addLog(`Iniciando Teste Transação: ${type}...`, 'info');
    try {
      const result = await api.testarTransacao(type);
      addLog(`Sucesso: ${result.message}`, 'success');
    } catch (error) {
       addLog(`Erro/Resposta do Servidor: ${error.message || error}`, 'error');
    } finally {
      setLoading(false);
      addLog(`Teste ${type} finalizado.`, 'info');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <Database /> Laboratório de Transações BD
        </h1>
        <button onClick={() => navigate('/')} className="btn btn-outline">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="card mb-6">
        <p style={{ color: 'var(--text-secondary)' }}>
          Esta página demonstra comportamento de Transações ACID. <br/>
          Cada teste realiza duas operações: <strong>1. INSERT Pedido</strong> e <strong>2. UPDATE Preço Produto (ID 1)</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* CASE A */}
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--success-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--success)' }}>
               <CheckCircle size={24} />
            </div>
            <h3 style={{ margin: 0 }}>Caso A: Transação OK</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', minHeight: '60px' }}>
            Executa INSERT e UPDATE e finaliza com <strong>COMMIT</strong>. <br/>
            Os dados DEVEM ser persistidos no banco.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'var(--success)' }}
            onClick={() => handleTest('OK')}
            disabled={loading}
          >
            Executar Commit
          </button>
        </div>

        {/* CASE B */}
        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--warning-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--warning)' }}>
               <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: 0 }}>Caso B: Incompleta</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', minHeight: '60px' }}>
            Executa INSERT e UPDATE mas encerra <strong>SEM COMMIT/ROLLBACK</strong> explícito. <br/>
            O Banco deve desfazer (Rollback automático). Nada muda.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'var(--warning)', color: 'black' }}
            onClick={() => handleTest('INCOMPLETE')}
            disabled={loading}
          >
            Executar Incompleta
          </button>
        </div>

        {/* CASE C */}
        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--danger-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)' }}>
               <XCircle size={24} />
            </div>
            <h3 style={{ margin: 0 }}>Caso C: Rollback</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', minHeight: '60px' }}>
            Executa INSERT e UPDATE e força um <strong>ROLLBACK</strong> intencional.<br/>
            As alterações são descartadas. Nada muda.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'var(--danger)' }}
            onClick={() => handleTest('ROLLBACK')}
            disabled={loading}
          >
            Executar Rollback
          </button>
        </div>

      </div>

      <div className="card">
        <h3>Logs da Execução</h3>
        <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '8px', height: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {logs.length === 0 && <span style={{ color: '#666' }}>Aguardando execução...</span>}
            {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '0.5rem', color: log.type === 'error' ? '#f87171' : log.type === 'success' ? '#4ade80' : '#d4d4d4' }}>
                    <span style={{ color: '#666', marginRight: '0.5rem' }}>[{log.time}]</span>
                    {log.msg}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
