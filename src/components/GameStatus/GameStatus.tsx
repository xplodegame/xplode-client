import React from 'react';
import { GameState, Player } from '../../types/gameTypes';
import { Loader2 } from 'lucide-react';

interface GameStatusProps {
  gameState: GameState | null;
  userData?: Player;
}

const GameStatus: React.FC<GameStatusProps> = ({ gameState, userData }) => {
  if (!gameState || !userData) return null;

  if ('WAITING' in gameState) {
    return (
      <div className="flex flex-col items-center space-y-3 mb-8">
        <div className="text-zinc-400 flex items-center space-x-2">
          <Loader2 className="animate-spin" size={20} />
          <span>Finding opponents...</span>
        </div>
      </div>
    );
  }

  if ('RUNNING' in gameState) {
    const isMyTurn = gameState.RUNNING.players[gameState.RUNNING.turn_idx].id === userData.id?.toString();
    return (
      <div className="text-xl mb-4">
        {isMyTurn ? (
          <span className="text-green-400">Your turn!</span>
        ) : (
          <span className="text-yellow-400">Opponent's turn</span>
        )}
      </div>
    );
  }

  if ('FINISHED' in gameState) {
    const isLoser = gameState.FINISHED.players[gameState.FINISHED.loser_idx].id === userData.id?.toString();
    return (
      <div className={`text-xl mb-8 font-medium ${isLoser ? 'text-red-400' : 'text-emerald-400'}`}>
        {isLoser ? 'Game Over' : 'Victory!'}
      </div>
    );
  }

  if ('ABORTED' in gameState) {
    return (
      <div className="text-xl mb-8 font-medium text-yellow-400">
        Game Aborted Due to Inactivity
      </div>
    );
  }

  return null;
};

export default React.memo(GameStatus);