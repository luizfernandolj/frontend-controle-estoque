import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransactionList() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const data = await api.listarTodasTransacoes();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <FileText /> Histórico Global de Transações
        </h1>
        <button onClick={() => navigate('/')} className="btn btn-outline">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>

      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Operação</th>
                <th>Produto</th>
                <th>Documento</th>
                <th style={{ textAlign: 'right' }}>Qtd</th>
                <th style={{ textAlign: 'right' }}>Valor Un. (R$)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Carregando...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhuma transação encontrada.</td>
                </tr>
              ) : (
                transactions.map((t, index) => (
                  <tr key={index}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {new Date(t.dataTransacao).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${t.tipoOperacao === 'COMPRA' ? 'status-success' : 'status-danger'}`}>
                        {t.tipoOperacao}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500' }}>{t.nomeProduto}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.nroDocumento}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{t.quantidade}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {t.valorUnitario?.toFixed(2)}
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
