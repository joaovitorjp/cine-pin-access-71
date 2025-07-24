import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllBackgroundImages,
  addBackgroundImage,
  updateBackgroundImage,
  deleteBackgroundImage,
  toggleBackgroundImageStatus,
  BackgroundImage
} from '@/services/backgroundService';

const BackgroundImageManager: React.FC = () => {
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<BackgroundImage | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    alt: '',
    order: 1,
    active: true
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await getAllBackgroundImages();
      setImages(data);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar imagens de fundo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingImage) {
        await updateBackgroundImage(editingImage.id, formData);
        toast.success('Imagem atualizada com sucesso!');
      } else {
        await addBackgroundImage(formData);
        toast.success('Imagem adicionada com sucesso!');
      }
      
      await fetchImages();
      setShowAddDialog(false);
      setEditingImage(null);
      setFormData({ url: '', alt: '', order: 1, active: true });
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast.error('Erro ao salvar imagem');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      await deleteBackgroundImage(id);
      toast.success('Imagem excluída com sucesso!');
      await fetchImages();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      toast.error('Erro ao excluir imagem');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBackgroundImageStatus(id);
      toast.success('Status da imagem alterado com sucesso!');
      await fetchImages();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da imagem');
    }
  };

  const openEditDialog = (image: BackgroundImage) => {
    setEditingImage(image);
    setFormData({
      url: image.url,
      alt: image.alt,
      order: image.order,
      active: image.active
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setEditingImage(null);
    setFormData({ url: '', alt: '', order: 1, active: true });
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Imagem de Fundo da Tela de Login</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ url: '', alt: 'Imagem de fundo da tela de login', order: 1, active: true })}>
              <Plus className="w-4 h-4 mr-2" />
              {images.length > 0 ? 'Alterar Imagem' : 'Adicionar Imagem'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-netflix-dark text-white">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Alterar Imagem de Fundo' : 'Adicionar Imagem de Fundo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url">URL da Imagem</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="alt">Descrição da Imagem</Label>
                <Input
                  id="alt"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  placeholder="Imagem de fundo da tela de login"
                  required
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Usar como imagem de fundo</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="flex-1 bg-netflix-red hover:bg-red-700">
                  {loading ? 'Salvando...' : (editingImage ? 'Atualizar' : 'Adicionar')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {images.length > 0 && (
        <Card className="bg-netflix-dark border-gray-700 max-w-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Imagem de Fundo Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video bg-gray-800 rounded-md overflow-hidden">
              <img
                src={images[0].url}
                alt={images[0].alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLDivElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-gray-500 hidden">
                <ImageIcon className="w-8 h-8" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">{images[0].alt}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded ${images[0].active ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {images[0].active ? 'Ativa' : 'Inativa'}
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(images[0])}
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(images[0].id)}
                    className="h-6 w-6 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden">
        {images.map((image) => (
          <Card key={image.id} className="bg-netflix-dark border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm text-white">
                  Ordem: {image.order}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(image)}
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(image.id)}
                    className="h-6 w-6 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-video bg-gray-800 rounded-md overflow-hidden">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const sibling = target.nextElementSibling as HTMLDivElement;
                      if (sibling) sibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center text-gray-500 hidden">
                  <ImageIcon className="w-8 h-8" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 truncate">{image.alt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${image.active ? 'bg-green-600' : 'bg-gray-600'}`}>
                    {image.active ? 'Ativa' : 'Inativa'}
                  </span>
                  <Switch
                    checked={image.active}
                    onCheckedChange={() => handleToggleStatus(image.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4" />
          <p>Nenhuma imagem de fundo configurada.</p>
          <p className="text-sm">Adicione uma imagem para personalizar o fundo da tela de login.</p>
        </div>
      )}
    </div>
  );
};

export default BackgroundImageManager;