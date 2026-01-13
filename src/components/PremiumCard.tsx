import React from 'react';
import { MapPin, Star, Heart } from 'lucide-react';

interface PremiumCardProps {
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  onLike?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  image,
  title,
  location,
  price,
  rating,
  onLike,
}) => {
  return (
    <div className="group relative w-80 card border border-slate-100/50">
      {/* Full-Bleed Image Section */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="card-image"
        />
        
        {/* Floating Glass Badges - Top Left */}
        <div className="absolute top-4 left-4">
          <div className="badge-glass flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-slate-800">{rating}</span>
          </div>
        </div>

        {/* Favorite Button - Top Right */}
        <button 
          onClick={onLike}
          className="absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-glass bg-white/60 text-slate-700 transition-all duration-300 hover:bg-white hover:text-red-500"
        >
          <Heart size={18} />
        </button>

        {/* Price Badge - Bottom Left */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-brand-blue text-white px-4 py-2 rounded-inner font-bold text-sm shadow-lg">
            ${price} <span className="font-normal opacity-80">/ night</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="card-content">
        <div className="mb-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-slate-600 group-hover:text-brand-blue transition-colors duration-300">
          <MapPin size={16} />
          <span className="text-sm font-medium">{location}</span>
        </div>

        {/* Bottom Divider with CTA */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="guest" className="w-full h-full" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-brand-blue">
              +12
            </div>
          </div>
          <button className="text-xs font-bold text-brand-blue uppercase tracking-widest hover:underline transition-all duration-300">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumCard;
