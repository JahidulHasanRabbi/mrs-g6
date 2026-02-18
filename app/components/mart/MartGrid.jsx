"use client";

import { motion } from "framer-motion";
import MartItem from "./MartItem";

export default function MartGrid({ items, onRedeem }) {
  return (
    <motion.div 
      className="flex flex-wrap gap-[7px] justify-center px-4 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {items.map((item, index) => (
        <MartItem
          key={index}
          index={index}
          image={item.image}
          title={item.title}
          coins={item.coins}
          onRedeem={() => onRedeem(item)}
        />
      ))}
    </motion.div>
  );
}
