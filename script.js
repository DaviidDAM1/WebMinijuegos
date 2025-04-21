// Al enviar el formulario de login
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Evitar que se recargue la página

    const usuario = document.getElementById("username").value.trim();
    const contraseña = document.getElementById("password").value.trim();

    // Aquí validamos (puedes cambiar el usuario y contraseña si quieres)
    if (usuario === "admin" && contraseña === "1234") {
        // Guardamos en localStorage para recordar que inició sesión
        localStorage.setItem("usuario", usuario);

        // Redireccionar al menú principal
        window.location.href = "menu.html";
    } else {
        alert("Usuario o contraseña incorrectos. Intenta de nuevo.");
    }
});