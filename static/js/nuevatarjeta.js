document.addEventListener('DOMContentLoaded', function(){
    cargarCuentas();
})

let tarjetaPorCrear = {
    tipo: null,
    esVirtual: null,
    cuentaDtoId: null,
}

const cargarCuentas = async () => {
    let userId = localStorage.getItem('usuarioId');
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
    let textoCartel = `
    <div style="text-align: left; color: #4b5563; line-height: 1.6;">
        <p style="margin-bottom: 10px;">✅ Tu tarjeta será creada y solicitada al instante.</p>
        <p style="margin-bottom: 5px; font-weight: 500;">🔹 <span style="color: #1e40af;">Tipo:</span> ${tipoSelect}</p>
        <p style="margin-bottom: 5px; font-weight: 500;">🔹 <span style="color: #1e40af;">N° de Cuenta:</span> ${cuentaId}</p>
`;
    if(esVirtualCheck){
        direccionInput.removeAttribute('required');
        textoCartel += `<p style="margin-bottom: 5px; font-weight: 500;">🔹 <span style="color: #1e40af;">Modalidad:</span> <span style="color: #10b981; font-weight: 600;">Virtual</span></p>`;
    }else {
        const direccionInput = document.getElementById('direccionInput').value;
    textoCartel += `<p style="margin-bottom: 5px; font-weight: 500;">🔹 <span style="color: #1e40af;">Dirección de envío:</span> ${direccionInput}</p>`;
    }
    textoCartel += `</div>`;
    Swal.fire({
        title: '<span style="font-size: 1.5rem; color: #1e40af;">¿Estás seguro?</span>',
    html: textoCartel,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#d33",
    cancelButtonText: '<span style="font-weight: 500">Cancelar</span>',
    confirmButtonText: '<span style="font-weight: 500">Sí, solicitar</span>',
    background: '#f9fafb',
    showClass: {
        popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
    }
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