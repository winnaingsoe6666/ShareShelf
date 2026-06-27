"use client";

import { useState, useEffect, useCallback } from "react";

const quotes = [
  {
    text: "Every tool shared is a neighbor helped.",
    icon: "🤝",
  },
  {
    text: "Building community, one tool at a time.",
    icon: "🛠️",
  },
  {
    text: "Sharing is caring — together we grow stronger.",
    icon: "💚",
  },
  {
    text: "A neighborhood that shares, thrives.",
    icon: "🏘️",
  },
  {
    text: "Less buying, more sharing. Better for everyone.",
    icon: "♻️",
  },
  {
    text: "Your unused tool could be your neighbor's lifeline.",
    icon: "🔧",
  },
  {
    text: "Community is not a place — it's a practice.",
    icon: "🌱",
  },
  {
    text: "When neighbors share, everyone has more.",
    icon: "✨",
  },
  {
    text: "The best things in life are shared.",
    icon: "💛",
  },
  {
    text: "Small acts of sharing build great communities.",
    icon: "🏡",
  },
  {
    text: "A tool borrowed is a friendship strengthened.",
    icon: "🤝",
  },
  {
    text: "Together we have everything we need.",
    icon: "🌟",
  },
];

export default function CommunityQuotes() {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * quotes.length)
  );
  const [fade, setFade] = useState(true);

  const nextQuote = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
      setFade(true);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextQuote, 6000);
    return () => clearInterval(interval);
  }, [nextQuote]);

  const quote = quotes[currentIndex];

  return (
    <div
      className="cursor-pointer select-none"
      onClick={nextQuote}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && nextQuote()}
      aria-label="Show next quote"
    >
      <div
        className={`transition-all duration-500 ease-in-out ${
          fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <span className="text-4xl block mb-4" role="img" aria-hidden="true">
          {quote.icon}
        </span>
        <p className="font-heading text-2xl md:text-3xl font-bold text-white/95 leading-snug italic">
          &ldquo;{quote.text}&rdquo;
        </p>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-8">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setFade(false);
              setTimeout(() => {
                setCurrentIndex(i);
                setFade(true);
              }, 300);
            }}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
