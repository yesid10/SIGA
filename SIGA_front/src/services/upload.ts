import apiClient from './api/axios';
import axios from 'axios';

interface UploadResponse {
  url: string;
  mensaje?: string;
}

export const uploadImage = async (
  file: File,
  folder: 'productos' | 'usuarios' | 'general' = 'productos'
): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Direct Cloudinary upload if unsigned preset is present
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `siga/${folder}`);

      const { data } = await axios.post<{ secure_url: string }>(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn('Fallo en subida directa a Cloudinary, intentando vía backend proxy...', err);
    }
  }

  // Upload through secure backend endpoint
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const { data } = await apiClient.post<UploadResponse>(
    '/v1/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data.url;
};
