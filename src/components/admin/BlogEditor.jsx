import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
  Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Heading3,
  Code, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon,
  ZoomIn, ZoomOut, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MenuBar = ({ editor, onShowPreview, showPreview, fileInputRef, linkInputRef, linkUrl, setLinkUrl }) => {
  if (!editor) {
    return null;
  }

  const handleImageUpload = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      editor.chain().focus().setImage({ 
        src: event.target.result,
      }).run();
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const handleAddLink = useCallback(() => {
    if (!linkUrl) {
      toast.error('Por favor ingresa una URL');
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run();
    setLinkUrl('');
  }, [editor, linkUrl, setLinkUrl]);

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50 sticky top-0 z-10 overflow-x-auto">
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Deshacer"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rehacer"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="border-l border-gray-300 mx-1"></div>

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(editor.isActive('bold') && 'bg-accent')}
        title="Negrita (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(editor.isActive('italic') && 'bg-accent')}
        title="Itálica (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(editor.isActive('underline') && 'bg-accent')}
        title="Subrayado"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <div className="border-l border-gray-300 mx-1"></div>

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(editor.isActive('heading', { level: 1 }) && 'bg-accent')}
        title="Encabezado 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(editor.isActive('heading', { level: 2 }) && 'bg-accent')}
        title="Encabezado 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(editor.isActive('heading', { level: 3 }) && 'bg-accent')}
        title="Encabezado 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="border-l border-gray-300 mx-1"></div>

      {/* Lists and Blocks */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(editor.isActive('bulletList') && 'bg-accent')}
        title="Lista de viñetas"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(editor.isActive('orderedList') && 'bg-accent')}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(editor.isActive('blockquote') && 'bg-accent')}
        title="Cita"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(editor.isActive('codeBlock') && 'bg-accent')}
        title="Bloque de código"
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="border-l border-gray-300 mx-1"></div>

      {/* Alignment */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-accent')}
        title="Alinear a la izquierda"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-accent')}
        title="Centrar"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-accent')}
        title="Alinear a la derecha"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="border-l border-gray-300 mx-1"></div>

      {/* Media */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef?.current?.click()}
        title="Insertar imagen"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="border-l border-gray-300 mx-1"></div>

      {/* Link */}
      <div className="flex gap-1 items-center">
        <input
          ref={linkInputRef}
          type="text"
          placeholder="URL..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="px-2 py-1 text-sm border rounded w-32"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddLink();
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddLink}
          title="Añadir enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-l border-gray-300 mx-1 ml-auto"></div>

      {/* Preview Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onShowPreview}
        className={cn(showPreview && 'bg-accent')}
        title="Alternar previsualización"
      >
        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const BlogEditor = ({ content, onChange }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageControls, setImageControls] = useState(null);
  const fileInputRef = useRef(null);
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto cursor-pointer',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Comienza a escribir tu artículo...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handleClick = (e) => {
      if (e.target.tagName === 'IMG') {
        setSelectedImage(e.target);
        const rect = e.target.getBoundingClientRect();
        const editorRect = editor.view.dom.getBoundingClientRect();
        
        setImageControls({
          top: rect.top - editorRect.top - 60,
          left: rect.left - editorRect.left,
        });
      } else {
        setSelectedImage(null);
        setImageControls(null);
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);

    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor]);

  const handleImageResize = (percentage) => {
    if (!selectedImage) return;

    const currentWidth = selectedImage.getAttribute('width') || '100%';
    const currentValue = parseInt(currentWidth) || 100;
    const newValue = Math.max(30, Math.min(100, currentValue + percentage));
    
    selectedImage.setAttribute('width', `${newValue}%`);
    selectedImage.style.width = `${newValue}%`;
    selectedImage.style.height = 'auto';
    
    if (editor) {
      onChange(editor.getHTML());
    }
  };

  const handleImageAlign = (align) => {
    if (!selectedImage) return;

    const container = selectedImage.parentElement;
    
    if (align === 'center') {
      selectedImage.style.margin = '10px auto';
      selectedImage.style.display = 'block';
    } else if (align === 'right') {
      selectedImage.style.margin = '10px 0 10px 10px';
      selectedImage.style.float = 'right';
    } else {
      selectedImage.style.margin = '10px 10px 10px 0';
      selectedImage.style.float = 'left';
    }

    if (editor) {
      onChange(editor.getHTML());
    }
  };

  const handleImageDelete = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    setImageControls(null);

    if (editor) {
      onChange(editor.getHTML());
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <MenuBar 
        editor={editor} 
        onShowPreview={() => setShowPreview(!showPreview)}
        showPreview={showPreview}
        fileInputRef={fileInputRef}
        linkInputRef={linkInputRef}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="min-h-[400px] border-r relative overflow-auto">
          {selectedImage && imageControls && (
            <div 
              className="absolute z-50 flex gap-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg"
              style={{
                top: `${imageControls.top}px`,
                left: `${imageControls.left}px`,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImageResize(10)}
                title="Aumentar tamaño"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImageResize(-10)}
                title="Reducir tamaño"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="border-l border-gray-300 mx-1"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImageAlign('left')}
                title="Alinear a la izquierda"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImageAlign('center')}
                title="Centrar"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImageAlign('right')}
                title="Alinear a la derecha"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <div className="border-l border-gray-300 mx-1"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageDelete}
                className="text-destructive hover:text-destructive"
                title="Eliminar imagen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <EditorContent 
            editor={editor} 
            className="prose prose-sm max-w-none p-4 focus:outline-none [&_img]:cursor-pointer"
          />
        </div>

        {showPreview && (
          <div className="min-h-[400px] p-4 bg-gray-50 overflow-auto border-l">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;
