const usuarioId = 2;

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

// Función para mostrar el resumen de una cuenta
function mostrarResumen(cuentaId) {
    // Mostrar indicador de carga
    Swal.fire({
        title: 'Cargando resumen...',
        html: '<div class="pulse-animation">Obteniendo datos de la cuenta</div>',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    // Hacer llamada a la API
    fetch(`http://localhost:8080/api/cuentas/${cuentaId}/resumen`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(resumen => {
            mostrarModalResumen(resumen, cuentaId);
        })
        .catch(error => {
            console.error('Error al obtener el resumen:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener el resumen de la cuenta. Por favor, intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#667eea'
            });
        });
}

// Función para mostrar el modal con el resumen
function mostrarModalResumen(resumen, cuentaId) {
    const monedaIcono = resumen.moneda === 'dolar_cripto' ? '₿' : 
                       resumen.moneda === 'dolar_comun' ? '💵' : '💰';
    
    const htmlResumen = `
        <div class="resumen-modal text-left">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
                <h3 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <span class="material-icons mr-2 text-blue-600">analytics</span>
                    Resumen de la Cuenta #${cuentaId}
                    <span class="ml-2 text-2xl">${monedaIcono}</span>
                </h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="flex items-center mb-2">
                        <span class="material-icons text-green-600 mr-2">trending_up</span>
                        <h4 class="font-semibold text-green-800">Ingresos</h4>
                    </div>
                    <p class="text-2xl font-bold text-green-600">${formatearSaldo(resumen.totalDepositado || 0, resumen.moneda || 'peso')}</p>
                    <p class="text-sm text-green-700">Total depositado</p>
                </div>
                
                <div class="bg-red-50 p-4 rounded-lg">
                    <div class="flex items-center mb-2">
                        <span class="material-icons text-red-600 mr-2">trending_down</span>
                        <h4 class="font-semibold text-red-800">Egresos</h4>
                    </div>
                    <p class="text-2xl font-bold text-red-600">${formatearSaldo(resumen.totalExtraido || 0, resumen.moneda || 'peso')}</p>
                    <p class="text-sm text-red-700">Total extraído</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="flex items-center mb-2">
                        <span class="material-icons text-blue-600 mr-2">swap_horiz</span>
                        <h4 class="font-semibold text-blue-800">Transferencias</h4>
                    </div>
                    <p class="text-2xl font-bold text-blue-600">${formatearSaldo(resumen.totalTransferido || 0, resumen.moneda || 'peso')}</p>
                    <p class="text-sm text-blue-700">Total transferido</p>
                </div>
                
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="flex items-center mb-2">
                        <span class="material-icons text-purple-600 mr-2">receipt</span>
                        <h4 class="font-semibold text-purple-800">Transacciones</h4>
                    </div>
                    <p class="text-2xl font-bold text-purple-600">${resumen.cantidadTransacciones || 0}</p>
                    <p class="text-sm text-purple-700">Total de operaciones</p>
                </div>
            </div>
            
            ${resumen.tipoUltimaTransaccion ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="material-icons mr-2 text-gray-600">history</span>
                        Última Transacción
                    </h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Tipo:</span>
                            <span class="font-medium capitalize">${resumen.tipoUltimaTransaccion}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Monto:</span>
                            <span class="font-medium">${formatearSaldo(resumen.montoUltimaTransaccion || 0, resumen.moneda || 'peso')}</span>
                        </div>
                        ${resumen.descripcionUltimaTransaccion ? `
                            <div class="flex justify-between">
                                <span class="text-gray-600">Descripción:</span>
                                <span class="font-medium">${resumen.descripcionUltimaTransaccion}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : `
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <span class="material-icons text-gray-400 text-3xl mb-2">inbox</span>
                    <p class="text-gray-600">No hay transacciones registradas</p>
                </div>
            `}
        </div>
    `;

    Swal.fire({
        html: htmlResumen,
        width: '650px',
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

// Función para cargar las cuentas y mostrarlas agrupadas por moneda
function cargarCuentas() {
    fetch(`http://localhost:8080/api/cuentas/usuario/${usuarioId}`)
        .then(res => res.json())
        .then(async cuentas => {
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
            console.error("Error al cargar cuentas:", err);
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

// Función para generar HTML de una tarjeta de cuenta individual
function generarTarjetaCuenta(cuenta, tipoMoneda) {
    const icono = getAccountIcon(cuenta.tipo, tipoMoneda);
    const color = getAccountColor(cuenta.tipo, tipoMoneda);
    
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
                            <span class="text-xs bg-${color}-100 text-${color}-700 px-2 py-1 rounded-full capitalize">
                                ${tipoMoneda.replace('_', ' ')}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">Usuario ID: ${cuenta.usuarioId || usuarioId}</p>
                        <p class="text-2xl font-bold text-${color}-600 mt-2">
                            ${formatearSaldo(cuenta.saldo, tipoMoneda)}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="mostrarResumen(${cuenta.id})" 
                            class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver resumen">
                        <span class="material-icons text-sm">analytics</span>
                    </button>
                    <button onclick="eliminarCuenta(${cuenta.id})" 
                            class="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar cuenta">
                        <span class="material-icons text-sm">delete</span>
                    </button>
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

function eliminarCuenta(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará la cuenta permanentemente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:8080/api/cuentas/${id}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    Swal.fire('Eliminada', 'La cuenta ha sido eliminada correctamente', 'success');
                    cargarCuentas();
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error al eliminar cuenta:', error);
                Swal.fire('Error', 'No se pudo eliminar la cuenta', 'error');
            }
        }
    });
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
            window.location.href = 'index.html';
        }
    });
}

// Funciones globales para compatibilidad con el HTML
window.showCreateForm = mostrarFormulario;
window.hideForm = ocultarFormulario;
window.deleteAccount = eliminarCuenta;
window.logout = logout;
window.mostrarResumen = mostrarResumen;

// Inicialización cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
    updateTime();
    setInterval(updateTime, 1000);

    cargarCuentas();
    cargarTiposDeCuenta();

    const form = document.getElementById("cuenta-form");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const tipo = document.getElementById("cuenta-tipo").value;
        const saldo = 0; // Saldo inicial por defecto en 0
        const usuarioIdForm = usuarioId; // Usar el ID del usuario logueado

        if (!tipo) {
            Swal.fire("Atención", "Selecciona un tipo de cuenta", "warning");
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

    // No necesitamos más el campo de usuario ID en el formulario
    // El usuarioId se toma automáticamente del usuario logueado
});