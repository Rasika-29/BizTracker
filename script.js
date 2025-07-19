// ===== Inventory Page Logic =====
const productForm = document.getElementById('productForm');
const inventoryTable = document.getElementById('inventoryTable')?.querySelector('tbody');

if (productForm) {
  productForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const stock = parseInt(document.getElementById('stock').value);
    const price = parseFloat(document.getElementById('price').value);

    if (name && !isNaN(stock) && !isNaN(price)) {
      try {
        const response = await fetch('server.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'add_product': true,
            'name': name,
            'stock': stock,
            'price': price
          })
        });

        const data = await response.text();
        alert(data);

        productForm.reset();
        renderInventory();
      } catch (err) {
        alert('Failed to add product. Please try again.');
        console.error(err);
      }
    } else {
      alert("Please fill in valid product details.");
    }
  };
}

async function renderInventory() {
  if (!inventoryTable) return;
  try {
    const response = await fetch('server.php?get_products=true');
    const products = await response.json();

    inventoryTable.innerHTML = '';
    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>₹${parseFloat(product.price).toFixed(2)}</td>
        <td><button class="delete-btn" data-id="${product.id}">❌ Delete</button></td>
      `;
      inventoryTable.appendChild(tr);
    });

    // Attach delete event to all delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(id);
        }
      });
    });

  } catch (err) {
    console.error("Error fetching products:", err);
    inventoryTable.innerHTML = '<tr><td colspan="4">Error loading inventory</td></tr>';
  }
}

async function deleteProduct(id) {
  try {
    const res = await fetch(`server.php?delete_product=true&id=${id}`);
    const msg = await res.text();
    alert(msg);
    renderInventory();
  } catch (err) {
    alert('Failed to delete product. Please try again.');
    console.error(err);
  }
}

// ===== Sales History Page Logic =====
const salesHistoryTable = document.getElementById('salesHistoryTable')?.querySelector('tbody');

// Function to render the sales history
async function renderSalesHistory() {
  if (!salesHistoryTable) return;

  try {
    const response = await fetch('server.php?get_sales=true');
    const sales = await response.json();

    // Clear the existing table body
    salesHistoryTable.innerHTML = '';

    // Loop through the sales data and populate the table rows
    sales.forEach(sale => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sale.product_name}</td>
        <td>${sale.quantity_sold}</td>
        <td>₹${parseFloat(sale.total_price).toFixed(2)}</td>
        <td>${new Date(sale.sale_date).toLocaleString()}</td>
      `;
      salesHistoryTable.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching sales data:", err);
    salesHistoryTable.innerHTML = '<tr><td colspan="4">Error loading sales history</td></tr>';
  }
}

// Call the function to render the sales history when the page loads
window.onload = function() {
  renderInventory(); // Ensure inventory is loaded
  renderSalesHistory(); // Fetch and display sales history
};
