import { useMemo, useState } from "react";
import "./App.css";
import { INGREDIENTS } from "./data/ingredients";

const FLAVORS = [
  { key: "salty", label: "Salty", emoji: "🧂" },
  { key: "sweet", label: "Sweet", emoji: "🍭" },
  { key: "spicy", label: "Spicy", emoji: "🌶️" },
  { key: "sour", label: "Sour", emoji: "🍋" },
];

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedFlavors, setSelectedFlavors] = useState([]);

  const [q, setQ] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const toggleIngredient = (name) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const toggleFlavor = (key) => {
    setSelectedFlavors((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const filteredIngredients = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return INGREDIENTS.filter((name) => {
      if (onlySelected && !selectedIngredients.includes(name)) return false;
      if (keyword && !name.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }, [q, onlySelected, selectedIngredients]);

  const pickRandom = (n = 5) => {
    const pool = [...INGREDIENTS].sort(() => Math.random() - 0.5);
    setSelectedIngredients(pool.slice(0, n));
  };

  const generate = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedIngredients,
          selectedFlavors, 
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedIngredients([]);
    setSelectedFlavors([]);
    setResult(null);
    setError("");
    setQ("");
    setOnlySelected(false);
  };

  return (
    <div className="page">
      <header className="header">
        <h1>☠️ Dark Dish Lab</h1>
        <p>Pick hated ingredients + flavors. We do the rest (for worse).</p>
      </header>

      <section className="card">
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>1) Pick hated ingredients</h2>

          <label className="chip" style={{ userSelect: "none" }}>
            <input
              type="checkbox"
              checked={onlySelected}
              onChange={(e) => setOnlySelected(e.target.checked)}
            />
            <span>Show selected only</span>
          </label>
        </div>

        <div className="row" style={{ marginTop: 10, gap: 10 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ingredients… (e.g., durian)"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #2a2a2a",
              background: "transparent",
              color: "inherit",
            }}
          />
          <button className="secondary" disabled={loading} onClick={() => pickRandom(5)}>
            🎲 Random 5
          </button>
        </div>

        {selectedIngredients.length > 0 && (
          <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" }}>
            {selectedIngredients.map((name) => (
              <button
                key={name}
                className="badge"
                onClick={() => toggleIngredient(name)}
                title="Click to remove"
                type="button"
              >
                {name} ✕
              </button>
            ))}
          </div>
        )}

        <div className="ingredientsPanel">
          <div className="grid">
            {filteredIngredients.map((name) => (
              <label key={name} className="chip">
                <input
                  type="checkbox"
                  checked={selectedIngredients.includes(name)}
                  onChange={() => toggleIngredient(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="meta">
          Selected ingredients: <b>{selectedIngredients.length}</b>
        </div>
      </section>

      <section className="card">
        <h2>2) Flavor chaos</h2>
        <div className="row">
          {FLAVORS.map((f) => (
            <label key={f.key} className="chip">
              <input
                type="checkbox"
                checked={selectedFlavors.includes(f.key)}
                onChange={() => toggleFlavor(f.key)}
              />
              <span>
                {f.emoji} {f.label}
              </span>
            </label>
          ))}
        </div>
        <div className="meta">
          Selected flavors:{" "}
          <b>{selectedFlavors.length ? selectedFlavors.join(", ") : "none (random)"}</b>
        </div>
      </section>

      <section className="actions">
        <button disabled={loading} onClick={generate}>
          {loading ? "Generating..." : "🎲 Generate"}
        </button>
        <button className="secondary" disabled={loading} onClick={reset}>
          Reset
        </button>
      </section>

      {error && (
        <section className="card error">
          <b>⚠️ {error}</b>
        </section>
      )}

      {result && (
        <section className="card result">
          <div className="resultHead">
            <h2>🔥 Result</h2>
            <div className="badges">
              <span className="badge">{result.type}</span>
              <span className="badge">{result.rarity}</span>
              <span className="badge">{result.horrorScore}/100</span>
              <span className="badge">{result.usedAi ? "AI" : "No-AI"}</span>
            </div>
          </div>
          <pre className="pre">{result.text}</pre>
        </section>
      )}
    </div>
  );
}