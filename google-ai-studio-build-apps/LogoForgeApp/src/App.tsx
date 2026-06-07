import { useMemo, useState } from 'react';
import { LogoInputs, LogoResponse } from './types/logo';
import { generateLogo } from './services/geminiService';
import { LogoPreview } from './components/LogoPreview';
import { Loader2, Sparkles, Layers } from 'lucide-react';

export default function App() {
  const [inputs, setInputs] = useState<LogoInputs>({
    brandName: '',
    industry: '',
    style: 'minimal',
    keywords: '',
    count: 1,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<1 | 3 | null>(null);

  const [results, setResults] = useState<LogoResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (count: 1 | 3) => {
    setLoading(true);
    setLoadingMode(count);
    setError(null);
    setActiveIndex(0);

    try {
      const res = await generateLogo({ ...inputs, count });

      if (res.data) {
        setResults(res.data);
        setRawJson(res.raw);
      } else {
        setError(res.error || 'Generation failed.');
      }
    } finally {
      setLoading(false);
      setLoadingMode(null);
    }
  };

  const presets = useMemo(
    () => [
      {
        label: 'Preset 1',
        value: { brandName: 'LogoForge', industry: 'AI tools', style: 'minimal' as const, keywords: 'clean, geometric' },
      },
      {
        label: 'Preset 2',
        value: { brandName: 'RetroBite', industry: 'burger shop', style: 'retro' as const, keywords: 'badge, bold, vintage' },
      },
      {
        label: 'Preset 3',
        value: { brandName: 'PlayPals', industry: 'kids toys', style: 'playful' as const, keywords: 'rounded, bubbly, colorful' },
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
            <h1 className="text-2xl font-black mb-6 text-indigo-600 tracking-tight">LogoForge</h1>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Brand Name</label>
                <input
                  value={inputs.brandName}
                  onChange={(e) => setInputs({ ...inputs, brandName: e.target.value })}
                  placeholder="e.g. Sunflow Studio"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Industry</label>
                <input
                  value={inputs.industry}
                  onChange={(e) => setInputs({ ...inputs, industry: e.target.value })}
                  placeholder="e.g. design agency, bakery, fintech"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Style</label>
                <select
                  value={inputs.style}
                  onChange={(e) => setInputs({ ...inputs, style: e.target.value as LogoInputs['style'] })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="minimal">minimal</option>
                  <option value="retro">retro</option>
                  <option value="playful">playful</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Keywords (optional)</label>
                <input
                  value={inputs.keywords}
                  onChange={(e) => setInputs({ ...inputs, keywords: e.target.value })}
                  placeholder="e.g. warm, modern, leaf, geometric"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      setInputs({
                        ...inputs,
                        brandName: p.value.brandName,
                        industry: p.value.industry,
                        style: p.value.style,
                        keywords: p.value.keywords,
                      })
                    }
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => handleGenerate(1)}
                disabled={loading}
                className="bg-indigo-600 text-white font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                type="button"
              >
                {loading && loadingMode === 1 ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Single
              </button>
              <button
                onClick={() => handleGenerate(3)}
                disabled={loading}
                className="bg-slate-800 text-white font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                type="button"
              >
                {loading && loadingMode === 3 ? <Loader2 className="animate-spin" size={16} /> : <Layers size={16} />}
                3 Variations
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          {results.length > 0 && (
            <div className="space-y-6">
              {results.length > 1 && (
                <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
                  {results.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                        activeIndex === idx ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      type="button"
                    >
                      Variation {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              <LogoPreview data={results[activeIndex]} rawJson={rawJson} />
            </div>
          )}

          {!results.length && !loading && (
            <div className="h-full min-h-[500px] border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300">
              <Sparkles size={64} className="mb-4 opacity-10" />
              <p className="text-xl font-medium">Ready to forge your brand</p>
            </div>
          )}

          {loading && (
            <div className="mt-6 text-slate-400 text-sm flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Generating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}