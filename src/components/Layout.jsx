import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, TrendingDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <Package size={20} />
          </div>
          <span className="brand-text">
            ERP Estoque
          </span>
        </div>

        <nav className="nav-menu">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/produtos" icon={Package} label="Produtos" />
          <NavItem to="/pedidos/compra" icon={TrendingDown} label="Entrada (Compra)" />
          <NavItem to="/pedidos/venda" icon={TrendingUp} label="Saída (Venda)" />
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <User size={18} />
                <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user?.username}</div>
                    <div style={{ fontSize: '0.75rem' }}>{user?.role}</div>
                </div>
            </div>
            <button 
                onClick={logout}
                className="nav-item" 
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', justifyContent: 'flex-start' }}
            >
                <LogOut size={20} />
                <span>Sair</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
