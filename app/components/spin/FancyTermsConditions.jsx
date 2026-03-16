"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CollapsibleTermItem = ({ number, title, description, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      className="mb-3 last:mb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08 + 0.3,
        type: "spring",
        stiffness: 120,
      }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group cursor-pointer relative overflow-hidden rounded-[12px] p-5"
        style={{
          background: isExpanded 
            ? "linear-gradient(135deg, rgba(233, 175, 65, 0.12) 0%, rgba(233, 175, 65, 0.05) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          border: `1px solid ${isExpanded ? 'rgba(233, 175, 65, 0.3)' : 'rgba(233, 175, 65, 0.15)'}`,
          boxShadow: isExpanded 
            ? "0px 4px 20px rgba(233, 175, 65, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.1)"
            : "0px 2px 8px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
        }}
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0px 6px 24px rgba(233, 175, 65, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.15)"
        }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full shrink-0"
            style={{
              background: "linear-gradient(135deg, #e9af41 0%, #b07c2a 100%)",
              boxShadow: "0px 4px 12px rgba(233, 175, 65, 0.4), inset 0px 1px 2px rgba(255, 255, 255, 0.3)",
            }}
          >
            <span 
              className="text-[#3d1a02] text-[18px] font-extrabold" 
              style={{ textShadow: "0px 1px 1px rgba(255,255,255,0.3)" }}
            >
              {number}
            </span>
          </div>
          <div className="flex-1">
            <h4 
              className="text-[17px] font-bold leading-tight group-hover:text-[#fcd064] transition-colors" 
              style={{ 
                color: isExpanded ? "#fcd064" : "#e9af41",
                textShadow: "0px 2px 6px rgba(0,0,0,0.8)"
              }}
            >
              {title}
            </h4>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="text-[#e9af41] text-[16px] font-bold shrink-0"
            style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.6)" }}
          >
            ▼
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="pl-[52px] pr-2">
                <p 
                  className="text-white/90 text-[15px] font-medium leading-relaxed whitespace-pre-line" 
                  style={{ 
                    textShadow: "0px 1px 3px rgba(0,0,0,0.8)"
                  }}
                >
                  {description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export default function FancyTermsConditions() {
  const terms = [
    {
      title: "Introduction",
      description: "Welcome to kinggroup44.com (the \"Site\"). By accessing, registering, or using any services provided on this Site, you agree to be bound by these Terms & Conditions. The Site operates as a VIP rewards and promotional platform for the following affiliated brands: KGAME99, LV918, EP369, ACEBET77, N1GANG and UBET CLUB."
    },
    {
      title: "Eligibility and Account Security",
      description: "You must be at least 18 years of age to participate in any promotional activities, register an account, or use this Site.\nMembers are responsible for maintaining the confidentiality of their account credentials.\nOnly one account per individual, IP address, or household is permitted."
    },
    {
      title: "VIP Membership and Points System",
      description: "Accumulation: VIP members earn points through designated activities on our affiliated partner sites.\nNo Expiration: Points accumulated in your account do not expire.\nNon-Transferable: Points, rewards, and VIP statuses are strictly non-transferable and cannot be exchanged for cash.\nDiscrepancies: KingGroup44 reserves the right to adjust point balances in the event of system errors, fraudulent activity, or chargebacks from affiliated platforms."
    },
    {
      title: "The Mart (Points Exchange)",
      description: "Redemption: Points can be redeemed for goods, vouchers, or digital items available in the KingGroup44 Mart.\nAvailability: All items in the Mart are subject to availability. We reserve the right to substitute items of equal or greater value if a requested item is out of stock.\nDelivery & Shipping: Physical items will be shipped to the address provided in your profile. KingGroup44 is not responsible for items lost or delayed due to incorrect address details.\nFinal Sale: All point redemptions are final. Exchanged goods cannot be returned or refunded for points."
    },
    {
      title: "Lucky Draw Rules",
      description: "Entry: Participation in Lucky Draws requires a specified number of points, VIP tier status, or specific promotional tickets.\nPrizes: Lucky Draw prizes are awarded as-is. KingGroup44 reserves the right to modify or replace prizes without prior notice.\nVerification: Winners may be required to verify their identity before prizes are disbursed."
    },
    {
      title: "Affiliated Casino Brands",
      description: "The Site serves as a promotional hub for KGAME99, LV918, EP369, N1GANG, ACEBET77, and UBET CLUB.\nAny gameplay, wagers, deposits, or withdrawals made on those respective platforms are governed by their individual Terms & Conditions. KingGroup44 is not liable for disputes arising directly on the affiliated casino platforms."
    },
    {
      title: "Fraud and Account Termination",
      description: "KingGroup44 maintains a strict zero-tolerance policy against bonus abuse, point manipulation, multiple account creation, or any form of fraud.\nWe reserve the right to instantly suspend or terminate any account and void all accumulated points and rewards if fraudulent activity is suspected."
    },
    {
      title: "Modifications to Terms",
      description: "KingGroup44 reserves the right to update, modify, or completely replace these Terms & Conditions at any time. Continued use of the Site following any changes constitutes acceptance of the new terms."
    }
  ];

  return (
    <motion.div 
      className="relative w-full max-w-[500px] mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      {/* Main Card Container */}
      <div 
        className="relative rounded-[24px] p-8 sm:p-10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(13, 31, 19, 0.92) 0%, rgba(8, 20, 12, 0.98) 100%)",
          boxShadow: "0px 20px 60px -10px rgba(0, 0, 0, 0.8), 0px 0px 0px 1px rgba(233, 175, 65, 0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Subtle corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-[3px] border-l-[3px] border-[#e9af41] rounded-tl-[24px] opacity-40" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-[3px] border-r-[3px] border-[#e9af41] rounded-tr-[24px] opacity-40" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[3px] border-l-[3px] border-[#e9af41] rounded-bl-[24px] opacity-40" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[3px] border-r-[3px] border-[#e9af41] rounded-br-[24px] opacity-40" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[200px] bg-[#e9af41] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />

        {/* Header */}
        {/* <motion.div 
          className="relative mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div 
            className="inline-block w-full text-center px-8 py-4 rounded-[12px]"
            style={{ 
              background: "linear-gradient(135deg, #e9af41 0%, #b07c2a 100%)",
              boxShadow: "0px 8px 24px rgba(233, 175, 65, 0.3), inset 0px 2px 4px rgba(255, 255, 255, 0.25)",
              border: "2px solid rgba(255, 219, 133, 0.4)",
            }}
          >
            <p 
              className="text-[#3d1a02] text-[20px] font-extrabold tracking-wider uppercase"
              style={{ 
                textShadow: "0px 2px 4px rgba(255, 255, 255, 0.3)"
              }}
            >
              Terms & Conditions
            </p>
          </div>
        </motion.div>
      
        {/* Terms List */}
        <div className="space-y-3 relative">
          {terms.map((term, index) => (
            <CollapsibleTermItem 
              key={index} 
              number={index + 1}
              index={index} 
              title={term.title} 
              description={term.description} 
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
