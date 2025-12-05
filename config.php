<?php
/**
 * config.php - Configuração do Banco de Dados
 * COLOQUE ESTE ARQUIVO NA RAIZ DO PROJETO
 */

// Configurações do banco
define('DB_HOST', 'localhost');
define('DB_NAME', 'novamoda');
define('DB_USER', 'root');
define('DB_PASS', ''); // Deixe vazio se não tiver senha
define('DB_CHARSET', 'utf8mb4');

// Conexão PDO
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    // Teste básico
    $pdo->query("SELECT 1");
    
} catch(PDOException $e) {
    // Mostrar erro detalhado
    die(json_encode([
        'error' => true,
        'message' => 'Erro de conexão com o banco de dados',
        'details' => $e->getMessage(),
        'host' => DB_HOST,
        'database' => DB_NAME,
        'user' => DB_USER
    ]));
}
?>