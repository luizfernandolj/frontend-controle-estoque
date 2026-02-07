import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import ProductKardex from './pages/ProductKardex';
import OrderForm from './pages/OrderForm';
import OrderList from './pages/OrderList';
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import SupplierList from './pages/SupplierList';
import SupplierForm from './pages/SupplierForm';
import OrderDetail from './pages/OrderDetail';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/*" element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/produtos" element={<ProductList />} />
                  <Route path="/produtos/novo" element={<ProductForm />} />
                  <Route path="/produtos/:id/kardex" element={<ProductKardex />} />
                  
                  {/* Clients & Suppliers */}
                  <Route path="/clientes" element={<ClientList />} />
                  <Route path="/clientes/novo" element={<ClientForm />} />
                  <Route path="/fornecedores" element={<SupplierList />} />
                  <Route path="/fornecedores/novo" element={<SupplierForm />} />

                  {/* Global Transactions */}
                  <Route path="/pedidos/compra" element={<OrderList type="compra" />} />
                  <Route path="/pedidos/venda" element={<OrderList type="venda" />} />
                  <Route path="/pedidos/detalhes/:nroDocumento" element={<OrderDetail />} />

                  {/* Create Pages */}
                  <Route path="/pedidos/compra/novo" element={<OrderForm type="compra" />} />
                  <Route path="/pedidos/venda/novo" element={<OrderForm type="venda" />} />
                  <Route path="/pedidos/devolucao/novo" element={<OrderForm type="devolucao" />} />

                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
