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

    // Función de logout mejorada
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
                Swal.fire({
                    title: 'Cerrando sesión...',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        window.location.href = 'login.html';
                    }
                });
            }
        });
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
    });

    // Actualizar último update cada minuto
    let lastUpdateMinutes = 2;
    setInterval(() => {
        lastUpdateMinutes++;
        document.getElementById('lastUpdate').textContent = `hace ${lastUpdateMinutes} min`;
    }, 60000);