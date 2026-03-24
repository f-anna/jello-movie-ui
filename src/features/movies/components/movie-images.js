import React, { useState, useMemo } from 'react';
import { Galleria } from 'primereact/galleria';
import { Card } from 'primereact/card';

export const MovieImages = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = useMemo(() => {
    if (!images) return [];

    const topN = (arr, n) =>
      [...(arr ?? [])].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, n);

    const allImages = [];

    topN(images.backdrops, 6).forEach((backdrop, index) => {
      allImages.push({
        itemImageSrc: backdrop.imageUrl,
        thumbnailImageSrc: backdrop.imageUrl,
        alt: `Backdrop ${index + 1}`,
        type: 'backdrop'
      });
    });

    topN(images.posters, 4).forEach((poster, index) => {
      allImages.push({
        itemImageSrc: poster.imageUrl,
        thumbnailImageSrc: poster.imageUrl,
        alt: `Poster ${index + 1}`,
        type: 'poster'
      });
    });

    topN(images.logos, 2).forEach((logo, index) => {
      allImages.push({
        itemImageSrc: logo.imageUrl,
        thumbnailImageSrc: logo.imageUrl,
        alt: `Logo ${index + 1}`,
        type: 'logo'
      });
    });

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
        onError={(e) => { e.target.style.display = 'none'; }}
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
        onError={(e) => { e.target.style.display = 'none'; }}
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
