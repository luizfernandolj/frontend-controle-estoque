import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, ArrowLeft, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function OrderList({ type }) { // type: 'compra' or 'venda'
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPurchase = type === 'compra';
  const title = isPurchase ? 'Pedidos de Compra' : 'Pedidos de Venda';
  const ThemeIcon = isPurchase ? TrendingDown : TrendingUp;
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [type]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = isPurchase ? await api.listarPedidosCompra() : await api.listarPedidosVenda();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
           <ThemeIcon style={{ color: isPurchase ? 'var(--success)' : 'var(--danger)' }} />
           {title}
        </h1>
        <div className="flex-gap">
            <button onClick={() => navigate('/')} className="btn btn-outline">
                <ArrowLeft size={18} /> Voltar
            </button>
            <button 
                onClick={() => navigate(`/pedidos/${type}/novo`)} 
                className="btn btn-primary"
                style={{ background: isPurchase ? 'var(--success)' : 'var(--danger)' }}
            >
                <Plus size={18} /> Nova {isPurchase ? 'Compra' : 'Venda'}
            </button>
            {!isPurchase && (
                 <button 
                    onClick={() => navigate('/pedidos/devolucao/novo')} 
                    className="btn btn-outline"
                    title="Registrar Devolução"
                >
                    <RefreshCw size={18} /> Devolução
                </button>
            )}
        </div>
      </div>

      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Data</th>
                <th>{isPurchase ? 'Fornecedor' : 'Cliente'}</th>
                {/* <th>Valor Total</th> TODO: Backend does not return total yet */}
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                   <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum pedido encontrado.</td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{order.nroDocumento}</td>
                    <td>{new Date(order.dtTransacao).toLocaleString()}</td>
                    <td>
                        {isPurchase ? 
                            (order.fornecedor?.nomeFornecedor || order.fornecedor?.nome || '-') : 
                            (order.cliente?.nomeCliente || order.cliente?.nome || order.cliente?.nomeFantasia || '-')}
                    </td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => navigate(`/pedidos/detalhes/${order.nroDocumento}`)}
                        >
                            Detalhes
                        </button>
                        <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#e02424', color: 'white', border: 'none' }}
                            onClick={async () => {
                                if(window.confirm(`Tem certeza que deseja excluir o Pedido nº ${order.nroDocumento} com todos os seus itens?`)) {
                                    try {
                                        if (isPurchase) {
                                            await api.removerPedidoCompra(order.nroDocumento);
                                        } else {
                                            await api.removerPedidoVenda(order.nroDocumento);
                                        }
                                        loadOrders();
                                    } catch(e) {
                                        alert('Erro ao excluir pedido: ' + e.message);
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
