document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const provinciaSelect = document.getElementById("provincia");
    const municipioSelect = document.getElementById("municipio");

    // Verifica que el formulario exista
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

            // Obtén los valores de los campos
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const email = document.getElementById('email').value;
            const dni = document.getElementById('dni').value;
            const telefono = document.getElementById('telefono').value;
            const fechaNacimiento = document.getElementById('fechaNacimiento').value;

            // Obtén el nombre de la provincia y municipio seleccionados
            const provincia = provinciaSelect.options[provinciaSelect.selectedIndex].text; // Obtener nombre de la provincia
            const municipio = municipioSelect.options[municipioSelect.selectedIndex].text; // Obtener nombre del municipio

            const direccion = document.getElementById('direccion').value;
            const numero = document.getElementById('numero').value; // Obtener el número de la dirección
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value; // Asegúrate de obtener confirmPassword

            // Validar campos
            if (!nombre || !apellido || !email || !dni || !telefono || !fechaNacimiento || !provincia || !municipio || !direccion || !numero || !password) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Todos los campos son obligatorios.',
                });
                return; // Evita enviar la solicitud si hay campos vacíos
            }

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las contraseñas no coinciden.',
                });
                return;
            }

            // Crea el objeto de datos que se enviará
            const userData = {
                nombre: nombre,
                apellido: apellido,
                email: email,
                dni: dni,
                telefono: telefono,
                fechaNacimiento: fechaNacimiento,
                provincia: provincia, // Usar el nombre de la provincia
                ciudad: municipio, // Usar el nombre del municipio
                direccion: direccion,
                numeroD: numero,
                password: password
            };

            // Realiza la solicitud POST al backend
            fetch('http://localhost:8080/api/usuario/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || 'Error en la conexión con el servidor'); });
                }
                return response.json();
            })
            .then(data => {
                // Muestra un mensaje de éxito o redirige al usuario
                Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: '¡Bienvenido a AlkyWallet!',
                }).then(() => {
                    // Redirigir a la página de inicio de sesión o a otra página
                    window.location.href = 'index.html';
                });
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message || 'Error desconocido.',
                });
            });
        });
    } else {
        console.error('El formulario no se encontró. Verifica el ID.');
    }

    // Función para cargar provincias
    function cargarProvincias() {
        fetch('http://localhost:8080/api/provincias')
            .then(response => response.json())
            .then(data => {
                data.forEach(provincia => {
                    const option = document.createElement("option");
                    option.value = provincia.id; // ID se mantiene para la selección
                    option.textContent = provincia.nombre; // Nombre se muestra en el select
                    provinciaSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar provincias:', error));
    }

    // Función para cargar municipios según la provincia seleccionada
    function cargarMunicipios(provinciaId) {
        municipioSelect.innerHTML = '<option value="">Selecciona un municipio</option>'; // Resetear municipios
        municipioSelect.disabled = true; // Deshabilitar el select de municipios

        if (provinciaId) {
            fetch(`http://localhost:8080/api/municipios?provincia=${provinciaId}`)
                .then(response => response.json())
                .then(data => {
                    data.forEach(municipio => {
                        const option = document.createElement("option");
                        option.value = municipio.id; // ID se mantiene para la selección
                        option.textContent = municipio.nombre; // Nombre se muestra en el select
                        municipioSelect.appendChild(option);
                    });
                    municipioSelect.disabled = false; // Habilitar el select de municipios
                })
                .catch(error => console.error('Error al cargar municipios:', error));
        }
    }

    // Cargar provincias al iniciar
    cargarProvincias();

    // Evento para cargar municipios cuando se selecciona una provincia
    provinciaSelect.addEventListener("change", function() {
        const provinciaId = this.value;
        cargarMunicipios(provinciaId);
    });
});



