import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API}/ressources`);
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            try {
                await axios.delete(`${API}/admin/documents/${id}`);
                fetchDocuments(); // Recharger la liste après suppression
                alert("Document supprimé avec succès");
            } catch (err) {
                console.error("Erreur lors de la suppression:", err);
                alert("Erreur lors de la suppression du document");
            }
        }
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

    const uploadFiles = async (files) => {
        for (let file of files) {
            try {
                // Remplacer les espaces par des underscores dans le nom du fichier
                const originalName = file.name;
                const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
                const extension = originalName.substring(originalName.lastIndexOf('.'));
                const cleanName = nameWithoutExtension.replace(/\s+/g, '_') + extension;
                
                // Créer FormData pour l'upload
                const formData = new FormData();
                formData.append('file', file, cleanName);
                formData.append('nom', nameWithoutExtension.replace(/\s+/g, '_'));
                formData.append('type', extension.substring(1)); // Enlever le point de l'extension

                // Upload du fichier
                const response = await axios.post(`${API}/admin/documents/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 201) {
                    console.log(`Document ${cleanName} uploadé avec succès`);
                } else {
                    console.error(`Erreur lors de l'upload de ${cleanName}`);
                }
            } catch (err) {
                console.error(`Erreur lors de l'upload de ${file.name}:`, err);
                alert(`Erreur lors de l'upload de ${file.name}`);
            }
        }
        
        // Recharger la liste des documents après tous les uploads
        fetchDocuments();
        alert('Upload terminé');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(Array.from(e.target.files));
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