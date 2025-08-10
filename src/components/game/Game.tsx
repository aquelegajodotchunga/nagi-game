import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayerCar from './PlayerCar';
import Obstacle from './Obstacle';
import { Button } from '@/components/ui/button';
import { initAudio, playCrashSound, playScoreSound, playLevelUpSound } from '@/utils/audio';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const CAR_WIDTH = 48;
const OBSTACLE_WIDTH = 48;
const OBSTACLE_HEIGHT = 80;
const PLAYER_SPEED = 5; // Controls how fast the car moves

const Game = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: GAME_WIDTH / 2 });
  const [obstacles, setObstacles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [movement, setMovement] = useState<'left' | 'right' | null>(null);

  const gameLoopRef = useRef<number>();
  const obstaclesRef = useRef(obstacles);
  const playerPositionRef = useRef(playerPosition);
  const levelRef = useRef(level);
  const movementRef = useRef(movement);

  obstaclesRef.current = obstacles;
  playerPositionRef.current = playerPosition;
  levelRef.current = level;
  movementRef.current = movement;

  useEffect(() => {
    const savedHighScore = localStorage.getItem('racerHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    const newLevel = Math.floor(score / 40) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      playLevelUpSound();
    }
  }, [score, level]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver || !gameStarted) return;
    if (e.key === 'ArrowLeft') {
      setMovement('left');
    } else if (e.key === 'ArrowRight') {
      setMovement('right');
    }
  }, [gameOver, gameStarted]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (
      (e.key === 'ArrowLeft' && movementRef.current === 'left') ||
      (e.key === 'ArrowRight' && movementRef.current === 'right')
    ) {
      setMovement(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const startGame = () => {
    initAudio();
    setPlayerPosition({ x: GAME_WIDTH / 2 });
    setObstacles([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setGameStarted(true);
    setMovement(null);
  };

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setGameStarted(false);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    playCrashSound();

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('racerHighScore', score.toString());
    }
  }, [score, highScore]);

  const gameLoop = useCallback(() => {
    if (gameOver) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    // Player movement
    setPlayerPosition(prev => {
      let newX = prev.x;
      if (movementRef.current === 'left') {
        newX = Math.max(prev.x - PLAYER_SPEED, CAR_WIDTH / 2);
      } else if (movementRef.current === 'right') {
        newX = Math.min(prev.x + PLAYER_SPEED, GAME_WIDTH - CAR_WIDTH / 2);
      }
      return { x: newX };
    });

    // Obstacle movement and spawning
    const currentLevel = levelRef.current;
    const speed = 4 + currentLevel;
    const spawnChance = 0.04 + currentLevel * 0.01;

    let newObstacles = obstaclesRef.current.map(obs => ({ ...obs, y: obs.y + speed }));

    const passedObstacles = newObstacles.filter(obs => obs.y > GAME_HEIGHT);
    if (passedObstacles.length > 0) {
        setScore(s => s + passedObstacles.length);
        playScoreSound();
    }
    newObstacles = newObstacles.filter(obs => obs.y <= GAME_HEIGHT);

    if (Math.random() < spawnChance && newObstacles.filter(o => o.y < 150).length === 0) {
      const newObstacle = {
        id: Date.now(),
        x: Math.random() * (GAME_WIDTH - OBSTACLE_WIDTH) + OBSTACLE_WIDTH / 2,
        y: -OBSTACLE_HEIGHT,
      };
      newObstacles.push(newObstacle);
    }
    
    setObstacles(newObstacles);

    // Collision detection
    const playerRect = { x: playerPositionRef.current.x - CAR_WIDTH / 2, y: GAME_HEIGHT - 20 - 80, width: CAR_WIDTH, height: 80 };
    for (const obs of newObstacles) {
      const obsRect = { x: obs.x - OBSTACLE_WIDTH / 2, y: obs.y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT };
      if (
        playerRect.x < obsRect.x + obsRect.width &&
        playerRect.x + playerRect.width > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.height &&
        playerRect.y + playerRect.height > obsRect.y
      ) {
        handleGameOver();
        return;
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, handleGameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, gameLoop]);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">NAGI</h1>
      <div className="p-4 bg-green-600 rounded-xl shadow-lg">
        <div
          className={`relative bg-gray-600 w-[400px] h-[600px] overflow-hidden border-4 border-gray-900 rounded-lg shadow-lg road-bg ${gameStarted && !gameOver ? 'is-animating' : ''}`}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {!gameStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10">
                  {gameOver && <h2 className="text-4xl font-bold text-white mb-2">Fim de Jogo</h2>}
                  <p className="text-white text-xl mb-2">Pontuação: {score}</p>
                  <p className="text-white text-lg mb-4">Recorde: {highScore}</p>
                  <Button onClick={startGame}>{gameOver ? 'Tentar Novamente' : 'Iniciar Jogo'}</Button>
              </div>
          )}
          {gameStarted && (
            <>
              <PlayerCar position={playerPosition} />
              {obstacles.map(obs => (
                <Obstacle key={obs.id} position={obs} />
              ))}
              {/* Touch controls for mobile */}
              <div className="absolute inset-0 flex z-20">
                <div 
                  className="w-1/2 h-full" 
                  onTouchStart={() => setMovement('left')}
                  onTouchEnd={() => setMovement(null)}
                ></div>
                <div 
                  className="w-1/2 h-full"
                  onTouchStart={() => setMovement('right')}
                  onTouchEnd={() => setMovement(null)}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">Use <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">←</kbd> e <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">→</kbd> para mover.</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Em dispositivos móveis, toque nos lados da tela.</p>
        <div className="flex justify-center items-center space-x-8 mt-2">
            <p className="font-bold text-lg">Nível: {level}</p>
            <p className="font-bold text-lg">Pontuação: {score}</p>
            <p className="font-bold text-lg">Recorde: {highScore}</p>
        </div>
      </div>
    </div>
  );
};

export default Game;