import { useMemo } from "react";
import "./Ambience.css";

export default function Ambience({ photos = [] }) {
  // Every photo gets its own falling lane — natural aspect ratio,
  // width varies slightly so the rain doesn't feel mechanical.
  const fallingPhotos = useMemo(
    () =>
      photos.map((image, i) => ({
        id: i,
        image,
        left: 5 + Math.random() * 90, // keep off the very edge
        width: 60 + Math.random() * 50,
        rotate: -8 + Math.random() * 16,
        duration: 20 + Math.random() * 15,
        delay: -(Math.random() * 25),
        drift: (Math.random() - 0.5) * 40,
      })),
    [photos],
  );

  const motes = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 16 + Math.random() * 14,
        size: 2 + Math.random() * 3,
        drift: (Math.random() - 0.5) * 50,
      })),
    [],
  );

  return (
    <div className="ambience" aria-hidden="true">
      <div className="falling-memories">
        {fallingPhotos.map((photo) => (
          <img
            key={photo.id}
            src={photo.image}
            alt=""
            className="memory-photo"
            loading="lazy"
            style={{
              left: `${photo.left}%`,
              width: `${photo.width}px`,
              "--rotate": `${photo.rotate}deg`,
              "--drift": `${photo.drift}px`,
              "--duration": `${photo.duration}s`,
              "--delay": `${photo.delay}s`,
            }}
          />
        ))}
      </div>
      {motes.map((m) => (
        <span
          key={m.id}
          className="mote"
          style={{
            left: `${m.left}%`,
            "--delay": `${m.delay}s`,
            "--duration": `${m.duration}s`,
            "--size": `${m.size}px`,
            "--drift": `${m.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
