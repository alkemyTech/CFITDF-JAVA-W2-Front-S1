// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function() {
        const toggleIcon = this.querySelector('.material-icons');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = 'visibility_off';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = 'visibility';
        }
    });

    // Form submission with enhanced UX
    // Form submission with enhanced UX
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Loading state
    submitBtn.innerHTML = '<span class="material-icons animate-spin">sync</span><span>Iniciando sesión...</span>';
    submitBtn.disabled = true;

    // Gather user data
    const userData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    // Make API call
    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Credenciales incorrectas');
            });
        }
        return response.json();
    })
    .then(data => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Check the role and redirect accordingly
        let redirectUrl;
        switch (data.rol) {
            case 'ADMIN':
                redirectUrl = 'dashboardAdmin.html';
                break;
            default:
                redirectUrl = 'dashboard.html';
                break;
        }

        // Show success message
        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Iniciando sesión...',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            // Redirigir a la página correspondiente
            window.location.href = redirectUrl;
        });
    })
    .catch(error => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Show error message
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message,
        });
    });
});


    // Input validation feedback
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('border-red-300');
                this.classList.remove('border-gray-200');
            } else {
                this.classList.remove('border-red-300');
                this.classList.add('border-green-300');
            }
        });
    });
});
