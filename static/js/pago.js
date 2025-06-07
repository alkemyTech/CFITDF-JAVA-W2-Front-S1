const usuarioId       = localStorage.getItem("usuarioId");
const spanSaldoActual = document.getElementById("saldoActual");
const cuentaSelect    = document.getElementById("cuentaId");

// si no hay usuarioId redirigimos
if (!usuarioId) {
  window.location.href = "index.html";
}

// ------------------------------------------------------------
// 0) Helpers globales
// ------------------------------------------------------------
function formatearSaldo(num) {
  if (isNaN(num)) return "0,00";
  return num.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}



function cargarCuentasYSaldo(usuarioId, spanSaldoEl, cuentaSelectEl) {
  fetch(`http://localhost:8080/api/cuentas/usuario/${usuarioId}`)
    .then(resp => {
      if (!resp.ok) throw new Error("Error al leer cuentas");
      return resp.json();
    })
    .then(listaCuentas => {
      if (!Array.isArray(listaCuentas) || listaCuentas.length === 0) {
        spanSaldoEl.textContent = "0,00";
        return;
      }
      const principal = listaCuentas[0];
      spanSaldoEl.textContent = formatearSaldo(principal.saldo);

      cuentaSelectEl.innerHTML = '<option value="">Selecciona una cuenta</option>';
      listaCuentas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `Cuenta ${c.tipo} · $ ${formatearSaldo(c.saldo)}`;
        cuentaSelectEl.appendChild(opt);
      });
    })
    .catch(err => {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las cuentas.", "error");
    });
}

// ------------------------------------------------------------
// 1) Función global para “Próximos vencimientos”
// ------------------------------------------------------------
function confirmarPago(btn) {
  const row     = btn.closest("tr");
  const empresa = row.dataset.empresa;
  const monto   = parseFloat(row.dataset.monto);
  const fecha   = row.dataset.fecha;
  const cuenta  = parseInt(row.dataset.cuentaId, 10);

  Swal.fire({
    title: "¿Confirmar pago?",
    html: `<p>¿Deseas pagar <strong>$ ${formatearSaldo(monto)}</strong> a<br><strong>${empresa}</strong>?</p>`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, pagar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#667eea",
    cancelButtonColor: "#6b7280"
  }).then(result => {
    if (!result.isConfirmed) return;
    btn.disabled = true;
    const oldHTML = btn.innerHTML;
    btn.innerHTML =
      '<span class="material-icons animate-spin mr-1">refresh</span>Procesando...';

    const dto = { comercio: empresa, monto, fecha, cuentaId: cuenta };
    fetch("http://localhost:8080/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al procesar el pago");
        return res.json();
      })
      .then(() => {
        Swal.fire("¡Pagado!", "Tu pago fue registrado correctamente.", "success");
        // refrescar saldo y eliminar fila
        cargarCuentasYSaldo(usuarioId, spanSaldoActual, cuentaSelect);
        row.remove();
      })
      .catch(err => {
        console.error(err);
        Swal.fire("Error", "No se pudo procesar el pago.", "error");
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = oldHTML;
      });
  });
}

// ------------------------------------------------------------
// 2) Código de inicialización
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const usuarioId           = localStorage.getItem("usuarioId");
  if (!usuarioId) {
    return window.location.href = "index.html";
  }

  const spanSaldoActual     = document.getElementById("saldoActual");
  const cuentaSelect        = document.getElementById("cuentaId");
  const formPago            = document.getElementById("pagoForm");
  const buscarServicioInput = document.getElementById("buscarServicio");
  const formPagoSection     = document.getElementById("formPagoSection");
  const empresaSeleccionada = document.getElementById("empresaSeleccionada");
  const codigoPagoInput     = document.getElementById("codigoPago");
  const hintCodigoEl        = document.getElementById("hintCodigo");
  const btnConfirmarPago    = document.getElementById("btnConfirmarPago");
  const inputMonto          = document.getElementById("monto");

  // Carga inicial de cuentas y saldo
  cargarCuentasYSaldo(usuarioId, spanSaldoActual, cuentaSelect);

  // Mostrar sección de pago al escribir empresa
  buscarServicioInput.addEventListener("input", e => {
    const texto = e.target.value.trim();
    if (texto.length >= 3) {
      setTimeout(() => {
        empresaSeleccionada.textContent = texto;
        formPagoSection.classList.remove("hidden");
      }, 300);
    } else {
      formPagoSection.classList.add("hidden");
    }
  });

  // Validación del código de pago
  btnConfirmarPago.disabled = true;
  codigoPagoInput.addEventListener("input", e => {
    const v = e.target.value.trim();
    if (v.length >= 11 && v.length <= 13) {
      btnConfirmarPago.disabled = false;
      hintCodigoEl.className = "text-xs text-green-600 mt-2";
      hintCodigoEl.textContent = "✓ Código válido";
    } else {
      btnConfirmarPago.disabled = true;
      hintCodigoEl.className = "text-xs text-gray-500 mt-2";
      hintCodigoEl.innerHTML =
        'Su pago electrónico Banelco consta de entre <strong>11</strong> y <strong>13</strong> dígitos.';
    }
  });

  // Envío del formulario de “Nuevo Pago”
  formPago.addEventListener("submit", e => {
    e.preventDefault();
    const comercio = empresaSeleccionada.textContent.trim();
    const montoVal = parseFloat(inputMonto.value);
    const cuentaId = parseInt(cuentaSelect.value, 10);

    if (!comercio || isNaN(montoVal) || isNaN(cuentaId)) {
      return Swal.fire("Faltan datos", "Completa todos los campos correctamente.", "warning");
    }

    Swal.fire({
      title: "¿Confirmar pago?",
      html: `<p>¿Deseas pagar <strong>$ ${formatearSaldo(montoVal)}</strong> a<br><strong>${comercio}</strong>?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, pagar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#667eea",
      cancelButtonColor: "#6b7280"
    }).then(result => {
      if (!result.isConfirmed) return;

      btnConfirmarPago.disabled = true;
      const oldHTML = btnConfirmarPago.innerHTML;
      btnConfirmarPago.innerHTML =
        '<span class="material-icons animate-spin mr-2">refresh</span>Procesando...';

      const dto = {
        comercio,
        monto: montoVal,
        fecha: new Date().toISOString(),
        cuentaId
      };

      fetch("http://localhost:8080/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      })
        .then(res => {
          if (!res.ok) throw new Error("Error al registrar el pago");
          return res.json();
        })
        .then(() => {
          Swal.fire("¡Listo!", "El pago se registró correctamente.", "success");
          cargarCuentasYSaldo(usuarioId, spanSaldoActual, cuentaSelect);
          formPago.reset();
          formPagoSection.classList.add("hidden");
          hintCodigoEl.className = "text-xs text-gray-500 mt-2";
          hintCodigoEl.innerHTML =
            'Su pago electrónico Banelco consta de entre <strong>11</strong> y <strong>13</strong> dígitos.';
        })
        .catch(err => {
          console.error(err);
          Swal.fire("Error", "No se pudo registrar el pago.", "error");
        })
        .finally(() => {
          btnConfirmarPago.disabled = false;
          btnConfirmarPago.innerHTML = oldHTML;
        });
    });
  });

  // Listeners para botones “Ver” de la tabla
  document.querySelectorAll("button[data-accion='verPago']").forEach(btn => {
    btn.addEventListener("click", () => confirmarPago(btn));
  });
});

