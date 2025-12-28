import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

import dashboardBanner1 from "@/assets/dashboard-banner-1.png";
import dashboardBanner2 from "@/assets/dashboard-banner-2.png";
import dashboardBanner3 from "@/assets/dashboard-banner-3.png";
import dashboardBanner4 from "@/assets/dashboard-banner-4.png";

const ImportantInformation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { src: dashboardBanner1, alt: 'BluePay2026 - 100% Legit' },
    { src: dashboardBanner2, alt: 'Join & Save Big' },
    { src: dashboardBanner3, alt: 'Save Big on Airtime, Data & Bills' },
    { src: dashboardBanner4, alt: 'Get Your Account Ready Instantly' },
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden mb-3">
      <div className="relative w-full h-[140px]">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Card className="glass-card w-full h-full p-0 overflow-hidden">
              <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover rounded-xl" />
            </Card>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2 space-x-1.5">
        {slides.map((_, index) => (
          <div key={index} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-3' : 'bg-muted/50'}`} />
        ))}
      </div>
    </div>
  );
};

export default ImportantInformation;
