// ===== LocalStorage Utilities =====
function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
  }
  
  function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  
  function getSales() {
    return JSON.parse(localStorage.getItem('sales') || '[]');
  }
  
  function saveSales(sales) {
    localStorage.setItem('sales', JSON.stringify(sales));
  }
  
  // ===== Inventory Page Logic =====
  const productForm = document.getElementById('productForm');
  const inventoryTable = document.getElementById('inventoryTable')?.querySelector('tbody');
  
  if (productForm) {
    productForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const stock = parseInt(document.getElementById('stock').value);
      const price = parseFloat(document.getElementById('price').value);
      if (name && !isNaN(stock) && !isNaN(price)) {
        const products = getProducts();
        products.push({ id: Date.now(), name, stock, price });
        saveProducts(products);
        productForm.reset();
        renderInventory();
      }
    };
  }
  
  function renderInventory() {
    if (!inventoryTable) return;
    inventoryTable.innerHTML = '';
    const products = getProducts();
    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${product.name}</td>
        <td>${product.stock}</td>
        <td>₹${product.price.toFixed(2)}</td>
        <td><button onclick="deleteProduct(${product.id})">Delete</button></td>
      `;
      inventoryTable.appendChild(tr);
    });
  }
  
  function deleteProduct(id) {
    const products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderInventory();
  }
  
  // ===== Dashboard Page Logic =====
  function updateDashboard() {
    const products = getProducts();
    const sales = getSales();
  
    const productCount = products.length;
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const lowStock = products.filter(p => p.stock <= 5).length;
  
    document.getElementById('productCount').textContent = productCount;
    document.getElementById('totalSales').textContent = totalSales.toFixed(2);
    document.getElementById('lowStockCount').textContent = lowStock;
  }
  
  // ===== Sales Page Logic =====
  const salesForm = document.getElementById('salesForm');
  const productSelect = document.getElementById('productSelect');
  const salesList = document.getElementById('salesList');
  
  if (salesForm) {
    populateProductOptions();
  
    salesForm.onsubmit = (e) => {
      e.preventDefault();
      const productId = parseInt(productSelect.value);
      const quantity = parseInt(document.getElementById('quantity').value);
      if (!isNaN(productId) && !isNaN(quantity)) {
        let products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product && product.stock >= quantity) {
          product.stock -= quantity;
          saveProducts(products);
  
          const sale = {
            id: Date.now(),
            productName: product.name,
            quantity,
            amount: quantity * product.price,
            date: new Date().toLocaleString()
          };
  
          const sales = getSales();
          sales.push(sale);
          saveSales(sales);
          salesForm.reset();
          populateProductOptions();
          renderSales();
        } else {
          alert("Insufficient stock!");
        }
      }
    };
  }
  
  function populateProductOptions() {
    if (!productSelect) return;
    productSelect.innerHTML = '';
    const products = getProducts();
    products.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `${p.name} (Stock: ${p.stock})`;
      productSelect.appendChild(option);
    });
  }
  
  function renderSales() {
    if (!salesList) return;
    const sales = getSales();
    salesList.innerHTML = '';
    sales.reverse().forEach(sale => {
      const li = document.createElement('li');
      li.textContent = `${sale.date} - Sold ${sale.quantity} x ${sale.productName} for ₹${sale.amount.toFixed(2)}`;
      salesList.appendChild(li);
    });
  }
  
  // ===== Initialize Based on Page =====
  window.onload = () => {
    if (document.title.includes('Inventory')) {
      renderInventory();
    } else if (document.title.includes('Sales')) {
      renderSales();
    } else if (document.title.includes('Dashboard')) {
      updateDashboard();
    }
  };
  