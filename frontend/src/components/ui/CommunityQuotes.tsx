"use client";

import { useState, useEffect, useCallback } from "react";

interface Quote {
  text: string;
  icon: string;
}

const quotesEn: Quote[] = [
  { text: "Every tool shared is a neighbor helped.", icon: "🤝" },
  { text: "Building community, one tool at a time.", icon: "🛠️" },
  { text: "Sharing is caring — together we grow stronger.", icon: "💚" },
  { text: "A neighborhood that shares, thrives.", icon: "🏘️" },
  { text: "Less buying, more sharing. Better for everyone.", icon: "♻️" },
  { text: "Your unused tool could be your neighbor's lifeline.", icon: "🔧" },
  { text: "Community is not a place — it's a practice.", icon: "🌱" },
  { text: "When neighbors share, everyone has more.", icon: "✨" },
  { text: "The best things in life are shared.", icon: "💛" },
  { text: "Small acts of sharing build great communities.", icon: "🏡" },
  { text: "A tool borrowed is a friendship strengthened.", icon: "🤝" },
  { text: "Together we have everything we need.", icon: "🌟" },
];

const quotesMy: Quote[] = [
  { text: "တစ်ယောက်ချင်းစီ မျှဝေခြင်းက အိမ်နီးချင်းကို ကူညီခြင်းပါပဲ။", icon: "🤝" },
  { text: "လူမှုအသိုင်းအဝိုင်းကို တစ်ခုပြီးတစ်ခု တည်ဆောက်ကြပါစို့။", icon: "🛠️" },
  { text: "မျှဝေခြင်းက ဂရုစိုက်ခြင်းပါ — အတူတကွ ပိုမိုခိုင်မာကြပါစို့။", icon: "💚" },
  { text: "မျှဝေတတ်သော ရပ်ကွက်က တိုးတက်ပါတယ်။", icon: "🏘️" },
  { text: "ဝယ်ယူခြင်းထက် မျှဝေခြင်းက ပိုကောင်းပါတယ်။", icon: "♻️" },
  { text: "သင်မသုံးတော့တဲ့ ကိရိယာက အိမ်နီးချင်းအတွက် အသက်သွေးကြော ဖြစ်နိုင်ပါတယ်။", icon: "🔧" },
  { text: "လူမှုအသိုင်းအဝိုင်းဆိုတာ နေရာမဟုတ်ပါ — လက်တွေ့လုပ်ဆောင်ခြင်းပါ။", icon: "🌱" },
  { text: "အိမ်နီးချင်းတွေ မျှဝေကြရင် လူတိုင်းပိုရပါတယ်။", icon: "✨" },
  { text: "ဘဝရဲ့ အကောင်းဆုံးအရာတွေက မျှဝေထားတာပါ။", icon: "💛" },
  { text: "မျှဝေခြင်း အသေးအမွှားလေးတွေက ကြီးမားတဲ့ လူမှုအသိုင်းအဝိုင်းကို တည်ဆောက်ပါတယ်။", icon: "🏡" },
  { text: "ငှားယူထားတဲ့ ကိရိယာက ခိုင်မာတဲ့ ခင်မင်မှုကို တည်ဆောက်ပါတယ်။", icon: "🤝" },
  { text: "အတူတကွဆိုရင် လိုအပ်တာအားလုံး ရှိပါတယ်။", icon: "🌟" },
];

interface CommunityQuotesProps {
  locale?: string;
  variant?: "light" | "dark" | "green" | "sunset";
}

export default function CommunityQuotes({ locale = "en", variant = "light" }: CommunityQuotesProps) {
  const quotes = locale === "my" ? quotesMy : quotesEn;

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
  }, [quotes.length]);

  useEffect(() => {
    const interval = setInterval(nextQuote, 6000);
    return () => clearInterval(interval);
  }, [nextQuote]);

  const quote = quotes[currentIndex];
  const isDark = variant === "dark";
  const isGreen = variant === "green";
  const isSunset = variant === "sunset";

  const getDotClass = (i: number) => {
    const isActive = i === currentIndex;
    if (isSunset) {
      return isActive
        ? "w-5 h-1.5 bg-[#fca3a0]"
        : "w-1.5 h-1.5 bg-[#fca3a0]/30 hover:bg-[#fca3a0]/50";
    }
    if (isGreen) {
      return isActive
        ? "w-5 h-1.5 bg-emerald-400"
        : "w-1.5 h-1.5 bg-emerald-500/30 hover:bg-emerald-400/50";
    }
    if (isDark) {
      return isActive
        ? "w-5 h-1.5 bg-purple-600"
        : "w-1.5 h-1.5 bg-purple-200 hover:bg-purple-300";
    }
    return isActive
      ? "w-5 h-1.5 bg-white"
      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60";
  };

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
        <span className={`block ${isDark || isGreen || isSunset ? "text-2xl mb-1" : "text-3xl mb-2"}`} role="img" aria-hidden="true">
          {quote.icon}
        </span>
        <p
          className={`font-heading font-semibold leading-relaxed italic transition-colors duration-300 ${
            isSunset
              ? "text-base sm:text-lg text-[#fca3a0]"
              : isGreen
                ? "text-base sm:text-lg text-emerald-300"
                : isDark
                  ? "text-base text-purple-950/80"
                  : "text-base sm:text-lg text-white/90"
          }`}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
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
            className={`rounded-full transition-all duration-300 ${getDotClass(i)}`}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
