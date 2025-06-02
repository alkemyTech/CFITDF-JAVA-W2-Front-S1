    // Variables globales
    let allMovements = [];
    let filteredMovements = [];
    let currentFilter = 'all';

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

    // Funcion logout
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

    // Función para filtrar movimientos
    function filterMovements(type) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activar el botón seleccionado
        document.getElementById(`filter-${type}`).classList.add('active');
        currentFilter = type;

        // Filtrar movimientos
        const movements = document.querySelectorAll('.movement-item');
        let visibleCount = 0;

        movements.forEach(movement => {
            const shouldShow = type === 'all' || movement.dataset.type === type;

            if (shouldShow) {
                movement.style.display = 'flex';
                visibleCount++;
            } else {
                movement.style.display = 'none';
            }
        });

        // Mostrar estado vacío si no hay movimientos
        updateEmptyState(visibleCount === 0);
        updateStats();
    }

    // Función para limpiar filtros
    function clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('dateFilter').value = 'all';
        filterMovements('all');
    }

    // Función para actualizar el estado vacío
    function updateEmptyState(isEmpty) {
        const emptyState = document.getElementById('emptyState');
        const movementsList = document.getElementById('movimientosList');

        if (isEmpty) {
            emptyState.classList.remove('hidden');
            movementsList.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            movementsList.classList.remove('hidden');
        }
    }

    // Función para buscar movimientos
    function searchMovements() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const movements = document.querySelectorAll('.movement-item');
        let visibleCount = 0;

        movements.forEach(movement => {
            const text = movement.textContent.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || movement.dataset.type === currentFilter;

            if (matchesSearch && matchesFilter) {
                movement.style.display = 'flex';
                visibleCount++;
            } else {
                movement.style.display = 'none';
            }
        });

        updateEmptyState(visibleCount === 0);
    }

    // Función para actualizar estadísticas
    function updateStats() {
        // Esta función se puede expandir para calcular estadísticas dinámicamente
        // Por ahora mantiene los valores estáticos del HTML
    }

    // Función para filtrar por fecha
    function filterByDate() {
        const dateFilter = document.getElementById('dateFilter').value;
        const now = new Date();

        // Aquí se implementaría la lógica de filtrado por fecha
        // Por ahora solo muestra una alerta como placeholder
        if (dateFilter === 'custom') {
            Swal.fire({
                title: 'Rango personalizado',
                html: `
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha desde:</label>
                        <input type="date" id="dateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha hasta:</label>
                        <input type="date" id="dateTo" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Aplicar filtro',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const from = document.getElementById('dateFrom').value;
                    const to = document.getElementById('dateTo').value;

                    if (!from || !to) {
                        Swal.showValidationMessage('Por favor selecciona ambas fechas');
                        return false;
                    }

                    if (new Date(from) > new Date(to)) {
                        Swal.showValidationMessage('La fecha de inicio no puede ser mayor que la fecha final');
                        return false;
                    }

                    return { from, to };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Aquí se implementaría el filtrado por rango de fechas
                    Swal.fire('Filtro aplicado', `Mostrando movimientos desde ${result.value.from} hasta ${result.value.to}`, 'success');
                }
            });
        }
    }

    // Función para mostrar detalles del movimiento
    function showMovementDetails(movementId) {
        // Datos de ejemplo para el movimiento
        const movementData = {
            id: movementId,
            type: 'income',
            amount: '$50.000',
            description: 'Carga de saldo',
            details: 'Depósito por tarjeta terminada en ****4521',
            date: 'Hoy, 14:30',
            status: 'Completado',
            reference: '#TXN001234'
        };

        Swal.fire({
            title: 'Detalles del movimiento',
            html: `
                <div class="text-left space-y-3">
                    <div class="flex justify-between">
                        <span class="font-medium">Tipo:</span>
                        <span class="text-green-600">${movementData.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Monto:</span>
                        <span class="font-bold text-green-600">${movementData.amount}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Descripción:</span>
                        <span>${movementData.description}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Detalles:</span>
                        <span class="text-sm text-gray-600">${movementData.details}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Fecha:</span>
                        <span>${movementData.date}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Estado:</span>
                        <span class="text-green-600">${movementData.status}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Referencia:</span>
                        <span class="font-mono text-sm">${movementData.reference}</span>
                    </div>
                </div>
            `,
            confirmButtonText: 'Cerrar',
            width: 600
        });
    }

    // Función para exportar movimientos
    function exportMovements() {
        Swal.fire({
            title: 'Exportar movimientos',
            text: '¿En qué formato deseas exportar tus movimientos?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'PDF',
            denyButtonText: 'Excel',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Simular exportación a PDF
                Swal.fire({
                    title: 'Exportando...',
                    text: 'Generando archivo PDF',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });

                setTimeout(() => {
                    Swal.fire('¡Éxito!', 'Archivo PDF descargado correctamente', 'success');
                }, 2000);
            } else if (result.isDenied) {
                // Simular exportación a Excel
                Swal.fire({
                    title: 'Exportando...',
                    text: 'Generando archivo Excel',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });

                setTimeout(() => {
                    Swal.fire('¡Éxito!', 'Archivo Excel descargado correctamente', 'success');
                }, 2000);
            }
        });
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
        // Actualizar hora cada minuto
        updateCurrentTime();
        setInterval(updateCurrentTime, 60000);

        // Agregar data-type a los movimientos de ejemplo
        const movements = document.querySelectorAll('.movement-item');
        movements.forEach((movement, index) => {
            const types = ['income', 'transfer', 'expense', 'transfer', 'expense'];
            movement.dataset.type = types[index % types.length];
        });

        // Event listener para búsqueda
        document.getElementById('searchInput').addEventListener('input', searchMovements);

        // Event listener para filtro de fecha
        document.getElementById('dateFilter').addEventListener('change', filterByDate);

        // Obtener el nombre y apellido del usuario del localStorage
            const nombreUsuario = localStorage.getItem('nombreUsuario');
            const apellidoUsuario = localStorage.getItem('apellidoUsuario');
            
            if (nombreUsuario && apellidoUsuario) {
                document.getElementById('userFullName').textContent = `${nombreUsuario} ${apellidoUsuario}`; // Mostrar el nombre completo en la página
            } else {
                document.getElementById('userFullName').textContent = 'Usuario'; // Nombre por defecto si no hay
            }

        // Agregar click listeners a los movimientos para mostrar detalles
        movements.forEach((movement, index) => {
            movement.style.cursor = 'pointer';
            movement.addEventListener('click', () => showMovementDetails(`TXN00123${4-index}`));
        });

        // Mostrar notificación de bienvenida
        setTimeout(() => {
            Swal.fire({
                title: '¡Bienvenida!',
                text: 'Aquí puedes revisar todos tus movimientos y transacciones',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }, 1000);
    });

    // Función para actualizar la hora de última actualización
    function updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('footerUpdateTime').textContent = timeString + ' hs';
        document.getElementById('lastUpdateTime').textContent = 'Actualizado ahora';
    }

    // Actualizar tiempo cada 5 minutos
    setInterval(updateLastUpdateTime, 300000);
