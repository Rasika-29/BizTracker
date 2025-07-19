<?php
include 'db.php';
header('Content-Type: application/json');

// Fetch all products
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['get_products'])) {
    $result = $conn->query("SELECT * FROM products");
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode($products);
    exit;
}

// Add a new product
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_product'])) {
    $name = $_POST['name'];
    $stock = (int)$_POST['stock'];
    $price = (float)$_POST['price'];

    $stmt = $conn->prepare("INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)");
    $stmt->bind_param("sid", $name, $stock, $price);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Product added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }
    exit;
}

// Delete a product
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['delete_product'])) {
    $id = (int)$_GET['id'];

    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Product deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }
    exit;
}

// Record a new sale
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['record_sale'])) {
    $product_id = (int)$_POST['product_id'];
    $quantity = (int)$_POST['quantity'];

    // Get current stock and price
    $product = $conn->query("SELECT quantity, price FROM products WHERE id = $product_id")->fetch_assoc();
    if (!$product) {
        echo json_encode(['status' => 'error', 'message' => 'Product not found']);
        exit;
    }

    if ($product['quantity'] < $quantity) {
        echo json_encode(['status' => 'error', 'message' => 'Insufficient stock']);
        exit;
    }

    $total_price = $product['price'] * $quantity;

    // Insert into sales table
    $stmt = $conn->prepare("INSERT INTO sales (product_id, quantity_sold, total_price, sale_date) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iid", $product_id, $quantity, $total_price);

    if ($stmt->execute()) {
        // Update product stock
        $new_quantity = $product['quantity'] - $quantity;
        $conn->query("UPDATE products SET quantity = $new_quantity WHERE id = $product_id");

        echo json_encode(['status' => 'success', 'message' => 'Sale recorded successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to record sale']);
    }

    exit;
}

// Fetch all sales history
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['get_sales'])) {
    $result = $conn->query("SELECT s.sale_date, p.name AS product_name, s.quantity_sold, s.total_price FROM sales s JOIN products p ON s.product_id = p.id ORDER BY s.sale_date DESC");
    $sales = [];
    while ($row = $result->fetch_assoc()) {
        $sales[] = $row;
    }
    echo json_encode($sales);
    exit;
}
?>
