// Función para detectar moneda basada en el nombre del tipo de cuenta
function detectarMonedaPorTipo(tipo) {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('dolar') || tipoLower.includes('dollar') || tipoLower.includes('usd')) {
        return 'dolar_comun';
    }
    
    if (tipoLower.includes('cripto') || tipoLower.includes('bitcoin') || tipoLower.includes('btc') || tipoLower.includes('crypto')) {
        return 'dolar_cripto';
    }
    
    return 'peso'; // Por defecto pesos
}

// Variables globales para autenticación
let usuarioAutenticado = null;
let usuarioRol = null;

// Función para obtener el usuario autenticado desde el almacenamiento local
function obtenerUsuarioAutenticado() {
    try {
        const userData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

        if (!userData) {
            console.error('No se encontró información de usuario en el almacenamiento');
            throw new Error('Usuario no autenticado');
        }

        usuarioAutenticado = JSON.parse(userData);
        console.log('Usuario autenticado:', usuarioAutenticado);
        return usuarioAutenticado;

    } catch (error) {
        console.error('Error al obtener usuario autenticado:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se encontró información del usuario. Redirigiendo al login...',
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'index.html'; // o tu página de login
        });

        return null;
    }
}


// Función para obtener el rol del usuario desde la API
async function obtenerRolUsuario() {
    try {
        if (!usuarioAutenticado) {
            usuarioAutenticado = obtenerUsuarioAutenticado();
        }
        
        // Si ya tenemos el rol, no hacer petición
        if (usuarioAutenticado.rol) {
            usuarioRol = usuarioAutenticado.rol;
            console.log(`Usuario con rol desde cache: ${usuarioRol}`);
            return usuarioRol;
        }

        // Obtener el rol desde la API
        const res = await fetch(`http://localhost:8080/api/usuario/${usuarioAutenticado.id}`);
        if (res.ok) {
            const userData = await res.json();
            usuarioRol = userData.rol;
            
            // Actualizar el usuario autenticado con el rol
            usuarioAutenticado.rol = usuarioRol;
            usuarioAutenticado.nombre = userData.nombre || usuarioAutenticado.nombre;
            
            console.log(`Usuario logueado con rol: ${usuarioRol}`);
            return usuarioRol;
        } else {
            // Fallback: asumir CLIENTE por seguridad
            usuarioRol = 'CLIENTE';
            console.warn('No se pudo obtener el rol del usuario, asignando rol CLIENTE por defecto');
            return usuarioRol;
        }
    } catch (error) {
        console.error('Error al obtener rol del usuario:', error);
        usuarioRol = 'CLIENTE'; // Fallback seguro
        return usuarioRol;
    }
}

// Función para verificar si el usuario tiene permisos
function tienePermiso(accion) {
    if (usuarioRol === 'ADMIN') {
        return true; // Admin puede hacer TODO (listar, crear, editar, eliminar)
    }
    
    if (usuarioRol === 'CLIENTE') {
        // Cliente solo puede listar y crear sus propias cuentas (NO editar ni eliminar)
        return ['listar', 'crear'].includes(accion);
    }
    
    return false; // Por defecto, sin permisos
}

// Función para obtener el ID del usuario autenticado
function obtenerUsuarioId() {
    if (!usuarioAutenticado) {
        usuarioAutenticado = obtenerUsuarioAutenticado();
    }
    return usuarioAutenticado ? usuarioAutenticado.id : USUARIO_ID_DEFAULT;
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

// Función para actualizar la interfaz con datos del usuario
function actualizarInterfazUsuario() {
    if (usuarioAutenticado) {
        // Actualizar nombre del usuario en la interfaz
        const nombreElements = document.querySelectorAll('[data-usuario-nombre]');
        nombreElements.forEach(el => {
            el.textContent = usuarioAutenticado.nombre || usuarioAutenticado.email || 'Usuario Test';
        });
        
        // Mostrar indicador de usuario y rol
        const userIndicator = document.createElement('div');
        userIndicator.id = 'user-indicator';
        userIndicator.className = `fixed top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border z-50 ${
            usuarioRol === 'ADMIN' 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : 'bg-blue-100 text-blue-800 border-blue-200'
        }`;
        userIndicator.textContent = `${usuarioRol || 'LOADING'} - ID: ${usuarioAutenticado.id}`;
        
        // Insertar el indicador si no existe
        const existingIndicator = document.getElementById('user-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        document.body.appendChild(userIndicator);
    }
}

// Función para configurar la interfaz según el rol
function configurarInterfazSegunRol() {
    const esAdmin = usuarioRol === 'ADMIN';
    
    // Actualizar título de la página
    const tituloSeccion = document.querySelector('h2');
    if (tituloSeccion) {
        tituloSeccion.textContent = esAdmin ? 'Gestión de Cuentas - Administrador' : 'Mis Cuentas';
    }
    
    // Actualizar descripción
    const descripcionSeccion = tituloSeccion?.nextElementSibling;
    if (descripcionSeccion) {
        descripcionSeccion.textContent = esAdmin 
            ? 'Administra todas las cuentas del sistema' 
            : 'Administra tus cuentas bancarias y de inversión';
    }
    
    // Configurar botones según permisos
    const btnNuevaCuenta = document.querySelector('button[onclick*="showCreateForm"]');
    if (btnNuevaCuenta && !tienePermiso('crear')) {
        btnNuevaCuenta.style.display = 'none';
    }
    
    console.log(`Interfaz configurada para rol: ${usuarioRol}`);
}

// Función para obtener el icono según el tipo de cuenta y moneda
function getAccountIcon(tipo, moneda = 'peso') {
    if (moneda === 'dolar_cripto') {
        return '₿';
    } else if (moneda === 'dolar_comun') {
        return '💵';
    }
    
    const iconos = {
        'ahorro': '💰',
        'corriente': '🏦',
        'inversion': '📈',
        'credito': '💳',
        'caja de ahorro': '💰',
        'cuenta en dolares': '💵',
        'default': '🏛️'
    };
    return iconos[tipo.toLowerCase()] || iconos.default;
}

// Función para obtener el color según el tipo de cuenta y moneda
function getAccountColor(tipo, moneda = 'peso') {
    if (moneda === 'dolar_cripto') {
        return 'orange';
    } else if (moneda === 'dolar_comun') {
        return 'green';
    }
    
    const colores = {
        'ahorro': 'blue',
        'corriente': 'indigo',
        'inversion': 'purple',
        'credito': 'red',
        'caja de ahorro': 'blue',
        'cuenta en dolares': 'green',
        'default': 'gray'
    };
    return colores[tipo.toLowerCase()] || colores.default;
}

// Función para formatear el saldo con formato uniforme ($ y 2 decimales)
function formatearSaldo(saldo, moneda = 'peso') {
    const valor = parseFloat(saldo || 0);
    return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


// Función principal para cargar las cuentas según el rol
function cargarCuentas() {
    if (!tienePermiso('listar')) {
        console.error('Sin permisos para listar cuentas');
        mostrarError('Sin permisos para listar cuentas');
        return;
    }

    const usuarioId = obtenerUsuarioId();
    
    // Mostrar loading
    const lista = document.getElementById("lista-cuentas");
    if (lista) {
        lista.innerHTML = '<div class="text-center py-8"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p class="mt-2 text-gray-600">Cargando cuentas...</p></div>';
    }

    let url;
    if (usuarioRol === 'ADMIN') {
        // Admin ve todas las cuentas
        url = 'http://localhost:8080/api/cuentas';
        console.log('Cargando todas las cuentas (modo administrador)');
    } else {
        // Cliente ve solo sus cuentas
        url = `http://localhost:8080/api/cuentas/usuario/${usuarioId}`;
        console.log(`Cargando cuentas para usuario ID: ${usuarioId} (modo cliente)`);
    }

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(async cuentas => {
            console.log('Cuentas recibidas:', cuentas);
            
            const lista = document.getElementById("lista-cuentas");
            const emptyState = document.getElementById("empty-accounts");
            
            if (!lista) return;
            
            lista.innerHTML = "";
            
            if (!cuentas || cuentas.length === 0) {
                console.log('No se encontraron cuentas');
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                lista.classList.add('hidden');
                actualizarEstadisticas([]);
                return;
            }

            if (emptyState) {
                emptyState.classList.add('hidden');
            }
            lista.classList.remove('hidden');

            // Para admin, agrupar por usuario; para cliente, agrupar por moneda
            if (usuarioRol === 'ADMIN') {
                mostrarCuentasAdmin(cuentas);
            } else {
                mostrarCuentasCliente(cuentas);
            }
        })
        .catch(err => {
            console.error("Error al cargar cuentas:", err);
            mostrarError("No se pudieron cargar las cuentas: " + err.message);
        });
}

// Función para mostrar cuentas en modo administrador
function mostrarCuentasAdmin(cuentas) {
    const lista = document.getElementById("lista-cuentas");
    
    // Detectar automáticamente la moneda si no está definida
    const cuentasConMoneda = cuentas.map(cuenta => ({
        ...cuenta,
        moneda: cuenta.moneda || detectarMonedaPorTipo(cuenta.tipo)
    }));
    
    // Agrupar cuentas por usuario
    const cuentasPorUsuario = {};
    cuentasConMoneda.forEach(cuenta => {
        const userId = cuenta.usuarioId || cuenta.nombreUsuario || 'Sin usuario';
        if (!cuentasPorUsuario[userId]) {
            cuentasPorUsuario[userId] = [];
        }
        cuentasPorUsuario[userId].push(cuenta);
    });

    let htmlContent = `
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-center">
                <span class="material-icons text-red-600 mr-2">admin_panel_settings</span>
                <h3 class="text-lg font-bold text-red-800">Vista de Administrador</h3>
            </div>
            <p class="text-red-700 text-sm mt-1">Viendo todas las cuentas del sistema (${cuentasConMoneda.length} cuentas)</p>
        </div>
    `;

    Object.entries(cuentasPorUsuario).forEach(([userId, cuentasUsuario]) => {
        // Separar cuentas del usuario por moneda para calcular totales
        const cuentasPorMonedaUsuario = {
            peso: cuentasUsuario.filter(c => !c.moneda || c.moneda === 'peso'),
            dolar_comun: cuentasUsuario.filter(c => c.moneda === 'dolar_comun'),
            dolar_cripto: cuentasUsuario.filter(c => c.moneda === 'dolar_cripto')
        };

        const totalPesos = cuentasPorMonedaUsuario.peso.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
        const totalDolarComun = cuentasPorMonedaUsuario.dolar_comun.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
        const totalDolarCripto = cuentasPorMonedaUsuario.dolar_cripto.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
        
        htmlContent += `
            <div class="mb-8">
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-bold text-blue-800 flex items-center">
                            <span class="material-icons mr-2">person</span>
                            Usuario ID: ${userId}
                            ${cuentasUsuario[0].nombreUsuario ? ` (${cuentasUsuario[0].nombreUsuario})` : ''}
                            ${cuentasUsuario[0].apellidoUsuario ? ` ${cuentasUsuario[0].apellidoUsuario}` : ''}
                        </h3>
                        <div class="text-right">
                            <p class="text-sm text-blue-600">Totales del usuario</p>
                            <div class="space-y-1">
                                ${totalPesos > 0 ? `<div class="text-lg font-bold text-blue-800">${formatearSaldo(totalPesos, 'peso')}</div>` : ''}
                                ${totalDolarComun > 0 ? `<div class="text-sm font-bold text-green-600">${formatearSaldo(totalDolarComun, 'dolar_comun')}</div>` : ''}
                                ${totalDolarCripto > 0 ? `<div class="text-sm font-bold text-orange-600">${formatearSaldo(totalDolarCripto, 'dolar_cripto')}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    <p class="text-sm text-blue-600 mt-1">${cuentasUsuario.length} cuenta(s)</p>
                </div>
                
                <div class="space-y-4 ml-4">
                    ${cuentasUsuario.map(cuenta => generarTarjetaCuentaAdmin(cuenta)).join('')}
                </div>
            </div>
        `;
    });

    lista.innerHTML = htmlContent;
    
    // Actualizar estadísticas globales
    actualizarEstadisticasAdmin(cuentasConMoneda);
}

// Función para detectar moneda basada en el nombre del tipo de cuenta
function detectarMonedaPorTipo(tipo) {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('dolar') || tipoLower.includes('dollar') || tipoLower.includes('usd')) {
        return 'dolar_comun';
    }
    
    if (tipoLower.includes('cripto') || tipoLower.includes('bitcoin') || tipoLower.includes('btc') || tipoLower.includes('crypto')) {
        return 'dolar_cripto';
    }
    
    return 'peso'; // Por defecto pesos
}

// Función para mostrar cuentas en modo cliente
function mostrarCuentasCliente(cuentas) {
    // Detectar automáticamente la moneda si no está definida
    const cuentasConMoneda = cuentas.map(cuenta => ({
        ...cuenta,
        moneda: cuenta.moneda || detectarMonedaPorTipo(cuenta.tipo)
    }));

    // Usar la lógica original agrupada por moneda
    const cuentasPorMoneda = {
        peso: cuentasConMoneda.filter(c => !c.moneda || c.moneda === 'peso'),
        dolar_comun: cuentasConMoneda.filter(c => c.moneda === 'dolar_comun'),
        dolar_cripto: cuentasConMoneda.filter(c => c.moneda === 'dolar_cripto')
    };

    let htmlContent = '';

    if (cuentasPorMoneda.peso.length > 0) {
        htmlContent += generarSeccionMoneda('Cuentas en Pesos Argentinos', cuentasPorMoneda.peso, 'peso', '🇦🇷');
    }

    if (cuentasPorMoneda.dolar_comun.length > 0) {
        htmlContent += generarSeccionMoneda('Cuentas en Dólar Común', cuentasPorMoneda.dolar_comun, 'dolar_comun', '💵');
    }

    if (cuentasPorMoneda.dolar_cripto.length > 0) {
        htmlContent += generarSeccionMoneda('Cuentas en Criptomonedas', cuentasPorMoneda.dolar_cripto, 'dolar_cripto', '₿');
    }

    const lista = document.getElementById("lista-cuentas");
    lista.innerHTML = htmlContent;

    actualizarEstadisticasSeparadas(cuentasPorMoneda);
}

function generarTarjetaCuentaAdmin(cuenta) {
    const monedaDetectada = cuenta.moneda || detectarMonedaPorTipo(cuenta.tipo);
    const icono = getAccountIcon(cuenta.tipo, monedaDetectada);
    const color = getAccountColor(cuenta.tipo, monedaDetectada);

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
                                ${monedaDetectada.replace('_', ' ')}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">Propietario: Usuario ID ${cuenta.usuarioId}</p>
                        <p class="text-2xl font-bold text-${color}-600 mt-2">
                            ${formatearSaldo(cuenta.saldo, monedaDetectada)}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2 items-end">
                    <button onclick="verResumenCuenta(${cuenta.id})" 
                            class="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Ver resumen">
                        <span class="material-icons text-sm">analytics</span>
                    </button>
                    <button onclick="editarCuentaAdmin(${cuenta.id}, '${cuenta.tipo}', ${cuenta.saldo}, '${monedaDetectada}', ${cuenta.usuarioId})" 
                            class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar cuenta">
                        <span class="material-icons text-sm">edit</span>
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

// Función para generar HTML de una sección de moneda (modo cliente)
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
                ${cuentas.map(cuenta => generarTarjetaCuentaCliente(cuenta, tipoMoneda)).join('')}
            </div>
        </div>
    `;
}

// Función para generar tarjeta de cuenta para cliente (SOLO lectura - sin editar/eliminar)
function generarTarjetaCuentaCliente(cuenta, tipoMoneda) {
    const monedaDetectada = cuenta.moneda || tipoMoneda || detectarMonedaPorTipo(cuenta.tipo);
    const icono = getAccountIcon(cuenta.tipo, monedaDetectada);
    const color = getAccountColor(cuenta.tipo, monedaDetectada);
    const usuarioId = obtenerUsuarioId();
    
    // CLIENTE: Solo botón de ver resumen
    const botonesAccion = `
        <div class="flex flex-col space-y-2">
            <button onclick="verResumenCuenta(${cuenta.id})" 
                    class="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver resumen">
                <span class="material-icons text-sm">analytics</span>
            </button>
            <div class="flex flex-col items-center text-gray-400 mt-2">
                <span class="material-icons text-sm mb-1">visibility</span>
                <span class="text-xs">Solo lectura</span>
            </div>
        </div>
    `;

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
                                ${monedaDetectada.replace('_', ' ')}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">Usuario ID: ${cuenta.usuarioId || usuarioId}</p>
                        <p class="text-2xl font-bold text-${color}-600 mt-2">
                            ${formatearSaldo(cuenta.saldo, monedaDetectada)}
                        </p>
                    </div>
                </div>
                ${botonesAccion}
            </div>
        </div>
    `;
}

// Función para actualizar estadísticas de administrador
function actualizarEstadisticasAdmin(todasLasCuentas) {
    // Separar por monedas
    const cuentasPorMoneda = {
        peso: todasLasCuentas.filter(c => {
            const moneda = c.moneda || detectarMonedaPorTipo(c.tipo);
            return !moneda || moneda === 'peso';
        }),
        dolar_comun: todasLasCuentas.filter(c => {
            const moneda = c.moneda || detectarMonedaPorTipo(c.tipo);
            return moneda === 'dolar_comun';
        }),
        dolar_cripto: todasLasCuentas.filter(c => {
            const moneda = c.moneda || detectarMonedaPorTipo(c.tipo);
            return moneda === 'dolar_cripto';
        })
    };

    const totalPesos = cuentasPorMoneda.peso.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    const totalDolarComun = cuentasPorMoneda.dolar_comun.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    const totalDolarCripto = cuentasPorMoneda.dolar_cripto.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
    
    const totalCuentas = todasLasCuentas.length;
    const usuariosUnicos = new Set(todasLasCuentas.map(c => c.usuarioId)).size;
    
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
        let contenidoHTML = '<div class="space-y-1">';
        
        // Mostrar solo las monedas que tienen saldo > 0
        const monedasConSaldo = [];
        
        if (totalPesos > 0) {
            monedasConSaldo.push(`<div class="text-lg font-bold text-red-600">${formatearSaldo(totalPesos, 'peso')}</div>`);
        }
        if (totalDolarComun > 0) {
            monedasConSaldo.push(`<div class="text-sm font-bold text-green-600">${formatearSaldo(totalDolarComun, 'dolar_comun')}</div>`);
        }
        if (totalDolarCripto > 0) {
            monedasConSaldo.push(`<div class="text-sm font-bold text-orange-600">${formatearSaldo(totalDolarCripto, 'dolar_cripto')}</div>`);
        }
        
        if (monedasConSaldo.length > 0) {
            contenidoHTML += monedasConSaldo.join('');
            contenidoHTML += '<div class="text-xs text-red-500 mt-1">Total del sistema por moneda</div>';
        } else {
            contenidoHTML += '<div class="text-lg font-bold text-gray-400">Sin fondos</div>';
            contenidoHTML += '<div class="text-xs text-gray-400 mt-1">No hay cuentas con saldos</div>';
        }
        
        contenidoHTML += '</div>';
        
        totalBalanceEl.innerHTML = contenidoHTML;
    }

    const activeAccountsEl = document.getElementById('activeAccounts');
    if (activeAccountsEl) {
        activeAccountsEl.textContent = totalCuentas;
    }

    const mainAccountEl = document.getElementById('mainAccount');
    if (mainAccountEl) {
        mainAccountEl.innerHTML = `
            <div class="text-center">
                <div class="text-lg font-bold text-purple-600">${usuariosUnicos}</div>
                <div class="text-xs text-purple-500">usuarios activos</div>
            </div>
        `;
    }
}

// Función para actualizar estadísticas de cliente
function actualizarEstadisticasSeparadas(cuentasPorMoneda) {
    const totalPesos = cuentasPorMoneda.peso?.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0) || 0;
    const totalDolarComun = cuentasPorMoneda.dolar_comun?.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0) || 0;
    const totalDolarCripto = cuentasPorMoneda.dolar_cripto?.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0) || 0;
    
    const totalCuentas = Object.values(cuentasPorMoneda).flat().length;
    
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
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

    const todasLasCuentas = Object.values(cuentasPorMoneda).flat();
    const mainAccountEl = document.getElementById('mainAccount');
    if (mainAccountEl && todasLasCuentas.length > 0) {
        const cuentaPrincipal = todasLasCuentas.sort((a, b) => {
            if (a.moneda === 'peso' && b.moneda !== 'peso') return -1;
            if (b.moneda === 'peso' && a.moneda !== 'peso') return 1;
            return parseFloat(b.saldo) - parseFloat(a.saldo);
        })[0];
        
        mainAccountEl.textContent = cuentaPrincipal.tipo.charAt(0).toUpperCase() + cuentaPrincipal.tipo.slice(1);
    }
}

// Función auxiliar para actualizarEstadisticas (compatibilidad)
function actualizarEstadisticas(cuentas) {
    if (usuarioRol === 'ADMIN') {
        actualizarEstadisticasAdmin(cuentas);
    } else {
        const cuentasPorMoneda = {
            peso: cuentas.filter(c => !c.moneda || c.moneda === 'peso'),
            dolar_comun: cuentas.filter(c => c.moneda === 'dolar_comun'),
            dolar_cripto: cuentas.filter(c => c.moneda === 'dolar_cripto')
        };
        actualizarEstadisticasSeparadas(cuentasPorMoneda);
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const lista = document.getElementById("lista-cuentas");
    if (lista) {
        lista.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons text-red-500 text-3xl">error</span>
                </div>
                <h4 class="text-lg font-medium text-red-600 mb-2">Error</h4>
                <p class="text-red-500 mb-6">${mensaje}</p>
                <button onclick="cargarCuentas()" 
                        class="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                    <span class="material-icons mr-2">refresh</span>
                    Reintentar
                </button>
            </div>
        `;
    }
    
    Swal.fire("Error", mensaje, "error");
}

// Función para cargar tipos de cuenta
function cargarTiposDeCuenta() {
    fetch("http://localhost:8080/api/tipos-cuenta")
        .then(res => res.json())
        .then(tipos => {
            const select = document.getElementById("cuenta-tipo");
            if (!select) return;
            
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }

            tipos.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.nombre;
                option.textContent = `${getAccountIcon(tipo.nombre)} ${tipo.descripcion}`;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error al cargar tipos de cuenta:", err);
            const tiposPredefinidos = [
                { nombre: 'ahorro', descripcion: 'Cuenta de Ahorro' },
                { nombre: 'corriente', descripcion: 'Cuenta Corriente' },
                { nombre: 'inversion', descripcion: 'Cuenta de Inversión' },
                { nombre: 'credito', descripcion: 'Cuenta de Crédito' }
            ];
            
            const select = document.getElementById("cuenta-tipo");
            if (!select) return;
            
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
    if (!tienePermiso('crear')) {
        Swal.fire({
            title: 'Sin permisos',
            text: 'No tienes permisos para crear cuentas',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const formSection = document.getElementById('form-section');
    if (formSection) {
        formSection.classList.remove('hidden');
    }
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Crear Nueva Cuenta';
    }
    
    const btnText = document.getElementById('btn-text');
    if (btnText) {
        btnText.textContent = 'Crear Cuenta';
    }
    
    const form = document.getElementById('cuenta-form');
    if (form) {
        form.reset();
    }
    
    const cuentaId = document.getElementById('cuenta-id');
    if (cuentaId) {
        cuentaId.value = '';
    }
}

function ocultarFormulario() {
    const formSection = document.getElementById('form-section');
    if (formSection) {
        formSection.classList.add('hidden');
    }
}

// Función especial para editar cuentas como administrador
function editarCuentaAdmin(id, tipo, saldo, moneda = 'peso', propietarioId) {
    if (!tienePermiso('editar')) {
        Swal.fire({
            title: 'Sin permisos',
            text: 'No tienes permisos para editar cuentas',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    mostrarFormulario();
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = `Editar Cuenta #${id} (Admin)`;
    }
    
    const btnText = document.getElementById('btn-text');
    if (btnText) {
        btnText.textContent = 'Actualizar Cuenta';
    }
    
    const cuentaId = document.getElementById('cuenta-id');
    if (cuentaId) {
        cuentaId.value = id;
    }
    
    const cuentaTipo = document.getElementById('cuenta-tipo');
    if (cuentaTipo) {
        cuentaTipo.value = tipo;
    }
    
    const cuentaSaldo = document.getElementById('cuenta-saldo');
    if (cuentaSaldo) {
        cuentaSaldo.value = saldo;
    }
    
    const usuarioIdInput = document.getElementById('cuenta-usuario-id');
    if (usuarioIdInput) {
        usuarioIdInput.value = propietarioId; // Mantener el propietario original
        usuarioIdInput.readOnly = false; // Admin puede cambiar el propietario
        usuarioIdInput.style.backgroundColor = '#fff'; // Estilo normal
    }
    
    const monedaSelect = document.getElementById('cuenta-moneda');
    if (monedaSelect) {
        monedaSelect.value = moneda;
    }
}
// Función para editar cuentas (clientes - solo sus propias cuentas)
function editarCuenta(id, tipo, saldo, moneda = 'peso') {
    if (!tienePermiso('editar')) {
        Swal.fire({
            title: 'Sin permisos',
            text: 'No tienes permisos para editar cuentas',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    mostrarFormulario();
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Editar Cuenta';
    }
    
    const btnText = document.getElementById('btn-text');
    if (btnText) {
        btnText.textContent = 'Actualizar Cuenta';
    }
    
    const cuentaId = document.getElementById('cuenta-id');
    if (cuentaId) {
        cuentaId.value = id;
    }
    
    const cuentaTipo = document.getElementById('cuenta-tipo');
    if (cuentaTipo) {
        cuentaTipo.value = tipo;
    }
    
    const cuentaSaldo = document.getElementById('cuenta-saldo');
    if (cuentaSaldo) {
        cuentaSaldo.value = saldo;
    }
    
    const usuarioIdInput = document.getElementById('cuenta-usuario-id');
    if (usuarioIdInput) {
        usuarioIdInput.value = obtenerUsuarioId();
        usuarioIdInput.readOnly = true; // Cliente no puede cambiar el propietario
        usuarioIdInput.style.backgroundColor = '#f9fafb';
    }
    
    const monedaSelect = document.getElementById('cuenta-moneda');
    if (monedaSelect) {
        monedaSelect.value = moneda;
    }
}

// Función para ver el resumen de una cuenta
async function verResumenCuenta(cuentaId) {
    try {
        // Mostrar loading
        Swal.fire({
            title: 'Cargando resumen...',
            text: 'Obteniendo estadísticas de la cuenta',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`http://localhost:8080/api/cuentas/${cuentaId}/resumen`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const resumen = await response.json();
        console.log('Resumen obtenido:', resumen);

        // Cerrar loading y mostrar modal con resumen
        Swal.close();
        mostrarModalResumen(cuentaId, resumen);

    } catch (error) {
        console.error('Error al obtener resumen:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el resumen de la cuenta',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
    }
}

// Función para mostrar el modal con el resumen
function mostrarModalResumen(cuentaId, resumen) {
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        try {
            return new Date(fechaString).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fechaString;
        }
    };

    const htmlContent = `
        <div class="text-left">
            <div class="mb-6">
                <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 mb-4">
                    <h3 class="text-lg font-bold text-green-800 flex items-center mb-2">
                        <span class="material-icons mr-2">account_balance</span>
                        Resumen de Cuenta #${cuentaId}
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-green-600 font-medium">Cuentas Totales</p>
                            <p class="text-xl font-bold text-green-800">${resumen.cuentasId || 0}</p>
                        </div>
                        <div>
                            <p class="text-sm text-green-600 font-medium">Saldo Actual</p>
                            <p class="text-xl font-bold text-green-800">${formatearSaldo(resumen.saldoActual || 0)}</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-blue-600 font-medium">Total Depositado</p>
                                <p class="text-lg font-bold text-blue-800">${formatearSaldo(resumen.totalDepositado || 0)}</p>
                            </div>
                            <span class="material-icons text-blue-600 text-2xl">trending_up</span>
                        </div>
                    </div>

                    <div class="bg-red-50 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-red-600 font-medium">Total Extraído</p>
                                <p class="text-lg font-bold text-red-800">${formatearSaldo(resumen.totalExtraido || 0)}</p>
                            </div>
                            <span class="material-icons text-red-600 text-2xl">trending_down</span>
                        </div>
                    </div>

                    <div class="bg-purple-50 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-purple-600 font-medium">Total Transferido</p>
                                <p class="text-lg font-bold text-purple-800">${formatearSaldo(resumen.totalTransferido || 0)}</p>
                            </div>
                            <span class="material-icons text-purple-600 text-2xl">swap_horiz</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <span class="material-icons text-sm mr-2">timeline</span>
                            Estadísticas de Transacciones
                        </h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total de transacciones:</span>
                                <span class="font-medium">${resumen.cantidadTransacciones || 0}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total pagado:</span>
                                <span class="font-medium">${formatearSaldo(resumen.totalPagado || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <span class="material-icons text-sm mr-2">history</span>
                            Última Actividad
                        </h4>
                        <div class="space-y-2">
                            ${resumen.fechaUltimaTransaccion ? `
                                <div>
                                    <p class="text-sm text-gray-600">Última transacción:</p>
                                    <p class="font-medium text-sm">${formatearFecha(resumen.fechaUltimaTransaccion)}</p>
                                </div>
                            ` : '<p class="text-sm text-gray-500">Sin actividad reciente</p>'}
                            
                            ${resumen.tipoUltimaTransaccion ? `
                                <div>
                                    <p class="text-sm text-gray-600">Tipo:</p>
                                    <p class="font-medium">${resumen.tipoUltimaTransaccion}</p>
                                </div>
                            ` : ''}
                            
                            ${resumen.montoUltimaTransaccion ? `
                                <div>
                                    <p class="text-sm text-gray-600">Monto:</p>
                                    <p class="font-medium">${formatearSaldo(resumen.montoUltimaTransaccion)}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${resumen.descripcionUltimaTransaccion ? `
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <h4 class="text-md font-semibold text-yellow-800 mb-2 flex items-center">
                            <span class="material-icons text-sm mr-2">description</span>
                            Descripción de última transacción
                        </h4>
                        <p class="text-yellow-700">${resumen.descripcionUltimaTransaccion}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    Swal.fire({
        title: '',
        html: htmlContent,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3085d6',
        customClass: {
            popup: 'text-left'
        }
    });
}

// Función para eliminar cuentas (solo admin puede eliminar)
function eliminarCuenta(id) {
    if (!tienePermiso('eliminar')) {
        Swal.fire({
            title: 'Sin permisos',
            text: 'Solo los administradores pueden eliminar cuentas',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

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
            // Limpiar localStorage y sessionStorage
            localStorage.removeItem('usuario');
            sessionStorage.removeItem('usuario');

            // También limpiamos claves antiguas si existieran
            localStorage.removeItem('usuarioId');
            localStorage.removeItem('nombreUsuario');
            localStorage.removeItem('apellidoUsuario');
            localStorage.removeItem('RolUsuario');
            localStorage.removeItem('cuentaIds');

            // Mostrar mensaje opcional antes de redirigir
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

        }

// Funciones globales para compatibilidad con el HTML
window.showCreateForm = mostrarFormulario;
window.hideForm = ocultarFormulario;
window.editAccount = editarCuenta;
window.deleteAccount = eliminarCuenta;
window.verResumenCuenta = verResumenCuenta;
window.editarCuentaAdmin = editarCuentaAdmin; // Nueva función para admin
window.logout = logout;

// Inicialización cuando se carga el DOM
document.addEventListener("DOMContentLoaded", async () => {
    // Obtener usuario autenticado
    usuarioAutenticado = obtenerUsuarioAutenticado();
    
    if (!usuarioAutenticado) {
        console.error('No se pudo obtener usuario autenticado');
        return;
    }
    
    // Obtener rol del usuario
    await obtenerRolUsuario();
    
    // Configurar interfaz según rol
    actualizarInterfazUsuario();
    configurarInterfazSegunRol();
    
    // Inicializar reloj
    updateTime();
    setInterval(updateTime, 1000);

    // Cargar datos
    cargarCuentas();
    cargarTiposDeCuenta();

    // Configurar formulario
    const form = document.getElementById("cuenta-form");
    
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const id = document.getElementById("cuenta-id")?.value;
            const esEdicion = Boolean(id);
            
            // Verificar permisos
            if (esEdicion && !tienePermiso('editar')) {
                Swal.fire("Sin permisos", "No tienes permisos para editar cuentas", "warning");
                return;
            }
            
            if (!esEdicion && !tienePermiso('crear')) {
                Swal.fire("Sin permisos", "No tienes permisos para crear cuentas", "warning");
                return;
            }
            
            const tipo = document.getElementById("cuenta-tipo")?.value;
            const saldoInput = document.getElementById("cuenta-saldo")?.value;
            const saldo = parseFloat(saldoInput);
            const usuarioIdForm = document.getElementById("cuenta-usuario-id")?.value || obtenerUsuarioId();
            
            const monedaSelect = document.getElementById("cuenta-moneda");
            const moneda = monedaSelect ? monedaSelect.value : 'peso';

            if (!tipo) {
                Swal.fire("Atención", "Selecciona un tipo de cuenta", "warning");
                return;
            }
            
            if (isNaN(saldo) || saldo < 0) {
                Swal.fire("Atención", "Ingresa un saldo válido", "warning");
                return;
            }

            // Mostrar loading en el botón
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-icons animate-spin mr-2">sync</span>Guardando...';
            submitBtn.disabled = true;

            try {
                const url = id
                    ? `http://localhost:8080/api/cuentas/${id}`
                    : "http://localhost:8080/api/cuentas";

                const method = id ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        tipo, 
                        saldo, 
                        usuarioId: parseInt(usuarioIdForm),
                        moneda: moneda
                    }),
                });

                const mensaje = id ? "actualizada" : "creada";
                
                if (res.ok) {
                    Swal.fire({
                        title: 'Éxito',
                        text: `Cuenta ${mensaje} correctamente`,
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
            } finally {
                // Restaurar botón
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Pre-rellenar el campo de usuario ID si existe
    const usuarioIdInput = document.getElementById("cuenta-usuario-id");
    if (usuarioIdInput && usuarioAutenticado) {
        usuarioIdInput.value = usuarioAutenticado.id;
        usuarioIdInput.readOnly = true;
        usuarioIdInput.style.backgroundColor = '#f9fafb';
    }
});