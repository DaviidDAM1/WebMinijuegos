document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("username").value;
    const contraseña = document.getElementById("password").value;

    if(usuario === "admin" && contraseña === "1234") {
        window.location.href = "menu.html"; // redirigir al menú
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});