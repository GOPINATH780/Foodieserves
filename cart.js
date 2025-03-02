let cartItems = [];

function addToCart(foodItem) {
    try {
        // Get item details
        const name = foodItem.querySelector('h3').textContent;
        const price = foodItem.querySelector('.price').textContent;
        const image = foodItem.querySelector('img').src;
        const description = foodItem.querySelector('p').textContent;

        // Create item object
        const item = {
            name: name,
            price: parseFloat(price.replace('₹', '')),
            image: image,
            description: description,
            quantity: 1
        };

        // Get existing cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if item exists
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }

        // Save cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success message
        showNotification('Success!', `${name} added to cart`, 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error', 'Failed to add item to cart', 'error');
    }
}

function displayCartItems() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) {
        console.log('Cart container not found');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Current cart:', cart);
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        updateSummary(0);
        return;
    }

    let cartHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="price">₹${item.price}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${index}, -1)" class="quantity-btn">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)" class="quantity-btn">+</button>
                </div>
                <button onclick="removeFromCart(${index})" class="remove-btn">
                    <i class="fa fa-trash"></i> Remove
                </button>
            </div>
        `;
    });

    cartContainer.innerHTML = cartHTML;
    updateSummary(subtotal);
}

function changeQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
    }
}

function removeFromCart(index) {
    // Show confirmation dialog
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemName = cart[index].name;
    
    showConfirmDialog(
        'Remove Item',
        `Are you sure you want to remove "${itemName}" from your cart?`,
        () => {
            // User clicked Yes
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            updateCartCount();
            showNotification('Removed', `${itemName} has been removed from cart`, 'info');
        }
    );
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function updateSummary(subtotal) {
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;

    // Get all summary elements
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('deliveryFee');
    const totalElement = document.getElementById('total');

    // Check if cart is empty
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        // Set all values to 0 when cart is empty
        subtotalElement.textContent = '₹0.00';
        deliveryFeeElement.textContent = '₹0.00';
        totalElement.textContent = '₹0.00';
        
        // Disable checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.backgroundColor = '#ccc';
            checkoutBtn.style.cursor = 'not-allowed';
        }
    } else {
        // Show actual values when cart has items
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        deliveryFeeElement.textContent = `₹${deliveryFee.toFixed(2)}`;
        totalElement.textContent = `₹${total.toFixed(2)}`;
        
        // Enable checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.backgroundColor = '#ff4757';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showNotification('Error', 'Your cart is empty!', 'error');
        return;
    }

    // Calculate total amount
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    // Create order details string
    const orderDetails = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

    // Razorpay configuration
    const options = {
        key: 'rzp_test_Q4yKwuiGEyv53i', // Replace with your Razorpay key
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'FoodieServes',
        description: `Order: ${orderDetails}`,
        image: 'your-logo-url.png', // Replace with your logo URL
        handler: function(response) {
            // Payment successful
            handlePaymentSuccess(response);
        },
        prefill: {
            name: sessionStorage.getItem('userName') || '',
            email: sessionStorage.getItem('userEmail') || '',
            contact: sessionStorage.getItem('userPhone') || ''
        },
        theme: {
            color: '#ff4757'
        },
        modal: {
            ondismiss: function() {
                showNotification('Info', 'Payment cancelled', 'info');
            }
        }
    };

    // Initialize Razorpay
    const rzp = new Razorpay(options);
    rzp.open();
}

function handlePaymentSuccess(response) {
    try {
        // Get cart items before clearing
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Generate unique order ID
        const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        // Calculate totals
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const deliveryFee = 40;
        const total = subtotal + deliveryFee;

        // Create order object
        const order = {
            orderId: orderId,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                image: item.image,
                description: item.description,
                quantity: item.quantity
            })),
            paymentId: response.razorpay_payment_id,
            date: new Date().toISOString(),
            status: 'Processing',
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: total,
            paymentMethod: 'Razorpay'
        };

        // Save to order history
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.push(order);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success message
        showNotification('Success!', `Order placed successfully! Order ID: ${orderId}`, 'success');
        
        // Update cart display
        displayCartItems();
        updateCartCount();

        // Redirect to order confirmation
        setTimeout(() => {
            window.location.href = 'order-confirmation.html';
        }, 2000);

    } catch (error) {
        console.error('Error handling payment success:', error);
        showNotification('Error', 'There was an error processing your order', 'error');
    }
}

// Add this function to initialize the cart display
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, displaying cart items');
    displayCartItems();
    updateCartCount();
});

// Add these styles to your finalp.css
const style = document.createElement('style');
style.textContent = `
    .add-cart-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        border: 2px solid red;
        animation: fadeIn 0.3s ease;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-content i {
        color: red;
        font-size: 24px;
    }

    .notification-content p {
        margin: 0;
        color: #333;
        font-size: 16px;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -40%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .fade-out {
        animation: fadeOut 0.3s ease forwards;
    }

    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -60%); }
    }
`;
document.head.appendChild(style);

// Add these new functions for notifications and dialogs
function showNotification(title, message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    
    // Set colors based on type
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    notification.innerHTML = `
        <div class="notification-content" style="
            background: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            border: 2px solid ${colors[type]};
            display: flex;
            align-items: center;
            gap: 15px;
            min-width: 300px;
        ">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}" 
               style="color: ${colors[type]}; font-size: 24px;"></i>
            <div style="flex: 1;">
                <h4 style="margin: 0; color: ${colors[type]}; font-size: 18px;">${title}</h4>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 16px;">${message}</p>
            </div>
        </div>
    `;

    // Style the notification container to appear in center
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { 
                opacity: 0;
                transform: translate(-50%, -40%);
            }
            to { 
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
        @keyframes fadeOut {
            from { 
                opacity: 1;
                transform: translate(-50%, -50%);
            }
            to { 
                opacity: 0;
                transform: translate(-50%, -60%);
            }
        }
    `;
    document.head.appendChild(style);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(backdrop);
    
    // Add notification after backdrop
    document.body.appendChild(notification);
    
    // Fade in backdrop
    setTimeout(() => {
        backdrop.style.opacity = '1';
    }, 0);

    // Remove both elements after delay
    setTimeout(() => {
        backdrop.style.opacity = '0';
        setTimeout(() => {
            backdrop.remove();
            notification.remove();
        }, 300);
    }, 3000);
}

function showConfirmDialog(title, message, onConfirm) {
    // Create dialog backdrop with blur effect
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create dialog content
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: 90%;
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    dialog.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 24px;">${title}</h3>
        <p style="margin: 0 0 25px 0; color: #666; font-size: 16px;">${message}</p>
        <div style="display: flex; justify-content: center; gap: 15px;">
            <button onclick="this.closest('.confirm-dialog-backdrop').remove()" 
                    style="padding: 10px 25px; border: none; border-radius: 8px; background: #ccc; color: white; cursor: pointer; font-size: 16px; transition: background 0.3s ease;">
                Cancel
            </button>
            <button id="confirmBtn" 
                    style="padding: 10px 25px; border: none; border-radius: 8px; background: #f44336; color: white; cursor: pointer; font-size: 16px; transition: background 0.3s ease;">
                Remove
            </button>
        </div>
    `;

    backdrop.className = 'confirm-dialog-backdrop';
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Animate in
    setTimeout(() => {
        backdrop.style.opacity = '1';
        dialog.style.transform = 'scale(1)';
    }, 0);

    // Add hover effects to buttons
    const buttons = dialog.querySelectorAll('button');
    buttons.forEach(button => {
        button.onmouseover = () => {
            button.style.background = button.id === 'confirmBtn' ? '#d32f2f' : '#999';
        };
        button.onmouseout = () => {
            button.style.background = button.id === 'confirmBtn' ? '#f44336' : '#ccc';
        };
    });

    // Add click handler for confirm button
    document.getElementById('confirmBtn').onclick = () => {
        dialog.style.transform = 'scale(0.9)';
        backdrop.style.opacity = '0';
        setTimeout(() => {
            backdrop.remove();
            onConfirm();
        }, 300);
    };
}