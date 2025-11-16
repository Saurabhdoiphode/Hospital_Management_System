import React, { useState } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, filters = [], placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value, activeFilters);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    onSearch(searchTerm, newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onSearch('', {});
  };

  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key]);

  return (
    <div className="advanced-search">
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {filters.length > 0 && (
          <button
            className={`filter-btn ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <FiFilter />
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
        )}
        {(searchTerm || hasActiveFilters) && (
          <button className="clear-btn" onClick={clearFilters} title="Clear">
            <FiX />
          </button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="filters-panel">
          {filters.map((filter, idx) => (
            <div key={idx} className="filter-group">
              <label>{filter.label}</label>
              {filter.type === 'select' ? (
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">All</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <input
                  type="date"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  placeholder={filter.placeholder}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

