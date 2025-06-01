let selectedAmount = 0;
let selectedMethod = '';

// Actualizar hora actual
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const dateString = now.toLocaleDateString('es-AR');
    document.getElementById('currentTime').textContent = `${timeString}`;
    document.getElementById('lastAccess').textContent = `${dateString} - ${timeString} hs`;
}

// Nueva función para actualizar la hora
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Manejar selección de montos predefinidos
document.querySelectorAll('.amount-card').forEach(card => {
    card.addEventListener('click', function() {
        // Remover selección anterior
        document.querySelectorAll('.amount-card').forEach(c => c.classList.remove('selected'));

        // Seleccionar actual
        this.classList.add('selected');
        selectedAmount = parseInt(this.dataset.amount);

        // Actualizar input
        document.getElementById('monto').value = selectedAmount;

        updateResumen();
    });
});

// Manejar input manual
document.getElementById('monto').addEventListener('input', function() {
    selectedAmount = parseInt(this.value) || 0;

    // Remover selección de cards
    document.querySelectorAll('.amount-card').forEach(c => c.classList.remove('selected'));

    updateResumen();
});

// Manejar selección de método de pago
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function() {
        // Remover selección anterior
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));

        // Seleccionar actual
        this.classList.add('selected');
        selectedMethod = this.dataset.method;

        updateResumen();
    });
});

// Actualizar resumen
function updateResumen() {
    const resumen = document.getElementById('resumenCarga');
    const btnConfirmar = document.getElementById('btnConfirmar');

    if (selectedAmount >= 100 && selectedMethod) {
        resumen.classList.remove('hidden');
        btnConfirmar.disabled = false;

        document.getElementById('montoResumen').textContent = selectedAmount.toLocaleString('es-AR');
        document.getElementById('totalResumen').textContent = selectedAmount.toLocaleString('es-AR');

        const methodNames = {
            'tarjeta': 'Tarjeta de crédito/débito',
            'transferencia': 'Transferencia bancaria',
            'mercadopago': 'MercadoPago',
            'rapipago': 'Rapipago/Pagofácil'
        };
        document.getElementById('metodoResumen').textContent = methodNames[selectedMethod];
    } else {
        resumen.classList.add('hidden');
        btnConfirmar.disabled = true;
    }
}

// Función de logout
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

// Manejar envío del formulario
document.getElementById('cargaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (selectedAmount < 100) {
        Swal.fire({
            icon: 'warning',
            title: 'Monto inválido',
            text: 'El monto mínimo es $100'
        });
        return;
    }

    if (!selectedMethod) {
        Swal.fire({
            icon: 'warning',
            title: 'Método de pago',
            text: 'Por favor selecciona un método de pago'
        });
        return;
    }

    const btnConfirmar = document.getElementById('btnConfirmar');
    const originalText = btnConfirmar.innerHTML;

    // Estado de carga
    btnConfirmar.innerHTML = '<span class="material-icons animate-spin mr-2">sync</span><span>Procesando...</span>';
    btnConfirmar.disabled = true;

    // Simular procesamiento
    setTimeout(() => {
        btnConfirmar.innerHTML = originalText;
        btnConfirmar.disabled = false;

        Swal.fire({
            icon: 'success',
            title: '¡Carga exitosa! 🎉',
            html: `
                <p>Se han cargado <strong>$${selectedAmount.toLocaleString('es-AR')}</strong> a tu billetera</p>
                <p class="text-sm text-gray-600 mt-2">Método: ${document.getElementById('metodoResumen').textContent}</p>
            `,
            confirmButtonText: 'Ver mi saldo',
            confirmButtonColor: '#059669'
        }).then(() => {
            window.location.href = 'dashboard.html';
        });
    }, 2000);
});

// Al cargar el documento
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime(); // Actualiza la hora al cargar
    setInterval(updateCurrentTime, 60000); // Actualizar cada minuto

    // Obtener el nombre y apellido del usuario del localStorage
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const apellidoUsuario = localStorage.getItem('apellidoUsuario');
    
    if (nombreUsuario && apellidoUsuario) {
        document.getElementById('userFullName').textContent = `${nombreUsuario} ${apellidoUsuario}`; // Mostrar el nombre completo en la página
    } else {
        document.getElementById('userFullName').textContent = 'Usuario'; // Nombre por defecto si no hay
    }
});
