"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * VideoGallery Component
 * Grid of video thumbnails with play buttons
 */
export default function VideoGallery() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);

  const videos = [
    {
      id: 1,
      thumbnail: "/assets/home/special_for_you/video_image.png",
      title: "Game Tutorial",
    },
    {
      id: 2,
      thumbnail: "/assets/home/special_for_you/video_image.png",
      title: "Winning Tips",
    },
    {
      id: 3,
      thumbnail: "/assets/home/special_for_you/video_image.png",
      title: "Advanced Strategies",
    },
    {
      id: 4,
      thumbnail: "/assets/home/special_for_you/video_image.png",
      title: "Bonus Features",
    },
  ];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Section Title */}
      <h3
        className="text-3xl font-bold mb-4"
        style={{
          fontFamily: '"Times New Roman", serif',
          color: "#e9af41",
        }}
      >
        ###
      </h3>

      {/* Horizontal Scrolling Video Container */}
      <div
        ref={containerRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide transition-all ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitScrollbar: { display: "none" },
          userSelect: isDragging ? "none" : "auto",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            className="flex-shrink-0 relative rounded-xl overflow-hidden cursor-pointer"
            style={{
              width: "255px",
              height: "176px",
              border: "3px solid #e9af41",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Video Thumbnail */}
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover"
            />

            {/* Play Button Overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #ffd700 0%, #e9af41 100%)",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="w-0 h-0 border-l-[16px] border-l-[#07190d] border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
