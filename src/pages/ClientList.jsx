import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ClientList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await api.listarClientes();
      if (Array.isArray(data)) setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <Users /> Clientes
        </h1>
        <div className="flex-gap">
            <button onClick={() => navigate('/')} className="btn btn-outline">
                <ArrowLeft size={18} /> Voltar
            </button>
            <button onClick={() => navigate('/clientes/novo')} className="btn btn-primary">
                <Plus size={18} /> Novo Cliente
            </button>
        </div>
      </div>

      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>CNPJ</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum cliente encontrado.</td></tr>
              ) : (
                clients.map(c => (
                  <tr key={c.idCliente}>
                    <td style={{ fontWeight: '500' }}>{c.nomeCliente}</td>
                    <td>{c.cpf || '-'}</td>
                    <td>{c.cnpj || '-'}</td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} disabled>Editar</button>
                        <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#e02424', color: 'white', border: 'none' }}
                            onClick={async () => {
                                if(window.confirm(`Tem certeza que deseja remover ${c.nomeCliente}?`)) {
                                    try {
                                        await api.removerCliente(c.idCliente);
                                        loadClients();
                                    } catch(e) {
                                        alert('Erro ao remover: ' + e.message);
                                    }
                                }
                            }}
                        >
                            Excluir
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
