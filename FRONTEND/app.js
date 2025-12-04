// URL Shortener Frontend - Complete App
console.log('URL Shortener app loaded');

let token = localStorage.getItem('token');
let currentUser = null;

// Loading state functions
function showLoading(button) {
    if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>Processing...';
    }
}

function hideLoading(button, originalText) {
    if (button) {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Show/hide functions
function showLogin() {
    console.log('Showing login form');
    hideAll();
    document.getElementById('loginSection').style.display = 'block';
}

function showSignup() {
    console.log('Showing signup form');
    hideAll();
    document.getElementById('signupSection').style.display = 'block';
}

function showDashboard() {
    console.log('Showing dashboard');
    hideAll();
    document.getElementById('dashboard').style.display = 'block';
    loadUserProfile();
}

function hideAll() {
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    const dashboard = document.getElementById('dashboard');
    
    if (loginSection) loginSection.style.display = 'none';
    if (signupSection) signupSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'none';
}

// Load user profile after login
async function loadUserProfile() {
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            const welcomeElement = document.getElementById('userWelcome');
            if (welcomeElement) {
                welcomeElement.textContent = `Welcome, ${userData.username || userData.name}!`;
            }
        } else {
            console.log('Failed to load user profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Login function
async function handleLogin(e) {
    e.preventDefault();
    const loginButton = e.target.querySelector('button[type="submit"]');
    const loginOriginalText = loginButton.textContent;
    showLoading(loginButton);
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        hideLoading(loginButton, loginOriginalText);
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            showDashboard();
            alert('Login successful!');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed - please try again');
    } finally {
        hideLoading(loginButton, loginOriginalText);
    }
}

// Signup function
async function handleSignup(e) {
    e.preventDefault();
    const signupButton = e.target.querySelector('button[type="submit"]');
    const signupOriginalText = signupButton.textContent;
    showLoading(signupButton);
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!username || !email || !password) {
        alert('Please fill in all fields');
        hideLoading(signupButton, signupOriginalText);
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name: username,
                email: email, 
                password: password 
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful! Please login.');
            document.getElementById('signupForm').reset();
            showLogin();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed - please try again');
    } finally {
        hideLoading(signupButton, signupOriginalText);
    }
}

// URL Shortening function - SIMPLIFIED WORKING VERSION
// URL Shortening function - FIXED
async function handleUrlShorten(e) {
    e.preventDefault();
    const shortenButton = e.target.querySelector('button[type="submit"]');
    const shortenOriginalText = shortenButton.textContent;
    showLoading(shortenButton);
    
    const longUrl = document.getElementById('longUrl').value;
    
    if (!longUrl) {
        alert('Please enter a URL');
        hideLoading(shortenButton, shortenOriginalText);
        return;
    }
    
    try {
        console.log('Sending URL request...');
        
        // CHANGE: Use 'url' instead of 'full_url' to match backend
        const requestBody = { url: longUrl };
        
        const response = await fetch('http://localhost:3000/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            const shortUrl = data.shortUrl || data.short_url || data.url;
            const resultElement = document.getElementById('result');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-container">
                        <div class="result-title">✅ Short URL Created!</div>
                        <div class="result-url">
                            <strong>Original:</strong> <a href="${longUrl}" target="_blank">${longUrl}</a>
                        </div>
                        <div class="result-url">
                            <strong>Short:</strong> <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                        </div>
                        <button onclick="copyToClipboard('${shortUrl}')" class="copy-btn">Copy Short URL</button>
                    </div>
                `;
            }
            document.getElementById('longUrl').value = '';
        } else {
            alert(data.message || 'Failed to shorten URL');
        }
    } catch (error) {
        console.error('URL shorten error:', error);
        alert('Failed to shorten URL - please try again');
    } finally {
        hideLoading(shortenButton, shortenOriginalText);
    }
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copied to clipboard!');
    });
}

// Logout function
function handleLogout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    showLogin();
    alert('Logged out successfully!');
}

// Setup event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app');
    
    // Setup navigation between login and signup
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSignup();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLogin();
        });
    }
    
    // Setup form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const urlForm = document.getElementById('urlForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (urlForm) {
        urlForm.addEventListener('submit', handleUrlShorten);
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Initial auth check
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
    
    console.log('App initialization complete');
});

// Make functions available globally for HTML onclick attributes
window.copyToClipboard = copyToClipboard;