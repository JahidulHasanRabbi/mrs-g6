"use client";

import { motion } from "framer-motion";
import MartItem from "./MartItem";

export default function MartGrid({ items, onRedeem, isItemLocked, getRequiredTierName }) {
  return (
    <motion.div
      className="flex flex-wrap gap-4 justify-center items-center mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {items.map((item, index) => {
        const locked = isItemLocked ? isItemLocked(item) : false;
        const requiredTier = getRequiredTierName ? getRequiredTierName(item) : '';
        
        return (
          <MartItem
            key={index}
            index={index}
            image={item.image}
            title={item.title}
            originalPrice={item.originalPrice}
            discountPrice={item.discountPrice}
            coins={item.coins}
            isLocked={locked}
            requiredTierLabel={requiredTier}
            onRedeem={() => onRedeem(item)}
          />
        );
      })}
    </motion.div>
  );
}
