import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

export const MovieList = ({ movies }) => {
  const navigate = useNavigate();
  const [selectedMovies, setSelectedMovies] = useState([]);

  const ratingBodyTemplate = (rowData) => {
    const rating = rowData.rating || 0;
    return (
      <Tag 
        value={rating.toFixed(1)} 
        severity={rating >= 8 ? 'success' : rating >= 6 ? 'info' : 'warning'}
        rounded
      />
    );
  };

  const dateBodyTemplate = (rowData) => {
    if (!rowData.releaseDate) return 'N/A';
    const date = new Date(rowData.releaseDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-eye"
        rounded
        text
        severity="info"
        tooltip="View Details"
        tooltipOptions={{ position: 'top' }}
        onClick={() => navigate(`/movie/${rowData.id || rowData.tmdbId}`)}
      />
    );
  };

  return (
    <div className="card">
      <h3 className="p-3">Imported Movies</h3>
      <DataTable
        value={movies}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        emptyMessage="No movies imported yet. Start by importing a movie using the form above."
        selection={selectedMovies}
        onSelectionChange={(e) => setSelectedMovies(e.value)}
        responsiveLayout="scroll"
        stripedRows
        showGridlines
        sortMode="multiple"
        removableSort
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
        <Column 
          field="tmdbId" 
          header="TMDB ID" 
          sortable 
          style={{ minWidth: '8rem' }}
        />
        <Column 
          field="title" 
          header="Title" 
          sortable 
          filter 
          filterPlaceholder="Search by title"
          style={{ minWidth: '12rem' }}
        />
        <Column 
          field="releaseDate" 
          header="Release Date" 
          body={dateBodyTemplate}
          sortable 
          style={{ minWidth: '10rem' }}
        />
        <Column 
          field="rating" 
          header="Rating" 
          body={ratingBodyTemplate}
          sortable 
          style={{ minWidth: '8rem' }}
        />
        <Column 
          body={actionBodyTemplate} 
          exportable={false} 
          header="Actions"
          style={{ minWidth: '10rem' }}
        />
      </DataTable>
    </div>
  );
};
