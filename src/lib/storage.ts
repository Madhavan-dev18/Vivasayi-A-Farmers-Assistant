import { supabase } from '@/lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to the private 'vivasayi-storage' bucket and returns its
 * storage PATH (not a public URL — the bucket is private, so there is no
 * public URL). Store this path in the database. To actually display or
 * download the file later, call getSignedFileUrl() server-side, which
 * mints a short-lived signed URL on demand.
 */
export async function uploadImage(
  file: File,
  userId: string,
  folder: string = 'general'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${userId}/${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from('vivasayi-storage')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  return filePath;
}
