import React, { useEffect, useState } from 'react';
import { getLoginBackgroundImages } from '@/services/backgroundService';

interface BackgroundImage {
  id: string;
  url: string;
  alt: string;
}

const AnimatedBackground: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const backgroundImages = await getLoginBackgroundImages();
        // Pega a primeira imagem ativa
        if (backgroundImages.length > 0) {
          setBackgroundImage(backgroundImages[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar imagem de fundo:', error);
      }
    };

    fetchImage();
  }, []);

  // Se não há imagem, não renderiza nada
  if (!backgroundImage) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 -z-10" />
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Imagem de fundo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage.url})` }}
      />
      
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
};

export default AnimatedBackground;