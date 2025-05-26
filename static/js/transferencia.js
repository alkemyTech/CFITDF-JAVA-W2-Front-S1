
    let transferData = {};

    // Actualizar hora actual
    function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('currentTime').textContent = timeString;
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
                window.location.href = 'login.html';
            }
        });
    }

    // Seleccionar contacto frecuente
    function selectContact(name, identifier) {
        const destinatarioInput = document.getElementById('destinatario');
        const destinatarioInfo = document.getElementById('destinatarioInfo');
        const nombreDestinatario = document.getElementById('nombreDestinatario');
        const datosDestinatario = document.getElementById('datosDestinatario');
        const destinatarioStatus = document.getElementById('destinatarioStatus');

        destinatarioInput.value = identifier;
        nombreDestinatario.textContent = name;
        datosDestinatario.textContent = identifier;

        destinatarioInfo.classList.remove('hidden');
        destinatarioStatus.classList.remove('hidden');

        // Animación
        destinatarioInfo.classList.add('fade-in');

        // Scroll al formulario en móviles
        if (window.innerWidth < 1024) {
            destinatarioInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Validar destinatario en tiempo real
    function validateDestinatario() {
        const input = document.getElementById('destinatario');
        const value = input.value.trim();
        const destinatarioInfo = document.getElementById('destinatarioInfo');
        const destinatarioStatus = document.getElementById('destinatarioStatus');
        const nombreDestinatario = document.getElementById('nombreDestinatario');
        const datosDestinatario = document.getElementById('datosDestinatario');

        if (value.length > 3) {
            // Simular validación
            setTimeout(() => {
                if (value.includes('juan.perez') || value.includes('maria.gonzalez') || value.includes('carlos.rodriguez') ||
                    value.includes('@') || value.length > 10) {

                    // Asignar nombre según el identificador
                    let name = 'Usuario Verificado';
                    if (value.includes('juan.perez')) name = 'Juan Pérez';
                    else if (value.includes('maria.gonzalez')) name = 'María González';
                    else if (value.includes('carlos.rodriguez')) name = 'Carlos Rodriguez';
                    else if (value.includes('@')) name = 'Usuario Verificado';

                    nombreDestinatario.textContent = name;
                    datosDestinatario.textContent = value;

                    destinatarioInfo.classList.remove('hidden');
                    destinatarioStatus.classList.remove('hidden');
                    input.style.borderColor = '#10B981';
                } else {
                    destinatarioInfo.classList.add('hidden');
                    destinatarioStatus.classList.add('hidden');
                    input.style.borderColor = '#ef4444';
                }
            }, 800);
        } else {
            destinatarioInfo.classList.add('hidden');
            destinatarioStatus.classList.add('hidden');
            input.style.borderColor = 'transparent';
        }
    }

    // Validar monto en tiempo real
    function validateMonto() {
        const input = document.getElementById('monto');
        const value = parseFloat(input.value);
        const saldoDisponible = 125750;

        if (value > saldoDisponible) {
            input.style.borderColor = '#ef4444';
            showError('El monto no puede ser mayor al saldo disponible');
        } else if (value < 1 && value !== 0) {
            input.style.borderColor = '#ef4444';
            showError('El monto mínimo es $1,00');
        } else if (value >= 1) {
            input.style.borderColor = '#10B981';
        } else {
            input.style.borderColor = 'transparent';
        }
    }

    // Mostrar error temporal
    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    // Actualizar contador de caracteres del concepto
    function updateConceptoCount() {
        const textarea = document.getElementById('concepto');
        const counter = document.getElementById('conceptoCount');
        const length = textarea.value.length;
        counter.textContent = `${length}/200`;

        if (length > 180) {
            counter.style.color = '#ef4444';
        } else {
            counter.style.color = '#6b7280';
        }
    }

    // Formatear número con separadores de miles
    function formatNumber(num) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    // Procesar formulario de transferencia
    function processTransfer(event) {
        event.preventDefault();

        const destinatario = document.getElementById('destinatario').value.trim();
        const monto = parseFloat(document.getElementById('monto').value);
        const concepto = document.getElementById('concepto').value.trim();

        // Validaciones
        if (!destinatario) {
            showError('Debe ingresar un destinatario válido');
            return;
        }

        if (!monto || monto < 1) {
            showError('Debe ingresar un monto válido');
            return;
        }

        if (monto > 125750) {
            showError('El monto excede el saldo disponible');
            return;
        }

        // Guardar datos de la transferencia
        transferData = {
            destinatario: destinatario,
            monto: monto,
            concepto: concepto || 'Sin concepto especificado',
            fecha: new Date().toISOString()
        };

        // Mostrar confirmación
        showTransferConfirmation();
    }

    // Mostrar confirmación de transferencia
    function showTransferConfirmation() {
        const nombreDestino = document.getElementById('nombreDestinatario').textContent || 'Usuario Verificado';

        Swal.fire({
            title: '¿Confirmar transferencia?',
            html: `
                <div class="text-left">
                    <div class="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-2">Detalles de la transferencia:</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Destinatario:</span>
                                <span class="font-medium">${nombreDestino}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Monto:</span>
                                <span class="font-medium text-green-600">${formatNumber(transferData.monto)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Concepto:</span>
                                <span class="font-medium">${transferData.concepto}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500 text-center">
                        Esta operación no se puede deshacer después de confirmarla
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Confirmar transferencia',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                executeTransfer();
            }
        });
    }

    // Ejecutar transferencia
    function executeTransfer() {
        // Mostrar loading
        Swal.fire({
            title: 'Procesando transferencia...',
            html: 'Por favor espere mientras procesamos su transferencia',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Simular procesamiento
        setTimeout(() => {
            // Actualizar saldo
            const saldoElement = document.getElementById('saldoDisponible');
            const nuevoSaldo = 125750 - transferData.monto;
            saldoElement.textContent = formatNumber(nuevoSaldo);

            // Mostrar éxito
            Swal.fire({
                title: '¡Transferencia exitosa!',
                html: `
                    <div class="text-center">
                        <div class="mb-4">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-green-600 text-2xl">✓</span>
                            </div>
                        </div>
                        <div class="text-left bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 class="font-semibold text-gray-800 mb-2">Comprobante de transferencia:</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">N° Operación:</span>
                                    <span class="font-mono">#${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Fecha:</span>
                                    <span>${new Date().toLocaleDateString('es-AR')}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Monto:</span>
                                    <span class="font-medium text-green-600">${formatNumber(transferData.monto)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Nuevo saldo:</span>
                                    <span class="font-medium">${formatNumber(nuevoSaldo)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-500">
                            El comprobante ha sido enviado a su email registrado
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: '#10B981',
                confirmButtonText: 'Continuar',
                allowOutsideClick: false
            }).then(() => {
                // Limpiar formulario
                clearForm();

                // Opcional: redirigir al dashboard
                // window.location.href = 'dashboard.html';
            });
        }, 2000);
    }

    // Limpiar formulario
    function clearForm() {
        document.getElementById('transferForm').reset();
        document.getElementById('destinatarioInfo').classList.add('hidden');
        document.getElementById('destinatarioStatus').classList.add('hidden');
        document.getElementById('conceptoCount').textContent = '0/200';

        // Resetear estilos de inputs
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.style.borderColor = 'transparent';
        });
    }

    // Agregar event listeners cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Actualizar hora cada minuto
        updateCurrentTime();
        setInterval(updateCurrentTime, 60000);

        // Event listeners para validación en tiempo real
        const destinatarioInput = document.getElementById('destinatario');
        const montoInput = document.getElementById('monto');
        const conceptoTextarea = document.getElementById('concepto');
        const transferForm = document.getElementById('transferForm');

        // Validación del destinatario
        destinatarioInput.addEventListener('input', validateDestinatario);
        destinatarioInput.addEventListener('blur', validateDestinatario);

        // Validación del monto
        montoInput.addEventListener('input', validateMonto);
        montoInput.addEventListener('blur', validateMonto);

        // Contador de caracteres para concepto
        conceptoTextarea.addEventListener('input', updateConceptoCount);

        // Envío del formulario
        transferForm.addEventListener('submit', processTransfer);

        // Formatear saldo inicial
        const saldoElement = document.getElementById('saldoDisponible');
        saldoElement.textContent = formatNumber(125750);

        // Animaciones de entrada
        setTimeout(() => {
            document.querySelectorAll('.slide-in').forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    });

    // Manejar responsive en tiempo real
    window.addEventListener('resize', function() {
        // Ajustar elementos según el tamaño de pantalla
        const isMobile = window.innerWidth < 1024;

        if (isMobile) {
            // Ajustes para móvil si es necesario
            document.body.style.paddingBottom = '2rem';
        } else {
            document.body.style.paddingBottom = '0';
        }
    });

    // Prevenir envío del formulario con Enter en campos de texto
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.target.tagName !== 'BUTTON' && event.target.type !== 'submit') {
            if (event.target.tagName !== 'TEXTAREA') {
                event.preventDefault();
            }
        }
    });