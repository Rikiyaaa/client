
import React from 'react';

function PokemonCard({ pokemon }) {
  if (!pokemon) return null;

  return (
    <div className="flex justify-center items-center mb-2 relative group">
      <div className="h-36 w-36 bg-gray-50 rounded-full flex items-center justify-center p-2 shadow-inner">
        <img 
          src={pokemon.image} 
          alt={pokemon.name} 
          className="max-h-32 max-w-32 object-contain"
        />
        
        {/* Tooltip that appears on hover */}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-8 bg-black text-white text-xs rounded py-1 px-2 pointer-events-none capitalize">
          {pokemon.name}
        </div>
      </div>
    </div>
  );
}

export default PokemonCard;