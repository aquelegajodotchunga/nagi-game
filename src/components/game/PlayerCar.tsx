import React from 'react';

interface PlayerCarProps {
  position: { x: number };
}

const PlayerCar: React.FC<PlayerCarProps> = ({ position }) => {
  return (
    <div
      className="absolute w-12 h-20"
      style={{
        left: `${position.x}px`,
        bottom: '20px',
        transform: 'translateX(-50%)',
      }}
      data-dyad-id="player-car"
    >
      {/* Car body */}
      <div className="w-full h-full bg-blue-600 rounded-md shadow-lg border-2 border-blue-800 p-1 flex flex-col justify-between">
        {/* Hood area */}
        <div className="h-5 relative"></div>
        
        {/* Cabin/Roof area */}
        <div className="h-10 bg-blue-400 rounded-md border-2 border-blue-600 mx-1 flex flex-col justify-between p-0.5">
            <div className="h-3 bg-black/20 rounded-sm"></div> {/* Front windshield */}
            <div className="h-3 bg-black/20 rounded-sm"></div> {/* Rear windshield */}
        </div>

        {/* Trunk area with taillights */}
        <div className="h-5 relative">
          <div className="absolute bottom-0 left-1 w-3 h-2 bg-red-600 rounded-sm border border-gray-800"></div>
          <div className="absolute bottom-0 right-1 w-3 h-2 bg-red-600 rounded-sm border border-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCar;