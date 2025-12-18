"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ArrowRight, Download, RefreshCw, Trash2, Image as ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'converting' | 'done' | 'error';
  error?: string;
}

export default function ImageToPdfPage() {
  const [queue, setQueue] = useState<ImageItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const newItems: ImageItem[] = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file), // Create preview URL
      status: 'idle'
    }));
    setQueue(prev => [...prev, ...newItems]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: true
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
  };

  const removeItem = (id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview); // Cleanup
      return prev.filter(i => i.id !== id);
    });
  };

  const handleConvert = async () => {
    if (queue.length === 0) return;
    setIsConverting(true);
    setPdfUrl(null);

    const formData = new FormData();
    queue.forEach(item => {
      formData.append('files', item.file);
    });

    try {
      const response = await fetch('/api/tools/image-to-pdf/convert', { // Relative path
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setQueue(prev => prev.map(item => ({ ...item, status: 'done' })));

    } catch (error) {
      console.error(error);
      alert('Failed to convert images to PDF');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-xl mb-6">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Image to PDF</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Convert your images into a single professional PDF document.
          </p>
        </div>

        {/* Upload Area */}
        {!pdfUrl && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-8 ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-white'
              } ${queue.length > 0 ? 'py-6 bg-white' : 'py-16 bg-white'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={` p-3 bg-blue-50 text-blue-600 rounded-xl ${queue.length > 0 ? 'w-10 h-10' : 'w-16 h-16'}`}>
                <Upload className={queue.length > 0 ? 'w-5 h-5' : 'w-8 h-8'} />
              </div>
              <div>
                <h3 className={`font-bold text-slate-900 ${queue.length > 0 ? 'text-lg' : 'text-xl'}`}>
                  {queue.length > 0 ? 'Add more Images' : 'Drop your Images here'}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {queue.length > 0 && !pdfUrl && (
          <div className="space-y-4 mb-8">
            {queue.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-900 truncate max-w-[200px]">{item.file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(item.file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {queue.length > 0 && !pdfUrl && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-primary text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center disabled:opacity-70"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                  Converting...
                </>
              ) : (
                <>
                  Convert to PDF
                  <ArrowRight className="w-6 h-6 ml-3" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {pdfUrl && (
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Conversion Complete!</h2>
            <div className="flex justify-center gap-4 mt-8">
              <a
                href={pdfUrl}
                download="images.pdf"
                className="flex items-center px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </a>
              <button
                onClick={() => {
                  setQueue([]);
                  setPdfUrl(null);
                }}
                className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}