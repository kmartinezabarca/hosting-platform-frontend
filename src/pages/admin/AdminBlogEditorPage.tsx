import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const blogPostSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título no puede exceder 200 caracteres'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  excerpt: z.string().min(1, 'El extracto es requerido').max(500, 'El extracto no puede exceder 500 caracteres'),
  content: z.string().min(1, 'El contenido es requerido'),
  image: z.string().optional(),
  blog_category_id: z.string().min(1, 'La categoría es requerida'),
  author_name: z.string().optional().default('ROKE Industries'),
  is_featured: z.boolean().default(false),
  read_time: z.number().min(1, 'El tiempo de lectura debe ser al menos 1 minuto').max(120, 'El tiempo de lectura no puede exceder 120 minutos'),
  published_at: z.string().optional(),
});

const AdminBlogEditorPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;

  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
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
    }
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
      const res = await BlogService.adminGetPost(uuid as string);
      const post: any = (res.data as any).data;
      
      reset({
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

  const generateSlug = () => {
    const title = watch('title');
    if (!title) return;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', slug, { shouldValidate: true });
  };

  const handleCategoryChange = (value) => {
    setValue('blog_category_id', value, { shouldValidate: true });
  };

  const handleContentChange = (content) => {
    setValue('content', content, { shouldValidate: true });
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
        setImagePreview(event.target?.result as string);
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
      const imageUrl = (res.data as any).url;
      
      setValue('image', imageUrl, { shouldValidate: true });
      setShowImageUpload(false);
      setImageFile(null);
      toast.success('Imagen cargada correctamente');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Error al cargar la imagen');
    }
  };

  const onSubmit = async (data) => {
    console.log('onSubmit called - data:', data);
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        blog_category_id: data.blog_category_id,
        author_name: data.author_name || 'ROKE Industries',
        is_featured: data.is_featured,
        read_time: data.read_time,
        published_at: data.published_at
      };

      if (isEdit) {
        await BlogService.adminUpdatePost(uuid, payload);
        toast.success('Artículo actualizado correctamente');
      } else {
        await BlogService.adminCreatePost(payload);
        toast.success('Artículo creado correctamente');
      }

      navigate('/admin/blog');
    } catch (err: any) {
      console.error('Error saving post:', err);
      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
        toast.error(`Error: ${errorMessages}`);
} else {
        toast.error('Error al guardar el artículo');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      return;
    }

    try {
      await BlogService.adminDeletePost(uuid as string);
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
                disabled={isSubmitting}
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
              type="button"
              onClick={() => document.querySelector('form')?.requestSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      placeholder="Ej: Cómo optimizar tu servidor..." 
                      {...register('title')}
                      onBlur={generateSlug}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL amigable)</Label>
                  <Input 
                    id="slug" 
                    placeholder="ej-como-optimizar-tu-servidor" 
                    {...register('slug')}
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extracto / Resumen <span className="text-destructive">*</span></Label>
                  <textarea 
                    id="excerpt"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Una breve descripción que aparecerá en el listado..."
                    {...register('excerpt')}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Contenido del Artículo <span className="text-destructive">*</span></Label>
                  <BlogEditor 
                    content={watch('content')} 
                    onChange={handleContentChange} 
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                  )}
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
                    className="flex w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    {...register('blog_category_id')}
                  >
                    <option key="select-default" value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.uuid} value={cat.uuid}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.blog_category_id && (
                    <p className="text-sm text-destructive">{errors.blog_category_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_name">Autor</Label>
                  <Input 
                    id="author_name" 
                    placeholder="Ej: ROKE Industries" 
                    {...register('author_name')}
                  />
                  <p className="text-xs text-muted-foreground">Por defecto: ROKE Industries</p>
                </div>

                <div className="space-y-2">
                  <Label>Imagen Destacada</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        id="image" 
                        type="url"
                        placeholder="Ej: https://ejemplo.com/imagen.jpg" 
                        {...register('image')}
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
                          className="absolute top-2 right-2 bg-black/50 dark:bg-black/50 hover:bg-black/70 dark:hover:bg-black/70 text-white dark:text-white"
                          onClick={() => {
                            setImagePreview(null);
                            setValue('image', '', { shouldValidate: true });
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
                    type="number"
                    min="1"
                    max="120"
                    {...register('read_time', { valueAsNumber: true })}
                  />
                  {errors.read_time && (
                    <p className="text-sm text-destructive">{errors.read_time.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="published_at">Fecha de Publicación</Label>
                  <Input 
                    id="published_at" 
                    type="date"
                    {...register('published_at')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Destacado</span>
                    </div>
                  </Label>
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        id="is_featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
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
                alt={watch('title')}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{watch('title')}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" /> {watch('author_name')}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {watch('published_at')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {watch('read_time')} min
                </span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: watch('content') }} />
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
