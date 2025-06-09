function logout() {
  Swal.fire({
    title: "¿Cerrar sesión?",
    text: "Se cerrará tu sesión actual",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "index.html";
    }
  });
}

class HeaderManager {
  constructor() {
    this.menuBtn = document.getElementById("menuBtn");
    this.navMenu = document.getElementById("navMenu");
    this.currentTimeEl = document.getElementById("currentTime");
    this.nombreUsuarioEl = document.getElementById("userFullName");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.dropdownContainers = document.querySelectorAll("[data-dropdown]");
    this.init();
  }

  init() {
    this.attachListeners();
    this.updateClock();
    this.loadUserName();
    setInterval(() => this.updateClock(), 60000);
  }

  attachListeners() {
    // Toggle menú móvil
    this.menuBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) this.closeMobileMenu();
    });

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener("click", (e) => {
      const clickedInside = e.target.closest("[data-dropdown]");
      const clickedBtn = e.target.closest(".dropdown-btn");
      if (!clickedInside && !clickedBtn) {
        this.closeAllDropdowns();
      }
    });

    // Toggle de cada dropdown
    this.dropdownContainers.forEach((container) => {
      const btn = container.querySelector(".dropdown-btn");
      btn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleOneDropdown(container);
      });
    });

    // Logout al hacer clic
    this.logoutBtn?.addEventListener("click", logout);
  }

  toggleOneDropdown(container) {
    const menu = container.querySelector(".dropdown-menu");
    const btn = container.querySelector(".dropdown-btn");
    if (!menu || !btn) return;

    const isHidden = menu.classList.contains("hidden");
    this.closeAllDropdowns();
    if (isHidden) {
      menu.classList.remove("hidden");
      btn.setAttribute("aria-expanded", "true");
    } else {
      menu.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    }
  }

  closeAllDropdowns() {
    this.dropdownContainers.forEach((container) => {
      const menu = container.querySelector(".dropdown-menu");
      const btn = container.querySelector(".dropdown-btn");
      if (menu) menu.classList.add("hidden");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  toggleMobileMenu() {
    if (!this.navMenu || !this.menuBtn) return;
    this.navMenu.classList.toggle("hidden");
    const expanded = !this.navMenu.classList.contains("hidden");
    this.menuBtn.setAttribute("aria-expanded", expanded);
    this.menuBtn.querySelector(".material-icons").textContent = expanded
      ? "close"
      : "menu";
  }

  closeMobileMenu() {
    if (!this.navMenu || !this.menuBtn) return;
    this.navMenu.classList.add("hidden");
    this.menuBtn.setAttribute("aria-expanded", "false");
    this.menuBtn.querySelector(".material-icons").textContent = "menu";
  }

  updateClock() {
    if (!this.currentTimeEl) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    this.currentTimeEl.textContent = timeString;
  }

  loadUserName() {
    if (!this.nombreUsuarioEl) return;
    const nombre = localStorage.getItem("nombreUsuario");
    const apellido = localStorage.getItem("apellidoUsuario");
    this.nombreUsuarioEl.textContent = nombre && apellido
      ? `${nombre} ${apellido}`
      : "Usuario";
  }
}

function initHeaderLogic() {
  new HeaderManager();
}
window.initHeaderLogic = initHeaderLogic;

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar el HeaderManager
  initHeaderLogic();
  
  // Carga inicial del reloj
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000); // Actualizar reloj cada minuto
});

function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const currentTimeEl = document.getElementById('currentTime');
  if (currentTimeEl) {
    currentTimeEl.textContent = timeString;
  }
}

