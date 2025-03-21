import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Notes = () => {
  const { store, dispatch } = useGlobalReducer();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  // 🟢 Estado local para la nueva nota
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: ""  // Para guardar las etiquetas como string
  });

  // 🟢 Cargar notas al montar el componente
  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [store.token]);

  // 🟢 Función para cargar las notas
  const fetchNotes = async (tagName = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      console.log("Token completo en header:", `Bearer ${store.token}`);

      // 🟢 URL para obtener notas (con o sin filtro de etiqueta)
      const url = tagName
        ? `${backendUrl}/api/tags/${tagName}/notes`
        : `${backendUrl}/api/notes`;

      // 🟢 Hacer petición incluyendo el token en el header
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar las notas");
      }

      dispatch({ type: "load_notes", payload: data });
    } catch (err) {
      setError(err.message || "Error al cargar las notas");
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Función para cargar las etiquetas
  const fetchTags = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backendUrl}/api/tags`, {
        headers: {
          "Authorization": `Bearer ${store.token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar etiquetas");
      }

      const tagsData = await response.json();
      setTags(tagsData);
    } catch (err) {
      console.error("Error cargando etiquetas:", err);
    }
  };

  // 🟢 Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🟢 Manejar filtrado por etiqueta
  const handleFilterByTag = (tagName) => {
    if (selectedTag === tagName) {
      // Si ya está seleccionada, quitar el filtro
      setSelectedTag(null);
      fetchNotes();
    } else {
      // Aplicar filtro por etiqueta
      setSelectedTag(tagName);
      fetchNotes(tagName);
    }
  };

  // 🟢 Crear nueva nota
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newNote.title || !newNote.content) {
      setError("El título y contenido son obligatorios");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

      // 🟢 Preparar datos de la nota con etiquetas
      const tagsArray = newNote.tags
        ? newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const noteData = {
        title: newNote.title,
        content: newNote.content,
        tags: tagsArray
      };

      // 🟢 Hacer petición para crear nota
      const response = await fetch(`${backendUrl}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${store.token}`
        },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la nota");
      }

      // 🟢 Actualizar lista de notas
      dispatch({
        type: "load_notes",
        payload: [data, ...store.notes]
      });

      // 🟢 Limpiar formulario
      setNewNote({ title: "", content: "", tags: "" });

      // 🟢 Refrescar lista de etiquetas
      fetchTags();

    } catch (err) {
      setError(err.message || "Error al crear la nota");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Mis Notas</h2>

      {/* Mostrar errores */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Formulario para crear notas */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Nueva Nota</h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Título
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={newNote.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="content" className="form-label">
                Contenido
              </label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                rows="3"
                value={newNote.content}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            {/* 🟢 Campo para etiquetas */}
            <div className="mb-3">
              <label htmlFor="tags" className="form-label">
                Etiquetas (separadas por comas)
              </label>
              <input
                type="text"
                className="form-control"
                id="tags"
                name="tags"
                value={newNote.tags}
                onChange={handleInputChange}
                placeholder="ej: importante, trabajo, personal"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Nota"}
            </button>
          </form>
        </div>
      </div>

      {/* 🟢 Filtro de etiquetas */}
      {tags.length > 0 && (
        <div className="mb-4">
          <h5>Filtrar por etiqueta:</h5>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <button
                key={tag.id}
                className={`btn btn-sm ${selectedTag === tag.name ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => handleFilterByTag(tag.name)}
              >
                {tag.name}
              </button>
            ))}
            {selectedTag && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleFilterByTag(selectedTag)}
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de notas */}
      <div className="row">
        {isLoading && store.notes.length === 0 ? (
          <p>Cargando notas...</p>
        ) : store.notes.length === 0 ? (
          <p>No tienes notas. ¡Crea tu primera nota!</p>
        ) : (
          store.notes.map(note => (
            <div className="col-md-4 mb-3" key={note.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{note.title}</h5>
                  <p className="card-text">{note.content}</p>

                  {/* Mostrar etiquetas si existen */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-2">
                      {note.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="badge bg-info me-1"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};