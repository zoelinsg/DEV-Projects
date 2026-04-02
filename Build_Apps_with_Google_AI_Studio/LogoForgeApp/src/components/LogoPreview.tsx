import { useState } from 'react';
import { LogoResponse } from '../types/logo';
import { Download, Code } from 'lucide-react';

type Props = {
  data: LogoResponse;
  rawJson: string;
};

function sanitizeSvg(svg: string): string {
  // Minimal guard (not a full sanitizer)
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

export function LogoPreview({ data, rawJson }: Props) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const copyToClipboard = async (text: string, type: 'hex' | 'json') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'hex') {
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
      } else {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 1500);
      }
    } catch {
      if (type === 'json') {
        alert('Copy failed. Please copy from the Raw Response panel.');
      }
    }
  };

  const downloadSVG = () => {
    const blob = new Blob([data.svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.brandName.replace(/\s+/g, '_')}_logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{data.brandName}</h2>
          <p className="italic text-slate-500">{data.tagline}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadSVG}
            className="p-2 hover:bg-slate-100 rounded-lg text-blue-600"
            title="Download SVG"
            type="button"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => copyToClipboard(rawJson, 'json')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            title="Copy JSON"
            type="button"
          >
            <Code size={20} />
          </button>
        </div>
      </div>

      {/* SVG Preview + Optional Grid Toggle */}
      <div className="relative group mb-6">
        <div
          className={`aspect-square w-full max-w-[400px] mx-auto rounded-lg flex items-center justify-center border overflow-hidden
            ${showGrid ? 'bg-slate-100' : 'bg-slate-50'}
            border-dashed border-slate-300`}
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(data.svgMarkup) }}
        />
        <button
          onClick={() => setShowGrid((v) => !v)}
          className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-600"
          title="Toggle grid background"
          type="button"
        >
          {showGrid ? 'HIDE GRID' : 'SHOW GRID'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Color Palette
          </h3>
          <div className="flex gap-3 flex-wrap">
            {data.colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => copyToClipboard(color, 'hex')}
                className="group relative w-12 h-12 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title="Click to copy"
                type="button"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {copiedColor === color ? 'Copied!' : color}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800">The Story</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{data.brandStory}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800">Design Concept</h3>
          <p className="text-slate-600 text-sm leading-relaxed italic">{data.logoConcept}</p>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDebug((v) => !v)}
            className="text-xs text-slate-400 underline"
            type="button"
          >
            {showDebug ? 'Hide' : 'Show'} Raw Response
          </button>
          {copiedJson && <span className="text-xs text-emerald-600 font-semibold">JSON copied!</span>}
        </div>

        {showDebug && (
          <pre className="mt-2 p-3 bg-slate-900 text-green-400 text-[10px] rounded overflow-x-auto">
            {rawJson}
          </pre>
        )}
      </div>
    </div>
  );
}