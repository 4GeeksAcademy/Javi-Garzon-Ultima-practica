import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();

	// 🟢 Función para cerrar sesión
	const handleLogout = () => {
		dispatch({ type: "logout" });
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Notas App</span>
				</Link>

				<div className="ml-auto d-flex align-items-center">
					{/* 🟢 Mostrar links según estado de autenticación */}
					{store.token ? (
						<>
							<Link to="/notes" className="btn btn-outline-primary me-2">
								Mis Notas
							</Link>
							<span className="me-3">Hola, {store.user?.email}</span>
							<button onClick={handleLogout} className="btn btn-outline-danger">
								Cerrar Sesión
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="btn btn-outline-primary me-2">
								Iniciar Sesión
							</Link>
							<Link to="/signup" className="btn btn-outline-success">
								Registrarse
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};