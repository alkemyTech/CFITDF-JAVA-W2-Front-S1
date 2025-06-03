async function mostrarUltimosUsuarios() {
    const ultimosUsuariosDiv = document.getElementById("ultimosUsuarios");
    ultimosUsuariosDiv.innerHTML = ""; // Limpiar contenido previo

    try {
        const response = await fetch('http://localhost:8080/api/usuario/listado');
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }

        const usuarios = await response.json(); // Obtener la lista de usuarios

        // Obtener los últimos 4 usuarios
        const ultimosUsuarios = usuarios.slice(0, 4);

        // Generar el HTML para cada usuario
        ultimosUsuarios.forEach(usuario => {
            const usuarioDiv = document.createElement("div");
            usuarioDiv.className = "flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-300";
            
            usuarioDiv.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span class="material-icons text-blue-600">person</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${usuario.nombre} ${usuario.apellido}</p>
                        <p class="text-sm text-gray-500">Registrado: ${new Date(usuario.fechaRegistro).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-800">${usuario.enabled ? 'Activo' : 'Inactivo'}</p>
                </div>
            `;

            ultimosUsuariosDiv.appendChild(usuarioDiv);
        });
    } catch (error) {
        console.error('Error al cargar los usuarios:', error);
    }
}
function logout() {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: 'Se cerrará tu sesión actual',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Limpiar el localStorage
                    localStorage.removeItem('usuarioId');
                    localStorage.removeItem('nombreUsuario');
                    localStorage.removeItem('apellidoUsuario');
                    localStorage.removeItem('RolUsuario');
                    localStorage.removeItem('cuentaIds');

                    // Mostrar mensaje de cerrando sesión
                    Swal.fire({
                        title: 'Cerrando sesión...',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        willClose: () => {
                            // Redirigir a la página de inicio de sesión
                            window.location.href = 'index.html'; // Cambia esto por la URL de tu página de inicio de sesión
                        }
                    });
                }
            });
        }
// Actualizar hora actual
    function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('currentTime').textContent = `${timeString}`;
    }

    // Simular datos del dashboard
    function loadDashboardData() {
        // Simular saldo
        const saldo = 125750.50;
        document.getElementById('saldo').textContent = saldo.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Simular estadísticas
        document.getElementById('monthlyIncome').textContent = '87.500,00';
        document.getElementById('monthlyExpenses').textContent = '34.250,00';
        document.getElementById('transactionCount').textContent = '23';
    }

    // Animación de números (contador)
    function animateNumber(elementId, finalNumber, duration = 2000) {
        const element = document.getElementById(elementId);
        const startNumber = 0;
        const increment = finalNumber / (duration / 16);
        let currentNumber = startNumber;

        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                currentNumber = finalNumber;
                clearInterval(timer);
            }
            element.textContent = currentNumber.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }, 16);
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);

        loadDashboardData();

        mostrarUltimosUsuarios();

        // Animar el saldo al cargar
        setTimeout(() => {
            animateNumber('saldo', 125750.50);
        }, 500);

        // Mostrar notificación de bienvenida
        setTimeout(() => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: '¡Bienvenida de vuelta, Melina!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }, 1000);

        // Obtener el nombre y apellido del usuario del localStorage
            const nombreUsuario = localStorage.getItem('nombreUsuario');
            const apellidoUsuario = localStorage.getItem('apellidoUsuario');
            
            if (nombreUsuario && apellidoUsuario) {
                document.getElementById('userFullName').textContent = `${nombreUsuario} ${apellidoUsuario}`; // Mostrar el nombre completo en la página
            } else {
                document.getElementById('userFullName').textContent = 'Usuario'; // Nombre por defecto si no hay
            }
    });

    // Actualizar último update cada minuto
    let lastUpdateMinutes = 2;
    setInterval(() => {
        lastUpdateMinutes++;
        document.getElementById('lastUpdate').textContent = `hace ${lastUpdateMinutes} min`;
    }, 60000);
