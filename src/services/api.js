const API_BASE = 'http://localhost:8080';

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important for sending cookies
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  // Handle empty responses
  const contentLength = response.headers.get('Content-Length');
  if (contentLength === '0') return null;

  // Try to parse JSON, if fails return text
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  // Produtos
  listarProdutos: () => fetchAPI('/produto'),
  obterProdutoPorId: (id) => fetchAPI(`/produto/id?id=${id}`),
  cadastrarProduto: (data) => fetchAPI('/produto/cadastro', { method: 'POST', body: JSON.stringify(data) }),

  // Clientes
  listarClientes: () => fetchAPI('/cliente'),
  obterClientePorId: (id) => fetchAPI(`/cliente/id?id=${id}`),
  cadastrarCliente: (data) => fetchAPI('/cliente/cadastro', { method: 'POST', body: JSON.stringify(data) }),

  // Fornecedores
  listarFornecedores: () => fetchAPI('/fornecedor'),
  obterFornecedorPorId: (id) => fetchAPI(`/fornecedor/id?id=${id}`),
  cadastrarFornecedor: (data) => fetchAPI('/fornecedor/cadastro', { method: 'POST', body: JSON.stringify(data) }),

  // Pedidos
  registrarPedidoCompra: (data) => fetchAPI('/pedido/compra', { method: 'POST', body: JSON.stringify(data) }),
  registrarPedidoVenda: (data) => fetchAPI('/pedido/venda', { method: 'POST', body: JSON.stringify(data) }),
  listarPedidosCompra: () => fetchAPI('/pedido/compra/listar'),
  listarPedidosVenda: () => fetchAPI('/pedido/venda/listar'),

  // Transacoes (Consulta)
  listarTransacoesPorDocumento: (nro) => fetchAPI(`/transacao/documento?nroDocumento=${nro}`),
  obterHistoricoProduto: (id, start, end) => {
    let url = `/transacao/produto?id=${id}`;
    if (start) url += `&dataInicio=${start}`;
    if (end) url += `&dataFim=${end}`;
    return fetchAPI(url);
  },
  
  // Enderecos
  listarEnderecos: () => fetchAPI('/endereco/lista'),

  // Delete Actions
  removerCliente: (id) => fetchAPI(`/cliente/remover?id=${id}`, { method: 'DELETE' }),
  removerFornecedor: (id) => fetchAPI(`/fornecedor/remover?id=${id}`, { method: 'DELETE' }),
  removerProduto: (id) => fetchAPI(`/produto/remover?id=${id}`, { method: 'DELETE' }),
  removerPedidoCompra: (nro) => fetchAPI(`/pedido/compra/remover?nroDocumento=${nro}`, { method: 'DELETE' }),
  removerPedidoVenda: (nro) => fetchAPI(`/pedido/venda/remover?nroDocumento=${nro}`, { method: 'DELETE' }),
};
