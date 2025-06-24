import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = "/api/home"; // adapte si besoin

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(API_URL);
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        // Prépare la suppression (à implémenter côté backend)
        // await axios.delete(`${API_URL}/${id}`);
        // fetchDocuments();
        alert(`Suppression du document id: ${id} (à implémenter)`);
    };

    const handleEdit = (doc) => {
        // Prépare l'édition (ouvrir un modal ou une page d'édition)
        alert(`Édition du document id: ${doc.id} (à implémenter)`);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Gérer les fichiers ici
            console.log(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Gérer les fichiers ici
            console.log(e.target.files);
        }
    };

    return (
        <>
            <div>
                <h2>Documents</h2>
            </div>
            <div>
                <form
                    onDragEnter={handleDrag}
                    onSubmit={(e) => e.preventDefault()}
                    style={{ position: "relative" }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleChange}
                    />
                    <div
                        onClick={() => inputRef.current.click()}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        style={{
                            border: "2px dashed #aaa",
                            borderRadius: "8px",
                            padding: "40px",
                            textAlign: "center",
                            background: dragActive ? "#f0f8ff" : "#fff",
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                    >
                        <p>Déposez vos fichiers ici ou cliquez pour sélectionner</p>
                    </div>
                </form>
            </div>
            <div style={{ marginTop: "2rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Chemin</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.id}</td>
                                <td>{doc.nom}</td>
                                <td>{doc.chemin}</td>
                                <td>{doc.type}</td>
                                <td>
                                    <button onClick={() => handleEdit(doc)}>Éditer</button>
                                    <button onClick={() => handleDelete(doc.id)} style={{ marginLeft: 8, color: "red" }}>
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center" }}>Aucun document</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Documents;