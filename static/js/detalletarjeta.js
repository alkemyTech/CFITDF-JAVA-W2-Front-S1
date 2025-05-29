// Actualizar hora actual
    function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('currentTime').textContent = `${timeString}`;
    }

    function eliminarTarjeta(id) {
        Swal.fire({
            title: '¿Deseas eliminar la tarjeta?',
            text: 'Tu tarjeta dejara de funcionar y deberas solicitar una nuevamente',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar tarjeta',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTarjeta();
                Swal.fire({
                    title: 'Eliminando tarjeta',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        window.location.href = 'tarjetas.html';
                    }
                });
            }
        });
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

    const tarjetaId = localStorage.getItem("tarjetaId");
    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {

        obtenerTarjeta();
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);

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

    // Actualizar último update cada minuto
    let lastUpdateMinutes = 2;
    setInterval(() => {
        lastUpdateMinutes++;
        document.getElementById('lastUpdate').textContent = `hace ${lastUpdateMinutes} min`;
    }, 60000);

    let tarjetaCargada = {
        id: tarjetaId,
        tipo: null,
        numero: null,
        fechaExpiracion: null,
        esVirtual: null,
        usuarioDto: null,
        cuentaDtoId: null,
        saldo: null,
    }

    const deleteTarjeta = async () => {
        try{
            const response = await fetch(`http://localhost:8080/api/tarjetas/${tarjetaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(response.ok) {
	           window.location.href = "tarjetas.html";
	       } else {
	           throw new Error(await response.text());
	       }
	   } catch (error) {
	       console.error("Error al eliminar:", error);
	       alert("Error al eliminar la tarjeta: " + error.message);
	   }
    }

    const obtenerTarjeta = async () => {
        try{
            const response = await fetch(`http://localhost:8080/api/tarjetas/${tarjetaId}`);
            if(response.ok){
                let datosTarjeta = await response.json();
                console.log(datosTarjeta);
                tarjetaCargada.numero = datosTarjeta.numero;
                tarjetaCargada.tipo = datosTarjeta.tipo;
                tarjetaCargada.fechaExpiracion = datosTarjeta.fechaExpiracion;
                tarjetaCargada.cuentaDtoId = datosTarjeta.cuentaDtoId;
                const responseCuenta = await fetch(`http://localhost:8080/api/cuentas/${tarjetaCargada.cuentaDtoId}`);
                let datosCuenta = await responseCuenta.json();
                tarjetaCargada.saldo = datosCuenta.saldo;
                document.getElementById("detalle-cuenta-numero").innerHTML = `CUENTA N° ${datosCuenta.id}`;  
                document.getElementById("detalle-cuenta-tipo").innerHTML = `${datosCuenta.tipo}`;  
            }
        }catch(error){
            console.error("Error al obtener la tarjeta ", error)
        }
    }

    const mostrarDatos = () => {
        document.getElementById("tipo-tarjeta").innerHTML = `TARJETA ${tarjetaCargada.tipo}`;  
        document.getElementById("numero-tarjeta").innerHTML = `${tarjetaCargada.numero.slice(0, 4)} ${tarjetaCargada.numero.slice(4, 8)} ${tarjetaCargada.numero.slice(8, -1)}`;
        document.getElementById("vencimiento-tarjeta").innerHTML = `${tarjetaCargada.fechaExpiracion.slice(5, 7)}/${tarjetaCargada.fechaExpiracion.slice(0, 4)}`;
        document.getElementById("saldo-tarjeta").innerHTML = `$${tarjetaCargada.saldo}`;
    }

    const ocultarDatos = () => {
        document.getElementById("tipo-tarjeta").innerHTML = `TARJETA ****`;  
        document.getElementById("numero-tarjeta").innerHTML = `**** **** **** ****`;
        document.getElementById("vencimiento-tarjeta").innerHTML = `**/****`;
        document.getElementById("saldo-tarjeta").innerHTML = `$***`;
    }