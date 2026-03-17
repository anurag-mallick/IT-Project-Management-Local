import { createClient } from './supabase/client';

const BUCKET_NAME = 'attachments';

export async function uploadAttachment(ticketId: number, file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${ticketId}/${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw error;
  }

  return {
    path: data.path,
    name: file.name,
    size: file.size,
    type: file.type
  };
}

export async function getFileUrl(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
