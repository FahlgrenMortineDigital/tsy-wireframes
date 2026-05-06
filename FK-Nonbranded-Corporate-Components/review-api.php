<?php
/* ===== WIREFRAME REVIEW COMMENTS API =====
   Simple REST endpoint for shared comment storage.
   Stores all comments in a JSON file on the server.

   GET  review-api.php          → Returns all comments (JSON array)
   POST review-api.php          → Adds a new comment
   DELETE review-api.php        → Clears all comments (use with caution)

   Data is stored in review-comments-data.json alongside this file.
*/

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/review-comments-data.json';

// --- Helpers ---

function readComments() {
    global $dataFile;
    if (!file_exists($dataFile)) return [];
    $raw = file_get_contents($dataFile);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveComments($comments) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($comments, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// --- GET: Return all comments ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $comments = readComments();

    // Sort by timestamp descending (newest first)
    usort($comments, function ($a, $b) {
        return strcmp($b['timestamp'] ?? '', $a['timestamp'] ?? '');
    });

    echo json_encode($comments);
    exit;
}

// --- POST: Add a new comment ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['comment'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment text is required']);
        exit;
    }

    $comments = readComments();
    $comments[] = [
        'page'      => $input['page'] ?? '',
        'pageTitle' => $input['pageTitle'] ?? '',
        'name'      => $input['name'] ?? 'Anonymous',
        'text'      => $input['comment'],
        'timestamp' => $input['timestamp'] ?? date('c')
    ];
    saveComments($comments);

    echo json_encode(['success' => true, 'total' => count($comments)]);
    exit;
}

// --- DELETE: Clear all comments ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    saveComments([]);
    echo json_encode(['success' => true, 'message' => 'All comments cleared']);
    exit;
}

// --- Unsupported method ---
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
