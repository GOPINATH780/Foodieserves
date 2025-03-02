// Store users in localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];

function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered!');
        return false;
    }

    // Create new user
    const newUser = {
        username,
        email,
        password,
        role: email === 'admin@foodieserves.com' ? 'admin' : 'user'
    };

    // Add user to array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Account created successfully!');
    window.location.href = 'login.html';
    return false;
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Invalid email or password!');
        return false;
    }

    // Store logged in user
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Redirect based on role
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'finalp.html';
    }

    return false;
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.querySelector('.login-btn');
    
    if (currentUser) {
        // Update login button to show logout
        loginBtn.textContent = 'Logout';
        loginBtn.href = '#';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'finalp.html';
        };
    }
});

// Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Function to check if user is admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user && user.role === 'admin';
}

// Protect admin routes
if (window.location.pathname.includes('admin.html')) {
    if (!isAdmin()) {
        window.location.href = 'login.html';
    }
}