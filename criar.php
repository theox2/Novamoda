<?php
/**
 * api/pedidos/criar.php - Finalizar Pedido
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'message' => 'Apenas POST permitido']));
}

$input = json_decode(file_get_contents('php://input'), true);

try {
    // ==========================================
    // VALIDAR DADOS
    // ==========================================
    
    $required = ['usuario_id', 'endereco', 'forma_pagamento', 'itens', 'total'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Campo obrigatório ausente: {$field}"
            ]);
            exit;
        }
    }
    
    // Validar usuário
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND ativo = 1");
    $stmt->execute([$input['usuario_id']]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Usuário não encontrado'
        ]);
        exit;
    }
    
    // Validar itens
    if (!is_array($input['itens']) || count($input['itens']) === 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Pedido deve conter pelo menos 1 item'
        ]);
        exit;
    }
    
    // ==========================================
    // CRIAR ENDEREÇO
    // ==========================================
    
    $endereco = $input['endereco'];
    $stmt = $pdo->prepare("
        INSERT INTO enderecos (usuario_id, cep, estado, cidade, bairro, endereco, numero, complemento, padrao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    ");
    
    $stmt->execute([
        $input['usuario_id'],
        $endereco['cep'] ?? '',
        $endereco['estado'] ?? '',
        $endereco['cidade'] ?? '',
        $endereco['bairro'] ?? '',
        $endereco['endereco'] ?? '',
        $endereco['numero'] ?? '',
        $endereco['complemento'] ?? null
    ]);
    
    $endereco_id = $pdo->lastInsertId();
    
    // ==========================================
    // CRIAR PEDIDO
    // ==========================================
    
    $stmt = $pdo->prepare("
        INSERT INTO pedidos (
            usuario_id, 
            endereco_id, 
            status, 
            forma_pagamento, 
            subtotal, 
            desconto, 
            frete, 
            total, 
            cupom_codigo,
            observacoes
        ) VALUES (?, ?, 'pendente', ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['usuario_id'],
        $endereco_id,
        $input['forma_pagamento'],
        $input['subtotal'] ?? $input['total'],
        $input['desconto'] ?? 0,
        $input['frete'] ?? 0,
        $input['total'],
        $input['cupom'] ?? null,
        $input['observacoes'] ?? null
    ]);
    
    $pedido_id = $pdo->lastInsertId();
    
    // ==========================================
    // ADICIONAR ITENS DO PEDIDO
    // ==========================================
    
    $stmt = $pdo->prepare("
        INSERT INTO pedido_itens (
            pedido_id, 
            produto_id, 
            nome_produto, 
            quantidade, 
            tamanho, 
            cor, 
            preco_unitario, 
            subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($input['itens'] as $item) {
        $subtotal = $item['preco'] * $item['quantidade'];
        
        $stmt->execute([
            $pedido_id,
            $item['produto_id'],
            $item['nome'],
            $item['quantidade'],
            $item['tamanho'] ?? null,
            $item['cor'] ?? null,
            $item['preco'],
            $subtotal
        ]);
        
        // Atualizar estoque (opcional)
        if (isset($item['atualizar_estoque']) && $item['atualizar_estoque']) {
            $pdo->prepare("UPDATE produtos SET estoque = estoque - ? WHERE id = ?")->execute([
                $item['quantidade'],
                $item['produto_id']
            ]);
        }
    }
    
    // ==========================================
    // BUSCAR PEDIDO COMPLETO
    // ==========================================
    
    $stmt = $pdo->prepare("SELECT * FROM pedidos WHERE id = ?");
    $stmt->execute([$pedido_id]);
    $pedido = $stmt->fetch();
    
    // ==========================================
    // RESPOSTA
    // ==========================================
    
    echo json_encode([
        'success' => true,
        'message' => 'Pedido criado com sucesso',
        'pedido' => [
            'id' => $pedido_id,
            'numero_pedido' => $pedido['numero_pedido'],
            'status' => $pedido['status'],
            'total' => (float)$pedido['total'],
            'data_pedido' => $pedido['data_pedido']
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar pedido',
        'error' => $e->getMessage()
    ]);
}
?>