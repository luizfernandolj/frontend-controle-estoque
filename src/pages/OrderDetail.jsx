import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderDetail() {
  const { nroDocumento } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItems();
  }, [nroDocumento]);

  async function loadItems() {
    try {
      const data = await api.listarTransacoesPorDocumento(nroDocumento);
      if (Array.isArray(data)) {
        setItems(data);
      } else {
          setItems([]);
      }
    } catch (error) {
      console.error('Failed to load order items:', error);
      setError('Erro ao carregar itens do pedido.');
    } finally {
      setLoading(false);
    }
  }

  // Calculate total if possible (client side sum)
  const total = items.reduce((acc, item) => acc + (item.quantidade * (item.valorUnitario || 0)), 0);
  const type = items.length > 0 ? items[0].tipoOperacao : 'Pedido';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <FileText /> Detalhes do Pedido {nroDocumento}
        </h1>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="card mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <strong>Documento:</strong> {nroDocumento} <br/>
                <strong>Tipo:</strong> {type} <br/>
                <strong>Itens:</strong> {items.length}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                Total: R$ {total.toFixed(2)}
            </div>
        </div>
      </div>

      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th style={{ textAlign: 'right' }}>Qtd</th>
                <th style={{ textAlign: 'right' }}>Valor Un. (R$)</th>
                <th style={{ textAlign: 'right' }}>Subtotal (R$)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Carregando...</td>
                </tr>
              ) : error ? (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>{error}</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum item encontrado.</td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '500' }}>{item.nomeProduto}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{item.quantidade}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {item.valorUnitario?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {(item.quantidade * (item.valorUnitario || 0)).toFixed(2)}
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
