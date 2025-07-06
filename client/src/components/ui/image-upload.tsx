import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  existing?: string[];
  className?: string;
}

export function ImageUpload({ 
  onUpload, 
  maxFiles = 5, 
  existing = [], 
  className = "" 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existing);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync internal state with existing prop changes
  useEffect(() => {
    setImages(existing);
  }, [existing]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const newImages = [...images, ...result.urls];
      setImages(newImages);
      onUpload(newImages);

      toast({
        title: "Upload successful",
        description: `${files.length} image(s) uploaded`,
      });

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Product Images</Label>
      
      {/* Upload Area */}
      <Card className="mt-2">
        <CardContent className="p-4">
          <div 
            onClick={triggerFileSelect}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WebP up to 10MB ({images.length}/{maxFiles})
                </p>
              </div>
            </div>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || images.length >= maxFiles}
          />
        </CardContent>
      </Card>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="mt-4 flex items-center justify-center py-8 text-gray-400">
          <ImageIcon className="h-8 w-8 mr-2" />
          <span className="text-sm">No images uploaded</span>
        </div>
      )}
    </div>
  );
}