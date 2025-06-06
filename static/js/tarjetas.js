let currentFilter = 'all';
const userId = localStorage.getItem('usuarioId');
document.addEventListener('DOMContentLoaded', function() {

    updateCurrentTime();
    mostrarTarjetas();
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const apellidoUsuario = localStorage.getItem('apellidoUsuario');
        if (nombreUsuario && apellidoUsuario) {
            document.getElementById('userFullName').textContent = `${nombreUsuario} ${apellidoUsuario}`; // Mostrar el nombre completo en la página
        } else {
            document.getElementById('userFullName').textContent = 'Usuario'; // Nombre por defecto si no hay
        }
});




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

const mostrarTarjetas = async () => {
    const contenedorPadre = document.getElementById("contenedor-tarjetas");
    try {
        const response = await fetch(`http://localhost:8080/api/tarjetas/usuario/${userId}`);
        if(!response.ok) {
            contenedorPadre.innerHTML = `
                <div class="flex items-center gap-2 text-gray-600">
                    <span class="material-icons text-blue-500">info</span>
                    <span>No tenés tarjetas. <a href="nuevatarjeta.html" class="text-blue-600 hover:underline">Solicitá una nueva</a>.</span>
                </div>`;
            throw new Error("Error al obtener las tarjetas");
        } else {
            const tarjetas = await response.json();
            console.log(tarjetas);
            contenedorPadre.innerHTML = "";
            
            tarjetas.forEach(tarjeta => {
                // Crear contenedor principal para cada tarjeta
                const tarjetaContainer = document.createElement("div");
                tarjetaContainer.className = "movement-item flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:border-l-4 hover:border-blue-500";
                tarjetaContainer.dataset.tipo = tarjeta.tipo.toLowerCase(); // IMPORTANTE para los filtros
                tarjetaContainer.classList.add('tarjeta-item'); // Clase necesaria para filtros
                
                // Crear contenedor interno para los detalles
                const detalleContainer = document.createElement("div");
                detalleContainer.className = "flex items-center space-x-4";
                
                // Crear icono
                const icon = document.createElement("span");
                icon.textContent = tarjeta.esVirtual ? "smartphone" : "credit_card";
                icon.className = "material-icons text-green-600";
                
                // Crear contenedor de texto
                const textoContainer = document.createElement("div");
                textoContainer.className = "flex flex-col";
                
                // Tipo de tarjeta
                const tipo = document.createElement("p");
                tipo.className = "font-medium text-gray-800";
                let stringTipoTarjeta = `Tarjeta de ${tarjeta.tipo.toLowerCase()}${tarjeta.esVirtual ? ' virtual' : ' fisica'} ${tarjeta.congelada ? ' - CONGELADA TEMPORALMENTE' : ''}`;
                tipo.textContent = stringTipoTarjeta;
                
                // Número de tarjeta
                const numero = document.createElement("p");
                numero.className = "text-sm text-gray-500";
                numero.textContent = `**** **** **** ${tarjeta.numero.slice(-4)}`;
                
                // Botón Ver detalle
                const boton = document.createElement("button");
                boton.textContent = "Ver detalle";
                boton.className = "text-blue-600 hover:text-blue-700 text-sm font-medium";
                boton.dataset.id = tarjeta.id;

                boton.addEventListener("click", () => {
                    localStorage.setItem("tarjetaId", tarjeta.id);
                    window.location.href = "detalletarjeta.html";
                });
                
                // Construir estructura
                textoContainer.appendChild(tipo);
                textoContainer.appendChild(numero);
                detalleContainer.appendChild(icon);
                detalleContainer.appendChild(textoContainer);
                
                tarjetaContainer.appendChild(detalleContainer);
                tarjetaContainer.appendChild(boton);
                
                contenedorPadre.appendChild(tarjetaContainer);
            });
        }
    } catch(error) {
        console.error("No se pudo obtener las tarjetas", error);
    }
}

    const solicitarTarjeta = () => {
        localStorage.setItem("userId", userId);
        window.location.href = "nuevatarjeta.html";
    }


 function filtrarTarjetas(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('bg-blue-100', 'text-blue-700');
        btn.classList.add('bg-gray-100', 'text-gray-700');
    });
    console.log(userId);
    const activeBtn = document.getElementById(`filter-${type}`);
    activeBtn.classList.add('active', 'bg-blue-100', 'text-blue-700');
    activeBtn.classList.remove('bg-gray-100', 'text-gray-700');

    const tarjetas = document.querySelectorAll('.tarjeta-item');
    let visibleCount = 0;

    tarjetas.forEach(tarjeta => {
        const tipoTarjeta = tarjeta.dataset.tipo;
        const shouldShow = type === 'all' || tipoTarjeta === type;

        if (shouldShow) {
            tarjeta.style.display = 'flex';
            visibleCount++;
        } else {
            tarjeta.style.display = 'none';
        }
    });
    updateEmptyState(visibleCount === 0);
}

function updateEmptyState(isEmpty) {
    const emptyState = document.getElementById('empty-state');
    const contenedorTarjetas = document.getElementById('contenedor-tarjetas');
    
    if (isEmpty) {
        if (!emptyState) {
            const emptyDiv = document.createElement('div');
            emptyDiv.id = 'empty-state';
            emptyDiv.className = 'flex items-center gap-2 text-gray-600 p-4';
            emptyDiv.innerHTML = `
                <span class="material-icons text-blue-500">info</span>
                <span>No se encontraron tarjetas de este tipo.</span>
            `;
            contenedorTarjetas.appendChild(emptyDiv);
        }
    } else {
        if (emptyState) {
            emptyState.remove();
        }
    }
}