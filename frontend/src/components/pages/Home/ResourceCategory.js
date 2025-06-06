// src/components/pages/Home/ResourceCategory.js
import ResourceCard from './ResourceCard';

const ResourceCategory = ({ type, items, apiUrl }) => (
  <div className="resource-category">
    <h3 className="category-title">{type}</h3>
    <div className="resource-grid">
      {items.map((res) => (
        <ResourceCard key={res.id} res={res} apiUrl={apiUrl} />
      ))}
    </div>
  </div>
);

export default ResourceCategory;
