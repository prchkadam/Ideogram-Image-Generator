import React, { useState } from 'react';

const API_URL = "https://uncensored-idk--ideogram-v4-generator-ideogramservice-fa-ce0501.modal.run";

export const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error (${response.status})`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.image) {
        setImage(data.image);
      } else {
        throw new Error('Failed to retrieve image from backend response.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center">Ideogram 4 Image Generator</h1>

        {/* Input & Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-1 text-slate-300">
              Prompt
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed font-medium text-white transition"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {/* Loading State Indicator */}
        {loading && (
          <div className="p-6 rounded-lg bg-slate-800 border border-slate-700 text-center space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm text-slate-300">Generating image on Modal GPU worker... Please wait.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Rendered Output Image */}
        {image && !loading && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Generated Result</h2>
            <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-950 p-2">
              <img src={image} alt={prompt} className="w-full h-auto rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
