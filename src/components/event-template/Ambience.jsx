import { useMemo } from "react";
import "./Ambience.css";

// photos: array of public image URLs (from Supabase Storage), passed in by the
// event renderer. Falls back to just the ambient "motes" if no photos are given.
export default function Ambience({ photos = [] }) {
  const fallingPhotos = useMemo(
    () =>
      photos.map((image, i) => {
        // depth simulates distance: farther photos are smaller, dimmer,
        // blurrier and slower — nearer ones are crisper and faster.
        const depth = Math.random();
        const swing = 60 + Math.random() * 90;
        return {
          id: i,
          image,
          left: Math.random() * 92,
          width: 56 + depth * 70,
          rotateStart: -16 + Math.random() * 32,
          driftA: (Math.random() > 0.5 ? 1 : -1) * swing,
          driftB: (Math.random() > 0.5 ? 1 : -1) * swing * 0.6,
          rotA: -10 - Math.random() * 14,
          rotB: 10 + Math.random() * 14,
          duration: 30 - depth * 12 + Math.random() * 6,
          delay: -(Math.random() * 42),
          blur: (1 - depth) * 2.2,
          peakOpacity: 0.1 + depth * 0.16,
        };
      }),
    [photos],
  );

  const motes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 16 + Math.random() * 14,
        size: 2 + Math.random() * 3,
        drift: (Math.random() - 0.5) * 60,
      })),
    [],
  );

  return (
    <div className="ambience" aria-hidden="true">
      {/* {fallingPhotos.length > 0 && (
        <div className="falling-memories">
          {fallingPhotos.map((photo) => (
            <div
              key={photo.id}
              className="memory-card"
              style={{
                left: `${photo.left}%`,
                width: `${photo.width}px`,
                "--rotate-start": `${photo.rotateStart}deg`,
                "--drift-a": `${photo.driftA}px`,
                "--drift-b": `${photo.driftB}px`,
                "--rot-a": `${photo.rotA}deg`,
                "--rot-b": `${photo.rotB}deg`,
                "--blur": `${photo.blur}px`,
                "--peak-opacity": photo.peakOpacity,
                animationDuration: `${photo.duration}s`,
                animationDelay: `${photo.delay}s`,
              }}
            >
              <img src={photo.image} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      )} */}
      {motes.map((m) => (
        <span
          key={m.id}
          className="mote"
          style={{
            left: `${m.left}%`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            "--drift": `${m.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
