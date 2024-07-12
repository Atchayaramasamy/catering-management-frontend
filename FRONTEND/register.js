document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const emailInput = document.getElementById('email');
    const registerButton = document.getElementById('registerButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const passwordError = document.getElementById('passwordError');
    const phoneNumberMessage = document.getElementById('phoneNumberMessage');
    const emailMessage = document.getElementById('emailMessage');
    const usernameError = document.getElementById('usernameError');


    const validateForm = () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const phoneNumber = phoneNumberInput.value.trim();
        const email = emailInput.value.trim();
        let isValid = true;
        

        if (username === '' || password === '' || phoneNumber === '' || email === '') {
            isValid = false;
        }

        if (password.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters long.';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        if (!/^\d{10}$/.test(phoneNumber)) {
            phoneNumberMessage.textContent = 'Phone number must be 10 digits.';
            isValid = false;
        } else {
            phoneNumberMessage.textContent = '';
        }

        registerButton.disabled = !isValid;
    };

    passwordInput.addEventListener('input', validateForm);
    phoneNumberInput.addEventListener('input', function() {
        let phoneNumber = phoneNumberInput.value.trim();
        phoneNumber = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digit characters
        phoneNumberInput.value = phoneNumber.slice(0, 10);
        validateForm();
    });
    usernameInput.addEventListener('input', validateForm);
    emailInput.addEventListener('input', validateForm);

    window.registerUser = function() {
        const user = {
            username: usernameInput.value.trim(),
            password: passwordInput.value.trim(),
            phoneNumber: phoneNumberInput.value.trim(),
            email: emailInput.value.trim()
        };

        fetch('http://localhost:8081/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                successMessage.textContent = data.message;
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                errorMessage.textContent = data.error;
            }
        })
        .catch(error => {
            errorMessage.textContent = 'An error occurred during registration.';
        });
    };
});
