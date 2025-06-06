// src/components/pages/Home/ResourceCard.js
const getFileIcon = (chemin) => {
  if (!chemin) return '📄';
  const ext = chemin.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📕', doc: '📘', docx: '📘', xls: '📊',
    xlsx: '📊', ppt: '📙', pptx: '📙', txt: '📝',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
    zip: '🗜️', rar: '🗜️'
  };
  return icons[ext] || '📄';
};

const ResourceCard = ({ res, apiUrl }) => (
  <div className="resource-card">
    <div className="resource-icon">{getFileIcon(res.chemin)}</div>
    <div className="resource-details">
      <a
        href={`${apiUrl}/viewressources/${res.chemin}`}
        target="_blank"
        rel="noopener noreferrer"
        className="resource-link"
      >
        {res.nom}
      </a>
      {res.description && <p className="resource-description">{res.description}</p>}
      {res.dateCreation && (
        <p className="resource-date">Ajouté le: {new Date(res.dateCreation).toLocaleDateString()}</p>
      )}
    </div>
  </div>
);

export default ResourceCard;
