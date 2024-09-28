export type StorageFile = {
    Body?: any | null;
    ContentLength?: number | null;
    ContentType?: string | null;
    ETag: number;
    LastModified: string;
    Metadata?: any | null;
    ServerSideEncryption?: string | null;   
  };