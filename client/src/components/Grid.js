'use client';

import { useSocket } from '@/context/SocketContext';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Move, Mouse } from 'lucide-react';

export default function Grid() {
  const { grid, gridSize, user, claimBlock, cooldownActive } = useSocket();
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (viewportRef.current && gridSize > 0) {
      const vw = viewportRef.current.clientWidth;
      const vh = viewportRef.current.clientHeight;
      const cellSize = 22;
      const gap = 2;
      const padding = 40;
      const gridPx = gridSize * (cellSize + gap) + padding * 2;
      const x = (vw - gridPx) / 2;
      const y = (vh - gridPx) / 2;
      setPan({ x: Math.max(x, 20), y: Math.max(y, 20) });
    }
  }, [gridSize]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      return Math.min(3, Math.max(0.3, z + delta));
    });
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (vp) {
      vp.addEventListener('wheel', handleWheel, { passive: false });
      return () => vp.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleMouseDown = useCallback(
    (e) => {
      if (e.target.classList.contains('cell')) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e) => {
      // Tooltip tracking
      if (e.target.classList.contains('cell')) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        if (!isNaN(row) && !isNaN(col) && grid[row] && grid[row][col]) {
          const cell = grid[row][col];
          setTooltip({
            x: e.clientX + 12,
            y: e.clientY - 10,
            owner: cell.owner,
            color: cell.color,
            row,
            col,
          });
        }
      } else {
        setTooltip(null);
      }

      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      });
    },
    [isDragging, grid]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCellClick = useCallback(
    (row, col) => {
      claimBlock(row, col);
    },
    [claimBlock]
  );

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.2));
  const zoomOut = () => setZoom((z) => Math.max(0.3, z - 0.2));
  const zoomReset = () => setZoom(1);

  if (!grid || grid.length === 0) return null;

  return (
    <>
      <div className="grid-header">
        <div className="grid-title">
          <h2>Battle Grid</h2>
          <span className="badge">{gridSize}×{gridSize}</span>
        </div>
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out" id="zoom-out-btn">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={zoomIn} title="Zoom In" id="zoom-in-btn">
            <ZoomIn size={16} />
          </button>
          <button className="zoom-btn" onClick={zoomReset} title="Reset Zoom" id="zoom-reset-btn">
            <Maximize size={14} />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="grid-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setTooltip(null);
        }}
        id="grid-viewport"
      >
        <div
          ref={canvasRef}
          className="grid-canvas"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <div
            className="grid-wrapper"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, var(--cell-size))`,
              gridTemplateRows: `repeat(${gridSize}, var(--cell-size))`,
            }}
          >
            {grid.map((row, ri) =>
              row.map((cell, ci) => {
                const isMine = cell.ownerId === user?.id;
                const isClaimed = !!cell.owner;
                const classes = [
                  'cell',
                  isClaimed ? 'claimed' : 'empty',
                  isMine ? 'mine' : '',
                  cell.justClaimed ? 'just-claimed' : '',
                ].join(' ');

                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={classes}
                    data-row={ri}
                    data-col={ci}
                    style={
                      isClaimed
                        ? { backgroundColor: cell.color, color: cell.color }
                        : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCellClick(ri, ci);
                    }}
                  >
                    {cell.justClaimed && <span className="ripple" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="cell-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.owner ? (
            <>
              <span
                className="user-color-dot"
                style={{ backgroundColor: tooltip.color }}
              />
              <span className="owner-name">{tooltip.owner}</span>
              <br />
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Unclaimed</span>
          )}
          <span className="coords">
            [{tooltip.row}, {tooltip.col}]
          </span>
        </div>
      )}

      <div className={`cooldown-toast ${cooldownActive ? 'show' : ''}`}>
        ⏱ Too fast! Cooldown active...
      </div>

      <div className="help-banner">
        <div className="help-item">
          <span className="help-key"><MousePointer2 size={12} /></span> Claim block
        </div>
        <div className="help-item">
          <span className="help-key"><Mouse size={12} /></span> Zoom
        </div>
        <div className="help-item">
          <span className="help-key"><Move size={12} /></span> Pan
        </div>
        <div className="help-item">
          <span className="help-key"><Maximize size={12} /></span> Reset view
        </div>
      </div>
    </>
  );
}
