import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Eye, Image as ImageIcon, 
  Loader2, AlertCircle, CheckCircle, Trash2, 
  Clock, User, Tag, Layout, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    blog_category_id: '',
    is_featured: false,
    read_time: 5,
    published_at: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchPost();
    }
  }, [uuid]);

  const fetchCategories = async () => {
    try {
      const res = await BlogService.adminGetCategories();
      setCategories(res.data.data || []);
    } catch (err) {
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
        blog_category_id: post.category?.id || '',
        is_featured: post.isFeatured || false,
        read_time: post.readTime || 5,
        published_at: post.publishedAt ? post.publishedAt.split(' ')[0] : new Date().toISOString().split('T')[0]
      });
    } catch (err) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.blog_category_id) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await BlogService.adminUpdatePost(uuid, formData);
        toast.success('Artículo actualizado correctamente');
      } else {
        await BlogService.adminCreatePost(formData);
        toast.success('Artículo creado correctamente');
      }
      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      toast.error('Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? 'Editar Artículo' : 'Nuevo Artículo'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Modifica los detalles de tu publicación.' : 'Crea una nueva publicación para tu blog.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`/blog/${formData.slug}`, '_blank')} disabled={!formData.slug}>
            <Eye className="h-4 w-4 mr-2" /> Previsualizar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Actualizar' : 'Publicar'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Contenido Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Artículo <span className="text-destructive">*</span></Label>
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
                <select 
                  id="blog_category_id"
                  name="blog_category_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.blog_category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen Destacada</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image" 
                    name="image"
                    placeholder="https://ejemplo.com/imagen.jpg" 
                    value={formData.image}
                    onChange={handleChange}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border aspect-video bg-muted">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Artículo Destacado</Label>
                  <p className="text-xs text-muted-foreground">Aparecerá en la sección principal del blog.</p>
                </div>
                <Switch 
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="read_time">Tiempo de lectura (minutos)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="read_time" 
                    name="read_time"
                    type="number"
                    min="1"
                    value={formData.read_time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_at">Fecha de Publicación</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="published_at" 
                    name="published_at"
                    type="date"
                    value={formData.published_at}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">Listo para publicar</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Asegúrate de revisar el contenido y el slug antes de guardar los cambios.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditorPage;
