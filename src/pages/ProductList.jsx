import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Package, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProductList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.listarProdutos();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => 
    p.nomeProduto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <Package /> Catálogo de Produtos
        </h1>
        <Link to="/produtos/novo" className="btn btn-primary">
          <Plus size={18} /> Novo Produto
        </Link>
      </div>

      <div className="card mb-6">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input 
            type="text" 
            placeholder="Buscar por nome ou código..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Custo (R$)</th>
                <th>Venda (R$)</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Carregando...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.idProduto}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{product.codigo}</td>
                    <td style={{ fontWeight: 500 }}>{product.nomeProduto}</td>
                    <td>{product.precoCusto?.toFixed(2)}</td>
                    <td>{product.precoVenda?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${
                        product.quantidade > 10 ? 'status-success' : 
                        product.quantidade > 0 ? 'status-warning' : 
                        'status-danger'
                      }`}>
                        {product.quantidade} un
                      </span>
                    </td>
                    <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ativo</span>
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => navigate(`/produtos/${product.idProduto}/kardex`)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          title="Ver Kardex"
                        >
                          <FileText size={14} /> Histórico
                        </button>
                            <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#e02424', color: 'white', border: 'none' }}
                                onClick={async () => {
                                    if(window.confirm(`Tem certeza que deseja remover ${product.nomeProduto}?`)) {
                                        try {
                                            await api.removerProduto(product.idProduto);
                                            loadProducts();
                                        } catch(e) {
                                            alert('Erro ao remover: ' + e.message);
                                        }
                                    }
                                }}
                            >
                                Excluir
                            </button>
                        </div>
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
