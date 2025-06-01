document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pagoForm");
    const cuentaSelect = document.getElementById("cuentaId");

    // Simulación: obtener cuentas desde la API (ajustá URL según tu backend)
    fetch("/api/cuentas") // Ajustá esta URL
        .then(res => res.json())
        .then(data => {
            data.forEach(cuenta => {
                const option = document.createElement("option");
                option.value = cuenta.id;
                option.textContent = `Cuenta ${cuenta.tipo} - Saldo: $${cuenta.saldo.toFixed(2)}`;
                cuentaSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error al obtener cuentas:", err);
            Swal.fire("Error", "No se pudieron cargar las cuentas", "error");
        });

    // Envío del formulario
    form.addEventListener("submit", e => {
        e.preventDefault();

        const comercio = document.getElementById("comercio").value.trim();
        const monto = parseFloat(document.getElementById("monto").value);
        const cuentaId = cuentaSelect.value;

        if (!comercio || !monto || !cuentaId) {
            Swal.fire("Faltan datos", "Completá todos los campos correctamente", "warning");
            return;
        }

        fetch("/api/pagos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                comercio,
                monto,
                cuentaId
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Error en el servidor");
            return res.json();
        })
        .then(() => {
            Swal.fire("Pago registrado", "Tu pago fue registrado correctamente", "success")
                .then(() => window.location.href = "dashboard.html");
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "No se pudo registrar el pago", "error");
        });
    });
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