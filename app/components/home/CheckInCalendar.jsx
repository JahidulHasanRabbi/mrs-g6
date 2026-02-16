"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * CheckInCalendar Component
 * 7-day check-in calendar with rewards
 */
export default function CheckInCalendar() {
  const [checkedDays, setCheckedDays] = useState([1, 2]); // Example: days 1 and 2 checked

  const days = [
    { day: 1, reward: '100', icon: '💎' },
    { day: 2, reward: '100', icon: '💎' },
    { day: 3, reward: '100', icon: '💎' },
    { day: 4, reward: '100', icon: '💎' },
    { day: 5, reward: '100', icon: '💎' },
    { day: 6, reward: '⚡', icon: '⚡' },
    { day: 7, reward: 'BONUS', icon: '🎁', isSpecial: true },
  ];

  const handleCheckIn = (day) => {
    if (!checkedDays.includes(day)) {
      setCheckedDays([...checkedDays, day]);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Title Banner */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="relative py-4 px-6 text-center rounded-lg"
          style={{
            background: 'linear-gradient(180deg, #d4a03d 0%, #8b6914 100%)',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: '"Times New Roman", serif',
              color: '#07190d',
              textShadow: '2px 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            Check In
          </h2>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <div
        className="relative p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #d4a03d 0%, #8b6914 100%)',
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-green-900 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-green-900 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-green-900 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-green-900 rounded-br-lg" />

        {/* Days Grid */}
        <div className="grid grid-cols-4 gap-3">
          {days.map((item, index) => {
            const isChecked = checkedDays.includes(item.day);
            const isSpecial = item.isSpecial;

            return (
              <motion.button
                key={item.day}
                onClick={() => handleCheckIn(item.day)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl ${
                  isSpecial ? 'col-span-2' : ''
                }`}
                style={{
                  background: isSpecial
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                    : isChecked
                    ? '#2d5a3d'
                    : '#1a3d2a',
                  border: '2px solid #8b6914',
                  boxShadow: isChecked
                    ? '0px 4px 10px rgba(45, 90, 61, 0.5)'
                    : '0px 2px 5px rgba(0, 0, 0, 0.3)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Check mark for completed days */}
                {isChecked && !isSpecial && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}

                {/* Reward Icon/Amount */}
                <div className="text-2xl mb-1">{item.icon}</div>
                <div
                  className="text-sm font-bold"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    color: isSpecial ? '#8b6914' : '#ffd700',
                  }}
                >
                  {item.reward}
                </div>

                {/* Day Label */}
                <div
                  className="text-xs mt-1"
                  style={{
                    fontFamily: '"Times New Roman", serif',
                    color: isSpecial ? '#8b6914' : '#e9af41',
                  }}
                >
                  DAY {item.day}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
