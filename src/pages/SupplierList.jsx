import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Truck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SupplierList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const data = await api.listarFornecedores();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <Truck /> Fornecedores
        </h1>
        <div className="flex-gap">
            <button onClick={() => navigate('/')} className="btn btn-outline">
                <ArrowLeft size={18} /> Voltar
            </button>
            <button onClick={() => navigate('/fornecedores/novo')} className="btn btn-primary">
                <Plus size={18} /> Novo Fornecedor
            </button>
        </div>
      </div>

      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum fornecedor encontrado.</td></tr>
              ) : (
                suppliers.map(s => (
                  <tr key={s.idFornecedor}>
                    <td style={{ fontWeight: '500' }}>{s.nomeFornecedor}</td>
                    <td>{s.cnpj || '-'}</td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} disabled>Editar</button>
                        <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#e02424', color: 'white', border: 'none' }} 
                            onClick={async () => {
                                if(window.confirm(`Tem certeza que deseja remover ${s.nomeFornecedor}?`)) {
                                    try {
                                        await api.removerFornecedor(s.idFornecedor);
                                        loadSuppliers();
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
