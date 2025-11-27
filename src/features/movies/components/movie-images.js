import React, { useState, useMemo } from 'react';
import { Galleria } from 'primereact/galleria';
import { Card } from 'primereact/card';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const MovieImages = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Transform TMDB images to Galleria format
  const displayImages = useMemo(() => {
    if (!images) return [];
    
    const allImages = [];
    
    // Add backdrops
    if (images.backdrops?.length > 0) {
      images.backdrops.forEach((backdrop, index) => {
        allImages.push({
          itemImageSrc: `${TMDB_IMAGE_BASE_URL}/original${backdrop.filePath}`,
          thumbnailImageSrc: `${TMDB_IMAGE_BASE_URL}/w185${backdrop.filePath}`,
          alt: `Backdrop ${index + 1}`,
          type: 'backdrop'
        });
      });
    }
    
    // Add posters
    if (images.posters?.length > 0) {
      images.posters.forEach((poster, index) => {
        allImages.push({
          itemImageSrc: `${TMDB_IMAGE_BASE_URL}/original${poster.filePath}`,
          thumbnailImageSrc: `${TMDB_IMAGE_BASE_URL}/w185${poster.filePath}`,
          alt: `Poster ${index + 1}`,
          type: 'poster'
        });
      });
    }
    
    // Add logos
    if (images.logos?.length > 0) {
      images.logos.forEach((logo, index) => {
        allImages.push({
          itemImageSrc: `${TMDB_IMAGE_BASE_URL}/original${logo.filePath}`,
          thumbnailImageSrc: `${TMDB_IMAGE_BASE_URL}/w185${logo.filePath}`,
          alt: `Logo ${index + 1}`,
          type: 'logo'
        });
      });
    }
    
    return allImages;
  }, [images]);

  const itemTemplate = (item) => {
    return (
      <img 
        src={item.itemImageSrc} 
        alt={item.alt} 
        style={{ 
          width: '100%',
          maxHeight: '500px',
          display: 'block',
          objectFit: 'contain',
          backgroundColor: item.type === 'logo' ? '#1a1a1a' : 'transparent'
        }} 
      />
    );
  };

  const thumbnailTemplate = (item) => {
    return (
      <img 
        src={item.thumbnailImageSrc} 
        alt={item.alt} 
        style={{ 
          width: '80px', 
          height: '60px',
          display: 'block', 
          cursor: 'pointer',
          objectFit: 'cover'
        }} 
      />
    );
  };

  return (
    <Card className="movie-images mt-3">
      <div className="mb-3">
        <h4 className="m-0">Gallery</h4>
      </div>

      {displayImages.length > 0 ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Galleria
            value={displayImages}
            activeIndex={activeIndex}
            onItemChange={(e) => setActiveIndex(e.index)}
            numVisible={4}
            circular
            showItemNavigators
            showThumbnails
            item={itemTemplate}
            thumbnail={thumbnailTemplate}
            style={{ maxWidth: '100%' }}
            thumbnailsPosition="bottom"
          />
        </div>
      ) : (
        <div 
          className="flex flex-column align-items-center justify-content-center p-4"
          style={{
            border: '2px dashed #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <i className="pi pi-images" style={{ fontSize: '3rem', color: '#999', marginBottom: '1rem' }}></i>
          <p className="text-500">No images available</p>
        </div>
      )}
    </Card>
  );
};
