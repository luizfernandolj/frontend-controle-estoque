import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function ProductKardex() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load product details AND history
    Promise.all([
        api.obterProdutoPorId(id),
        api.obterHistoricoProduto(id)
    ]).then(([prod, hist]) => {
        setProduct(prod);
        
        let sortedHist = [];
        if (Array.isArray(hist)) {
             // Sort ascending by date for calculation
             sortedHist = [...hist].sort((a, b) => new Date(a.dataTransacao) - new Date(b.dataTransacao));
             
             // Calculate running balance
             let balance = 0;
             sortedHist = sortedHist.map(item => {
                 const qty = item.quantidade;
                 const type = (item.tipoOperacao || '').toUpperCase();
                 
                 // Heuristic for Input vs Output
                 // Inputs: COMPRA, ENTRADA, DEVOLUCAO (assuming sales return adds stock)
                 // Outputs: VENDA, SAIDA
                 if (type.includes('COMPRA') || type.includes('ENTRADA') || type.includes('DEVOLU')) {
                     balance += qty;
                 } else {
                     // Assume VENDA or SAIDA
                     balance -= qty;
                 }
                 item.saldo = balance;
                 return item;
             });
             
             // Reverse back for display (Newest first)
             sortedHist.reverse();
        }
        setHistory(sortedHist);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
       <button onClick={() => navigate(-1)} className="btn btn-outline mb-6">
          <ArrowLeft size={18} /> Voltar
       </button>

       <div className="card mb-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Histórico de Movimentações
          </h2>
          
          <div className="grid-2 mb-6">
             <div>
                <label>Produto</label>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                    {product ? `${product.codigo} - ${product.nomeProduto}` : 'Carregando...'}
                </div>
             </div>
             <div>
                <label>Qtde total em estoque atual</label>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                    {product ? product.quantidade : '-'}
                </div>
             </div>
          </div>

          <div className="table-container">
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Data</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Operação</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Doc</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Qtd</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Valor Un.</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Carregando histórico...</td></tr>
                    ) : history.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Nenhuma movimentação registrada.</td></tr>
                    ) : (
                        history.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                                <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    {new Date(item.dataTransacao).toLocaleString()}
                                </td>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold', color: item.tipoOperacao === 'VENDA' ? 'var(--danger)' : 'var(--success)' }}>
                                    {item.tipoOperacao}
                                </td>
                                <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>{item.nroDocumento}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'monospace' }}>{item.quantidade}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                    R$ {item.valorUnitario?.toFixed(2)}
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                    {item.saldo}
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
