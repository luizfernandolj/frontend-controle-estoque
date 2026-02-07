import React from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, TrendingDown, Users, Truck } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card p-6 hover:scale-[1.02] transition-transform">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon size={24} className={`${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <h3 className="text-secondary text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const ActionCard = ({ title, description, to, icon: Icon, colorClass }) => (
  <Link to={to} className="card" style={{ display: 'block', textDecoration: 'none' }}>
    <div className="flex-gap mb-4">
      <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}>
        <Icon size={24} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{title}</h3>
      </div>
    </div>
    <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
  </Link>
);

import { api } from '../services/api'; import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listarProdutos()
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bem-vindo ao sistema de controle de estoque.</p>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <ActionCard 
          title="Novo Produto" 
          description="Cadastrar itens no catálogo."
          to="/produtos/novo"
          icon={Package}
        />
        <ActionCard 
          title="Nova Compra" 
          description="Registrar entrada de mercadoria."
          to="/pedidos/compra/novo"
          icon={TrendingDown}
        />
        <ActionCard 
          title="Nova Venda" 
          description="Registrar saída e faturamento."
          to="/pedidos/venda/novo"
          icon={TrendingUp}
        />
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <h3 className="mb-4 flex-gap" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            <Users size={20} style={{ color: 'var(--accent-primary)' }} />
            Atalhos Administrativos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <Link to="/clientes" className="flex-between" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', textDecoration: 'none', color: 'inherit', border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div className="flex-gap">
                    <Users size={18} style={{ color: 'var(--info)' }} />
                    <span style={{ fontWeight: '500' }}>Gerenciar Clientes</span>
                </div>
                <div style={{ color: 'var(--info)' }}>→</div>
             </Link>
             <Link to="/fornecedores" className="flex-between" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', textDecoration: 'none', color: 'inherit', border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div className="flex-gap">
                    <Truck size={18} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontWeight: '500' }}>Gerenciar Fornecedores</span>
                </div>
                <div style={{ color: 'var(--warning)' }}>→</div>
             </Link>
          </div>
        </div>

        <div className="card">
           <h3 className="mb-4 flex-gap" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              <Package size={20} style={{ color: 'var(--accent-primary)' }} />
              Resumo de Estoque
           </h3>
           <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Produto</th>
                    <th style={{ padding: '0.5rem' }}>Qtd</th>
                  </tr>
                </thead>
                <tbody>
                   {loading ? (
                     <tr><td colSpan="2" style={{ padding: '1rem', textAlign: 'center' }}>Carregando...</td></tr>
                   ) : products.length === 0 ? (
                     <tr><td colSpan="2" style={{ padding: '1rem', textAlign: 'center' }}>Vazio</td></tr>
                   ) : (
                     products.slice(0, 5).map(p => (
                       <tr key={p.idProduto} style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                             <div style={{ fontWeight: 'bold' }}>{p.nomeProduto}</div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.codigo}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                             <span className={`status-badge ${p.quantidade > 0 ? 'status-success' : 'status-danger'}`}>
                                {p.quantidade} 
                             </span>
                          </td>
                       </tr>
                     ))
                   )}
                </tbody>
              </table>
              {products.length > 5 && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                     <Link to="/produtos" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>Ver todos</Link>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
