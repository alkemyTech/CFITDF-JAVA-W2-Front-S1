document.addEventListener('DOMContentLoaded', function(){
    cargarCuentas();
})

let tarjetaPorCrear = {
    tipo: null,
    esVirtual: null,
    cuentaDtoId: null,
}

const cargarCuentas = async () => {
    let userId = localStorage.getItem("userId");
    try{
        const response = await fetch(`http://localhost:8080/api/cuentas/usuario/${userId}`);
        if(!response.ok){
            throw new Error("No fue posible obtener las cuentas del usuario ID "+userId);
        }else{
            const cuentas = await response.json();
            console.log(cuentas);
            const selectCuentas = document.getElementById("cuentaAsociada");
            cuentas.forEach(cuenta => {
                const optionSelect = document.createElement("option");
                optionSelect.textContent = `${cuenta.tipo} - N° ${cuenta.id}`
                optionSelect.setAttribute("value", cuenta.id);
                selectCuentas.appendChild(optionSelect);
            });
        }
    }catch(error){
        console.error("Error al obtener las cuentas. ", error);
    }
}

function clickEsVirtual() {
    const esVirtual = document.getElementById('esVirtual').checked;
        if(esVirtual) {
            document.getElementById('direccionLabel').style.display = "none";
            document.getElementById('direccionInput').style.display = "none";
        }else {
        document.getElementById('direccionLabel').style.display = "block";
        document.getElementById('direccionInput').style.display = "block";
    }
}


const solicitarTarjeta = (event) => {
    event.preventDefault();
    const cuentaId = document.getElementById("cuentaAsociada").value;
    const tipoSelect = document.getElementById("tipo").value;
    const esVirtualCheck = document.getElementById('esVirtual').checked;
    let textoCartel = `Tu tarjeta sera creada y solicitada al instante. Asegurate de que los datos ingresados sean correctos.
        Tarjeta tipo: ${tipoSelect}, N° de Cuenta ${cuentaId}`;
    if(esVirtualCheck){
        direccionInput.removeAttribute('required');
        textoCartel += `, Virtual.`;
    }else {
        const direccionInput = document.getElementById('direccionInput').value;
        textoCartel += `, Direccion de envio: ${direccionInput}`;
    }
    Swal.fire({
        title: "Estas seguro?",
        text: textoCartel,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Si, solicitar!"
    }).then((result) => {
        if (result.isConfirmed) {
            crearTarjeta(cuentaId, esVirtualCheck, tipoSelect)   
        }
    });
    
}

const crearTarjeta = async (idCuenta, esVirtualCheck, tipoSelect) => {
    try{
        Swal.fire({
            title: "Procesando solicitud",
            html: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        tarjetaPorCrear.cuentaDtoId = idCuenta;
        tarjetaPorCrear.esVirtual = esVirtualCheck;
        tarjetaPorCrear.tipo = tipoSelect;
        const response = await fetch(`http://localhost:8080/api/tarjetas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tarjetaPorCrear)
        });
        Swal.close();
        if(!response.ok){
            throw new Error("No fue posible solicitar la tarjeta.");
        }else{
            Swal.fire({
                title: "Tarjeta solicitada",
                text: "Tu tarjeta fue registrada y solicitada exitosamente.",
                icon: "success"
            });
            window.location.href = "tarjetas.html";
        }
    }catch(error){
        console.error("Error al obtener las cuentas. ", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error al solicitar la tarjeta",
            icon: "error",
            confirmButtonText: "Entendido"
        });
    }
}