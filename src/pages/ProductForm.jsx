import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function ProductForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nomeProduto: '',
    precoCusto: '',
    precoVenda: '',
    quantidade: '0' // Initial stock
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert types
      const payload = {
        ...formData,
        precoCusto: parseFloat(formData.precoCusto),
        precoVenda: parseFloat(formData.precoVenda),
        quantidade: parseInt(formData.quantidade)
      };

      await api.cadastrarProduto(payload);
      alert('Produto cadastrado com sucesso!');
      navigate('/produtos');
    } catch (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper" style={{ maxWidth: '600px' }}>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-outline mb-4">
          <ArrowLeft size={18} /> Voltar
        </button>
        <h1 className="page-title">Novo Produto</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Código</label>
              <input 
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                required
                placeholder="Ex: P-001"
              />
            </div>
            
            <div className="form-group">
              <label>Nome do Produto</label>
              <input 
                name="nomeProduto"
                value={formData.nomeProduto}
                onChange={handleChange}
                required
                placeholder="Ex: Teclado Mecânico"
              />
            </div>

            <div className="form-group">
              <label>Preço de Custo (R$)</label>
              <input 
                type="number"
                step="0.01"
                name="precoCusto"
                value={formData.precoCusto}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Preço de Venda (R$)</label>
              <input 
                type="number"
                step="0.01"
                name="precoVenda"
                value={formData.precoVenda}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Estoque Inicial</label>
              <input 
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                required
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Geralmente 0. Use "Entrada" para adicionar estoque.</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
