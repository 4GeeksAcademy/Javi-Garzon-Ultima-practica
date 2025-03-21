export const initialStore = () => {
  // 🟢 Intentar recuperar el token almacenado (si existe)
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  // 🟢 Parsear el usuario si existe
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error("Error al parsear usuario", e);
    }
  }

  return {
    message: null,
    // 🟢 Estados de autenticación
    token: token || null,
    user: user || null,
    error: null,
    // 🟢 Estado para notas
    notes: [],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    // 🟢 Acción para guardar el token tras login exitoso
    case "login":
      // 🟢 Guardar en localStorage para persistencia
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
      };

    // 🟢 Acción para cerrar sesión
    case "logout":
      // 🟢 Eliminar de localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        ...store,
        token: null,
        user: null,
        notes: [],
      };

    // 🟢 Acción para manejar errores
    case "set_error":
      return {
        ...store,
        error: action.payload,
      };

    // 🟢 Acciones para notas
    case "load_notes":
      return {
        ...store,
        notes: action.payload,
      };

    default:
      return store;
  }
}
