<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>AlkyWallet - Login</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- SweetAlert2 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

  <!-- Fuente moderna opcional -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body class="bg-gradient-to-r from-blue-100 to-blue-300 min-h-screen flex items-center justify-center p-4">

  <div class="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-sm">
    <div class="mb-6 text-center">
      <img src="https://cdn-icons-png.flaticon.com/512/2950/2950652.png" alt="Logo" class="w-16 h-16 mx-auto mb-2">
      <h1 class="text-2xl font-bold text-blue-700">Bienvenido a AlkyWallet</h1>
    </div>

    <form id="loginForm" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input type="email" id="email" placeholder="ejemplo@mail.com" required
               class="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
        <input type="password" id="password" placeholder="Tu contraseña" required
               class="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>

      <button type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200">
        Iniciar sesión
      </button>
    </form>
  </div>

  <script src="/js/auth.js"></script>
</body>
</html>
