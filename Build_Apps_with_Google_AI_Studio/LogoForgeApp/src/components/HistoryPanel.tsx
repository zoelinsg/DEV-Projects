import { HistoryItem } from '../types/logo';
import { Clock, Trash2 } from 'lucide-react';

type Props = {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
};

function sanitizeSvg(svg: string): string {
  // Minimal guard (not a full sanitizer)
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

function toThumbnailSvg(svgMarkup: string, size = 40): string {
  let svg = sanitizeSvg(svgMarkup)
    .replace(/width\s*=\s*["']\d+["']/i, `width="${size}"`)
    .replace(/height\s*=\s*["']\d+["']/i, `height="${size}"`);

  if (!/width\s*=\s*["']\d+["']/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, `<svg width="${size}"`);
  }
  if (!/height\s*=\s*["']\d+["']/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, `<svg height="${size}"`);
  }

  return svg;
}

export function HistoryPanel({ items, onSelect, onClear }: Props) {
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Clock size={14} /> Recent History
        </h3>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Clear history"
          type="button"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-3 transition-all group"
            title="Load this result"
            type="button"
          >
            <div
              className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: toThumbnailSvg(item.svgMarkup, 40) }}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-700">{item.brandName}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}