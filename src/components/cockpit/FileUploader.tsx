import React, { useRef, useCallback, useState } from 'react';
import { Upload, FileText, X, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePipelineStore } from '@/stores/pipelineStore';
import { motion, AnimatePresence } from 'framer-motion';

export function FileUploader() {
  const { inputFile, inputType, setInputFile, setInputType } = usePipelineStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setInputFile(file);
    }
  }, [setInputFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputFile(file);
    }
  }, [setInputFile]);

  const handleRemoveFile = useCallback(() => {
    setInputFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setInputFile]);

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Log File Input</CardTitle>
        </div>
        <CardDescription>
          Upload security logs for analysis (LANL Auth or CIC-IDS format)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8
            transition-all duration-200 text-center
            ${isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
            }
          `}
          animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.parquet,.log,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <AnimatePresence mode="wait">
            {inputFile ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileText className="h-8 w-8" />
                </div>
                <p className="font-medium text-foreground">{inputFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(inputFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="font-medium text-foreground">Drop log file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Log Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Log Format</label>
          <div className="flex gap-2">
            <Button
              variant={inputType === 'lanl' ? 'default' : 'outline'}
              onClick={() => setInputType('lanl')}
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              LANL Auth
            </Button>
            <Button
              variant={inputType === 'cicids' ? 'default' : 'outline'}
              onClick={() => setInputType('cicids')}
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              CIC-IDS
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
