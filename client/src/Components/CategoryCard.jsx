import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Gift, Pencil } from "lucide-react";

const CategoryCard = ({
  category,
  index = 0,
  onClick,
  onEdit,
  heightClassName = "h-40",
}) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = category.image && !imgError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.5) }}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(category)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(category);
        }
      }}
      className={`group relative flex w-full cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-white/10 text-left transition-all duration-300 hover:border-[#00CBCF]/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/50 ${heightClassName}`}
    >
      {/* Background */}
      {hasImage ? (
        <img
          src={category.image}
          alt={category.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#00CBCF]/20 via-gray-900 to-gray-950">
          <Gift className="h-10 w-10 text-[#00CBCF]/40" />
        </div>
      )}

      {/* Overlay gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      {/* Inactive badge */}
      {category.isActive === false && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300">
          Inactive
        </span>
      )}

      {/* Edit button */}
      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(category);
          }}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          aria-label={`Edit ${category.name}`}
        >
          <Pencil size={12} />
        </button>
      )}

      {/* Text content */}
      <div className="relative z-10 p-4">
        <h3
          className="line-clamp-1 text-base font-bold leading-snug text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-300">
            {category.description}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#00CBCF]">
          View products
          <ChevronRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
