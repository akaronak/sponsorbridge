// API Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;

// Page Management
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.remove('hidden');
        
        // Load data when showing certain pages
        if (pageName === 'companies') {
            loadCompanies();
        } else if (pageName === 'organizers') {
            loadOrganizers();
        }
    }
    
    updateNav();
}

function updateNav() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    
    if (authToken && currentUser) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Auth Functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        authToken = data.token;
        currentUser = data;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateNav();
        showPage('home');
        
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        errorDiv.classList.add('hidden');
    } catch (err) {
        errorDiv.textContent = 'Network error: ' + err.message;
        errorDiv.classList.remove('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const errorDiv = document.getElementById('registerError');
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password, role })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        authToken = data.token;
        currentUser = data;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateNav();
        showPage('home');
        
        // Clear form
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerRole').value = '';
        errorDiv.classList.add('hidden');
    } catch (err) {
        errorDiv.textContent = 'Network error: ' + err.message;
        errorDiv.classList.remove('hidden');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateNav();
    showPage('home');
}

// Company Functions
async function loadCompanies() {
    const companiesList = document.getElementById('companiesList');
    const errorDiv = document.getElementById('companiesError');
    
    try {
        const response = await fetch(`${API_URL}/companies`);
        const companies = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = 'Failed to load companies';
            errorDiv.classList.remove('hidden');
            companiesList.innerHTML = '';
            return;
        }
        
        errorDiv.classList.add('hidden');
        
        if (companies.length === 0) {
            companiesList.innerHTML = '<p>No companies found</p>';
            return;
        }
        
        companiesList.innerHTML = companies.map(company => `
            <div class="company-card">
                <h3>${company.companyName}</h3>
                <p><strong>Industry:</strong> ${company.industry}</p>
                <p><strong>Location:</strong> ${company.location}</p>
                <p><strong>Website:</strong> <a href="${company.website}" target="_blank">${company.website}</a></p>
                <p><strong>Contact:</strong> ${company.contactPerson}</p>
                <p><strong>Budget:</strong> $${company.budgetMin || 0} - $${company.budgetMax || 0}</p>
                <div>
                    ${company.sponsorshipTypes ? company.sponsorshipTypes.map(type => 
                        `<span class="badge badge-info">${type}</span>`
                    ).join('') : ''}
                </div>
                ${authToken && currentUser.role === 'ORGANIZER' ? `
                    <button onclick="sendRequest(${company.id})" style="margin-top: 10px;">Send Sponsorship Request</button>
                ` : ''}
            </div>
        `).join('');
    } catch (err) {
        errorDiv.textContent = 'Network error: ' + err.message;
        errorDiv.classList.remove('hidden');
        companiesList.innerHTML = '';
    }
}

async function loadOrganizers() {
    const organizersList = document.getElementById('organizersList');
    const errorDiv = document.getElementById('organizersError');
    
    try {
        // For now, show a message since we don't have a list endpoint
        organizersList.innerHTML = '<p>Organizers list coming soon</p>';
        errorDiv.classList.add('hidden');
    } catch (err) {
        errorDiv.textContent = 'Network error: ' + err.message;
        errorDiv.classList.remove('hidden');
        organizersList.innerHTML = '';
    }
}

async function sendRequest(companyId) {
    if (!authToken) {
        alert('Please login first');
        showPage('login');
        return;
    }
    
    const eventName = prompt('Enter event name:');
    if (!eventName) return;
    
    const sponsorshipAsk = prompt('Enter sponsorship ask amount:');
    if (!sponsorshipAsk) return;
    
    try {
        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                companyId,
                eventName,
                sponsorshipAsk,
                eventSummary: eventName,
                expectedAudienceSize: 100
            })
        });
        
        if (response.ok) {
            alert('Sponsorship request sent successfully!');
            loadCompanies();
        } else {
            alert('Failed to send request');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    showPage('home');
});
