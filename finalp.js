function buyNow(button) {
    try {
        // Get the parent food-item div
        const foodItem = button.closest('.food-item');
        
        // Get item details
        const itemDetails = {
            name: foodItem.querySelector('h3').textContent,
            price: foodItem.querySelector('.price').textContent,
            image: foodItem.querySelector('img').src,
            description: foodItem.querySelector('p').textContent || ''
        };

        console.log("Item details:", itemDetails); // Debug log
        
        // Store in sessionStorage
        sessionStorage.setItem('buyNowItem', JSON.stringify(itemDetails));
        
        // Redirect to buy page
        window.location.href = 'buy.html';
    } catch (error) {
        console.error("Error in buyNow:", error);
    }
}

// Toggle menu function (already being used in your HTML)
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Scroll to Top functionality
window.addEventListener('scroll', function() {
    const scrollTop = document.querySelector('.scroll-top');
    if (window.pageYOffset > 300) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
});

document.querySelector('.scroll-top').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Modify the payment handling function
function handlePayment(event) {
    event.preventDefault();
    const amount = calculateTotal() * 100; // Convert to smallest currency unit
    const userEmail = sessionStorage.getItem('userEmail');
    const address = document.getElementById('address').value;

    if (!address) {
        showNotification('Please enter shipping address', 'error');
        return;
    }

    // Get cart items
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Prepare order details
    const orderDetails = {
        items: cartItems,
        totalAmount: calculateTotal(),
        shippingAddress: address,
        userEmail: userEmail
    };

    var options = {
        key: "rzp_test_kOOv5bxD7kI4JO",
        amount: amount,
        currency: "INR",
        name: "Food Order",
        description: "Food Order Payment",
        handler: function(response) {
            // Payment successful, now save order
            saveOrderToDatabase(orderDetails)
                .then(() => {
                    showNotification('Order placed successfully!', 'success');
                    localStorage.removeItem('cart'); // Clear cart
                    setTimeout(() => {
                        window.location.href = 'finalp.html';
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error saving order:', error);
                    showNotification('Error saving order details', 'error');
                });
        },
        prefill: {
            email: userEmail
        },
        theme: {
            color: "#3399cc"
        }
    };

    var pay = new Razorpay(options);
    pay.open();
}

async function saveOrderToDatabase(orderDetails) {
    try {
        console.log('Sending order details:', orderDetails); // Debug log

        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderDetails)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save order');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in saveOrderToDatabase:', error);
        throw error;
    }
}

// Add this function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}
