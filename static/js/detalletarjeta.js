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

    const tarjetaId = localStorage.getItem("tarjetaId");
    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
        obtenerTarjeta();
    });

    let tarjetaCargada = {
        id: tarjetaId,
        tipo: null,
        numero: null,
        fechaExpiracion: null,
        esVirtual: null,
        usuarioDto: null,
        cuentaDtoId: null,
        saldo: null,
        congelada: null,
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

    const mostrarToggleCongelarTarjeta = () => {
        if(tarjetaCargada.congelada){
Swal.fire({
    title: '¿Descongelar tarjeta?',
    html: `
        <div class="text-left">
            <p>Estás a punto de reactivar la tarjeta terminada en <b>${tarjetaCargada.numero.slice(8, 12)}</b>.</p>
            <ul class="list-disc pl-5 mt-2 text-green-600 text-sm">
                <li>Podrás realizar compras online y presenciales nuevamente</li>
                <li>Puedes volver a congelarla cuando lo necesites</li>
            </ul>
        </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745', // Verde en lugar de azul
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, descongelar',
    cancelButtonText: 'Cancelar',
}).then((result) => {
        if(result.isConfirmed) {
            toggleCongelarTarjeta();
        }
        });
        }else{
        Swal.fire({
        title: '¿Congelar tarjeta?',
        html: `
            <div class="text-left">
                <p>Estás a punto de congelar la tarjeta terminada en <b>${tarjetaCargada.numero.slice(8, 12)}</b>.</p>
                <ul class="list-disc pl-5 mt-2 text-red-500 text-sm">
                    <li>No podrás realizar compras online o presenciales</li>
                    <li>Puedes descongelarla en cualquier momento</li>
                </ul>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, congelar',
        cancelButtonText: 'Cancelar',
        }).then((result) => {
        if(result.isConfirmed) {
            toggleCongelarTarjeta();
        }
        });
        }
    }

    const toggleCongelarTarjeta = async () => {
        try{
            const response = await fetch(`http://localhost:8080/api/tarjetas/${tarjetaId}/toggle-congelar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Tarjeta modificada!',
                    text: 'El estado de la tarjeta ha sido modificado exitosamente',
                    timer: 2000
                }).then(() => {
  window.location.reload();
});
	       } else {
	           const errorData = await response.json();
                throw new Error(errorData.message);
	       }
	   } catch (error) {
	        Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                footer: 'Intenta nuevamente o contacta a soporte'
            });
            console.error('Error:', error);
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
                tarjetaCargada.congelada = datosTarjeta.congelada;
                document.getElementById('nombre-usuario').textContent = `${datosTarjeta.usuarioDTO.nombre.toUpperCase()} ${datosTarjeta.usuarioDTO.apellido.toUpperCase()}`
                document.getElementById('estadoTarjetaTexto').textContent = datosTarjeta.congelada ? "Descongelar" : "Congelar"
                document.getElementById('estadoTarjetaIcono').textContent = datosTarjeta.congelada ? "play_arrow" : "pause"
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
        document.getElementById("numero-tarjeta").innerHTML = `${tarjetaCargada.numero.slice(0, 4)} ${tarjetaCargada.numero.slice(4, 8)} ${tarjetaCargada.numero.slice(8, 12)}`;
        document.getElementById("vencimiento-tarjeta").innerHTML = `${tarjetaCargada.fechaExpiracion.slice(5, 7)}/${tarjetaCargada.fechaExpiracion.slice(0, 4)}`;
        document.getElementById("saldo-tarjeta").innerHTML = `$${tarjetaCargada.saldo}`;
    }   

    const ocultarDatos = () => {
        document.getElementById("tipo-tarjeta").innerHTML = `TARJETA ****`;  
        document.getElementById("numero-tarjeta").innerHTML = `**** **** **** ****`;
        document.getElementById("vencimiento-tarjeta").innerHTML = `**/****`;
        document.getElementById("saldo-tarjeta").innerHTML = `$***`;
    }