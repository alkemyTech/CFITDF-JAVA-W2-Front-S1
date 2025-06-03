const API_URL = 'http://localhost:8080/api/usuario'; // Cambia esta URL según tu configuración

// Función para cargar usuarios al cargar la página
async function cargarUsuarios() {
    // Mostrar el estado de carga
    document.getElementById('loadingUsuarios').classList.remove('hidden');
    document.getElementById('contenedorTabla').classList.add('hidden');
    document.getElementById('noUsuarios').classList.add('hidden');
    document.getElementById('errorUsuarios').classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/listado`);
        if (!response.ok) throw new Error('Error al cargar usuarios');

        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error(error);
        mostrarError();
    } finally {
        document.getElementById('loadingUsuarios').classList.add('hidden');
    }
}

function mostrarUsuarios(usuarios) {
    const tablaUsuarios = document.getElementById('tablaUsuarios');
    tablaUsuarios.innerHTML = ''; // Limpiar tabla

    if (usuarios.length === 0) {
        document.getElementById('noUsuarios').classList.remove('hidden');
        return;
    }

    // Inicializar contadores
    let totalActivos = 0;
    let totalInactivos = 0;

    // Llenar la tabla con los usuarios
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4">${usuario.nombre} ${usuario.apellido}</td>
            <td class="px-6 py-4">${usuario.email}</td>
            <td class="px-6 py-4">${new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
            <td class="px-6 py-4">${usuario.enabled ? 'Activo' : 'Inactivo'}</td>
            <td class="px-6 py-4">
                <button onclick="verUsuario(${usuario.id})" class="text-blue-600 hover:text-blue-800">Ver</button>
                <button onclick="modificarUsuario(${usuario.id})" class="text-green-600 hover:text-green-800 ml-2">Modificar</button>
                <button onclick="eliminarUsuario(${usuario.id})" class="text-red-600 hover:text-red-800 ml-2">Eliminar</button>
            </td>
        `;
        tablaUsuarios.appendChild(row);

        // Contar activos e inactivos
        if (usuario.enabled) {
            totalActivos++;
        } else {
            totalInactivos++;
        }
    });

    // Actualizar contadores en el DOM
    document.getElementById('totalUsuarios').textContent = usuarios.length; // Total de usuarios
    document.getElementById('usuariosActivos').textContent = totalActivos; // Usuarios activos
    document.getElementById('usuariosInactivos').textContent = totalInactivos; // Usuarios inactivos

    document.getElementById('contadorUsuarios').textContent = `${usuarios.length} usuarios`;
    document.getElementById('contenedorTabla').classList.remove('hidden');
}

function verUsuario(id) {
    // Mostrar el modal
    document.getElementById('modalDetalles').classList.remove('hidden');
    // Cargar detalles del usuario
    cargarDetallesUsuario(id);
}

async function cargarDetallesUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Error al cargar los detalles del usuario');

        const usuario = await response.json();
        mostrarDetalles(usuario);
    } catch (error) {
        console.error(error);
        document.getElementById('usuarioDetalles').innerHTML = `<p class="text-red-500">Error al cargar los detalles del usuario.</p>`;
    }
}

function mostrarDetalles(usuario) {
    const usuarioDetalles = document.getElementById('usuarioDetalles');
    usuarioDetalles.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${usuario.nombre} ${usuario.apellido}</h2>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>DNI:</strong> ${usuario.dni}</p>
        <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
        <p><strong>Provincia:</strong> ${usuario.provincia}</p>
        <p><strong>Ciudad:</strong> ${usuario.ciudad}</p>
        <p><strong>Fecha de nacimiento:</strong> ${new Date(usuario.fechaNacimiento).toLocaleDateString()}</p>
        <p><strong>Fecha de Registro:</strong> ${new Date(usuario.fechaRegistro).toLocaleDateString()}</p>
        <p><strong>Estado:</strong> ${usuario.enabled ? 'Activo' : 'Inactivo'}</p>
    `;
}

function cerrarModal() {
    // Ocultar el modal
    document.getElementById('modalDetalles').classList.add('hidden');
}

function modificarUsuario(id) {
    // Lógica para modificar el usuario
    window.location.href = `modificarUsuario.html?id=${id}`;
}

// Función para mostrar error
function mostrarError() {
    document.getElementById('errorUsuarios').classList.remove('hidden');
}

// Función para eliminar un usuario
async function eliminarUsuario(id) {
    const confirmDelete = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarlo!',
        cancelButtonText: 'Cancelar'
    });

    if (confirmDelete.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar el usuario');

            Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
            cargarUsuarios(); // Recargar usuarios
        } catch (error) {
            Swal.fire('Error!', 'Hubo un problema al eliminar el usuario.', 'error');
        }
    }
}

// Función para buscar usuarios
async function buscarUsuarios() {
    const busqueda = document.getElementById('buscarUsuario').value;
    const estado = document.getElementById('filtroEstado').value;

    // Mostrar el estado de carga
    document.getElementById('loadingUsuarios').classList.remove('hidden');
    document.getElementById('contenedorTabla').classList.add('hidden');

    try {
        let url = `${API_URL}/listado?nombre=${busqueda}`;
        
        // Ajustar el valor del estado según la selección
        if (estado === 'activo') {
            url += `&estado=true`; // Para usuarios activos
        } else if (estado === 'inactivo') {
            url += `&estado=false`; // Para usuarios inactivos
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al buscar usuarios');

        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error(error);
        mostrarError();
    } finally {
        document.getElementById('loadingUsuarios').classList.add('hidden');
    }
}

// Event listeners
document.getElementById('buscarUsuario').addEventListener('input', buscarUsuarios);
document.getElementById('filtroEstado').addEventListener('change', buscarUsuarios);

// Cargar usuarios al inicio
window.onload = cargarUsuarios;


