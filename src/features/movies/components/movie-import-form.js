import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { importMovie } from '../api/movie-api';

export const MovieImportForm = ({ onMovieImported }) => {
  const [tmdbId, setTmdbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!tmdbId) {
      setError('Please enter a TMDB ID');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const movie = await importMovie(tmdbId);
      onMovieImported(movie);
      setTmdbId('');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Failed to import movie. Check the TMDB ID or backend connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };

  return (
    <div className="mb-4">
      <div className="p-inputgroup" style={{ maxWidth: '500px' }}>
        <span className="p-inputgroup-addon">
          <i className="pi pi-film"></i>
        </span>
        <InputText
          value={tmdbId}
          onChange={(e) => {
            setTmdbId(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter TMDB Movie ID"
          className={error ? 'p-invalid' : ''}
          disabled={loading}
        />
        <Button
          label="Import"
          icon="pi pi-download"
          onClick={handleImport}
          loading={loading}
          disabled={!tmdbId}
        />
      </div>
      
      {error && (
        <Message 
          severity="error" 
          text={error} 
          className="mt-2" 
          style={{ maxWidth: '500px' }}
        />
      )}
    </div>
  );
};
