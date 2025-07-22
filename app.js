// Global variables
let currentSection = 'main';
let isAdmin = false;
let cart = [];
let gamingUserInfo = { id: '', region: '' };

const ADMIN_PASSWORD = 'nordstore0132';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateCartCount();
    showSection('main');
});

// Data management
function loadData() {
    // Load products from localStorage or set defaults
    if (!localStorage.getItem('gamingProducts')) {
        const defaultGamingProducts = [
            {
                id: 1,
                name: 'Steam Wallet $10',
                price: 35,
                description: 'Recarga para Steam de $10 USD',
                image: 'https://via.placeholder.com/300x200/1a1a2e/00ff7f?text=Steam+Wallet'
            },
            {
                id: 2,
                name: 'Riot Points 1350 RP',
                price: 25,
                description: 'Riot Points para League of Legends',
                image: 'https://via.placeholder.com/300x200/1a1a2e/00ff7f?text=RP+1350'
            }
        ];
        localStorage.setItem('gamingProducts', JSON.stringify(defaultGamingProducts));
    }

    if (!localStorage.getItem('streamingProducts')) {
        const defaultStreamingProducts = [
            {
                id: 1,
                name: 'Netflix Premium',
                price: 45,
                stock: 10,
                description: 'Cuenta Netflix Premium por 1 mes',
                image: 'https://via.placeholder.com/300x200/1a1a2e/ff0000?text=Netflix'
            },
            {
                id: 2,
                name: 'HBO Max',
                price: 35,
                stock: 5,
                description: 'Cuenta HBO Max por 1 mes',
                image: 'https://via.placeholder.com/300x200/1a1a2e/6633ff?text=HBO+Max'
            },
            {
                id: 3,
                name: 'Disney Plus',
                price: 30,
                stock: 8,
                description: 'Cuenta Disney Plus por 1 mes',
                image: 'https://via.placeholder.com/300x200/1a1a2e/0066ff?text=Disney+'
            }
        ];
        localStorage.setItem('streamingProducts', JSON.stringify(defaultStreamingProducts));
    }

    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// Navigation functions
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section, #mainPage').forEach(el => {
        el.classList.add('hidden');
    });

    // Show requested section
    if (section === 'main') {
        document.getElementById('mainPage').classList.remove('hidden');
    } else {
        document.getElementById(section + 'Section').classList.remove('hidden');
    }

    currentSection = section;

    // Load section-specific content
    if (section === 'gaming') {
        resetGamingForm();
    } else if (section === 'streaming') {
        loadStreamingProducts();
    } else if (section === 'cart') {
        loadCart();
    } else if (section === 'admin') {
        loadAdminPanel();
    }
}

function goHome() {
    showSection('main');
}

function goToGaming() {
    showSection('gaming');
}

function goToStreaming() {
    showSection('streaming');
}

function goToCart() {
    showSection('cart');
}

function goBack() {
    if (currentSection === 'cart') {
        // Determine where to go back based on cart contents
        if (cart.some(item => item.type === 'gaming')) {
            showSection('gaming');
        } else {
            showSection('streaming');
        }
    }
}

// Admin functions
function showAdminLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        closeModal();
        showSection('admin');
    } else {
        alert('Contraseña incorrecta');
    }
}

function logout() {
    isAdmin = false;
    showSection('main');
}

// Gaming section functions
function resetGamingForm() {
    document.getElementById('gamingUserId').value = '';
    document.getElementById('gamingRegion').value = '';
    document.getElementById('gamingProducts').classList.add('hidden');
    gamingUserInfo = { id: '', region: '' };
}

function validateGamingInfo() {
    const userId = document.getElementById('gamingUserId').value.trim();
    const region = document.getElementById('gamingRegion').value.trim();

    if (!userId || !region) {
        alert('Por favor, complete todos los campos');
        return;
    }

    gamingUserInfo = { id: userId, region: region };
    document.getElementById('gamingProducts').classList.remove('hidden');
    loadGamingProducts();
}

function loadGamingProducts() {
    const products = getData('gamingProducts');
    const container = document.getElementById('gamingProductsList');
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <h4>${product.name}</h4>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : ''}
            <div class="price">S/. ${product.price}</div>
            <div class="description">${product.description}</div>
            <button onclick="addToCart('gaming', ${product.id})">Agregar al Carrito</button>
        </div>
    `).join('');
}

// Streaming section functions
function loadStreamingProducts() {
    const products = getData('streamingProducts');
    const container = document.getElementById('streamingProductsList');
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <h4>${product.name}</h4>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : ''}
            <div class="price">S/. ${product.price}</div>
            <div class="stock">Stock: ${product.stock}</div>
            <div class="description">${product.description}</div>
            <button onclick="addToCart('streaming', ${product.id})" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
                ${product.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
        </div>
    `).join('');
}

// Cart functions
function addToCart(type, productId) {
    let products = getData(type + 'Products');
    let product = products.find(p => p.id === productId);
    
    if (!product) return;

    if (type === 'streaming' && product.stock <= 0) {
        alert('Producto sin stock');
        return;
    }

    // Check if product already in cart
    let existingItem = cart.find(item => item.id === productId && item.type === type);
    
    if (existingItem) {
        if (type === 'streaming' && existingItem.quantity >= product.stock) {
            alert('No hay suficiente stock');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            type: type,
            name: product.name,
            price: product.price,
            quantity: 1,
            userInfo: type === 'gaming' ? { ...gamingUserInfo } : null
        });
    }

    updateCartCount();
    showMessage('Producto agregado al carrito', 'success');
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartCountStreaming').textContent = count;
}

function loadCart() {
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        container.innerHTML = '<p>El carrito está vacío</p>';
        totalContainer.innerHTML = '';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                    ${item.userInfo ? `<p>ID: ${item.userInfo.id} | Región: ${item.userInfo.region}</p>` : ''}
                </div>
                <div class="cart-item-price">S/. ${itemTotal}</div>
                <button onclick="removeFromCart(${index})" class="delete-btn">Eliminar</button>
            </div>
        `;
    }).join('');

    // Apply discount if any
    let displayTotal = total;
    let discountDisplay = '';
    
    if (discountApplied) {
        const discountedTotal = total * (1 - discountAmount);
        displayTotal = discountedTotal;
        discountDisplay = `
            <div style="text-align: center; margin: 10px 0;">
                <span style="text-decoration: line-through; color: #999; font-size: 1.2em;">S/. ${total.toFixed(2)}</span>
                <br>
                <span style="color: #e53e3e; font-size: 1.5em; font-weight: bold;">S/. ${discountedTotal.toFixed(2)}</span>
                <br>
                <span style="color: #38a169; font-size: 0.9em;">¡5% de descuento aplicado!</span>
            </div>
        `;
    } else {
        discountDisplay = `<div style="text-align: center; font-size: 1.5em; font-weight: bold;">Total: S/. ${total.toFixed(2)}</div>`;
    }

    totalContainer.innerHTML = discountDisplay;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    loadCart();
}

let discountApplied = false;
let discountAmount = 0;

function applyDiscount() {
    const codeInput = document.getElementById('discountCode');
    const discountMessage = document.getElementById('discountMessage');
    const code = codeInput.value.trim().toLowerCase();

    if (code === '1añonordstoreland') {
        discountAmount = 0.05; // 5% discount
        discountApplied = true;
        discountMessage.textContent = '¡Código de descuento aplicado! 5% de descuento en tu compra.';
        discountMessage.style.color = 'green';
        loadCart(); // Update cart display immediately
    } else {
        discountAmount = 0;
        discountApplied = false;
        discountMessage.textContent = 'Código de descuento inválido.';
        discountMessage.style.color = 'red';
        loadCart(); // Update cart display immediately
    }
}

function processPayment() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    // Calculate total with discount if applied
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (discountApplied) {
        total = total * (1 - discountAmount);
    }

    // Create order
    const order = {
        id: Date.now(),
        items: [...cart],
        total: total,
        date: new Date().toLocaleString('es-ES'),
        status: 'Pendiente',
        discountApplied: discountApplied,
        discountAmount: discountAmount
    };

    // Save order
    let orders = getData('orders');
    orders.push(order);
    saveData('orders', orders);

    // Update stock for streaming products
    cart.forEach(item => {
        if (item.type === 'streaming') {
            let products = getData('streamingProducts');
            let product = products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
            }
            saveData('streamingProducts', products);
        }
    });

    // Send WhatsApp message
    sendWhatsAppMessage(order);

    // Clear cart and discount
    cart = [];
    discountApplied = false;
    discountAmount = 0;
    document.getElementById('discountCode').value = '';
    document.getElementById('discountMessage').textContent = '';

    updateCartCount();

    // Show success message
    showMessage('¡Pago procesado! Su pedido está en proceso. Será contactado por WhatsApp.', 'success');
    
    setTimeout(() => {
        goHome();
    }, 3000);
}

function sendWhatsAppMessage(order) {
    const phoneNumber = '51912888255';
    let message = `🛒 *NUEVO PEDIDO - NORD STORE LAND*\n\n`;
    message += `📅 Fecha: ${order.date}\n`;
    message += `🆔 Pedido #${order.id}\n\n`;
    
    message += `📦 *PRODUCTOS:*\n`;
    order.items.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) - S/. ${item.price * item.quantity}\n`;
        if (item.userInfo) {
            message += `  👤 ID: ${item.userInfo.id} | 🌍 Región: ${item.userInfo.region}\n`;
        }
    });
    
    // Calculate original total for discount display
    const originalTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (order.discountApplied && order.discountAmount > 0) {
        message += `\n💰 *TOTAL:*\n`;
        message += `~~S/. ${originalTotal.toFixed(2)}~~ (Precio original)\n`;
        message += `*S/. ${order.total.toFixed(2)}* (Con 5% descuento) 🎉\n`;
        message += `💸 *Ahorro: S/. ${(originalTotal - order.total).toFixed(2)}*`;
    } else {
        message += `\n💰 *TOTAL: S/. ${order.total.toFixed(2)}*`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Admin panel functions
function loadAdminPanel() {
    showAdminTab('products');
    showProductType('gaming');
}

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('admin' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.remove('hidden');
    event.target.classList.add('active');

    if (tab === 'products') {
        loadAdminProducts();
    } else if (tab === 'orders') {
        loadAdminOrders();
    }
}

function showProductType(type) {
    document.querySelectorAll('.product-admin').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.product-tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('admin' + type.charAt(0).toUpperCase() + type.slice(1) + 'Products').classList.remove('hidden');
    event.target.classList.add('active');

    loadAdminProducts();
}

function loadAdminProducts() {
    loadAdminGamingProducts();
    loadAdminStreamingProducts();
}

function loadAdminGamingProducts() {
    const products = getData('gamingProducts');
    const container = document.getElementById('gamingProductsAdmin');
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <h4>${product.name}</h4>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width: 100px; display: block; margin-bottom: 10px;">` : ''}
            <p>Precio: S/. ${product.price}</p>
            <p>Descripción: ${product.description}</p>
            <div class="admin-product-actions">
                <button class="edit-btn" onclick="editGamingProduct(${product.id})">Editar</button>
                <button class="delete-btn" onclick="deleteGamingProduct(${product.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function loadAdminStreamingProducts() {
    const products = getData('streamingProducts');
    const container = document.getElementById('streamingProductsAdmin');
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <h4>${product.name}</h4>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width: 100px; display: block; margin-bottom: 10px;">` : ''}
            <p>Precio: S/. ${product.price}</p>
            <p>Stock: ${product.stock}</p>
            <p>Descripción: ${product.description}</p>
            <div class="admin-product-actions">
                <button class="edit-btn" onclick="editStreamingProduct(${product.id})">Editar</button>
                <button class="delete-btn" onclick="deleteStreamingProduct(${product.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Product management functions
function addGamingProduct() {
    const name = document.getElementById('newGamingName').value.trim();
    const price = parseFloat(document.getElementById('newGamingPrice').value);
    const description = document.getElementById('newGamingDescription').value.trim();

    if (!name || !price || !description) {
        alert('Por favor, complete todos los campos');
        return;
    }

    const products = getData('gamingProducts');
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        description: description
    };

    products.push(newProduct);
    saveData('gamingProducts', products);

    // Clear form
    document.getElementById('newGamingName').value = '';
    document.getElementById('newGamingPrice').value = '';
    document.getElementById('newGamingDescription').value = '';

    loadAdminGamingProducts();
    showMessage('Producto agregado exitosamente', 'success');
}

function addStreamingProduct() {
    const name = document.getElementById('newStreamingName').value.trim();
    const price = parseFloat(document.getElementById('newStreamingPrice').value);
    const stock = parseInt(document.getElementById('newStreamingStock').value);
    const description = document.getElementById('newStreamingDescription').value.trim();

    if (!name || !price || !stock || !description) {
        alert('Por favor, complete todos los campos');
        return;
    }

    const products = getData('streamingProducts');
    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        stock: stock,
        description: description
    };

    products.push(newProduct);
    saveData('streamingProducts', products);

    // Clear form
    document.getElementById('newStreamingName').value = '';
    document.getElementById('newStreamingPrice').value = '';
    document.getElementById('newStreamingStock').value = '';
    document.getElementById('newStreamingDescription').value = '';

    loadAdminStreamingProducts();
    showMessage('Producto agregado exitosamente', 'success');
}

function deleteGamingProduct(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        let products = getData('gamingProducts');
        products = products.filter(p => p.id !== id);
        saveData('gamingProducts', products);
        loadAdminGamingProducts();
        showMessage('Producto eliminado exitosamente', 'success');
    }
}

function deleteStreamingProduct(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        let products = getData('streamingProducts');
        products = products.filter(p => p.id !== id);
        saveData('streamingProducts', products);
        loadAdminStreamingProducts();
        showMessage('Producto eliminado exitosamente', 'success');
    }
}

function editGamingProduct(id) {
    const products = getData('gamingProducts');
    const product = products.find(p => p.id === id);
    
    if (!product) return;

    // Create a form for editing with image upload
    const newName = prompt('Nuevo nombre:', product.name);
    if (newName === null) return;
    
    const newPrice = prompt('Nuevo precio:', product.price);
    if (newPrice === null) return;
    
    const newDescription = prompt('Nueva descripción:', product.description);
    if (newDescription === null) return;

    // For image, prompt for URL or base64 string
    const newImage = prompt('URL o base64 de la imagen (dejar vacío para no cambiar):', product.image || '');
    if (newImage !== null && newImage.trim() !== '') {
        product.image = newImage.trim();
    }

    product.name = newName.trim();
    product.price = parseFloat(newPrice);
    product.description = newDescription.trim();

    saveData('gamingProducts', products);
    loadAdminGamingProducts();
    showMessage('Producto actualizado exitosamente', 'success');
}

function editStreamingProduct(id) {
    const products = getData('streamingProducts');
    const product = products.find(p => p.id === id);
    
    if (!product) return;

    // Create a form for editing with image upload
    const newName = prompt('Nuevo nombre:', product.name);
    if (newName === null) return;
    
    const newPrice = prompt('Nuevo precio:', product.price);
    if (newPrice === null) return;
    
    const newStock = prompt('Nuevo stock:', product.stock);
    if (newStock === null) return;
    
    const newDescription = prompt('Nueva descripción:', product.description);
    if (newDescription === null) return;

    // For image, prompt for URL or base64 string
    const newImage = prompt('URL o base64 de la imagen (dejar vacío para no cambiar):', product.image || '');
    if (newImage !== null && newImage.trim() !== '') {
        product.image = newImage.trim();
    }

    product.name = newName.trim();
    product.price = parseFloat(newPrice);
    product.stock = parseInt(newStock);
    product.description = newDescription.trim();

    saveData('streamingProducts', products);
    loadAdminStreamingProducts();
    showMessage('Producto actualizado exitosamente', 'success');
}

// Orders management
function loadAdminOrders() {
    const orders = getData('orders');
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No hay pedidos registrados</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>Pedido #${order.id}</h4>
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <p><strong>Fecha:</strong> ${order.date}</p>
            <p><strong>Total:</strong> S/. ${order.total}</p>
            <div><strong>Productos:</strong></div>
            <ul>
                ${order.items.map(item => `
                    <li>${item.name} (x${item.quantity}) - S/. ${item.price * item.quantity}
                        ${item.userInfo ? `<br><small>ID: ${item.userInfo.id} | Región: ${item.userInfo.region}</small>` : ''}
                    </li>
                `).join('')}
            </ul>
            <div class="order-actions">
                <button onclick="updateOrderStatus(${order.id}, 'Pendiente')">Marcar Pendiente</button>
                <button onclick="updateOrderStatus(${order.id}, 'Terminado')">Marcar Terminado</button>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(orderId, status) {
    let orders = getData('orders');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        order.status = status;
        saveData('orders', orders);
        loadAdminOrders();
        showMessage(`Pedido marcado como ${status}`, 'success');
    }
}

// Utility functions
function showMessage(text, type) {
    // Remove existing messages
    document.querySelectorAll('.message').forEach(el => el.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at the top of the current section
    const currentSectionEl = document.querySelector('.section:not(.hidden)') || document.getElementById('mainPage');
    currentSectionEl.insertBefore(message, currentSectionEl.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeModal();
    }
}
