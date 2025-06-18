// src/components/pages/Home/ResourceCategory.js
import { useState } from 'react';
import ResourceCard from './ResourceCard';

const ResourceCategory = ({ type, items, apiUrl }) => {
  const [open, setOpen] = useState(true);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="resource-category">
      <button className="category-toggle" onClick={toggleOpen}>
        {open ? '▼' : '►'} {type} ({items.length})
      </button>
      {open && (
        <div className="resource-grid">
          {items.map((res) => (
            <ResourceCard key={res.id} res={res} apiUrl={apiUrl} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceCategory;
