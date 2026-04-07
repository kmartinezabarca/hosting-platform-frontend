import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Eye, Image as ImageIcon, 
  Loader2, AlertCircle, CheckCircle, Trash2, 
  Clock, User, Tag, Layout, FileText, Calendar, Upload, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import BlogService from '@/services/blogService';
import BlogEditor from '@/components/admin/BlogEditor';

const AdminBlogEditorPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    blog_category_id: '',
    author_name: 'ROKE Industries',
    is_featured: false,
    read_time: 5,
    published_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      if (isEdit) {
        await fetchPost();
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [uuid, isEdit]);

  const fetchCategories = async () => {
    try {
      const res = await BlogService.adminGetCategories();
      const categoryList = res.data.data || [];
      setCategories(categoryList);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Error al cargar categorías');
    }
  };

  const fetchPost = async () => {
    try {
      const res = await BlogService.adminGetPost(uuid);
      const post = res.data.data;
      
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        image: post.image || '',
        blog_category_id: post.category?.uuid || '',
        author_name: post.authorName || 'ROKE Industries',
        is_featured: post.isFeatured || false,
        read_time: post.readTime || 5,
        published_at: post.publishedAt ? post.publishedAt.split(' ')[0] : new Date().toISOString().split('T')[0]
      });
      
      if (post.image) {
        setImagePreview(post.image);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      toast.error('Error al cargar el artículo');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      blog_category_id: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    try {
      const formDataImage = new FormData();
      formDataImage.append('image', imageFile);
      
      const res = await BlogService.uploadImage(formDataImage);
      const imageUrl = res.data.url;
      
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setShowImageUpload(false);
      setImageFile(null);
      toast.success('Imagen cargada correctamente');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Error al cargar la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.content || !formData.blog_category_id) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        blog_category_id: formData.blog_category_id,
        author_name: formData.author_name || 'ROKE Industries',
        is_featured: formData.is_featured,
        read_time: formData.read_time,
        published_at: formData.published_at
      };

      if (isEdit) {
        await BlogService.adminUpdatePost(uuid, payload);
        toast.success('Artículo actualizado correctamente');
      } else {
        await BlogService.adminCreatePost(payload);
        toast.success('Artículo creado correctamente');
      }

      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
        toast.error(`Error: ${errorMessages}`);
      } else {
        toast.error('Error al guardar el artículo');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      return;
    }

    try {
      await BlogService.adminDeletePost(uuid);
      toast.success('Artículo eliminado correctamente');
      navigate('/admin/blog');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Error al eliminar el artículo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/blog')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEdit ? 'Actualiza el contenido de tu blog' : 'Crea un nuevo artículo para tu blog'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEdit && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowPreview(true)}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Previsualizar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Contenido del Artículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input 
                    id="title" 
                    name="title"
                    placeholder="Ej: Cómo optimizar tu servidor..." 
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={generateSlug}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL amigable)</Label>
                <Input 
                  id="slug" 
                  name="slug"
                  placeholder="ej-como-optimizar-tu-servidor" 
                  value={formData.slug}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Extracto / Resumen <span className="text-destructive">*</span></Label>
                <textarea 
                  id="excerpt"
                  name="excerpt"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Una breve descripción que aparecerá en el listado..."
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Contenido del Artículo <span className="text-destructive">*</span></Label>
                <BlogEditor 
                  content={formData.content} 
                  onChange={handleContentChange} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" /> Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="blog_category_id">Categoría <span className="text-destructive">*</span></Label>
                <Select value={formData.blog_category_id || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map(cat => (
                        <SelectItem key={cat.uuid} value={cat.uuid}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_name">Autor</Label>
                <Input 
                  id="author_name" 
                  name="author_name"
                  placeholder="Ej: ROKE Industries" 
                  value={formData.author_name}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Por defecto: ROKE Industries</p>
              </div>

              <div className="space-y-2">
                <Label>Imagen Destacada</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      id="image" 
                      name="image"
                      type="url"
                      placeholder="Ej: https://ejemplo.com/imagen.jpg" 
                      value={formData.image}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageUpload(true)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>

                  {imagePreview && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-input">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: '' }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="read_time">Tiempo de Lectura (minutos)</Label>
                <Input 
                  id="read_time" 
                  name="read_time"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.read_time}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_at">Fecha de Publicación</Label>
                <Input 
                  id="published_at" 
                  name="published_at"
                  type="date"
                  value={formData.published_at}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label htmlFor="is_featured" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Destacado</span>
                  </div>
                </Label>
                <Switch 
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_featured: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </form>

      {/* Image Upload Dialog */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar Imagen Destacada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para seleccionar una imagen o arrastra una aquí
                </p>
              </label>
            </div>
            {imageFile && (
              <div className="text-sm text-muted-foreground">
                Archivo seleccionado: {imageFile.name}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageUpload(false);
                  setImageFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImageUpload}
                disabled={!imageFile}
              >
                Cargar Imagen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previsualización del Artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{formData.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" /> {formData.author_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {formData.published_at}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {formData.read_time} min
                </span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Importar Star icon si no está disponible
const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default AdminBlogEditorPage;
