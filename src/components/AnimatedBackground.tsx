import React, { useEffect, useState } from 'react';
import { getLoginBackgroundImages } from '@/services/backgroundService';

interface BackgroundImage {
  id: string;
  url: string;
  alt: string;
}

const AnimatedBackground: React.FC = () => {
  const [images, setImages] = useState<BackgroundImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const backgroundImages = await getLoginBackgroundImages();
        setImages(backgroundImages);
      } catch (error) {
        console.error('Erro ao carregar imagens de fundo:', error);
      }
    };

    fetchImages();
  }, []);

  // Se não há imagens, não renderiza nada
  if (images.length === 0) {
    return null;
  }

  // Duplica as imagens para criar efeito contínuo
  const allImages = [...images, ...images, ...images];

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      {/* Container das imagens animadas */}
      <div className="absolute inset-0 flex">
        {/* Primeira coluna */}
        <div className="flex-1 flex flex-col animate-scroll-diagonal-1">
          {allImages.slice(0, Math.ceil(allImages.length / 3)).map((image, index) => (
            <div 
              key={`col1-${index}`}
              className="w-full h-48 mb-4 transform rotate-12 opacity-80 hover:opacity-100 transition-opacity duration-500"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Segunda coluna - offset */}
        <div className="flex-1 flex flex-col animate-scroll-diagonal-2" style={{ marginTop: '-100px' }}>
          {allImages.slice(Math.ceil(allImages.length / 3), Math.ceil(allImages.length * 2 / 3)).map((image, index) => (
            <div 
              key={`col2-${index}`}
              className="w-full h-48 mb-4 transform rotate-12 opacity-80 hover:opacity-100 transition-opacity duration-500"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Terceira coluna - offset maior */}
        <div className="flex-1 flex flex-col animate-scroll-diagonal-3" style={{ marginTop: '-200px' }}>
          {allImages.slice(Math.ceil(allImages.length * 2 / 3)).map((image, index) => (
            <div 
              key={`col3-${index}`}
              className="w-full h-48 mb-4 transform rotate-12 opacity-80 hover:opacity-100 transition-opacity duration-500"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;