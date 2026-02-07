import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash, ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function OrderForm({ type }) { // type: 'compra', 'venda', 'devolucao'
  const navigate = useNavigate();
  const isPurchase = type === 'compra';
  const isDevolution = type === 'devolucao';
  
  const title = isPurchase ? 'Nova Compra (Entrada)' : 
                isDevolution ? 'Devolução de Venda (Entrada)' : 'Nova Venda (Saída)';
  const ThemeIcon = isPurchase || isDevolution ? TrendingDown : TrendingUp;

  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState([]); // Suppliers or Clients
  const [products, setProducts] = useState([]);
  
  // Header Form
  const [header, setHeader] = useState({
    nroDocumento: '',
    datetime: new Date().toISOString().slice(0, 16),
    entityId: ''
  });

  // Items State
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    loadDependencies();
  }, [type]);

  async function loadDependencies() {
    try {
      const [prods, ents] = await Promise.all([
        api.listarProdutos(),
        isPurchase ? api.listarFornecedores() : api.listarClientes() // Devolucao uses Clientes too
      ]);
      setProducts(prods || []);
      setEntities(ents || []);
    } catch (err) {
      console.error('Error loading dependencies', err);
    }
  }

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentItem.productId) return;

    const product = products.find(p => p.idProduto === parseInt(currentItem.productId));
    if (!product) return;

    setItems([...items, { ...currentItem, productName: product.nomeProduto }]);
    setCurrentItem({ productId: '', quantity: 1, unitPrice: 0 }); // Reset item form
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (e) => {
     const pid = e.target.value;
     const prod = products.find(p => p.idProduto === parseInt(pid));
     setCurrentItem(prev => ({
        ...prev,
        productId: pid,
        unitPrice: isPurchase ? (prod?.precoCusto || 0) : (prod?.precoVenda || 0)
     }));
  }

  const handleSubmit = async () => {
    if (!header.nroDocumento || !header.entityId || items.length === 0) {
      alert('Preencha os dados obrigatórios e adicione pelo menos um item.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Header (Pedido)
      const timestamp = new Date(header.datetime).getTime();
      const entityKey = isPurchase ? 'fornecedor' : 'cliente';
      const entityIdKey = isPurchase ? 'idFornecedor' : 'idCliente';

      // Build items inside pedido
      const opId = isPurchase ? 1 : isDevolution ? 3 : 2;
      const itens = items.map(item => ({
        operacaoEstoque: { idOperacaoEstoque: opId },
        produto: { idProduto: parseInt(item.productId) },
        quantidade: parseInt(item.quantity),
        valorUnitario: parseFloat(item.unitPrice)
      }));

      const pedidoBody = {
        nroDocumento: header.nroDocumento,
        dtTransacao: timestamp,
        [entityKey]: { [entityIdKey]: parseInt(header.entityId) },
        itens
      };

      if (isPurchase) {
        await api.registrarPedidoCompra(pedidoBody);
      } else {
        await api.registrarPedidoVenda(pedidoBody);
      }

      alert('Operação realizada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao processar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper" style={{ maxWidth: '900px' }}>
      <div className="mb-6">
         <button onClick={() => navigate(-1)} className="btn btn-outline mb-4">
            <ArrowLeft size={18} /> Voltar
         </button>
         <h1 className="page-title flex-gap">
            <ThemeIcon style={{ color: isPurchase ? 'var(--success)' : 'var(--danger)' }} />
            {title}
         </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Col: Header Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Dados da Nota</h3>
                <div className="form-group">
                    <label>Nº Documento / Nota</label>
                    <input 
                        value={header.nroDocumento}
                        onChange={e => setHeader({...header, nroDocumento: e.target.value})}
                        placeholder="Ex: 12345"
                    />
                </div>
                <div className="form-group">
                    <label>Data/Hora</label>
                    <input 
                        type="datetime-local"
                        value={header.datetime}
                        onChange={e => setHeader({...header, datetime: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>{isPurchase ? 'Fornecedor' : 'Cliente'}</label>
                    <select 
                        value={header.entityId}
                        onChange={e => setHeader({...header, entityId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {entities.map(e => (
                            <option key={isPurchase ? e.idFornecedor : e.idCliente} value={isPurchase ? e.idFornecedor : e.idCliente}>
                              {isPurchase ? e.nomeFornecedor : e.nomeCliente}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    padding: '0.75rem',
                    fontSize: '1rem',
                    background: isPurchase ? 'var(--success)' : 'var(--danger)'
                }}
            >
                <Save size={20} />
                {loading ? 'Processando...' : 'Finalizar Pedido'}
            </button>
        </div>

        {/* Right Col: Items */}
        <div>
            <div className="card mb-4" style={{ background: 'rgba(30, 41, 59, 0.4)', borderColor: 'var(--border-color)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Adicionar Item</h3>
                <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 0.5fr', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                        <label>Produto</label>
                        <select 
                            value={currentItem.productId}
                            onChange={handleProductSelect}
                            required
                        >
                            <option value="">Selecione...</option>
                            {products.map(p => (
                                <option key={p.idProduto} value={p.idProduto}>
                                    {p.codigo} - {p.nomeProduto}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label>Qtd</label>
                         <input 
                            type="number" 
                            min="1"
                            value={currentItem.quantity}
                            onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})}
                            required
                         />
                    </div>
                    <div>
                         <label>Valor Unit (R$)</label>
                         <input 
                            type="number" 
                            step="0.01"
                            value={currentItem.unitPrice}
                            onChange={e => setCurrentItem({...currentItem, unitPrice: e.target.value})}
                            required
                         />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '42px' }}>
                            <Plus size={20} />
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ minHeight: '300px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Itens do Pedido ({items.length})</h3>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        Nenhum item adicionado.
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Qtd</th>
                                    <th>Valor Un.</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>R$ {parseFloat(item.unitPrice).toFixed(2)}</td>
                                        <td>R$ {(parseFloat(item.unitPrice) * parseInt(item.quantity)).toFixed(2)}</td>
                                        <td>
                                            <button 
                                                onClick={() => removeItem(idx)}
                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total do Pedido:</td>
                                    <td style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                        R$ {items.reduce((acc, i) => acc + (parseFloat(i.unitPrice) * parseInt(i.quantity)), 0).toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
