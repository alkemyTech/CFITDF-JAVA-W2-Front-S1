// Función para mostrar los últimos 4 usuarios registrados
async function mostrarUltimosUsuarios() {
    const ultimosUsuariosDiv = document.getElementById("ultimosUsuarios");
    ultimosUsuariosDiv.innerHTML = ""; // Limpiar contenido previo

    try {
        const response = await fetch('http://localhost:8080/api/usuario/listado'); // Hacer la solicitud al endpoint
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }

        const usuarios = await response.json(); // Obtener la lista de usuarios

        // Obtener los últimos 4 usuarios
        const ultimosUsuarios = usuarios.slice(0, 4);

        // Generar el HTML para cada usuario
        ultimosUsuarios.forEach(usuario => {
            const usuarioDiv = document.createElement("div");
            usuarioDiv.className = "flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-300";
            
            usuarioDiv.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span class="material-icons text-blue-600">person</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${usuario.nombre}</p>
                        <p class="text-sm text-gray-500">Registrado: ${usuario.fechaRegistro}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-800">${usuario.estado}</p>
                </div>
            `;

            ultimosUsuariosDiv.appendChild(usuarioDiv);
        });
    } catch (error) {
        console.error('Error al cargar los usuarios:', error);
    }
}

// Llamar a la función para mostrar los usuarios al cargar la página
document.addEventListener("DOMContentLoaded", mostrarUltimosUsuarios);
