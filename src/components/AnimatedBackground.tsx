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
  const extendedImages = [...images, ...images, ...images, ...images];

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/80 z-10" />
      
      {/* Container das 8 linhas horizontais */}
      <div className="absolute inset-0 flex flex-col gap-[3px] py-[3px]">
        {/* Primeira linha - Esquerda para Direita */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-left-right">
            {extendedImages.map((image, index) => (
              <div 
                key={`row1-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Segunda linha - Direita para Esquerda */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-right-left">
            {extendedImages.map((image, index) => (
              <div 
                key={`row2-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Terceira linha - Esquerda para Direita */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-left-right-slow">
            {extendedImages.map((image, index) => (
              <div 
                key={`row3-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quarta linha - Direita para Esquerda */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-right-left-slow">
            {extendedImages.map((image, index) => (
              <div 
                key={`row4-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quinta linha - Esquerda para Direita */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-left-right">
            {extendedImages.map((image, index) => (
              <div 
                key={`row5-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sexta linha - Direita para Esquerda */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-right-left">
            {extendedImages.map((image, index) => (
              <div 
                key={`row6-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sétima linha - Esquerda para Direita */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-left-right-slow">
            {extendedImages.map((image, index) => (
              <div 
                key={`row7-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Oitava linha - Direita para Esquerda */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-scroll-right-left-slow">
            {extendedImages.map((image, index) => (
              <div 
                key={`row8-${index}`}
                className="w-64 h-36 mx-2 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-500"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;