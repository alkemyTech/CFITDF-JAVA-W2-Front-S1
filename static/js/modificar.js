const API_URL = 'http://localhost:8080/api/usuario'; // Cambia esta URL según tu configuración

// Función para cargar los datos del usuario
async function cargarUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Error al cargar el usuario');

        const usuario = await response.json();
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('apellido').value = usuario.apellido;
        document.getElementById('email').value = usuario.email;
        document.getElementById('telefono').value = usuario.telefono;
        document.getElementById('estado').value = usuario.enabled ? 'true' : 'false';
    } catch (error) {
        console.error(error);
        alert('Error al cargar los datos del usuario.');
    }
}

// Función para modificar el usuario
async function modificarUsuario(event) {
    event.preventDefault(); // Prevenir el envío del formulario por defecto

    const id = document.getElementById('usuarioId').value;
    const usuarioActualizado = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        enabled: document.getElementById('estado').value === 'true'
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioActualizado)
        });

        if (!response.ok) throw new Error('Error al modificar el usuario');

        alert('Usuario modificado exitosamente.');
        window.location.href = 'usuarios.html'; // Redirigir a la lista de usuarios
    } catch (error) {
        console.error(error);
        alert('Error al modificar el usuario.');
    }
}

// Obtener el ID del usuario de la URL
const urlParams = new URLSearchParams(window.location.search);
const usuarioId = urlParams.get('id');

// Cargar el usuario al cargar la página
window.onload = () => {
    if (usuarioId) {
        cargarUsuario(usuarioId);
    }
};

// Asignar el evento de envío del formulario
document.getElementById('formModificarUsuario').addEventListener('submit', modificarUsuario);
