import React, { useState } from 'react';
import { Galleria } from 'primereact/galleria';
import { Card } from 'primereact/card';

export const MovieImages = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Generate placeholder images if none provided
  const displayImages = images.length > 0 ? images : [
    { itemImageSrc: null, thumbnailImageSrc: null, alt: 'Image 1' },
    { itemImageSrc: null, thumbnailImageSrc: null, alt: 'Image 2' },
    { itemImageSrc: null, thumbnailImageSrc: null, alt: 'Image 3' },
    { itemImageSrc: null, thumbnailImageSrc: null, alt: 'Image 4' },
  ];

  const itemTemplate = (item) => {
    if (!item.itemImageSrc) {
      return (
        <div 
          className="flex align-items-center justify-content-center"
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#e0e0e0',
          }}
        >
          <i className="pi pi-image" style={{ fontSize: '4rem', color: '#999' }}></i>
        </div>
      );
    }
    return (
      <img 
        src={item.itemImageSrc} 
        alt={item.alt} 
        style={{ width: '100%', display: 'block' }} 
      />
    );
  };

  const thumbnailTemplate = (item) => {
    if (!item.thumbnailImageSrc) {
      return (
        <div 
          className="flex align-items-center justify-content-center"
          style={{
            width: '80px',
            height: '60px',
            backgroundColor: '#f0f0f0',
            cursor: 'pointer',
          }}
        >
          <i className="pi pi-image" style={{ fontSize: '1.5rem', color: '#999' }}></i>
        </div>
      );
    }
    return (
      <img 
        src={item.thumbnailImageSrc} 
        alt={item.alt} 
        style={{ width: '80px', display: 'block', cursor: 'pointer' }} 
      />
    );
  };

  return (
    <Card className="movie-images mt-3">
      <div className="mb-3">
        <h4 className="m-0">Gallery</h4>
      </div>

      {displayImages.length > 0 ? (
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
