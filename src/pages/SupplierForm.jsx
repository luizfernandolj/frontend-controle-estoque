import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Truck } from 'lucide-react';

export default function SupplierForm() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    nomeFornecedor: '',
    cnpj: '',
    nroEndereco: '',
    enderecoFornecedor: { idEndereco: '' }
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
     loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const data = await api.listarEnderecos();
      if (Array.isArray(data)) {
        setAddresses(data);
        if (data.length > 0) {
           setFormData(prev => ({ ...prev, enderecoFornecedor: { idEndereco: data[0].idEndereco } }));
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.cadastrarFornecedor(formData);
      alert('Fornecedor cadastrado com sucesso!');
      navigate('/fornecedores');
    } catch (error) {
      console.error(error);
      const msg = error.message?.includes('JSON') ? 'Erro: Verifique se o endereço foi selecionado.' : error.message;
      alert('Erro ao cadastrar fornecedor: ' + msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <Truck /> Novo Fornecedor
        </h1>
        <button onClick={() => navigate('/fornecedores')} className="btn btn-outline">
          <ArrowLeft size={18} /> Cancelar
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form-group" style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="label">Nome do Fornecedor *</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.nomeFornecedor}
              onChange={e => setFormData({...formData, nomeFornecedor: e.target.value})}
            />
          </div>
          <div>
            <label className="label">CNPJ *</label>
            <input 
              type="text" 
              className="input" 
              required
              value={formData.cnpj}
              onChange={e => setFormData({...formData, cnpj: e.target.value})}
              maxLength={14}
              placeholder="Apenas números"
            />
          </div>

          <div>
            <label className="label">Endereço (Pré-Cadastrado) *</label>
            <select 
                className="input"
                value={formData.enderecoFornecedor.idEndereco}
                onChange={e => setFormData({...formData, enderecoFornecedor: { idEndereco: e.target.value }})}
                required
            >
                <option value="">Selecione um Endereço...</option>
                {addresses.map(addr => (
                    <option key={addr.idEndereco} value={addr.idEndereco}>
                        {addr.logradouro?.nomeLogradouro} - {addr.bairro?.nomeBairro}, {addr.cidade?.nomeCidade}/{addr.cidade?.unidadeFederativa?.siglaUF}
                    </option>
                ))}
            </select>
          </div>

          <div>
            <label className="label">Número de Endereço</label>
            <input 
              type="text" 
              className="input" 
              value={formData.nroEndereco}
              onChange={e => setFormData({...formData, nroEndereco: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Fornecedor'}
          </button>
        </form>
      </div>
    </div>
  );
}
