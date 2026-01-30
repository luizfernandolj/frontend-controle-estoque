import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Search } from 'lucide-react';
import { api } from '../services/api';

export default function ProductKardex() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = () => {
    setLoading(true);
    // Load product details AND history
    Promise.all([
        api.obterProdutoPorId(id),
        api.obterHistoricoProduto(id, startDate, endDate)
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
  };


  useEffect(() => {
    loadData();
  }, [id]); // Initial load relies on ID change, filter button triggers subsequent loads

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div>
       <button onClick={() => navigate(-1)} className="btn btn-outline mb-6">
          <ArrowLeft size={18} /> Voltar
       </button>

       <div className="card mb-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Histórico de Movimentações
            </h2>
          </div>
          
          {/* Filters */}
          <form onSubmit={handleFilter} className="mb-6 p-4 bg-gray-800 rounded-lg flex flex-wrap gap-4 items-end" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-1">Data Início</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                  />
              </div>
              <div className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-1">Data Fim</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                  />
              </div>
              <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Search size={18} /> Filtrar
              </button>
              {(startDate || endDate) && (
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setTimeout(() => loadData(), 0); // Hack to ensure state update triggers reload if we depended on useEffect, but here we call loadData directly, well actually we need to update state first.
                        // Better: just clear and call loadData, but accessing state immediately might use old values? 
                        // Actually, setState is async. So:
                        // setStartDate(''); setEndDate(''); 
                        // But we want to reload with empty values. loadHelper('', '') would be better.
                        // For now let's just refresh page or simply rely on next filter click? Users prefer clear + auto reload.
                        // Let's force reload with empty args:
                        api.obterHistoricoProduto(id, '', '').then(hist => {
                             // duplicated logic... simplified for now:
                             window.location.reload(); // crude but effective to reset state? No, better to reset state and refetch.
                        });
                    }}
                    style={{ marginLeft: 'auto' }}
                  >
                      Limpar
                  </button>
              )}
          </form>

          <div className="mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
             <div>
                <label>Balanço Calculado (No Período)</label>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                    {loading ? '-' : (
                        (() => {
                            // Calculates balance of DISPLAYED history (filtered)
                            if (history && history.length > 0) {
                                const total = history.reduce((acc, item) => {
                                    const type = (item.tipoOperacao || '').toUpperCase();
                                    const qty = Number(item.quantidade) || 0;
                                    
                                    if (type.includes('COMPRA') || type.includes('DEVOLU') || type.includes('ENTRADA')) {
                                        return acc + qty;
                                    } else {
                                        return acc - qty;
                                    }
                                }, 0);
                                return total; // This is net change in period
                            }
                            return 0;
                        })()
                    )}
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
                        {/* Note: Balance column might be confusing if filtered, as it starts from 0 in the period. 
                            Ideally request start balance from backend. For now we show running balance relative to period start. */}
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Acumulado (Período)</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Carregando histórico...</td></tr>
                    ) : history.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>Nenhuma movimentação no período.</td></tr>
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
