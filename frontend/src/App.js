import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SCALE      = 20;   // 1 foot = 20px
const CANVAS_PAD = 32;
const API        = "/api/designs"; // proxied to http://localhost:5001

const FURNITURE_CATALOG = [
  { id: "bed",       label: "Bed",      icon: "🛏",  w: 80,  h: 60,  color: "#BFDBFE", stroke: "#1D4ED8" },
  { id: "sofa",      label: "Sofa",     icon: "🛋",  w: 90,  h: 45,  color: "#BBF7D0", stroke: "#15803D" },
  { id: "table",     label: "Table",    icon: "🪑",  w: 60,  h: 60,  color: "#FDE68A", stroke: "#B45309" },
  { id: "desk",      label: "Desk",     icon: "🖥",  w: 70,  h: 45,  color: "#FBCFE8", stroke: "#9D174D" },
  { id: "wardrobe",  label: "Wardrobe", icon: "🚪",  w: 50,  h: 75,  color: "#DDD6FE", stroke: "#6D28D9" },
  { id: "plant",     label: "Plant",    icon: "🪴",  w: 35,  h: 35,  color: "#A7F3D0", stroke: "#047857" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  app:       { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1E293B" },
  header:    { background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", display: "flex", alignItems: "center", gap: 12, height: 56 },
  headerTitle:    { fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" },
  headerSubtitle: { fontSize: 13, color: "#64748B" },
  main:      { display: "flex", gap: 20, padding: 20, alignItems: "flex-start", maxWidth: 1200, margin: "0 auto" },
  sidebar:   { width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 },
  card:      { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" },
  label:     { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", marginBottom: 10 },
  dimRow:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  dimLabel:  { fontSize: 13, color: "#475569" },
  dimInput:  { width: 70, padding: "5px 8px", border: "1px solid #CBD5E1", borderRadius: 7, fontSize: 13, color: "#1E293B", background: "#F8FAFC", outline: "none", textAlign: "center" },
  nameInput: { width: "100%", padding: "7px 10px", border: "1px solid #CBD5E1", borderRadius: 7, fontSize: 13, color: "#1E293B", background: "#F8FAFC", outline: "none", marginBottom: 10 },
  furBtn:    { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#334155", marginBottom: 4, textAlign: "left" },
  btnPrimary:   { width: "100%", padding: "9px 0", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 6 },
  btnSuccess:   { width: "100%", padding: "9px 0", background: "#15803D", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 6 },
  btnDanger:    { width: "100%", padding: "8px 0", background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, fontSize: 13, cursor: "pointer", marginBottom: 6 },
  btnSecondary: { width: "100%", padding: "8px 0", background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, cursor: "pointer" },
  badge:     { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "4px 10px", fontWeight: 500 },
  // Saved designs panel
  savedPanel:   { width: 240, flexShrink: 0 },
  savedItem:    (active) => ({ padding: "10px 12px", border: `1px solid ${active ? "#2563EB" : "#E2E8F0"}`, borderRadius: 8, marginBottom: 8, cursor: "pointer", background: active ? "#EFF6FF" : "#fff", transition: "all 0.15s" }),
  savedName:    { fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 2 },
  savedMeta:    { fontSize: 11, color: "#94A3B8" },
  // Canvas
  canvasOuter:  { flex: 1, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: CANVAS_PAD, overflow: "auto" },
  room:         { position: "relative", background: "#F0F9FF", border: "2.5px solid #2563EB", borderRadius: 4, cursor: "default", userSelect: "none" },
  dimNote:      { fontSize: 12, color: "#94A3B8", textAlign: "center", marginBottom: 6 },
  footnote:     { fontSize: 11, color: "#CBD5E1", textAlign: "center", marginTop: 10 },
  toast: (visible, type) => ({
    position: "fixed", bottom: 28, right: 28,
    background: type === "error" ? "#991B1B" : "#166534",
    color: type === "error" ? "#FEE2E2" : "#DCFCE7",
    padding: "10px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500,
    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: "all 0.25s ease", pointerEvents: "none", zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: FurnitureItem — a single draggable box on the canvas
// ─────────────────────────────────────────────────────────────────────────────
function FurnitureItem({ item, selected, onMouseDown, onSelect }) {
  return (
    <div
      onMouseDown={(e) => { onSelect(item.uid); onMouseDown(e, item.uid); }}
      style={{
        position: "absolute", left: item.x, top: item.y,
        width: item.w, height: item.h,
        background: item.color,
        border: `2px solid ${selected ? "#EF4444" : item.stroke}`,
        borderRadius: 6, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: "grab", userSelect: "none", gap: 2,
        boxShadow: selected ? "0 0 0 3px rgba(239,68,68,0.25)" : "0 1px 3px rgba(0,0,0,0.08)",
        zIndex: selected ? 10 : 1,
      }}
    >
      <span style={{ fontSize: 18 }}>{item.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: item.stroke }}>{item.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Toast — brief notification popup
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ visible, message, type }) {
  return <div style={S.toast(visible, type)}>{message}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: SavedDesigns — right panel listing all saved designs from MongoDB
// ─────────────────────────────────────────────────────────────────────────────
function SavedDesigns({ designs, activeId, onLoad, onDelete, loading }) {
  return (
    <div style={S.savedPanel}>
      <div style={S.card}>
        <p style={S.label}>Saved Designs ({designs.length})</p>
        {loading && <p style={{ fontSize: 13, color: "#94A3B8" }}>Loading...</p>}
        {!loading && designs.length === 0 && (
          <p style={{ fontSize: 13, color: "#CBD5E1" }}>No saved designs yet.</p>
        )}
        {designs.map((d) => (
          <div key={d._id} style={S.savedItem(d._id === activeId)} onClick={() => onLoad(d)}>
            <p style={S.savedName}>🏠 {d.name}</p>
            <p style={S.savedMeta}>
              {d.room.length} × {d.room.width} ft · {d.furniture.length} items
            </p>
            <p style={S.savedMeta}>{new Date(d.createdAt).toLocaleDateString()}</p>
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(d._id); }}
              style={{ marginTop: 6, fontSize: 11, color: "#B91C1C", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ✕ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: App — main entry point, manages all state
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Room & canvas state ────────────────────────────────────────────────────
  const [roomLength, setRoomLength] = useState(14);
  const [roomWidth,  setRoomWidth]  = useState(12);
  const [items,      setItems]      = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [designName, setDesignName] = useState("My Room Design");
  const [idCounter,  setIdCounter]  = useState(0);

  // ── MongoDB state ──────────────────────────────────────────────────────────
  const [savedDesigns, setSavedDesigns] = useState([]);  // list of designs from DB
  const [activeId,     setActiveId]     = useState(null); // currently loaded design _id
  const [dbLoading,    setDbLoading]    = useState(false);

  // ── Toast notification ─────────────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const canvasRef = useRef(null);
  const dragging  = useRef(null);

  const cW = roomLength * SCALE;
  const cH = roomWidth  * SCALE;

  // ── Show toast helper ──────────────────────────────────────────────────────
  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  }

  // ── Fetch all saved designs from MongoDB on mount ──────────────────────────
  useEffect(() => {
    fetchDesigns();
  }, []);

  async function fetchDesigns() {
    setDbLoading(true);
    try {
      const res  = await fetch(API);
      const data = await res.json();
      setSavedDesigns(data);
    } catch {
      showToast("Could not reach server. Is the backend running?", "error");
    } finally {
      setDbLoading(false);
    }
  }

  // ── Save new design to MongoDB ─────────────────────────────────────────────
  async function handleSave() {
    const payload = {
      name: designName || "My Room Design",
      room: { length: roomLength, width: roomWidth },
      furniture: items.map(({ uid, label, icon, x, y, w, h }) => ({
        uid, label, icon,
        position: { x, y },
        size: { w, h },
        positionFt: { x: +(x / SCALE).toFixed(1), y: +(y / SCALE).toFixed(1) },
      })),
    };

    try {
      // If a design is already loaded, update it; otherwise create new
      const method = activeId ? "PUT"  : "POST";
      const url    = activeId ? `${API}/${activeId}` : API;

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();

      if (!res.ok) throw new Error(saved.error || "Save failed");

      setActiveId(saved._id);
      showToast(activeId ? "✓ Design updated in MongoDB!" : "✓ Design saved to MongoDB!");
      fetchDesigns(); // refresh the saved list
    } catch (err) {
      showToast("Save failed: " + err.message, "error");
    }
  }

  // ── Load a design from MongoDB into the canvas ─────────────────────────────
  function handleLoad(design) {
    setRoomLength(design.room.length);
    setRoomWidth(design.room.width);
    setDesignName(design.name);
    setActiveId(design._id);

    // Rebuild items array — restore color/stroke from catalog by matching id prefix
    const loadedItems = design.furniture.map((f) => {
      const catalog = FURNITURE_CATALOG.find((c) => f.uid.startsWith(c.id)) || {};
      return {
        ...catalog,
        uid:   f.uid,
        label: f.label,
        icon:  f.icon,
        x:     f.position.x,
        y:     f.position.y,
        w:     f.size.w,
        h:     f.size.h,
      };
    });

    setItems(loadedItems);
    setSelectedId(null);
    showToast(`Loaded "${design.name}"`);
  }

  // ── Delete a design from MongoDB ───────────────────────────────────────────
  async function handleDeleteDesign(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      if (activeId === id) {
        handleNewDesign(); // reset canvas if we deleted the current design
      }
      showToast("Design deleted.");
      fetchDesigns();
    } catch (err) {
      showToast("Delete failed: " + err.message, "error");
    }
  }

  // ── Start a fresh design ───────────────────────────────────────────────────
  function handleNewDesign() {
    setItems([]);
    setSelectedId(null);
    setActiveId(null);
    setDesignName("My Room Design");
    setRoomLength(14);
    setRoomWidth(12);
  }

  // ── Add furniture centered in room ─────────────────────────────────────────
  function handleAddFurniture(f) {
    const uid = `${f.id}_${idCounter}`;
    setIdCounter((c) => c + 1);
    const x = Math.max(0, Math.min(cW - f.w, Math.round((cW - f.w) / 2)));
    const y = Math.max(0, Math.min(cH - f.h, Math.round((cH - f.h) / 2)));
    setItems((prev) => [...prev, { ...f, uid, x, y }]);
    setSelectedId(uid);
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleMouseDown(e, uid) {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const item = items.find((i) => i.uid === uid);
    dragging.current = { uid, offsetX: e.clientX - rect.left - item.x, offsetY: e.clientY - rect.top - item.y };
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { uid, offsetX, offsetY } = dragging.current;
    setItems((prev) => prev.map((item) => {
      if (item.uid !== uid) return item;
      const nx = Math.max(0, Math.min(cW - item.w, e.clientX - rect.left - offsetX));
      const ny = Math.max(0, Math.min(cH - item.h, e.clientY - rect.top - offsetY));
      return { ...item, x: Math.round(nx), y: Math.round(ny) };
    }));
  }, [cW, cH]);

  const handleMouseUp = useCallback(() => { dragging.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── Dimension change (resets layout) ──────────────────────────────────────
  function handleDimChange(setter) {
    return (e) => {
      const val = Math.min(30, Math.max(5, Number(e.target.value) || 10));
      setter(val);
      setItems([]);
      setSelectedId(null);
    };
  }

  // ── Grid lines ─────────────────────────────────────────────────────────────
  function renderGrid() {
    const lines = [];
    for (let x = SCALE; x < cW; x += SCALE)
      lines.push(<div key={`v${x}`} style={{ position: "absolute", left: x, top: 0, width: 1, height: cH, background: "#BFDBFE", opacity: 0.5 }} />);
    for (let y = SCALE; y < cH; y += SCALE)
      lines.push(<div key={`h${y}`} style={{ position: "absolute", top: y, left: 0, height: 1, width: cW, background: "#BFDBFE", opacity: 0.5 }} />);
    return lines;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>

      {/* Header */}
      <header style={S.header}>
        <span style={{ fontSize: 24 }}>🏠</span>
        <span style={S.headerTitle}>Vision2Room</span>
        <span style={S.headerSubtitle}>— 2D Room Layout Designer · MongoDB Edition</span>
        {activeId && (
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#15803D", background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 20, padding: "3px 10px" }}>
            ● Synced to DB
          </span>
        )}
      </header>

      <div style={S.main}>

        {/* ── Left Sidebar ───────────────────────────────────────── */}
        <aside style={S.sidebar}>

          {/* Design name */}
          <div style={S.card}>
            <p style={S.label}>Design Name</p>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              style={S.nameInput}
              placeholder="Name your design..."
            />
          </div>

          {/* Room size */}
          <div style={S.card}>
            <p style={S.label}>Room Size</p>
            <div style={S.dimRow}>
              <span style={S.dimLabel}>Length (ft)</span>
              <input type="number" min={5} max={30} value={roomLength} onChange={handleDimChange(setRoomLength)} style={S.dimInput} />
            </div>
            <div style={S.dimRow}>
              <span style={S.dimLabel}>Width (ft)</span>
              <input type="number" min={5} max={30} value={roomWidth} onChange={handleDimChange(setRoomWidth)} style={S.dimInput} />
            </div>
          </div>

          {/* Furniture */}
          <div style={S.card}>
            <p style={S.label}>Add Furniture</p>
            {FURNITURE_CATALOG.map((f) => (
              <button key={f.id} style={S.furBtn} onClick={() => handleAddFurniture(f)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <span style={{ fontSize: 18 }}>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>

          {/* Selected item */}
          {selectedId && (
            <div style={S.card}>
              <p style={S.label}>Selected</p>
              <button style={S.btnDanger}
                onClick={() => { setItems((p) => p.filter((i) => i.uid !== selectedId)); setSelectedId(null); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#FEF2F2")}
              >✕ Remove Item</button>
            </div>
          )}

          {/* Actions */}
          <div style={S.card}>
            <p style={S.label}>Actions</p>
            <div style={{ marginBottom: 10 }}>
              <span style={S.badge}>◼ {items.length} item{items.length !== 1 ? "s" : ""}</span>
            </div>
            {/* Save to MongoDB */}
            <button style={S.btnSuccess} onClick={handleSave}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#166534")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#15803D")}
            >
              {activeId ? "🔄 Update in MongoDB" : "💾 Save to MongoDB"}
            </button>
            {/* New design */}
            <button style={S.btnSecondary} onClick={handleNewDesign}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            >✦ New Design</button>
          </div>

        </aside>

        {/* ── Canvas ─────────────────────────────────────────────── */}
        <div style={S.canvasOuter}>
          <div style={S.dimNote}>↔ {roomLength} ft</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, color: "#94A3B8", whiteSpace: "nowrap" }}>
              ↕ {roomWidth} ft
            </div>
            <div ref={canvasRef} style={{ ...S.room, width: cW, height: cH }}
              onClick={(e) => { if (e.target === canvasRef.current) setSelectedId(null); }}
            >
              {renderGrid()}
              {items.map((item) => (
                <FurnitureItem key={item.uid} item={item}
                  selected={item.uid === selectedId}
                  onMouseDown={handleMouseDown}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          </div>
          <div style={S.footnote}>Each grid square = 1 ft × 1 ft · Drag to reposition · Click to select</div>
        </div>

        {/* ── Saved Designs Panel ─────────────────────────────────── */}
        <SavedDesigns
          designs={savedDesigns}
          activeId={activeId}
          onLoad={handleLoad}
          onDelete={handleDeleteDesign}
          loading={dbLoading}
        />

      </div>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </div>
  );
}
