"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SPIN_ASSETS } from "./spinAssets";
import { getAllLuckySpinItems } from "../../api/memberApi";
import { mapLuckySpinItems } from "../../api/responseMappers";
import LoadingState from "../ui/LoadingState";
import ErrorDisplay from "../ui/ErrorDisplay";

const RewardItem = memo(function RewardItem({ icon, title, index }) {
  // More aggressive font size reduction for mobile to ensure full text shows
  const getFontSizeClass = (text) => {
    const length = text.length;
    if (length > 25) return "text-[10px] sm:text-xs"; // Very long text
    if (length > 18) return "text-[11px] sm:text-sm"; // Long text
    if (length > 12) return "text-xs sm:text-base"; // Medium text
    return "text-sm sm:text-lg"; // Short text
  };

  return (
  <motion.div
    className="relative w-[80%] sm:w-full mx-auto h-[62px] rounded-[6px] border border-white overflow-hidden"
    style={{
      background: "linear-gradient(0.57deg, rgba(242, 195, 107, 0) 74.37%, rgb(221, 143, 31) 94%), linear-gradient(90deg, rgba(7, 25, 13, 0.44) 0%, rgba(7, 25, 13, 0.44) 100%)",
      boxShadow: "3px 3px 48px 3px rgba(231, 196, 87, 0.5)"
    }}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.5,
      delay: index * 0.2,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4 gap-2 sm:gap-3">
      {icon && (
        <motion.div
          className="relative w-[45px] h-[45px] sm:w-[50px] sm:h-[51px] shrink-0"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: index * 0.2 + 0.1,
            ease: "easeOut"
          }}
        >
          <img
            alt={title}
            src={icon}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <p
          className={`text-white ${getFontSizeClass(title)} font-bold text-center drop-shadow-lg px-1 leading-[1.1]`}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
          }}
        >
          {title}
        </p>
      </div>
      {icon && <div className="w-[45px] sm:w-[50px] shrink-0" />}
    </div>
  </motion.div>
  );
});

const CreditCard = memo(function CreditCard({ range, index }) {
  return (
  <motion.div
    className="relative w-[100px] h-[100px] sm:w-[130px] sm:h-[96px]"
    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{
      duration: 0.6,
      delay: index * 0.15,
      ease: "easeOut"
    }}
    whileHover={{ scale: 1.05, rotate: 2 }}
  >
    <Image
      alt="Coin Frame"
      src={SPIN_ASSETS.coinFrame}
      fill
      className="object-cover"
      sizes="130px"
    />
    <motion.div
      className="absolute left-[-60px] bottom-[6px] w-[130px] h-[30px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.15 + 0.3,
        ease: "easeOut"
      }}
    >
      <Image
        alt="Coin"
        src={SPIN_ASSETS.coin2}
        fill
        className="object-contain"
        sizes="130px"
      />
    </motion.div>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a67520] font-bold text-center gap-0 -mt-2">
      <p className="text-xs sm:text-md  leading-tight">FREE</p>
      <p className="text-xs sm:text-md  leading-tight">CREDIT</p>
      <p className="text-xs sm:text-md  leading-tight mt-1">{range}</p>
    </div>
  </motion.div>
  );
});

const RewardsList = memo(function RewardsList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSpinItems() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllLuckySpinItems();
        const mappedItems = mapLuckySpinItems(response);
        setItems(mappedItems);
      } catch (err) {
        console.error('Error fetching lucky spin items:', err);
        setError(err.message || 'Failed to load rewards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpinItems();
  }, []);

  // Separate items by type
  const itemRewards = items.filter(item => 
    item.item_type === 'ITEM' || item.item_type === 2
  );
  const tokenRewards = items.filter(item => 
    item.item_type === 'TOKEN' || item.item_type === 3
  );
  const creditRewards = items.filter(item => 
    item.item_type === 'FREE CREDIT' || item.item_type === 1
  );

  if (isLoading) {
    return (
      <div className="relative w-[400px] min-h-[820px] sm:w-[520px] sm:min-h-[1020px] mx-auto flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-[400px] min-h-[820px] sm:w-[520px] sm:min-h-[1020px] mx-auto flex items-center justify-center">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return (
    <motion.div
      className="relative w-[400px] sm:w-[520px] min-h-[820px] sm:min-h-[1020px] mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      <Image
        alt="Scroll Background"
        src={SPIN_ASSETS.scrollBackground}
        fill
        className="object-cover"
      />

      <div className="relative flex flex-col items-center pt-32 px-10 pb-20">
        <motion.h2
          className="text-[36px] font-bold text-center mb-4"
          style={{ color: '#8B6914' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Rewards List
        </motion.h2>

        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {itemRewards.map((reward, index) => (
            <RewardItem 
              key={reward.uuid} 
              index={index} 
              icon={reward.image}
              title={reward.reward_name}
            />
          ))}
          {tokenRewards.map((reward, index) => {
            // Format token rewards to look better
            const displayName = reward.reward_name.toLowerCase().includes('token') 
              ? reward.reward_name 
              : `${reward.reward_name} Token${reward.token_amount > 1 ? 's' : ''}`;
            
            return (
              <RewardItem 
                key={reward.uuid} 
                index={itemRewards.length + index} 
                icon={reward.image}
                title={displayName}
              />
            );
          })}
        </div>

        {/* Display credit cards in rows */}
        {creditRewards.length > 0 && (
          <>
            <div className="flex justify-center gap-8 mt-2">
              {creditRewards.slice(0, 2).map((credit, index) => (
                <CreditCard
                  key={credit.uuid}
                  range={`RM${credit.min_withdraw} ~ RM${credit.max_withdraw}`}
                  index={index}
                />
              ))}
            </div>
            {creditRewards.length > 2 && (
              <div className="flex justify-center gap-8">
                {creditRewards.slice(2, 4).map((credit, index) => (
                  <CreditCard
                    key={credit.uuid}
                    range={`RM${credit.min_withdraw} ~ RM${credit.max_withdraw}`}
                    index={index + 2}
                  />
                ))}
              </div>
            )}
            {creditRewards.length > 4 && (
              <div className="flex justify-center gap-8">
                {creditRewards.slice(4, 6).map((credit, index) => (
                  <CreditCard
                    key={credit.uuid}
                    range={`RM${credit.min_withdraw} ~ RM${credit.max_withdraw}`}
                    index={index + 4}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
});

export default RewardsList;
