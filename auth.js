document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  const getUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
  const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

  // Registro
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value.trim();
      const password = document.getElementById("reg-password").value.trim();

      if (!username || !password) return;

      const users = getUsers();
      if (users[username]) {
        alert("Usuário já existe.");
        return;
      }

      users[username] = {
        password,
        watchlist: []
      };

      saveUsers(users);
      alert("Conta criada com sucesso!");
      window.location.href = "login.html";
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();

      const users = getUsers();
      if (users[username]?.password === password) {
        // 🔐 Corrigido: salva sessão do usuário logado
        sessionStorage.setItem("usuarioLogado", JSON.stringify({ username }));

        window.location.href = "index.html";
      } else {
        alert("Usuário ou senha inválidos.");
      }
    });
  }
});
