const API_URL = 'http://localhost:5000';

// Register User
async function registerUser(event) {
    event.preventDefault();
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        location: document.getElementById('registerLocation').value,
        phone: document.getElementById('registerPhone').value,
        skills: document.getElementById('registerSkills').value,
    };

    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (response.ok) {
        alert('Registration successful!');
        window.location.href = 'gg.html';
    } else {
        alert(data.message);
    }
}

// Login User
async function loginUser(event) {
    event.preventDefault();
    const loginData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
    };

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        window.location.href = 'userprofile.html';
    } else {
        alert(data.message);
    }
}

// Fetch Profile Data
async function loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Not authorized! Please log in.');
        window.location.href = 'gg.html';
        return;
    }

    const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: { 'Authorization': token }
    });

    const user = await response.json();
    if (response.ok) {
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('location').value = user.location;
        document.getElementById('skills').value = user.skills;
    } else {
        alert(user.message);
        window.location.href = 'gg.html';
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'gg.html';
}

// Attach Event Listeners
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', loginUser);
}
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', registerUser);
}
if (window.location.pathname.includes('userprofile.html')) {
    window.onload = loadProfile;
}
