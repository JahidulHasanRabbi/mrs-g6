"use client";
import { useState } from 'react';
import { HamburgerMenu } from '../hamburger';
import { FooterNav } from '../footer';
import ExampleFullWidth from '../ExampleFullWidth';

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#FFEBEB] pb-56 relative">
      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Open menu"
      >
        <div className="w-6 h-0.5 bg-black mb-1.5"></div>
        <div className="w-6 h-0.5 bg-black mb-1.5"></div>
        <div className="w-6 h-0.5 bg-black"></div>
      </button>

      <h1 className="text-2xl font-bold p-4">Home</h1>

      {/* Footer Navigation */}
      <FooterNav />
    </div>
  );
}

export default Home;
