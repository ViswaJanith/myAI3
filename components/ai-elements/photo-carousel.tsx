"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";

// 1. Static Image Database for TrekMate
// You can add more forts here easily!
const TREK_IMAGES: Record<string, string[]> = {
  "rajgad": [
    "https://images.unsplash.com/photo-1623164344075-472b83441999?w=800&q=80",
    "https://images.unsplash.com/photo-1623955615783-f368f3066347?w=800&q=80",
    "https://images.unsplash.com/photo-1616428784379-389f47021376?w=800&q=80"
  ],
  "raigad": [
    "https://images.unsplash.com/photo-1597818808369-63309e236ce3?w=800&q=80", 
    "https://images.unsplash.com/photo-1615967733475-b6d396792644?w=800&q=80"
  ],
  "torna": [
    "https://images.unsplash.com/photo-1613280540702-693339023420?w=800&q=80",
    "https://images.unsplash.com/photo-1634999468936-224443907a50?w=800&q=80"
  ],
  "kalsubai": [
    "https://images.unsplash.com/photo-1613977546377-dc4494a48436?w=800&q=80",
    "https://images.unsplash.com/photo-1672322306789-9132204c3298?w=800&q=80"
  ],
  "sinhagad": [
    "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&q=80",
    "https://images.unsplash.com/photo-1631527696350-f942d9929949?w=800&q=80"
  ],
  "harishchandragad": [
    "https://images.unsplash.com/photo-1623698717672-2d93d463e264?w=800&q=80", // Konkan Kada lookalike
    "https://images.unsplash.com/photo-1574692797204-74720979e262?w=800&q=80"
  ],
  // Fallback for unknown treks
  "default": [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
  ]
};

interface PhotoCarouselProps {
  location: string;
}

export function PhotoCarousel({ location }: PhotoCarouselProps) {
  const normalizedLocation = location.toLowerCase().trim();
  
  // Find images that match the location name (partial match)
  const matchedKey = Object.keys(TREK_IMAGES).find(key => normalizedLocation.includes(key)) || "default";
  const images = TREK_IMAGES[matchedKey];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="my-4 w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-xl border-4 border-stone-100 dark:border-stone-800 bg-white dark:bg-black relative group">
      {/* Title Badge */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
        <MapPin className="w-3 h-3 text-emerald-400" />
        {matchedKey === "default" ? location : matchedKey}
      </div>

      <div className="relative aspect-video w-full">
        <img
          src={images[currentIndex]}
          alt={`${location} view`}
          className="w-full h-full object-cover transition-all duration-500"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextSlide}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-emerald-500 w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
