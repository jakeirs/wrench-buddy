'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageManyDropzone from '@/components/modules/image-many-dropzone';
import { ArrowLeft, Shuffle, Loader2, AlertCircle, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface ImageData {
  file: File;
  url: string;
  id: string;
}

interface MixerResponse {
  success: boolean;
  data?: {
    content: string;
    images?: Array<{
      url?: string;
      b64_json?: string;
      revised_prompt?: string;
    }>;
    model: string;
    provider: 'fal' | 'openrouter';
    id: string;
    finishReason?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    originalFileNames: string[];
    originalFileSizes: number[];
    hasImages: boolean;
  };
  error?: {
    type: string;
    title: string;
    message: string;
    details: string;
    code: string;
    retryable: boolean;
    httpStatus: number;
  };
}

const AVAILABLE_MODELS = [
  {
    id: 'fal-ai/nano-banana/edit',
    name: 'FAL AI - Nano Banana Edit',
    provider: 'fal',
    description: 'Advanced image editing with FAL AI',
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'google/gemini-2.5-flash-image-preview:free',
    name: 'Google Gemini 2.5 Flash (Free)',
    provider: 'openrouter',
    description: 'Free image analysis and generation via OpenRouter',
    color: 'from-yellow-400 to-orange-500'
  }
];

export default function EditorMixerPage() {
  const [prompt, setPrompt] = useState('');
  const [currentImages, setCurrentImages] = useState<ImageData[]>([]);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<MixerResponse['error'] | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [responseDetails, setResponseDetails] = useState<MixerResponse['data'] | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const handleImagesUpload = (images: ImageData[]) => {
    setCurrentImages(images);
    // Reset previous results
    setAiResponse('');
    setError(null);
    setResponseDetails(null);
    setShowErrorDetails(false);
  };

  const handleProcess = async () => {
    if (currentImages.length === 0 || !prompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setShowErrorDetails(false);
    
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('model', selectedModel);
      
      // Append all images with indexed names
      currentImages.forEach((imageData, index) => {
        formData.append(`image_${index}`, imageData.file);
      });

      console.log('Sending request to /api/mixer-edit...', {
        model: selectedModel,
        imageCount: currentImages.length,
        prompt: prompt.substring(0, 100) + '...'
      });
      
      const response = await fetch('/api/mixer-edit', {
        method: 'POST',
        body: formData,
      });

      const result: MixerResponse = await response.json();
      console.log('Mixer API response:', result);

      if (!response.ok || !result.success) {
        // Handle structured error response from backend
        if (result.error) {
          setError(result.error);
        } else {
          // Fallback for unexpected error format
          setError({
            type: 'unknown',
            title: 'Request Failed',
            message: 'Failed to process images with AI',
            details: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
            retryable: true,
            httpStatus: response.status
          });
        }
        return;
      }
      
      if (result.success && result.data) {
        setAiResponse(result.data.content || '');
        setResponseDetails(result.data);
        console.log('AI responded successfully:', {
          provider: result.data.provider,
          model: result.data.model,
          hasText: !!result.data.content,
          hasImages: result.data.hasImages,
          imagesCount: result.data.images?.length || 0
        });
        
        // Log image data for debugging
        if (result.data.hasImages && result.data.images) {
          console.log('Generated images found:', result.data.images.length);
          result.data.images.forEach((img, idx) => {
            console.log(`Image ${idx}:`, img);
          });
        }
      }
      
    } catch (error) {
      console.error('Mixer processing failed:', error);
      
      // Handle network or other client-side errors
      setError({
        type: 'network',
        title: 'Connection Error',
        message: 'Failed to connect to the server',
        details: error instanceof Error ? error.message : 'Network error occurred',
        code: 'NETWORK_ERROR',
        retryable: true,
        httpStatus: 0
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (error?.retryable) {
      handleProcess();
    }
  };

  const clearError = () => {
    setError(null);
    setShowErrorDetails(false);
  };

  const clearAllAndReset = () => {
    setPrompt('');
    setAiResponse('');
    setResponseDetails(null);
    setError(null);
    setShowErrorDetails(false);
  };

  const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors" suppressHydrationWarning={true}>
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              AI Editor Mixer
            </h1>
            <p className="text-xl text-white/70">
              Upload multiple images and process them with different AI models
            </p>
            <div className="mt-4 text-sm text-white/60">
              Supports up to 5 images simultaneously
            </div>
          </div>

          <div className="space-y-8">
            {/* Model Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 relative z-20">
              <div>
                <label className="block text-lg font-medium text-white mb-3">
                  Choose AI Model
                </label>
                <div className="relative z-30">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className={`w-full p-4 bg-gradient-to-r ${selectedModelInfo?.color} rounded-xl text-white font-medium flex items-center justify-between transition-all duration-200 hover:shadow-lg`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{selectedModelInfo?.name}</div>
                      <div className="text-white/80 text-sm">{selectedModelInfo?.description}</div>
                    </div>
                    <ChevronDown size={20} className={`transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/20 rounded-xl overflow-hidden z-40 shadow-xl">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full p-4 text-left hover:bg-white/10 transition-colors duration-200 ${
                            selectedModel === model.id ? 'bg-white/20' : ''
                          }`}
                        >
                          <div className="font-medium text-white">{model.name}</div>
                          <div className="text-white/70 text-sm">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <ImageManyDropzone 
                onImagesUpload={handleImagesUpload}
                currentImages={currentImages}
                maxImages={5}
              />
            </div>

            {currentImages.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-6">
                <div>
                  <label htmlFor="prompt" className="block text-lg font-medium text-white mb-3">
                    Describe what you want to do with your images
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you want to do with the images... (e.g., 'Make the driver to wear the watch', 'Change all backgrounds to sunset', 'Add sunglasses to all people', 'Analyze all images and find common elements')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-32 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 resize-none"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleProcess}
                  disabled={!prompt.trim() || isProcessing}
                  className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${selectedModelInfo?.color} hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 text-white border-0 transition-all duration-200`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={24} />
                      Processing {currentImages.length} image{currentImages.length !== 1 ? 's' : ''} with {selectedModelInfo?.provider?.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <Shuffle className="mr-2" size={24} />
                      Process {currentImages.length} Image{currentImages.length !== 1 ? 's' : ''} with AI
                    </>
                  )}
                </Button>

                {error && (
                  <div className="mt-4 space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      error.type === 'authentication' ? 'bg-yellow-500/20 border-yellow-500/30' :
                      error.type === 'rate_limit' ? 'bg-blue-500/20 border-blue-500/30' :
                      error.type === 'network' ? 'bg-orange-500/20 border-orange-500/30' :
                      error.type === 'content_filter' ? 'bg-purple-500/20 border-purple-500/30' :
                      error.type === 'length_limit' ? 'bg-indigo-500/20 border-indigo-500/30' :
                      error.type === 'model' ? 'bg-pink-500/20 border-pink-500/30' :
                      'bg-red-500/20 border-red-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`mt-0.5 flex-shrink-0 ${
                          error.type === 'authentication' ? 'text-yellow-300' :
                          error.type === 'rate_limit' ? 'text-blue-300' :
                          error.type === 'network' ? 'text-orange-300' :
                          error.type === 'content_filter' ? 'text-purple-300' :
                          error.type === 'length_limit' ? 'text-indigo-300' :
                          error.type === 'model' ? 'text-pink-300' :
                          'text-red-300'
                        }`} size={20} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold ${
                              error.type === 'authentication' ? 'text-yellow-200' :
                              error.type === 'rate_limit' ? 'text-blue-200' :
                              error.type === 'network' ? 'text-orange-200' :
                              error.type === 'content_filter' ? 'text-purple-200' :
                              error.type === 'length_limit' ? 'text-indigo-200' :
                              error.type === 'model' ? 'text-pink-200' :
                              'text-red-200'
                            }`}>
                              {error.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearError}
                              className="h-auto p-1 text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                          <p className="text-white/90">{error.message}</p>
                          
                          {error.details !== error.message && (
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowErrorDetails(!showErrorDetails)}
                                className="h-auto p-0 text-white/60 hover:text-white/80 text-sm"
                              >
                                {showErrorDetails ? (
                                  <><ChevronUp size={16} className="mr-1" /> Hide Details</>
                                ) : (
                                  <><ChevronDown size={16} className="mr-1" /> Show Details</>
                                )}
                              </Button>
                              {showErrorDetails && (
                                <div className="bg-black/20 rounded p-3 text-sm text-white/70 font-mono">
                                  <div className="space-y-1">
                                    <div>Code: {error.code}</div>
                                    <div>Type: {error.type}</div>
                                    <div>Status: {error.httpStatus}</div>
                                    <div className="mt-2">Details:</div>
                                    <div className="whitespace-pre-wrap">{error.details}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            {error.retryable && (
                              <Button
                                onClick={handleRetry}
                                disabled={isProcessing}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
                              >
                                <RefreshCw size={16} className="mr-2" />
                                {isProcessing ? 'Retrying...' : 'Try Again'}
                              </Button>
                            )}
                            <Button
                              onClick={clearAllAndReset}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
                            >
                              Start Over
                            </Button>
                          </div>
                          
                          {error.type === 'authentication' && (
                            <div className="mt-3 p-3 bg-yellow-500/10 rounded text-sm text-yellow-200">
                              💡 Check your API keys in the .env.local file
                            </div>
                          )}
                          {error.type === 'rate_limit' && (
                            <div className="mt-3 p-3 bg-blue-500/10 rounded text-sm text-blue-200">
                              ⏳ Please wait a moment before trying again
                            </div>
                          )}
                          {error.type === 'network' && (
                            <div className="mt-3 p-3 bg-orange-500/10 rounded text-sm text-orange-200">
                              🌐 Check your internet connection and try again
                            </div>
                          )}
                          {error.type === 'content_filter' && (
                            <div className="mt-3 p-3 bg-purple-500/10 rounded text-sm text-purple-200">
                              🚫 Try modifying your prompt or using different images that comply with content policies
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(aiResponse || (responseDetails?.hasImages && responseDetails.images)) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">AI Response</h3>
                <div className="space-y-6">
                  {aiResponse && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                    </div>
                  )}
                  
                  {responseDetails?.hasImages && responseDetails.images && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">Generated/Edited Images</h4>
                      <div className="space-y-4">
                        {responseDetails.images.map((image, index) => (
                          <div key={index} className="space-y-3">
                            {image.url && (
                              <div className="relative rounded-lg overflow-hidden bg-white/5">
                                <img 
                                  src={image.url} 
                                  alt={`Generated image ${index + 1}`}
                                  className="w-full h-auto max-h-[600px] object-contain bg-black/20"
                                  onError={(e) => {
                                    console.error('Image load error:', e);
                                    console.log('Image URL:', image.url);
                                  }}
                                />
                              </div>
                            )}
                            {image.b64_json && (
                              <div className="relative rounded-lg overflow-hidden bg-white/5">
                                <img 
                                  src={`data:image/png;base64,${image.b64_json}`} 
                                  alt={`Generated image ${index + 1}`}
                                  className="w-full h-auto max-h-[600px] object-contain bg-black/20"
                                  onError={(e) => {
                                    console.error('Base64 image load error:', e);
                                    console.log('Base64 length:', image.b64_json?.length);
                                  }}
                                />
                              </div>
                            )}
                            {image.revised_prompt && (
                              <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-sm text-white/70">
                                  <span className="font-medium">Revised prompt:</span> {image.revised_prompt}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {responseDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white/80 font-medium mb-2">Processing Information</h4>
                        <div className="space-y-1 text-white/60">
                          <p>Provider: {responseDetails.provider?.toUpperCase()}</p>
                          <p>Model: {responseDetails.model}</p>
                          <p>Response ID: {responseDetails.id}</p>
                          {responseDetails.finishReason && <p>Finish Reason: {responseDetails.finishReason}</p>}
                          <p>Images Processed: {responseDetails.originalFileNames.length}</p>
                        </div>
                      </div>
                      
                      {responseDetails.usage && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white/80 font-medium mb-2">Token Usage</h4>
                          <div className="space-y-1 text-white/60">
                            <p>Prompt: {responseDetails.usage.prompt_tokens}</p>
                            <p>Response: {responseDetails.usage.completion_tokens}</p>
                            <p>Total: {responseDetails.usage.total_tokens}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        const element = document.createElement('textarea');
                        element.value = aiResponse;
                        document.body.appendChild(element);
                        element.select();
                        document.execCommand('copy');
                        document.body.removeChild(element);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Copy Response
                    </Button>
                    <Button
                      onClick={clearAllAndReset}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Process More Images
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}