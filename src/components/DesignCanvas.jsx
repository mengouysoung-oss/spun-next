'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * A lightweight canvas-based design tool: users can add text layers and
 * upload image layers, then drag/resize them over a product mockup.
 * No external canvas library — plain HTML5 canvas + pointer events.
 */
export default function DesignCanvas({ baseColor = '#F6F3EA', onChange }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [layers, setLayers] = useState([]); // {id, type:'text'|'image', text, color, x,y,scale, img}
  const [selectedId, setSelectedId] = useState(null);
  const [textInput, setTextInput] = useState('SPUN');
  const [textColor, setTextColor] = useState('#141210');
  const dragRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Base garment silhouette (simple tee shape) so layers have visual context
    ctx.fillStyle = baseColor;
    ctx.strokeStyle = '#14120F';
    ctx.lineWidth = 3;
    roundedTeeShape(ctx, width, height);
    ctx.fill();
    ctx.stroke();

    // Print zone guide
    const pz = printZone(width, height);
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(20,18,15,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pz.x, pz.y, pz.w, pz.h);
    ctx.setLineDash([]);

    for (const layer of layers) {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.scale(layer.scale, layer.scale);
      if (layer.type === 'text') {
        ctx.fillStyle = layer.color;
        ctx.font = "700 32px 'Space Grotesk', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(layer.text, 0, 0);
      } else if (layer.type === 'image' && layer.img) {
        const w = layer.img.width * 0.35;
        const h = layer.img.height * 0.35;
        ctx.drawImage(layer.img, -w / 2, -h / 2, w, h);
      }
      if (layer.id === selectedId) {
        ctx.strokeStyle = '#5B3CC4';
        ctx.lineWidth = 1.5 / layer.scale;
        ctx.setLineDash([4, 4]);
        const s = layer.type === 'text' ? 90 : (layer.img.width * 0.35);
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }, [layers, selectedId, baseColor]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    onChange?.({
      layers: layers.map(({ img, ...rest }) => rest),
      preview: canvasRef.current?.toDataURL('image/png'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  function roundedTeeShape(ctx, w, h) {
    // A stylized tee: body rectangle with sleeve notches and neckline
    const bodyX = w * 0.22, bodyY = h * 0.18, bodyW = w * 0.56, bodyH = h * 0.72;
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(bodyX - w * 0.14, bodyY + h * 0.12);
    ctx.lineTo(bodyX - w * 0.02, bodyY + h * 0.2);
    ctx.lineTo(bodyX, bodyY + h * 0.1);
    ctx.lineTo(bodyX, bodyY + bodyH);
    ctx.lineTo(bodyX + bodyW, bodyY + bodyH);
    ctx.lineTo(bodyX + bodyW, bodyY + h * 0.1);
    ctx.lineTo(bodyX + bodyW + w * 0.02, bodyY + h * 0.2);
    ctx.lineTo(bodyX + bodyW + w * 0.14, bodyY + h * 0.12);
    ctx.lineTo(bodyX + bodyW, bodyY);
    ctx.quadraticCurveTo(bodyX + bodyW * 0.5, bodyY + h * 0.09, bodyX, bodyY);
    ctx.closePath();
  }

  function printZone(w, h) {
    return { x: w * 0.32, y: h * 0.3, w: w * 0.36, h: h * 0.32 };
  }

  function addText() {
    const canvas = canvasRef.current;
    const id = crypto.randomUUID();
    const layer = { id, type: 'text', text: textInput || 'SPUN', color: textColor, x: canvas.width / 2, y: canvas.height / 2, scale: 1 };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(id);
  }

  function addImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const id = crypto.randomUUID();
        const layer = { id, type: 'image', img, x: canvas.width / 2, y: canvas.height / 2, scale: 1 };
        setLayers((prev) => [...prev, layer]);
        setSelectedId(id);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function hitTest(x, y) {
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      const s = (l.type === 'text' ? 90 : (l.img.width * 0.35)) * l.scale;
      if (Math.abs(x - l.x) < s / 2 && Math.abs(y - l.y) < s / 2) return l.id;
    }
    return null;
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = e.touches ? e.touches[0] : e;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  }

  function onPointerDown(e) {
    const { x, y } = getPos(e);
    const id = hitTest(x, y);
    setSelectedId(id);
    if (id) dragRef.current = { id, offsetX: x - layers.find(l => l.id === id).x, offsetY: y - layers.find(l => l.id === id).y };
  }
  function onPointerMove(e) {
    if (!dragRef.current) return;
    const { x, y } = getPos(e);
    const { id, offsetX, offsetY } = dragRef.current;
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, x: x - offsetX, y: y - offsetY } : l)));
  }
  function onPointerUp() { dragRef.current = null; }

  function resizeSelected(delta) {
    setLayers((prev) => prev.map((l) => (l.id === selectedId ? { ...l, scale: Math.max(0.3, Math.min(3, l.scale + delta)) } : l)));
  }
  function deleteSelected() {
    setLayers((prev) => prev.filter((l) => l.id !== selectedId));
    setSelectedId(null);
  }

  return (
    <div className="studio">
      <div className="studio-canvas-wrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          width={480}
          height={600}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
      </div>

      <div className="studio-row">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Add your own text"
          maxLength={20}
        />
        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} title="Text color" />
        <button type="button" className="btn btn-sm btn-outline" onClick={addText}>Add text</button>
      </div>

      <div className="studio-toolbar">
        <label className="btn btn-sm btn-outline file-btn">
          Upload graphic
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files[0] && addImage(e.target.files[0])} />
        </label>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => resizeSelected(0.15)} disabled={!selectedId}>Bigger</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => resizeSelected(-0.15)} disabled={!selectedId}>Smaller</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={deleteSelected} disabled={!selectedId}>Delete layer</button>
      </div>
      <p className="studio-hint">Drag layers onto the dashed print zone. Tap a layer to select, resize, or delete it.</p>
    </div>
  );
}
