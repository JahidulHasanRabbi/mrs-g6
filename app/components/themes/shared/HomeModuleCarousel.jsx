"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * The homepage game list: every MRS module as a themed badge on one
 * horizontally swipeable rail, with arrow buttons and page dots.
 *
 * The rail pages by its own visible width rather than a fixed item count, so
 * the same component works from a 320px phone up to the 475px member column.
 */
export default function HomeModuleCarousel({ tiles, className = '' }) {
  const railRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const width = rail.clientWidth || 1;
    const count = Math.max(1, Math.ceil(rail.scrollWidth / width));
    setPages(count);
    // The last page is short of a full width, so scrollLeft never reaches
    // (count - 1) * width — pin the final dot to the end of the rail instead.
    const atEnd = rail.scrollLeft >= rail.scrollWidth - width - 1;
    setPage(atEnd ? count - 1 : Math.round(rail.scrollLeft / width));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [measure, tiles]);

  // A mouse wheel only ever emits deltaY, which a horizontal-only scroller
  // ignores — the page scrolls instead of the rail. React attaches wheel
  // passively, so this has to be a native listener to be able to preventDefault.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = rail.scrollWidth - rail.clientWidth;
      const stuck = event.deltaY < 0 ? rail.scrollLeft <= 0 : rail.scrollLeft >= max - 1;
      if (stuck) return; // at either end the page should scroll, not the rail
      event.preventDefault();
      rail.scrollLeft = Math.max(0, Math.min(max, rail.scrollLeft + event.deltaY));
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, []);

  // Touch panning is native; a mouse press-and-drag is not, so wire it up.
  const startDrag = useCallback((event) => {
    // Clear here, not in the click handler: a drag that ends off a badge fires
    // no click, and a flag left set would swallow the next real tap.
    draggedRef.current = false;
    const rail = railRef.current;
    if (!rail || event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = { x: event.clientX, left: rail.scrollLeft, moved: false };
  }, []);

  const moveDrag = useCallback((event) => {
    const drag = dragRef.current;
    const rail = railRef.current;
    if (!drag || !rail) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) <= 4) return;
      drag.moved = true;
      // Capture only once this is a real drag: capturing on pointerdown would
      // retarget the click to the rail, and a plain tap would stop opening it.
      rail.setPointerCapture(event.pointerId);
      rail.style.scrollSnapType = 'none'; // snapping fights a hand-driven scroll
    }
    rail.scrollLeft = drag.left - dx;
  }, []);

  const endDrag = useCallback((event) => {
    const drag = dragRef.current;
    const rail = railRef.current;
    if (!drag || !rail) return;
    dragRef.current = null;
    draggedRef.current = drag.moved;
    rail.style.scrollSnapType = '';
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  }, []);

  // A drag that ends over a badge must not also open it.
  const swallowDragClick = useCallback((event) => {
    if (!draggedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const scrollByPage = useCallback((direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth, behavior: 'smooth' });
  }, []);

  const goToPage = useCallback((index) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: index * rail.clientWidth, behavior: 'smooth' });
  }, []);

  return (
    <div className={`relative -mx-2 w-[calc(100%+16px)] ${className}`}>
      <div
        ref={railRef}
        onScroll={measure}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={swallowDragClick}
        onDragStart={(event) => event.preventDefault()}
        className="scrollbar-hide flex cursor-grab snap-x snap-mandatory gap-[6px] overflow-x-auto overscroll-x-contain py-1 active:cursor-grabbing"
      >
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.id}
            // Exactly four per row at any width: four cards plus three 6px gaps.
            className="w-[calc((100%-18px)/4)] shrink-0 snap-start"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={tile.href}
              aria-label={tile.label}
              draggable={false}
              className="block w-full select-none"
            >
              <img
                src={tile.image}
                alt={tile.label}
                draggable={false}
                loading={i < 4 ? 'eager' : 'lazy'}
                className="aspect-square w-full select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {pages > 1 && (
        <>
          <RailArrow direction={-1} onClick={() => scrollByPage(-1)} disabled={page === 0} />
          <RailArrow direction={1} onClick={() => scrollByPage(1)} disabled={page >= pages - 1} />

          {/* The dots sit on the skin artwork, which runs from near-black to
              bright gold, so they ride a dark track rather than trusting the
              backdrop for contrast. */}
          <div className="mt-2 flex justify-center">
            <div
              className="flex items-center gap-[6px] rounded-full px-[8px] py-[5px] backdrop-blur-[2px]"
              style={{ backgroundColor: 'var(--rail-dot-track)' }}
            >
              {Array.from({ length: pages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToPage(index)}
                  aria-label={`Go to page ${index + 1}`}
                  className={`h-[6px] rounded-full transition-all ${index === page ? 'w-[16px]' : 'w-[6px]'}`}
                  style={{
                    backgroundColor: index === page ? 'var(--rail-dot)' : 'var(--rail-dot-idle)',
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RailArrow({ direction, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction < 0 ? 'Previous games' : 'Next games'}
      className={`absolute top-[38%] z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#f2cb7a]/50 bg-black/45 text-[16px] leading-none text-[#f2cb7a] backdrop-blur-sm transition-opacity ${
        direction < 0 ? 'left-0' : 'right-0'
      } ${disabled ? 'pointer-events-none opacity-0' : 'opacity-80'}`}
    >
      {direction < 0 ? '‹' : '›'}
    </button>
  );
}
