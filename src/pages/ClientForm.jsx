import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Users } from 'lucide-react';

export default function ClientForm() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    nomeCliente: '',
    cpf: '',
    cnpj: '',
    nroEndereco: '',
    enderecoCliente: { idEndereco: '' }
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
        // Set default if exists
        if (data.length > 0) {
           setFormData(prev => ({ ...prev, enderecoCliente: { idEndereco: data[0].idEndereco } }));
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
      await api.cadastrarCliente(formData);
      alert('Cliente cadastrado com sucesso!');
      navigate('/clientes');
    } catch (error) {
       console.error(error);
      const msg = error.message?.includes('JSON') ? 'Erro: Verifique se o endereço foi selecionado.' : error.message;
      alert('Erro ao cadastrar cliente: ' + msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title flex-gap">
          <Users /> Novo Cliente
        </h1>
        <button onClick={() => navigate('/clientes')} className="btn btn-outline">
          <ArrowLeft size={18} /> Cancelar
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form-group" style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="label">Nome do Cliente *</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.nomeCliente}
              onChange={e => setFormData({...formData, nomeCliente: e.target.value})}
            />
          </div>
          <div className="grid-2">
            <div>
                <label className="label">CPF</label>
                <input 
                type="text" 
                className="input" 
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                maxLength={11}
                placeholder="Apenas números"
                />
            </div>
            <div>
                <label className="label">CNPJ</label>
                <input 
                type="text" 
                className="input" 
                value={formData.cnpj}
                onChange={e => setFormData({...formData, cnpj: e.target.value})}
                maxLength={14}
                placeholder="Apenas números (opcional)"
                />
            </div>
          </div>

          <div>
            <label className="label">Endereço (Pré-Cadastrado) *</label>
            <select 
                className="input"
                value={formData.enderecoCliente.idEndereco}
                onChange={e => setFormData({...formData, enderecoCliente: { idEndereco: e.target.value }})}
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
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
}
