document.addEventListener('DOMContentLoaded', function(){
    cargarCuentas();
    obtenerSaldoActual();
});

let selectedAmount = 0;
let selectedMethod = '';

const cargarCuentas = async () => {
    let userId = localStorage.getItem('usuarioId');
    try{
        const response = await fetch(`http://localhost:8080/api/cuentas/usuario/${userId}`);
        if(!response.ok){
            throw new Error("No fue posible obtener las cuentas del usuario ID "+userId);
        }else{
            const cuentas = await response.json();
            console.log(cuentas);
            const selectCuentas = document.getElementById("cuentaAsociada");
            cuentas.forEach(cuenta => {
                const optionSelect = document.createElement("option");
                optionSelect.textContent = `${cuenta.tipo} - N° ${cuenta.id}`
                optionSelect.setAttribute("value", cuenta.id);
                selectCuentas.appendChild(optionSelect);
            });
        }
    }catch(error){
        console.error("Error al obtener las cuentas. ", error);
    }
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

const obtenerSaldoActual = async () => {
    const cuentas = JSON.parse(localStorage.getItem('cuentaIds'));
    const cuentaId = cuentas[0]; // Obtener el primer ID de cuenta

    try {
        const response = await fetch(`http://localhost:8080/api/cuentas/${cuentaId}`); // Usar el endpoint para obtener la cuenta
        if (!response.ok) {
            throw new Error("No fue posible obtener la cuenta ID " + cuentaId);
        } else {
            const cuenta = await response.json(); // Obtener la cuenta completa
            document.getElementById('saldoActual').textContent = cuenta.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    } catch (error) {
        console.error("Error al obtener el saldo. ", error);
        document.getElementById('saldoActual').textContent = 'Error al cargar saldo';
    }
};


// Manejar envío del formulario
document.getElementById('cargaForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validar monto y método de pago
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

    // Obtener el ID de la cuenta seleccionada
    const cuentaId = document.getElementById('cuentaAsociada').value;

    // Crear el objeto de datos que se enviará
    const data = {
        cuentaId: cuentaId,
        monto: selectedAmount
    };

    try {
        const response = await fetch('http://localhost:8080/api/cuentas/cargar-saldo', {
            method: 'PATCH', // Usar PATCH según tu controlador
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }

        const result = await response.json();
        
        // Mostrar mensaje de éxito
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
            window.location.href = 'cuentas.html'; // Redirigir a la página de saldo
        });

    } catch (error) {
        console.error("Error durante la carga de saldo: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message
        });
    } finally {
        btnConfirmar.innerHTML = originalText;
        btnConfirmar.disabled = false;
    }
});
