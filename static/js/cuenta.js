// Función para obtener el ID del usuario desde localStorage
function getUserId() {
    const usuarioId = localStorage.getItem('usuarioId') || localStorage.getItem('cuentaIds');
    console.log('🔍 ID de usuario obtenido del localStorage:', usuarioId);
    return usuarioId;
}

// Función para mostrar la hora actual
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Función para obtener el icono según el tipo de cuenta y moneda
function getAccountIcon(tipo, moneda = 'peso') {
    if (moneda === 'dolar_cripto') {
        return '₿'; // Bitcoin symbol para cripto
    } else if (moneda === 'dolar_comun') {
        return '💵'; // Dólar común
    }
    
    // Iconos para pesos según tipo
    const iconos = {
        'ahorro': '💰',
        'corriente': '🏦',
        'inversion': '📈',
        'credito': '💳',
        'default': '🏛️'
    };
    return iconos[tipo.toLowerCase()] || iconos.default;
}

// Función para obtener el color según el tipo de cuenta y moneda
function getAccountColor(tipo, moneda = 'peso') {
    if (moneda === 'dolar_cripto') {
        return 'orange'; // Color para cripto
    } else if (moneda === 'dolar_comun') {
        return 'green'; // Color para dólar común
    }
    
    // Colores para pesos según tipo
    const colores = {
        'ahorro': 'blue',
        'corriente': 'indigo',
        'inversion': 'purple',
        'credito': 'red',
        'default': 'gray'
    };
    return colores[tipo.toLowerCase()] || colores.default;
}

// Función para formatear el saldo según la moneda
function formatearSaldo(saldo, moneda = 'peso') {
    const valor = parseFloat(saldo || 0);
    
    if (moneda === 'dolar_cripto') {
        return `₿${valor.toLocaleString('es-AR', {minimumFractionDigits: 8, maximumFractionDigits: 8})}`;
    } else if (moneda === 'dolar_comun') {
        return `US$${valor.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    } else {
        return `$${valor.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    }
}

// Función para obtener el símbolo de moneda
function getMonedaSymbol(moneda) {
    const simbolos = {
        'peso': '$',
        'dolar_comun': 'US$',
        'dolar_cripto': '₿'
    };
    return simbolos[moneda] || '$';
}

// NUEVA FUNCIÓN: Mostrar movimientos de una cuenta específica
function mostrarMovimientos(cuentaId) {
    console.log('🎯 Solicitando movimientos para cuenta ID:', cuentaId);
    
    // Mostrar indicador de carga
    Swal.fire({
        title: 'Cargando movimientos...',
        html: `<div class="pulse-animation">Obteniendo historial de movimientos de la cuenta #${cuentaId}</div>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    // Hacer llamada a la API de movimientos con el ID de la cuenta específica
    // Probamos diferentes endpoints posibles
    const endpoints = [
        `http://localhost:8080/api/movimientos/${cuentaId}`,
        `http://localhost:8080/api/cuentas/${cuentaId}/movimientos`,
        `http://localhost:8080/api/movimientos?cuentaId=${cuentaId}`
    ];
    
    // Empezamos con el primer endpoint más probable
    const endpointToUse = `http://localhost:8080/api/movimientos/${cuentaId}`;
    console.log('📡 Llamando a endpoint:', endpointToUse);
    
    fetch(endpointToUse)
        .then(response => {
            console.log('📡 Response status:', response.status);
            console.log('📡 Response URL:', response.url);
            
            if (!response.ok) {
                // Si falla, intentar con endpoint alternativo
                if (response.status === 404) {
                    console.log('⚠️ Endpoint principal falló, intentando endpoint alternativo...');
                    return fetch(`http://localhost:8080/api/cuentas/${cuentaId}/movimientos`);
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(response => {
            // Si la primera llamada falló y estamos en la segunda
            if (response && typeof response.json === 'function') {
                console.log('📡 Usando endpoint alternativo, status:', response.status);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            }
            return response;
        })
        .then(movimientos => {
            console.log('📊 Movimientos obtenidos para cuenta', cuentaId, ':', movimientos);
            
            // Validar que la respuesta sea un array
            if (!Array.isArray(movimientos)) {
                console.warn('⚠️ La respuesta no es un array:', movimientos);
                // Si la respuesta tiene una propiedad que contiene el array
                if (movimientos.movimientos && Array.isArray(movimientos.movimientos)) {
                    movimientos = movimientos.movimientos;
                } else if (movimientos.data && Array.isArray(movimientos.data)) {
                    movimientos = movimientos.data;
                } else {
                    movimientos = [];
                }
            }
            
            mostrarModalMovimientos(movimientos, cuentaId);
        })
        .catch(error => {
            console.error('❌ Error al obtener movimientos para cuenta', cuentaId, ':', error);
            
            // Mensaje de error más específico
            let errorMessage = 'No se pudieron cargar los movimientos.';
            
            if (error.message.includes('404')) {
                errorMessage = `No se encontraron movimientos para la cuenta #${cuentaId} o el endpoint no existe.`;
            } else if (error.message.includes('500')) {
                errorMessage = 'Error interno del servidor. Por favor, intenta nuevamente.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Error de conexión. Verifica que el servidor esté ejecutándose.';
            }
            
            Swal.fire({
                title: 'Error al cargar movimientos',
                html: `
                    <div class="text-left">
                        <p class="mb-2">${errorMessage}</p>
                        <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>Detalles técnicos:</strong><br>
                            • Cuenta ID: ${cuentaId}<br>
                            • Endpoint: ${endpointToUse}<br>
                            • Error: ${error.message}
                        </div>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#667eea',
                footer: '<small>Revisa la consola del navegador para más detalles</small>'
            });
        });
}

// NUEVA FUNCIÓN: Mostrar el modal con los movimientos
function mostrarModalMovimientos(movimientos, cuentaId) {
    console.log('🎯 Mostrando movimientos:', movimientos);
    
    // Función para obtener el icono del tipo de movimiento
    function getTipoMovimientoIcon(tipo) {
        const iconos = {
            'TRANSACCION': '💳',
            'TRANSFERENCIA': '🔄',
            'DEPOSITO': '⬇️',
            'RETIRO': '⬆️',
            'CARGA': '💰',
            'PAGO': '🛒'
        };
        return iconos[tipo] || '📄';
    }

    // Función para obtener el color del tipo de movimiento
    function getTipoMovimientoColor(tipo) {
        const colores = {
            'TRANSACCION': 'blue',
            'TRANSFERENCIA': 'purple',
            'DEPOSITO': 'green',
            'RETIRO': 'red',
            'CARGA': 'indigo',
            'PAGO': 'orange'
        };
        return colores[tipo] || 'gray';
    }

    // Función para formatear fecha
    function formatearFecha(fecha) {
        try {
            const fechaObj = new Date(fecha);
            return fechaObj.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return fecha;
        }
    }

    // Función para formatear monto con color
    function formatearMontoConColor(monto) {
        const valor = parseFloat(monto);
        const isPositivo = valor >= 0;
        const colorClass = isPositivo ? 'text-green-600' : 'text-red-600';
        const signo = isPositivo ? '+' : '';
        
        return `<span class="${colorClass} font-bold">${signo}$${Math.abs(valor).toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>`;
    }

    if (!movimientos || movimientos.length === 0) {
        const htmlVacio = `
            <div class="text-center py-8">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons text-gray-400 text-3xl">receipt_long</span>
                </div>
                <h4 class="text-lg font-medium text-gray-600 mb-2">No hay movimientos</h4>
                <p class="text-gray-500">Esta cuenta no tiene movimientos registrados</p>
            </div>
        `;

        Swal.fire({
            title: `Movimientos - Cuenta #${cuentaId}`,
            html: htmlVacio,
            width: '700px',
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'rounded-xl'
            }
        });
        return;
    }

    // Ordenar movimientos por fecha (más recientes primero)
    const movimientosOrdenados = movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Generar HTML para los movimientos
    const htmlMovimientos = `
        <div class="movimientos-modal text-left max-h-96 overflow-y-auto">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4 sticky top-0 z-10">
                <h3 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <span class="material-icons mr-2 text-blue-600">receipt_long</span>
                    Historial de Movimientos - Cuenta #${cuentaId}
                </h3>
                <p class="text-sm text-gray-600">Total de movimientos: ${movimientos.length}</p>
            </div>
            
            <div class="space-y-3">
                ${movimientosOrdenados.map((movimiento, index) => `
                    <div class="movement-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-${getTipoMovimientoColor(movimiento.tipoMovimiento)}-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-lg">${getTipoMovimientoIcon(movimiento.tipoMovimiento)}</span>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center space-x-2 mb-1">
                                        <h4 class="text-sm font-semibold text-gray-800">${movimiento.tipoMovimiento.replace('_', ' ')}</h4>
                                        <span class="text-xs bg-${getTipoMovimientoColor(movimiento.tipoMovimiento)}-100 text-${getTipoMovimientoColor(movimiento.tipoMovimiento)}-700 px-2 py-1 rounded-full">
                                            #${index + 1}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-600 mb-1">${movimiento.descripcion || 'Sin descripción'}</p>
                                    <p class="text-xs text-gray-500">📅 ${formatearFecha(movimiento.fecha)}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-lg font-bold">
                                    ${formatearMontoConColor(movimiento.monto)}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Resumen al final -->
            <div class="bg-gray-50 rounded-lg p-4 mt-4 sticky bottom-0">
                <h4 class="font-semibold text-gray-800 mb-2 flex items-center">
                    <span class="material-icons mr-2 text-gray-600">analytics</span>
                    Resumen de movimientos
                </h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Ingresos:</span>
                        <span class="font-bold text-green-600">
                            $${movimientos
                                .filter(m => parseFloat(m.monto) > 0)
                                .reduce((sum, m) => sum + parseFloat(m.monto), 0)
                                .toLocaleString('es-AR', {minimumFractionDigits: 2})}
                        </span>
                    </div>
                    <div>
                        <span class="text-gray-600">Egresos:</span>
                        <span class="font-bold text-red-600">
                            $${Math.abs(movimientos
                                .filter(m => parseFloat(m.monto) < 0)
                                .reduce((sum, m) => sum + parseFloat(m.monto), 0))
                                .toLocaleString('es-AR', {minimumFractionDigits: 2})}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    Swal.fire({
        html: htmlMovimientos,
        width: '750px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#667eea',
        customClass: {
            popup: 'rounded-xl',
            content: 'p-0'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
}

// Función para cargar las cuentas y mostrarlas agrupadas por moneda (ACTUALIZADA)
function cargarCuentas() {
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

    console.log('🔄 Cargando cuentas para usuario:', usuarioId);

    fetch(`http://localhost:8080/api/cuentas/usuario/${usuarioId}`)
        .then(res => res.json())
        .then(async cuentas => {
            console.log('📊 Cuentas obtenidas:', cuentas);
            
            const lista = document.getElementById("lista-cuentas");
            const emptyState = document.getElementById("empty-accounts");
            
            lista.innerHTML = "";
            
            if (!cuentas || cuentas.length === 0) {
                emptyState.classList.remove('hidden');
                lista.classList.add('hidden');
                actualizarEstadisticas([]); // Actualizar con array vacío
                return;
            }

            emptyState.classList.add('hidden');
            lista.classList.remove('hidden');

            // Agrupar cuentas por moneda
            const cuentasPorMoneda = {
                peso: cuentas.filter(c => c.moneda === 'peso' || !c.moneda),
                dolar_comun: cuentas.filter(c => c.moneda === 'dolar_comun'),
                dolar_cripto: cuentas.filter(c => c.moneda === 'dolar_cripto')
            };

            // Generar HTML agrupado por moneda
            let htmlContent = '';

            // Sección de Pesos
            if (cuentasPorMoneda.peso.length > 0) {
                htmlContent += generarSeccionMoneda('Cuentas en Pesos Argentinos', cuentasPorMoneda.peso, 'peso', '🇦🇷');
            }

            // Sección de Dólar Común
            if (cuentasPorMoneda.dolar_comun.length > 0) {
                htmlContent += generarSeccionMoneda('Cuentas en Dólar Común', cuentasPorMoneda.dolar_comun, 'dolar_comun', '💵');
            }

            // Sección de Dólar Cripto
            if (cuentasPorMoneda.dolar_cripto.length > 0) {
                htmlContent += generarSeccionMoneda('Cuentas en Criptomonedas', cuentasPorMoneda.dolar_cripto, 'dolar_cripto', '₿');
            }

            lista.innerHTML = htmlContent;

            // Actualizar estadísticas separadas
            actualizarEstadisticasSeparadas(cuentasPorMoneda);
        })
        .catch(err => {
            console.error("❌ Error al cargar cuentas:", err);
            Swal.fire("Error", "No se pudieron cargar las cuentas", "error");
        });
}

// Función para generar HTML de una sección de moneda
function generarSeccionMoneda(titulo, cuentas, tipoMoneda, icono) {
    const totalSeccion = cuentas.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    
    return `
        <div class="mb-8">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-gray-800 flex items-center">
                        <span class="text-2xl mr-3">${icono}</span>
                        ${titulo}
                    </h3>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Total</p>
                        <p class="text-xl font-bold text-gray-800">${formatearSaldo(totalSeccion, tipoMoneda)}</p>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                ${cuentas.map(cuenta => generarTarjetaCuenta(cuenta, tipoMoneda)).join('')}
            </div>
        </div>
    `;
}

// Función para generar HTML de una tarjeta de cuenta individual (ACTUALIZADA - SIN USUARIO ID)
function generarTarjetaCuenta(cuenta, tipoMoneda) {
    const icono = getAccountIcon(cuenta.tipo, tipoMoneda);
    const color = getAccountColor(cuenta.tipo, tipoMoneda);
    
    // Función para obtener el nombre de la moneda en español
    function getNombreMoneda(moneda) {
        const nombres = {
            'peso': 'Peso',
            'dolar_comun': 'Dólares',
            'dolar_cripto': 'Cripto'
        };
        return nombres[moneda] || 'Peso';
    }
    
    return `
        <div class="account-item bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-${color}-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        ${icono}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <h4 class="text-lg font-semibold text-gray-800 capitalize">${cuenta.tipo}</h4>
                            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#${cuenta.id}</span>
                            <span class="text-xs bg-${color}-100 text-${color}-700 px-2 py-1 rounded-full">
                                ${getNombreMoneda(tipoMoneda)}
                            </span>
                        </div>
                        <p class="text-2xl font-bold text-${color}-600 mt-2">
                            ${formatearSaldo(cuenta.saldo, tipoMoneda)}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="mostrarMovimientos(${cuenta.id})" 
                            class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver movimientos">
                        <span class="material-icons text-sm">receipt_long</span>
                    </button>
                    <!-- BOTÓN DE ELIMINAR REMOVIDO POR SEGURIDAD -->
                </div>
            </div>
        </div>
    `;
}

// Función para actualizar las estadísticas separadas por moneda
function actualizarEstadisticasSeparadas(cuentasPorMoneda) {
    // Calcular totales por moneda
    const totalPesos = cuentasPorMoneda.peso.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    const totalDolarComun = cuentasPorMoneda.dolar_comun.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    const totalDolarCripto = cuentasPorMoneda.dolar_cripto.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    
    const totalCuentas = Object.values(cuentasPorMoneda).flat().length;
    
    // Crear HTML personalizado para mostrar los totales separados
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
        // Mostrar solo pesos en el total principal
        totalBalanceEl.innerHTML = `
            <div class="space-y-1">
                <div class="text-2xl font-bold text-blue-600">
                    ${formatearSaldo(totalPesos, 'peso')}
                </div>
                ${totalDolarComun > 0 ? `<div class="text-sm text-green-600">${formatearSaldo(totalDolarComun, 'dolar_comun')}</div>` : ''}
                ${totalDolarCripto > 0 ? `<div class="text-sm text-orange-600">${formatearSaldo(totalDolarCripto, 'dolar_cripto')}</div>` : ''}
            </div>
        `;
    }

    const activeAccountsEl = document.getElementById('activeAccounts');
    if (activeAccountsEl) {
        activeAccountsEl.textContent = totalCuentas;
    }

    // Determinar cuenta principal (la de mayor saldo en pesos)
    const todasLasCuentas = Object.values(cuentasPorMoneda).flat();
    const mainAccountEl = document.getElementById('mainAccount');
    if (mainAccountEl && todasLasCuentas.length > 0) {
        const cuentaPrincipal = todasLasCuentas.sort((a, b) => {
            // Priorizar pesos, luego por saldo
            if (a.moneda === 'peso' && b.moneda !== 'peso') return -1;
            if (b.moneda === 'peso' && a.moneda !== 'peso') return 1;
            return parseFloat(b.saldo) - parseFloat(a.saldo);
        })[0];
        
        mainAccountEl.textContent = cuentaPrincipal.tipo.charAt(0).toUpperCase() + cuentaPrincipal.tipo.slice(1);
    }
}

// Función para cargar los tipos de cuenta desde la API
function cargarTiposDeCuenta() {
    fetch("http://localhost:8080/api/tipos-cuenta")
        .then(res => res.json())
        .then(tipos => {
            const select = document.getElementById("cuenta-tipo");
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }

            // Función para obtener icono según el tipo
            function getAccountIcon(tipo) {
                const iconos = {
                    'CAJA_AHORRO': '💰',
                    'CUENTA_CORRIENTE': '🏦',
                    'DOLAR': '💵',
                    'CRIPTO': '₿'
                };
                return iconos[tipo] || '🏛️';
            }

            tipos.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.nombre || tipo;
                const descripcion = tipo.descripcion || tipo;
                option.textContent = `${getAccountIcon(option.value)} ${descripcion}`;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error al cargar tipos de cuenta:", err);
            
            // Fallback: tipos predefinidos
            const tiposPredefinidos = [
                { nombre: 'CAJA_AHORRO', descripcion: 'Caja de Ahorro' },
                { nombre: 'CUENTA_CORRIENTE', descripcion: 'Cuenta Corriente' },
                { nombre: 'DOLAR', descripcion: 'Cuenta en Dólares' },
                { nombre: 'CRIPTO', descripcion: 'Cuenta Cripto' }
            ];
            
            const select = document.getElementById("cuenta-tipo");
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }

            function getAccountIcon(tipo) {
                const iconos = {
                    'CAJA_AHORRO': '💰',
                    'CUENTA_CORRIENTE': '🏦',
                    'DOLAR': '💵',
                    'CRIPTO': '₿'
                };
                return iconos[tipo] || '🏛️';
            }

            tiposPredefinidos.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.nombre;
                option.textContent = `${getAccountIcon(tipo.nombre)} ${tipo.descripcion}`;
                select.appendChild(option);
            });
        });
}

// Funciones para el manejo del formulario
function mostrarFormulario() {
    document.getElementById('form-section').classList.remove('hidden');
    document.getElementById('form-title').textContent = 'Crear Nueva Cuenta';
    document.getElementById('btn-text').textContent = 'Crear Cuenta';
    document.getElementById('cuenta-form').reset();
    document.getElementById('cuenta-id').value = '';
}

function ocultarFormulario() {
    document.getElementById('form-section').classList.add('hidden');
}

function logout() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: 'Tu sesión se cerrará y volverás a la página de inicio',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar localStorage al cerrar sesión
            localStorage.removeItem('usuarioId');
            localStorage.removeItem('nombreUsuario');
            localStorage.removeItem('apellidoUsuario');
            localStorage.removeItem('cuentaIds');
            
            window.location.href = 'index.html';
        }
    });
}

// Funciones globales para compatibilidad con el HTML (ACTUALIZADA CON MOVIMIENTOS)
window.showCreateForm = mostrarFormulario;
window.hideForm = ocultarFormulario;
window.logout = logout;
window.mostrarMovimientos = mostrarMovimientos; // NUEVA FUNCIÓN GLOBAL

// Inicialización cuando se carga el DOM (ACTUALIZADA)
document.addEventListener("DOMContentLoaded", () => {
    updateTime();
    setInterval(updateTime, 1000);

    // Obtener ID del usuario dinámicamente
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

    console.log('✅ Usuario autenticado:', usuarioId);

    // Mostrar el nombre del usuario si está disponible
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const apellidoUsuario = localStorage.getItem('apellidoUsuario');
    const userFullNameElement = document.getElementById('userFullName');
    
    if (userFullNameElement) {
        if (nombreUsuario && apellidoUsuario) {
            userFullNameElement.textContent = `${nombreUsuario} ${apellidoUsuario}`;
        } else if (nombreUsuario) {
            userFullNameElement.textContent = nombreUsuario;
        } else {
            userFullNameElement.textContent = `Usuario ${usuarioId}`;
        }
    }

    cargarCuentas();
    cargarTiposDeCuenta();

    const form = document.getElementById("cuenta-form");
    
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const tipo = document.getElementById("cuenta-tipo").value;
            const saldo = 0; // Saldo inicial por defecto en 0
            const usuarioIdForm = getUserId(); // Usar el ID del usuario logueado dinámicamente

            if (!tipo) {
                Swal.fire("Atención", "Selecciona un tipo de cuenta", "warning");
                return;
            }

            if (!usuarioIdForm) {
                Swal.fire("Error", "No se pudo identificar al usuario", "error");
                return;
            }

            try {
                const res = await fetch("http://localhost:8080/api/cuentas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        tipo, 
                        saldo, 
                        usuarioId: parseInt(usuarioIdForm),
                        moneda: 'peso' // Por defecto crear en pesos
                    }),
                });
                
                if (res.ok) {
                    Swal.fire({
                        title: 'Éxito',
                        text: 'Cuenta creada correctamente',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        form.reset();
                        ocultarFormulario();
                        cargarCuentas();
                    });
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error en el servidor');
                }
            } catch (error) {
                console.error('Error al guardar cuenta:', error);
                Swal.fire("Error", error.message || "No se pudo guardar la cuenta", "error");
            }
        });
    }
});