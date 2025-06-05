let transferData = {};
let userAccounts = []; // Array para almacenar las cuentas del usuario

// Función para obtener el ID del usuario desde localStorage
function getUserId() {
    const usuarioId = localStorage.getItem('usuarioId') || localStorage.getItem('cuentaIds');
    console.log('🔍 ID de usuario obtenido del localStorage:', usuarioId);
    return usuarioId;
}

// Función de debug (actualizada para usar localStorage)
function debugInfo() {
    const usuarioId = getUserId();
    console.log('=== DEBUG INFO ===');
    console.log('usuarioId desde localStorage:', usuarioId);
    console.log('Todos los items en localStorage:', localStorage);
    console.log('userAccounts array:', userAccounts);
    console.log('=================');
    
    if (usuarioId) {
        // Prueba de API usando el endpoint correcto
        fetch(`http://localhost:8080/api/cuentas/usuario/${usuarioId}`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Data from API (array directo de cuentas):', data);
                console.log('Es un array?', Array.isArray(data));
                if (Array.isArray(data) && data.length > 0) {
                    console.log('Primera cuenta:', data[0]);
                    console.log('Campos disponibles:', Object.keys(data[0]));
                }
            })
            .catch(error => {
                console.error('Error en API:', error);
            });
    } else {
        console.warn('⚠️ No hay usuarioId en localStorage');
    }
}

// Hacer debugInfo disponible globalmente
window.debugInfo = debugInfo;

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

// Función logout
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
                    window.location.href = 'index.html';
                }
            });
        }
    });
}

// Obtener cuentas del usuario (usando la estructura real de tu API)
async function getUserAccounts(userId) {
    try {
        console.log('🔄 Obteniendo cuentas para usuario ID:', userId);
        
        // Usar el mismo endpoint que funciona en Postman
        const response = await fetch(`http://localhost:8080/api/cuentas/usuario/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Tu API devuelve un array directamente, no un objeto con campo 'cuentas'
        const cuentasArray = await response.json();
        console.log('📊 Array de cuentas obtenido:', cuentasArray);
        
        if (Array.isArray(cuentasArray) && cuentasArray.length > 0) {
            console.log('✅ Cuentas encontradas:', cuentasArray);
            userAccounts = cuentasArray;
            populateAccountDropdown();
        } else {
            console.warn('⚠️ No se encontraron cuentas en la respuesta');
            Swal.fire({
                icon: 'warning',
                title: 'Sin cuentas',
                text: 'No se encontraron cuentas asociadas al usuario',
                confirmButtonColor: '#f59e0b'
            });
        }
        
        return userAccounts;
    } catch (error) {
        console.error('❌ Error al obtener cuentas:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: `No se pudieron cargar las cuentas: ${error.message}`,
            confirmButtonColor: '#ef4444'
        });
        return [];
    }
}

// Poblar el dropdown de cuentas (adaptado para la estructura de cuentas.js)
function populateAccountDropdown() {
    const select = document.getElementById('cuentaOrigen');
    
    console.log('🔄 Poblando dropdown con cuentas:', userAccounts);
    
    // Limpiar opciones existentes
    select.innerHTML = '<option value="">Selecciona una cuenta...</option>';
    
    if (!userAccounts || userAccounts.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No hay cuentas disponibles";
        option.disabled = true;
        select.appendChild(option);
        return;
    }
    
    // Agregar las cuentas del usuario (estructura igual que en cuentas.js)
    userAccounts.forEach((cuenta, index) => {
        console.log(`📋 Cuenta ${index}:`, cuenta);
        
        const option = document.createElement('option');
        option.value = cuenta.id; // Las cuentas tienen directamente el campo 'id'
        
        // Construir el texto de la opción usando la misma lógica que cuentas.js
        let cuentaText = '';
        if (cuenta.tipo) {
            cuentaText = cuenta.tipo.charAt(0).toUpperCase() + cuenta.tipo.slice(1).toLowerCase();
        } else {
            cuentaText = `Cuenta ${index + 1}`;
        }
        
        // Agregar saldo con el mismo formato que cuentas.js
        if (cuenta.saldo !== undefined && cuenta.saldo !== null) {
            const saldoFormateado = formatNumber(cuenta.saldo);
            cuentaText += ` - Saldo: ${saldoFormateado}`;
            option.dataset.saldo = cuenta.saldo;
        } else {
            cuentaText += ' - Saldo: $0,00';
            option.dataset.saldo = 0;
        }
        
        // Agregar ID de cuenta
        cuentaText += ` (#${cuenta.id})`;
        
        // Si hay moneda diferente a peso, mostrarla
        if (cuenta.moneda && cuenta.moneda !== 'peso') {
            cuentaText += ` - ${cuenta.moneda.toUpperCase()}`;
        }
        
        option.textContent = cuentaText;
        select.appendChild(option);
        
        console.log(`✅ Opción agregada:`, {
            value: option.value,
            text: option.textContent,
            saldo: option.dataset.saldo
        });
    });
    
    console.log(`✅ Dropdown poblado con ${userAccounts.length} cuentas`);
}

// Validar selección de cuenta origen
function validateCuentaOrigen() {
    const select = document.getElementById('cuentaOrigen');
    const error = document.getElementById('cuentaOrigenError');
    
    error.classList.add('hidden');
    select.classList.remove('error');
    
    if (!select.value) {
        select.classList.add('error');
        error.classList.remove('hidden');
        return false;
    }

    const selectedOption = select.options[select.selectedIndex];
    const saldo = parseFloat(selectedOption.dataset.saldo || 0);
    updateSaldoDisponible(saldo);
    
    return true;
}

// Actualizar saldo disponible en pantalla
function updateSaldoDisponible(saldo) {
    const saldoElement = document.getElementById('saldoDisponible');
    saldoElement.textContent = formatNumber(saldo);
    
    // También actualizar el máximo del input de monto
    const montoInput = document.getElementById('monto');
    montoInput.max = saldo;
}

// Seleccionar contacto frecuente (ahora con CBU)
function selectContact(name, cbu) {
    const cbuInput = document.getElementById('cbuDestinatario');
    const destinatarioInfo = document.getElementById('destinatarioInfo');
    const nombreDestinatario = document.getElementById('nombreDestinatario');
    const datosDestinatario = document.getElementById('datosDestinatario');
    const cbuStatus = document.getElementById('cbuStatus');

    cbuInput.value = cbu;
    nombreDestinatario.textContent = name;
    datosDestinatario.textContent = `CBU: ${cbu}`;

    if (validateCBU(cbu)) {
        destinatarioInfo.classList.remove('hidden');
        cbuStatus.classList.remove('hidden');
        showCBUSuccess();
        destinatarioInfo.classList.add('fade-in');
    }

    if (window.innerWidth < 1024) {
        cbuInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Validar formato de CBU (22 dígitos numéricos)
function validateCBU(cbu) {
    const cbuRegex = /^\d{22}$/;
    return cbuRegex.test(cbu);
}

// Validar CBU en tiempo real
function validateCBUInput() {
    const input = document.getElementById('cbuDestinatario');
    const value = input.value.trim();
    const destinatarioInfo = document.getElementById('destinatarioInfo');
    const cbuStatus = document.getElementById('cbuStatus');

    hideCBUMessages();

    if (value.length === 0) {
        input.classList.remove('error');
        destinatarioInfo.classList.add('hidden');
        cbuStatus.classList.add('hidden');
        return;
    }

    if (!/^\d*$/.test(value)) {
        showCBUError('El CBU solo debe contener números');
        return;
    }

    if (value.length > 0 && value.length < 22) {
        showCBUError(`El CBU debe tener 22 dígitos (actual: ${value.length})`);
        return;
    }

    if (value.length === 22) {
        if (validateCBU(value)) {
            showCBUSuccess();
            showDestinatarioInfo(value);
        } else {
            showCBUError('Formato de CBU inválido');
        }
    }
}

// Mostrar información del destinatario
function showDestinatarioInfo(cbu) {
    const destinatarioInfo = document.getElementById('destinatarioInfo');
    const nombreDestinatario = document.getElementById('nombreDestinatario');
    const datosDestinatario = document.getElementById('datosDestinatario');
    const cbuStatus = document.getElementById('cbuStatus');

    let nombreDestino = 'Destinatario Verificado';
    
    const cbuContactos = {
        '0000003100010000000001': 'Juan Pérez',
        '0000003100010000000002': 'María González',
        '0000003100010000000003': 'Carlos Rodriguez'
    };

    if (cbuContactos[cbu]) {
        nombreDestino = cbuContactos[cbu];
    }

    nombreDestinatario.textContent = nombreDestino;
    datosDestinatario.textContent = `CBU: ${cbu}`;

    destinatarioInfo.classList.remove('hidden');
    cbuStatus.classList.remove('hidden');
    destinatarioInfo.classList.add('fade-in');
}

// Mostrar error de CBU
function showCBUError(message) {
    const input = document.getElementById('cbuDestinatario');
    const cbuError = document.getElementById('cbuError');
    const errorText = cbuError.querySelector('span:last-child');
    
    input.classList.add('error');
    errorText.textContent = message;
    cbuError.classList.remove('hidden');
    
    document.getElementById('destinatarioInfo').classList.add('hidden');
    document.getElementById('cbuStatus').classList.add('hidden');
}

// Mostrar éxito de CBU
function showCBUSuccess() {
    const input = document.getElementById('cbuDestinatario');
    const cbuSuccess = document.getElementById('cbuSuccess');
    
    input.classList.remove('error');
    cbuSuccess.classList.remove('hidden');
}

// Ocultar mensajes de CBU
function hideCBUMessages() {
    document.getElementById('cbuError').classList.add('hidden');
    document.getElementById('cbuSuccess').classList.add('hidden');
}

// Validar monto en tiempo real
function validateMonto() {
    const input = document.getElementById('monto');
    const value = parseFloat(input.value);
    const cuentaSelect = document.getElementById('cuentaOrigen');
    const selectedOption = cuentaSelect.options[cuentaSelect.selectedIndex];
    const saldoDisponible = parseFloat(selectedOption?.dataset.saldo || 0);
    const montoError = document.getElementById('montoError');

    montoError.classList.add('hidden');
    input.classList.remove('error');

    if (isNaN(value) || value <= 0) {
        if (input.value.trim() !== '') {
            showMontoError('Debe ingresar un monto válido mayor a 0');
        }
        return false;
    }

    if (value < 1) {
        showMontoError('El monto mínimo es $1,00');
        return false;
    }

    if (value > saldoDisponible) {
        showMontoError(`El monto no puede ser mayor al saldo disponible ($${formatNumber(saldoDisponible)})`);
        return false;
    }

    input.classList.remove('error');
    return true;
}

// Mostrar error de monto
function showMontoError(message) {
    const input = document.getElementById('monto');
    const montoError = document.getElementById('montoError');
    const montoErrorText = document.getElementById('montoErrorText');
    
    input.classList.add('error');
    montoErrorText.textContent = message;
    montoError.classList.remove('hidden');
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

// Validar formulario completo
function validateForm() {
    const cuentaOrigenId = document.getElementById('cuentaOrigen').value;
    const cbuDestinatario = document.getElementById('cbuDestinatario').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    
    let isValid = true;
    let errors = [];

    if (!cuentaOrigenId) {
        errors.push('Debe seleccionar una cuenta de origen');
        isValid = false;
    }

    if (!cbuDestinatario) {
        errors.push('Debe ingresar el CBU del destinatario');
        isValid = false;
    } else if (!validateCBU(cbuDestinatario)) {
        errors.push('El CBU debe tener exactamente 22 dígitos numéricos');
        isValid = false;
    }

    if (!monto || monto < 1) {
        errors.push('Debe ingresar un monto válido');
        isValid = false;
    } else {
        const selectedOption = document.getElementById('cuentaOrigen').options[document.getElementById('cuentaOrigen').selectedIndex];
        const saldoDisponible = parseFloat(selectedOption?.dataset.saldo || 0);
        if (monto > saldoDisponible) {
            errors.push('El monto excede el saldo disponible en la cuenta seleccionada');
            isValid = false;
        }
    }

    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: 'Errores en el formulario',
            html: errors.map(error => `• ${error}`).join('<br>'),
            confirmButtonColor: '#ef4444'
        });
    }

    return isValid;
}

// Procesar formulario de transferencia
function processTransfer(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const submitIcon = document.getElementById('submitIcon');
    const submitText = document.getElementById('submitText');
    
    submitBtn.disabled = true;
    submitIcon.innerHTML = '<div class="loading"></div>';
    submitText.textContent = 'Validando...';

    if (!validateForm()) {
        resetSubmitButton();
        return;
    }

    const cuentaOrigenId = document.getElementById('cuentaOrigen').value;
    const cbuDestinatario = document.getElementById('cbuDestinatario').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const concepto = document.getElementById('concepto').value.trim();

    transferData = {
        cuentaOrigenId: parseInt(cuentaOrigenId),
        cbuDestino: cbuDestinatario,
        monto: monto,
        descripcion: concepto || 'Transferencia de prueba',
        fecha: new Date().toISOString()
    };

    resetSubmitButton();
    showTransferConfirmation();
}

// Resetear botón de envío
function resetSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const submitIcon = document.getElementById('submitIcon');
    const submitText = document.getElementById('submitText');
    
    submitBtn.disabled = false;
    submitIcon.innerHTML = 'send';
    submitText.textContent = 'Continuar';
}

// Mostrar confirmación de transferencia
function showTransferConfirmation() {
    const nombreDestino = document.getElementById('nombreDestinatario').textContent || 'Destinatario Verificado';

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
                            <span class="text-gray-600">CBU Destino:</span>
                            <span class="font-mono text-xs">${transferData.cbuDestino}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Monto:</span>
                            <span class="font-medium text-green-600">$${formatNumber(transferData.monto)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Concepto:</span>
                            <span class="font-medium">${transferData.descripcion}</span>
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
async function executeTransfer() {
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

    try {
        const dataToSend = {
            cuentaOrigenId: parseInt(transferData.cuentaOrigenId),
            monto: transferData.monto,
            cbuDestino: transferData.cbuDestino,
            descripcion: transferData.descripcion
        };

        console.log('📤 Datos a enviar:', dataToSend);

        const response = await fetch('http://localhost:8080/api/transferencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);

        // Obtener el texto de respuesta primero
        const responseText = await response.text();
        console.log('📄 Response text:', responseText);

        if (!response.ok) {
            // Si hay error, mostrar el mensaje del servidor
            throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
        }

        // Intentar parsear como JSON solo si la respuesta está OK
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('📥 Respuesta parseada como JSON:', result);
        } catch (jsonError) {
            // Si no es JSON válido, usar el texto como resultado
            console.log('⚠️ La respuesta no es JSON válido, usando texto plano');
            result = { message: responseText, success: true };
        }

        handleTransferSuccess(result);

    } catch (error) {
        console.error('❌ Error completo en la transferencia:', error);
        handleTransferError(error);
    }
}

// Manejar transferencia exitosa
function handleTransferSuccess(result) {
    const cuentaSelect = document.getElementById('cuentaOrigen');
    const selectedOption = cuentaSelect.options[cuentaSelect.selectedIndex];
    const saldoActual = parseFloat(selectedOption.dataset.saldo);
    const nuevoSaldo = saldoActual - transferData.monto;
    
    selectedOption.dataset.saldo = nuevoSaldo;
    selectedOption.textContent = `${selectedOption.textContent.split(' - Saldo:')[0]} - Saldo: $${formatNumber(nuevoSaldo)}`;
    updateSaldoDisponible(nuevoSaldo);

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
                            <span class="font-mono">${result.numeroOperacion || '#' + Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Fecha:</span>
                            <span>${new Date().toLocaleDateString('es-AR')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">CBU Destino:</span>
                            <span class="font-mono text-xs">${transferData.cbuDestino}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Monto:</span>
                            <span class="font-medium text-green-600">$${formatNumber(transferData.monto)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Nuevo saldo:</span>
                            <span class="font-medium">$${formatNumber(nuevoSaldo)}</span>
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
        clearForm();
    });
}

// Manejar error en transferencia (mejorado para mostrar detalles)
function handleTransferError(error) {
    let errorMessage = 'No se pudo procesar la transferencia';
    
    if (error.message) {
        // Si el error tiene un mensaje específico, usarlo
        errorMessage = error.message;
        
        // Si el mensaje contiene "Error XXX:", extraer solo la parte del servidor
        const serverMessageMatch = errorMessage.match(/Error \d+: (.+)/);
        if (serverMessageMatch) {
            errorMessage = serverMessageMatch[1];
        }
    }
    
    console.error('❌ Error detallado:', {
        message: error.message,
        name: error.name,
        stack: error.stack
    });

    Swal.fire({
        title: 'Error en la transferencia',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Entendido',
        footer: '<small>Revisa la consola para más detalles técnicos</small>'
    });
}

// Limpiar formulario
function clearForm() {
    document.getElementById('transferForm').reset();
    document.getElementById('destinatarioInfo').classList.add('hidden');
    document.getElementById('cbuStatus').classList.add('hidden');
    document.getElementById('conceptoCount').textContent = '0/200';
    
    hideCBUMessages();
    document.getElementById('montoError').classList.add('hidden');
    document.getElementById('cuentaOrigenError').classList.add('hidden');

    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });

    transferData = {};
}

// Cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async function () {
    console.log('✅ DOM cargado correctamente');

    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);

    // Obtener ID del usuario dinámicamente desde localStorage
    const usuarioId = getUserId();
    
    if (!usuarioId) {
        console.error('❌ No se encontró usuarioId en localStorage');
        Swal.fire({
            title: 'Sesión no válida',
            text: 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
            icon: 'warning',
            confirmButtonText: 'Ir al login'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    // Mostrar el nombre del usuario si está disponible en localStorage
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const apellidoUsuario = localStorage.getItem('apellidoUsuario');
    
    if (nombreUsuario && apellidoUsuario) {
        document.getElementById('userFullName').textContent = `${nombreUsuario} ${apellidoUsuario}`;
    } else if (nombreUsuario) {
        document.getElementById('userFullName').textContent = nombreUsuario;
    } else {
        document.getElementById('userFullName').textContent = `Usuario ${usuarioId}`;
    }

    try {
        console.log('🔄 Iniciando carga de cuentas para usuario:', usuarioId);
        await getUserAccounts(usuarioId);
        console.log('✅ Carga de cuentas completada');
    } catch (error) {
        console.error('❌ Error al cargar cuentas del usuario:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar cuentas',
            text: 'No se pudieron cargar las cuentas del usuario',
            showCancelButton: true,
            confirmButtonText: 'Reintentar',
            cancelButtonText: 'Continuar sin cuentas'
        }).then((result) => {
            if (result.isConfirmed) {
                getUserAccounts(usuarioId);
            }
        });
    }

    // Event listeners
    const cuentaOrigenSelect = document.getElementById('cuentaOrigen');
    const cbuInput = document.getElementById('cbuDestinatario');
    const montoInput = document.getElementById('monto');
    const conceptoTextarea = document.getElementById('concepto');
    const transferForm = document.getElementById('transferForm');

    cuentaOrigenSelect.addEventListener('change', validateCuentaOrigen);
    cbuInput.addEventListener('input', validateCBUInput);
    cbuInput.addEventListener('blur', validateCBUInput);
    
    // Solo permitir números en el CBU
    cbuInput.addEventListener('keypress', function(e) {
        if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });

    montoInput.addEventListener('input', validateMonto);
    montoInput.addEventListener('blur', validateMonto);
    conceptoTextarea.addEventListener('input', updateConceptoCount);
    transferForm.addEventListener('submit', processTransfer);

    // Formatear saldo inicial
    const saldoElement = document.getElementById('saldoDisponible');
    saldoElement.textContent = formatNumber(0);

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
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
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