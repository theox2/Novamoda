<?php
/**
 * api/produtos/listar.php - Listagem de Produtos
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../../config.php';

try {
    // Parâmetros de busca
    $categoria = $_GET['categoria'] ?? null;
    $busca = $_GET['busca'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $destaque = isset($_GET['destaque']) ? (int)$_GET['destaque'] : null;
    
    // Query base
    $sql = "SELECT 
                p.*,
                c.nome as categoria_nome,
                c.slug as categoria_slug,
                ROUND(COALESCE((SELECT AVG(nota) FROM avaliacoes WHERE produto_id = p.id AND aprovada = 1), 0), 1) as nota_media,
                (SELECT COUNT(*) FROM avaliacoes WHERE produto_id = p.id AND aprovada = 1) as total_avaliacoes
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.ativo = 1";
    
    $params = [];
    
    // Filtro por categoria
    if ($categoria) {
        $sql .= " AND c.slug = :categoria";
        $params['categoria'] = $categoria;
    }
    
    // Filtro por busca
    if ($busca) {
        $sql .= " AND (p.nome LIKE :busca OR p.descricao LIKE :busca)";
        $params['busca'] = "%{$busca}%";
    }
    
    // Filtro por destaque
    if ($destaque !== null) {
        $sql .= " AND p.destaque = :destaque";
        $params['destaque'] = $destaque;
    }
    
    // Ordenação
    $sql .= " ORDER BY p.destaque DESC, p.data_cadastro DESC";
    
    // Paginação
    $sql .= " LIMIT :limit OFFSET :offset";
    
    // Executar query
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue(":{$key}", $value);
    }
    
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $produtos = $stmt->fetchAll();
    
    // Buscar tamanhos e cores para cada produto
    foreach ($produtos as &$produto) {
        // Tamanhos disponíveis
        $stmt = $pdo->prepare("SELECT tamanho, estoque FROM produto_tamanhos WHERE produto_id = ? ORDER BY id");
        $stmt->execute([$produto['id']]);
        $produto['tamanhos'] = $stmt->fetchAll();
        
        // Cores disponíveis
        $stmt = $pdo->prepare("SELECT cor, codigo_hex FROM produto_cores WHERE produto_id = ? ORDER BY id");
        $stmt->execute([$produto['id']]);
        $produto['cores'] = $stmt->fetchAll();
        
        // Imagens adicionais
        $stmt = $pdo->prepare("SELECT url FROM produto_imagens WHERE produto_id = ? ORDER BY ordem");
        $stmt->execute([$produto['id']]);
        $imagens = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Adicionar imagem principal ao início do array
        if ($produto['imagem_principal']) {
            array_unshift($imagens, $produto['imagem_principal']);
        }
        $produto['imagens'] = $imagens;
        
        // Formatar valores
        $produto['preco'] = (float)$produto['preco'];
        $produto['preco_antigo'] = $produto['preco_antigo'] ? (float)$produto['preco_antigo'] : null;
        $produto['estoque'] = (int)$produto['estoque'];
        $produto['nota_media'] = (float)$produto['nota_media'];
        $produto['total_avaliacoes'] = (int)$produto['total_avaliacoes'];
    }
    
    // Contar total de produtos (sem paginação)
    $countSql = "SELECT COUNT(*) FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.ativo = 1";
    if ($categoria) $countSql .= " AND c.slug = '$categoria'";
    if ($busca) $countSql .= " AND (p.nome LIKE '%{$busca}%' OR p.descricao LIKE '%{$busca}%')";
    if ($destaque !== null) $countSql .= " AND p.destaque = $destaque";
    
    $total = $pdo->query($countSql)->fetchColumn();
    
    // Resposta
    echo json_encode([
        'success' => true,
        'data' => $produtos,
        'pagination' => [
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no servidor',
        'error' => $e->getMessage()
    ]);
}
?>