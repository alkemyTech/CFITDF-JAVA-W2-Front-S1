document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) { // Verifica que el formulario exista
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

            // Obtén los valores de los campos
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Crea el objeto de datos que se enviará
            const userData = {
                nombre: nombre,
                apellido: apellido,
                email: email,
                password: password
            };

            // Realiza la solicitud POST al backend
            fetch('http://localhost:8080/api/usuario/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la conexión con el servidor');
                }
                return response.json();
            })
            .then(data => {
                // Muestra un mensaje de éxito o redirige al usuario
                Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: '¡Bienvenido a AlkyWallet!',
                }).then(() => {
                    // Redirigir a la página de inicio de sesión o a otra página
                    window.location.href = 'index.html';
                });
            })
            .catch(error => {
                // Manejo de errores
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message,
                });
            });
        });
    } else {
        console.error('El formulario no se encontró. Verifica el ID.');
    }
});