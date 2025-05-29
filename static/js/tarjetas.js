
        // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        mostrarTarjetas();

        // Animar el saldo al cargar
        setTimeout(() => {
            animateNumber('saldo', 125750.50);
        }, 500);

        // Mostrar notificación de bienvenida
        setTimeout(() => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: '¡Bienvenida de vuelta, Melina!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }, 1000);
    });


// Actualizar hora actual
function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('currentTime').textContent = `${timeString}`;
    }

    // Simular datos del dashboard
    function loadDashboardData() {
        // Simular saldo
        const saldo = 125750.50;
        document.getElementById('saldo').textContent = saldo.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Simular estadísticas
        document.getElementById('monthlyIncome').textContent = '87.500,00';
        document.getElementById('monthlyExpenses').textContent = '34.250,00';
        document.getElementById('transactionCount').textContent = '23';
    }

    // Función de logout mejorada
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
                        window.location.href = 'login.html';
                    }
                });
            }
        });
    }

    // Animación de números (contador)
    function animateNumber(elementId, finalNumber, duration = 2000) {
        const element = document.getElementById(elementId);
        const startNumber = 0;
        const increment = finalNumber / (duration / 16);
        let currentNumber = startNumber;

        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= finalNumber) {
                currentNumber = finalNumber;
                clearInterval(timer);
            }
            element.textContent = currentNumber.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }, 16);
    }



    // Actualizar último update cada minuto
    let lastUpdateMinutes = 2;
    setInterval(() => {
        lastUpdateMinutes++;
        document.getElementById('lastUpdate').textContent = `hace ${lastUpdateMinutes} min`;
    }, 60000);


    const mostrarTarjetas = async () => {
        const contenedor = document.getElementById("detalle-tarjeta");

        try{
            const response = await fetch(`http://localhost:8080/api/tarjetas/usuario/1`)
            if(!response.ok){
                contenedor.innerHTML =   `
  <div class="flex items-center gap-2 text-gray-600">
    <span class="material-icons text-blue-500">info</span>
    <span>No tenés tarjetas. <a href="nuevatarjeta.html" class="text-blue-600 hover:underline">Solicitá una nueva</a>.</span>
  </div>
`
                throw new Error("Error al obtener las tarjetas");
            }else{
                const tarjetas = await response.json();
                contenedor.innerHTML = "";
            tarjetas.forEach(tarjeta => {
                const tipo = document.createElement("p");
                tipo.className = "font-medium text-gray-800";
                tipo.textContent = tarjeta.tipo;

                const numero = document.createElement("p");
                numero.className = "text-sm text-gray-500";
                numero.textContent = `**** **** **** ${tarjeta.numero.slice(-4)}`;

                const boton = document.createElement("button");
                boton.textContent = "Ver detalle";
                boton.className = "text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center";
                boton.dataset.id = tarjeta.id; 

                const icon = document.createElement("span")
                icon.textContent = "wallet"
                icon.className = "material-icons text-green-600 mt-5"

                boton.addEventListener("click", () => {
                    localStorage.setItem("tarjetaId", tarjeta.id);
                    window.location.href = "detalletarjeta.html";
                });
                contenedor.appendChild(icon);
                contenedor.appendChild(tipo);
                contenedor.appendChild(numero);
                contenedor.appendChild(boton);
            });
            }
        }catch(error){
                console.error("No se pudo obtener las tarjetas", error);
        }
        //const response = await fetch(`http://localhost:8080/api/tarjetas/usuario/${userId}`)
    }

    const solicitarTarjeta = () => {
        localStorage.setItem("userId", 1); // despues cambiar por usuario dinamico
        window.location.href = "nuevatarjeta.html";
    }

