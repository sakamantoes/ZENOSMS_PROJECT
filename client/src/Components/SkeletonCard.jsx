const SkeletonCard = () => (
  <div className="flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 animate-pulse">
    <div className="h-44 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/5 rounded-lg w-3/4" />
      <div className="h-3 bg-white/5 rounded-lg w-full" />
      <div className="h-3 bg-white/5 rounded-lg w-2/3" />
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="h-5 bg-white/5 rounded-lg w-24" />
        <div className="h-8 bg-white/5 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
