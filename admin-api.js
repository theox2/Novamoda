/**
 * admin-api.js - Conecta o painel admin ao banco de dados via PHP
 * Substitui o localStorage por requisições à API
 */

const API_BASE = window.location.origin + '/Novamoda/api';

class AdminAPI {
  constructor() {
    this.init();
  }

  // ==========================================
  // HELPER: FAZER REQUISIÇÕES
  // ==========================================
  
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      this.showToast(error.message, 'error');
      throw error;
    }
  }

  // ==========================================
  // DASHBOARD - ESTATÍSTICAS
  // ==========================================
  
  async loadDashboard() {
    try {
      const stats = await this.request('/admin/dashboard.php');
      
      if (stats.success) {
        const data = stats.data;
        
        // Atualizar elementos do dashboard
        this.updateElement('totalPedidos', data.total_pedidos);
        this.updateElement('totalClientes', data.total_clientes);
        this.updateElement('newCustomers', data.novos_clientes);
        this.updateElement('vendasHoje', `R$ ${this.formatMoney(data.vendas_hoje)}`);
        
        if (data.estoque_baixo > 0) {
          this.updateElement('lowStockCount', data.estoque_baixo);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  }

  // ==========================================
  // PRODUTOS
  // ==========================================
  
  async listarProdutos(filtros = {}) {
    try {
      const params = new URLSearchParams(filtros);
      const response = await this.request(`/produtos/listar.php?${params}`);
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return [];
    }
  }

  async renderProdutosAdmin() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">Carregando produtos...</div>';

    try {
      const produtos = await this.listarProdutos({ limit: 100 });
      
      if (produtos.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">Nenhum produto cadastrado</div>';
        return;
      }

      grid.innerHTML = produtos.map(p => `
        <div class="product-card" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <img src="${p.imagem_principal}" style="width:100%;height:200px;object-fit:cover;" alt="${p.nome}">
          <div style="padding:16px;">
            <h3 style="color:#fff;font-size:16px;margin:0 0 8px 0;">${p.nome}</h3>
            <div style="color:#14d0d6;font-size:20px;font-weight:800;margin-bottom:8px;">
              R$ ${this.formatMoney(p.preco)}
            </div>
            <div style="display:flex;gap:8px;font-size:13px;color:#888;margin-bottom:12px;">
              <span>Estoque: ${p.estoque}</span>
              <span>•</span>
              <span>${p.categoria_nome || 'Sem categoria'}</span>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary" onclick="adminAPI.editarProduto(${p.id})" style="flex:1;padding:8px;font-size:13px;">
                Editar
              </button>
              <button class="btn btn-danger" onclick="adminAPI.deletarProduto(${p.id}, '${p.nome}')" style="padding:8px 12px;font-size:13px;">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `).join('');

    } catch (error) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ff3b30;">Erro ao carregar produtos</div>';
    }
  }

  async criarProduto(dados) {
    try {
      const response = await this.request('/admin/produtos/criar.php', {
        method: 'POST',
        body: JSON.stringify(dados)
      });

      if (response.success) {
        this.showToast('✅ Produto criado com sucesso!', 'success');
        return response.produto;
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return null;
    }
  }

  async editarProduto(id) {
    // Buscar produto
    try {
      const response = await this.request(`/produtos/detalhes.php?id=${id}`);
      
      if (response.success) {
        const produto = response.data;
        
        // Mostrar modal de edição (você pode criar um modal HTML)
        const novoNome = prompt('Nome do produto:', produto.nome);
        if (!novoNome) return;
        
        const novoPreco = parseFloat(prompt('Preço:', produto.preco));
        if (!novoPreco) return;
        
        const novoEstoque = parseInt(prompt('Estoque:', produto.estoque));
        if (isNaN(novoEstoque)) return;

        // Atualizar produto
        const updateResponse = await this.request('/admin/produtos/atualizar.php', {
          method: 'POST',
          body: JSON.stringify({
            id: id,
            nome: novoNome,
            preco: novoPreco,
            estoque: novoEstoque,
            categoria_id: produto.categoria_id,
            descricao: produto.descricao,
            imagem_principal: produto.imagem_principal
          })
        });

        if (updateResponse.success) {
          this.showToast('✅ Produto atualizado!', 'success');
          this.renderProdutosAdmin(); // Recarregar lista
        }
      }
    } catch (error) {
      console.error('Erro ao editar produto:', error);
    }
  }

  async deletarProduto(id, nome) {
    if (!confirm(`Tem certeza que deseja deletar "${nome}"?`)) return;

    try {
      const response = await this.request('/admin/produtos/deletar.php', {
        method: 'POST',
        body: JSON.stringify({ id })
      });

      if (response.success) {
        this.showToast('✅ Produto deletado!', 'success');
        this.renderProdutosAdmin(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  }

  // ==========================================
  // CLIENTES
  // ==========================================
  
  async listarClientes() {
    try {
      const response = await this.request('/admin/clientes.php');
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return [];
    }
  }

  async renderClientesAdmin() {
    const tbody = document.querySelector('#clientsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#888;">Carregando clientes...</td></tr>';

    try {
      const clientes = await this.listarClientes();
      
      if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#888;">Nenhum cliente cadastrado</td></tr>';
        return;
      }

      tbody.innerHTML = clientes.map(c => {
        const dataCadastro = new Date(c.data_cadastro).toLocaleDateString('pt-BR');
        const totalGasto = parseFloat(c.total_gasto || 0);
        const totalPedidos = parseInt(c.total_pedidos || 0);
        
        return `
          <tr>
            <td><strong>#${c.id}</strong></td>
            <td>
              <div style="font-weight:600;color:#fff;">${c.nome}</div>
              <div style="font-size:12px;color:#888;">${c.email}</div>
            </td>
            <td>${c.telefone || '-'}</td>
            <td>${totalPedidos}</td>
            <td><strong style="color:#14d0d6;">R$ ${this.formatMoney(totalGasto)}</strong></td>
            <td>${dataCadastro}</td>
          </tr>
        `;
      }).join('');

      // Atualizar estatísticas
      this.updateElement('totalClientes', clientes.length);

    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#ff3b30;">Erro ao carregar clientes</td></tr>';
    }
  }

  // ==========================================
  // PEDIDOS
  // ==========================================
  
  async listarPedidos() {
    try {
      // Você precisará criar este endpoint
      const response = await this.request('/admin/pedidos/listar.php');
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      return [];
    }
  }

  async renderPedidosAdmin() {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#888;">Carregando pedidos...</td></tr>';

    try {
      const pedidos = await this.listarPedidos();
      
      if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#888;">Nenhum pedido ainda</td></tr>';
        return;
      }

      tbody.innerHTML = pedidos.slice(0, 10).map(p => {
        const data = new Date(p.data_pedido).toLocaleDateString('pt-BR');
        
        return `
          <tr>
            <td><strong>${p.numero_pedido}</strong></td>
            <td>${p.cliente_nome}</td>
            <td>${p.total_itens} itens</td>
            <td><strong>R$ ${this.formatMoney(p.total)}</strong></td>
            <td><span class="status status-${p.status}">${this.getStatusLabel(p.status)}</span></td>
            <td>${data}</td>
            <td>
              <button class="btn" style="padding:6px 12px;font-size:12px;" onclick="alert('Ver detalhes: ${p.numero_pedido}')">
                Ver
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Atualizar estatísticas
      this.updateElement('totalPedidos', pedidos.length);

    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ff3b30;">Erro ao carregar pedidos</td></tr>';
    }
  }

  // ==========================================
  // HELPERS
  // ==========================================
  
  formatMoney(value) {
    return parseFloat(value || 0).toFixed(2).replace('.', ',');
  }

  updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  getStatusLabel(status) {
    const labels = {
      'pendente': 'Pendente',
      'processando': 'Processando',
      'enviado': 'Enviado',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }

  showToast(message, type = 'info') {
    const colors = {
      success: '#14d0d6',
      error: '#ff3b30',
      info: '#0ea5e9'
    };

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${colors[type] || colors.info};
      color: ${type === 'error' ? '#fff' : '#000'};
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================
  
  init() {
    // Detectar qual página admin estamos
    const path = window.location.pathname;

    if (path.includes('admin.html')) {
      // Dashboard
      this.loadDashboard();
      this.renderPedidosAdmin();
    } else if (path.includes('admin-produtos')) {
      // Produtos
      this.renderProdutosAdmin();
    } else if (path.includes('admin-clientes')) {
      // Clientes
      this.renderClientesAdmin();
    } else if (path.includes('admin-pedidos')) {
      // Pedidos
      this.renderPedidosAdmin();
    }
  }
}

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  window.adminAPI = new AdminAPI();
});

// CSS para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);