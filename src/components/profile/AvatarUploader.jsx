import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { UploadCloud, RotateCw, Check } from 'lucide-react';

// Función para obtener la imagen recortada
function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      blob.name = fileName;
      resolve(blob);
    }, 'image/png');
  });
}

const AvatarUploader = ({ onAvatarChange, onClose, isUploading }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setCrop(undefined); // Reinicia el recorte al subir una nueva imagen
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
      reader.readAsDataURL(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024,
  });

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(newCrop);
    imgRef.current = e.currentTarget;
  }

  async function handleUploadCroppedImage() {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop, 'avatar.png');
      onAvatarChange(croppedImageBlob);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Actualizar Avatar</h3>
          <p className="text-sm text-muted-foreground">Sube y recorta tu nueva imagen de perfil.</p>
        </div>
        <div className="p-6">
          {imgSrc ? (
            <div className="space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Recortar" style={{ maxHeight: '60vh' }} />
              </ReactCrop>
              <button onClick={() => setImgSrc('')} className="text-sm text-muted-foreground hover:text-foreground">
                <RotateCw className="w-4 h-4 inline-block mr-1" />
                Elegir otra imagen
              </button>
            </div>
          ) : (
            <div {...getRootProps()} className={`p-12 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : ''}`}>
              <input {...getInputProps()} />
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="font-semibold">Arrastra una imagen aquí o haz clic para seleccionar</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 5MB</p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-4 bg-muted/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-muted">Cancelar</button>
          <button
            onClick={handleUploadCroppedImage}
            disabled={!completedCrop || isUploading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isUploading ? 'Subiendo...' : <><Check className="w-4 h-4 inline-block mr-1" /> Guardar Avatar</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploader;
