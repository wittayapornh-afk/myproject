import React from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, Zap, Percent, ShoppingBag, Gift, Star, Activity, AlertCircle 
} from 'lucide-react';

/**
 * 🏷️ ProductBadge Component
 * Displays a colorful badge with an icon for product tags.
 */
const iconMap = {
  Tag, Zap, Percent, ShoppingBag, Gift, Star, Activity, AlertCircle
};

const ProductBadge = ({ tag, size = "sm", className = "" }) => {
  if (!tag) return null;

  const Icon = iconMap[tag.icon] || Tag;
  const isLarge = size === "lg";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
      className={`relative overflow-hidden inline-flex items-center gap-1.2 px-2 py-1 rounded-lg text-white font-black shadow-sm transition-all border border-white/20 backdrop-blur-[2px] ${isLarge ? 'text-[10px] px-2.5 py-1.5' : 'text-[8px] px-1.5 py-0.5'} ${className}`}
      style={{ 
        backgroundColor: tag.color || '#6366f1',
        boxShadow: `0 4px 12px ${tag.color}33`
      }}
    >
      {/* 🌟 Shimmer Effect */}
      <motion.div 
        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
        initial={{ x: '-150%' }}
        animate={{ x: '150%' }}
        transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            repeatDelay: Math.random() * 5 + 3, // Random delay 3-8s
            ease: "easeInOut"
        }}
      />

      <Icon size={isLarge ? 12 : 9} strokeWidth={3} className="shrink-0 relative z-20" />
      <span className="uppercase tracking-tight truncate max-w-[80px] relative z-20">{tag.name}</span>
    </motion.div>
  );
};

export default ProductBadge;
