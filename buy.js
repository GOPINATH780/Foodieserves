// Load selected item details when buy page loads
window.addEventListener('DOMContentLoaded', () => {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems'));
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    const productInfo = document.querySelector('.product-info');

    if (cartItems && cartItems.length > 0) {
        // Display cart items
        productInfo.innerHTML = '<h3>Your Order Summary</h3>';
        let totalAmount = 0;
        
        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
            productInfo.innerHTML += `
                <div class="checkout-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price">Price: $${item.price.toFixed(2)}</p>
                        <p class="item-quantity">Quantity: ${item.quantity}</p>
                        <p class="item-total">Item Total: $${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
        });

        productInfo.innerHTML += `
            <div class="total-price">
                <h4>Order Total:</h4>
                <p id="totalPrice">$${totalAmount.toFixed(2)}</p>
            </div>
        `;
    } else if (selectedItems && selectedItems.length > 0) {
        // Display selected items
        productInfo.innerHTML = '<h3>Your Order Summary</h3>';
        let totalAmount = 0;
        
        selectedItems.forEach((item, index) => {
            productInfo.innerHTML += `
                <div class="checkout-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price">Price: $${item.price.toFixed(2)}</p>
                        <div class="quantity-control">
                            <label for="quantity-${index}">Quantity:</label>
                            <div class="quantity-wrapper">
                                <button type="button" class="quantity-btn minus" onclick="updateQuantity(${index}, -1)">-</button>
                                <input type="number" id="quantity-${index}" value="${item.quantity}" min="1" max="99" readonly>
                                <button type="button" class="quantity-btn plus" onclick="updateQuantity(${index}, 1)">+</button>
                            </div>
                        </div>
                        <p class="item-total">Item Total: $<span id="itemTotal-${index}">${(item.price * item.quantity).toFixed(2)}</span></p>
                    </div>
                </div>
            `;
            totalAmount += item.price * item.quantity;
        });

        productInfo.innerHTML += `
            <div class="total-price">
                <h4>Order Total:</h4>
                <p id="totalPrice">$${totalAmount.toFixed(2)}</p>
            </div>
        `;
    } else {
        // If no item selected, redirect to home page
        window.location.href = 'finalp.html';
    }
});

// Add this function to handle quantity updates
function updateQuantity(index, change) {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems'));
    const quantityInput = document.getElementById(`quantity-${index}`);
    const itemTotalElement = document.getElementById(`itemTotal-${index}`);
    let currentQuantity = parseInt(quantityInput.value);
    let newQuantity = currentQuantity + change;
    
    if (newQuantity >= 1 && newQuantity <= 99) {
        quantityInput.value = newQuantity;
        selectedItems[index].quantity = newQuantity;
        
        // Update item total
        const itemTotal = selectedItems[index].price * newQuantity;
        itemTotalElement.textContent = itemTotal.toFixed(2);
        
        // Update overall total
        let totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('totalPrice').textContent = `$${totalAmount.toFixed(2)}`;
        
        // Save updated quantities
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    setupQuantityControls();
});

function displayOrderSummary() {
    try {
        const buyItem = JSON.parse(sessionStorage.getItem('buyNowItem'));
        const productInfo = document.querySelector('.product-info');
        
        if (!buyItem) {
            window.location.href = 'finalp.html';
            return;
        }

        // Display the selected item
        productInfo.innerHTML = `
            <div class="checkout-item">
                <img src="${buyItem.image}" alt="${buyItem.name}">
                <div class="item-details">
                    <h4>${buyItem.name}</h4>
                    <p class="item-price">Price: $${buyItem.price.toFixed(2)}</p>
                    <div class="quantity-control">
                        <label for="quantity">Quantity:</label>
                        <div class="quantity-wrapper">
                            <button type="button" class="quantity-btn minus" onclick="updateQuantity(-1)">-</button>
                            <input type="number" id="quantity" value="1" min="1" max="99" readonly>
                            <button type="button" class="quantity-btn plus" onclick="updateQuantity(1)">+</button>
                        </div>
                    </div>
                    <p class="item-total">Total: $<span id="itemTotal">${buyItem.price.toFixed(2)}</span></p>
                </div>
            </div>
            <div class="total-price">
                <h4>Order Summary</h4>
                <div class="summary-details">
                    <p>Subtotal: $<span id="subtotal">${buyItem.price.toFixed(2)}</span></p>
                    <p>Delivery Fee: $<span id="deliveryFee">2.99</span></p>
                    <p>Total: $<span id="total">${(buyItem.price + 2.99).toFixed(2)}</span></p>
                </div>
                <button class="delete-btn" onclick="deleteItem()">Remove Item</button>
            </div>
        `;

        // Setup quantity controls after adding to DOM
        setupQuantityControls();
    } catch (error) {
        console.error('Error in displayOrderSummary:', error);
    }
}

function setupQuantityControls() {
    const decreaseBtn = document.querySelector('.quantity-btn.minus');
    const increaseBtn = document.querySelector('.quantity-btn.plus');
    
    if (decreaseBtn && increaseBtn) {
        decreaseBtn.addEventListener('click', () => updateQuantity(-1));
        increaseBtn.addEventListener('click', () => updateQuantity(1));
    }
}

function updateQuantity(change) {
    try {
        const buyItem = JSON.parse(sessionStorage.getItem('buyNowItem'));
        const quantityInput = document.getElementById('quantity');
        const currentQuantity = parseInt(quantityInput.value);
        const newQuantity = currentQuantity + change;

        if (newQuantity >= 1 && newQuantity <= 99) {
            quantityInput.value = newQuantity;
            
            // Update item total
            const itemTotal = buyItem.price * newQuantity;
            document.getElementById('itemTotal').textContent = itemTotal.toFixed(2);
            
            // Update subtotal and total
            document.getElementById('subtotal').textContent = itemTotal.toFixed(2);
            document.getElementById('total').textContent = (itemTotal + 2.99).toFixed(2);

            // Update stored quantity
            buyItem.quantity = newQuantity;
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyItem));
        }
    } catch (error) {
        console.error('Error in updateQuantity:', error);
    }
}

function deleteItem() {
    if (confirm('Are you sure you want to remove this item?')) {
        sessionStorage.removeItem('buyNowItem');
        window.location.href = 'finalp.html';
    }
} 