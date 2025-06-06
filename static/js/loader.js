// Cargar header y footer dinámicamente
  const components = ["header", "footer"];
  const loadedComponents = {};

  components.forEach(id => {
    fetch(`../components/${id}.html`)
      .then(res => res.text())
      .then(html => {
        document.getElementById(`${id}-placeholder`).innerHTML = html;
        loadedComponents[id] = true;

        // Si se cargaron ambos, inicializamos HeaderManager
        if (loadedComponents.header && loadedComponents.footer) {
          initHeaderLogic(); // inicializamos lógica una vez cargado todo
        }
      });
  });

 