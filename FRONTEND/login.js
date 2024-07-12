document.getElementById('loginButton').addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:8081/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            const currentUser = {
                userId: result.userid,
                userName: result.username,
                userRole: result.role
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            if (result.role === 'ADMIN') {
                window.location.href = 'admin-menu.html';
            } else if (result.role === 'CUSTOMER') {
                window.location.href = 'customer-menu.html';
            }
        } else {
            errorMessage.textContent = result.message;
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred during login.';
    }
});
