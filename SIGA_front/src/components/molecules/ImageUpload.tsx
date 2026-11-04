import React, { useState, useRef } from 'react';
import { LuCloudUpload, LuImage, LuX, LuLoader } from 'react-icons/lu';
import { uploadImage } from '../../services/upload';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: 'productos' | 'usuarios' | 'general';
  label?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = 'productos',
  label = 'Fotografía del Producto',
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err: unknown) {
      console.error('Error al subir imagen a Cloudinary:', err);
      // Fallback local preview if Cloudinary is not configured yet in local development
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      setError('Aviso: Cloudinary no respondió. Se cargó una vista previa temporal.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 w-full h-44 flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-white/90 hover:bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md cursor-pointer transition"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-lg bg-red-600 hover:bg-red-700 p-1.5 text-white shadow-md cursor-pointer transition"
            >
              <LuX className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/20 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-slate-50/50"
        >
          {uploading ? (
            <>
              <LuLoader className="size-8 text-emerald-700 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">
                Subiendo a Cloudinary...
              </p>
            </>
          ) : (
            <>
              <div className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <LuCloudUpload className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Haz clic para subir o arrastra una imagen
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG o WEBP (Máx. 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs font-medium text-amber-600 flex items-center gap-1 mt-1">
          <LuImage className="size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
