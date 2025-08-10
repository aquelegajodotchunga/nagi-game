import React from 'react';

interface ObstacleProps {
  position: { x: number; y: number };
}

const Obstacle: React.FC<ObstacleProps> = ({ position }) => {
  return (
    <div
      className="absolute w-12 h-20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
      data-dyad-id="obstacle"
    >
      {/* Car body */}
      <div className="w-full h-full bg-red-600 rounded-md shadow-lg border-2 border-red-800 p-1 flex flex-col justify-between">
        {/* Trunk area (back of the car) */}
        <div className="h-5 relative">
        </div>
        
        {/* Cabin/Roof area */}
        <div className="h-10 bg-red-400 rounded-md border-2 border-red-600 mx-1 flex flex-col justify-between p-0.5">
            <div className="h-3 bg-black/20 rounded-sm"></div> {/* Rear windshield */}
            <div className="h-3 bg-black/20 rounded-sm"></div> {/* Front windshield */}
        </div>

        {/* Hood area with headlights (front of the car) */}
        <div className="h-5 relative">
          <div className="absolute bottom-0 left-1 w-2 h-3 bg-yellow-300 rounded-sm border border-gray-800"></div>
          <div className="absolute bottom-0 right-1 w-2 h-3 bg-yellow-300 rounded-sm border border-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export default Obstacle;