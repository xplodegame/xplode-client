import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useWebSocket from '../../hooks/useWebSocket';
import { motion } from 'framer-motion';
import { useParticles } from '../../components/GameComponents/Background/GameBackgroundParticles';
import GameBoard from '../../components/GameComponents/GameBoard/GameBoard';
import GameStatus from '../../components/GameComponents/GameStatus/GameStatus';
import LobbyDetails from '../../components/GameComponents/LobbyDetails/LobbyDetails';
import EnhancedTurnIndicator from '../../components/GameComponents/EnhancedTurnIndicator/EnhancedTurnIndicator';
import MatchmakingAnimation from '../../components/GameComponents/MatchmakingAnimation/MatchmakingAnimation'
import GameRoomShare from '../../components/GameComponents/GameRoomShare/GameRoomShare';
import JoiningGameIndicator from '../../components/GameComponents/JoiningGameIndicator/JoiningGameIndicator';
import { GameState, GameMessage, Board, Player } from '../../types/gameTypes';
import RematchDialog from '../../components/GameComponents/RematchDialog/RematchDialog';
import GifTauntFeature from '../../components/GameComponents/GifTauntFeature/GifTauntFeature';
import BlockchainNotification from '../../components/GameComponents/BlockchainNotification/BlockchainNotification';

import { useWalletStore } from '../../stores/walletStore';

const MOVE_TIMEOUT = 30000; // 30 seconds
const LOCK_PHASE_TIMEOUT = 5000; // 5 seconds
const WAIT_TIMEOUT = 50000 // 50 seconds

interface MultiplayerGameProps {
  userData?: { 
    privy_id: string; 
    email: string; 
    name: string; 
    wallet_balance: number;
    id?: number;
    deposit_address?: string;
    gif_ids?: [number];
  };
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ userData }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [, setTurnCount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [playerHasSufficientFunds, setPlayerHasSufficientFunds] = useState<boolean>(true);
  const balance = useWalletStore(state => state.balance);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [lockedCells, setLockedCells] = useState<Set<string>>(new Set());
  const [isLockPhase, setIsLockPhase] = useState<boolean>(false);
  const [locksRemaining, setLocksRemaining] = useState<number>(0);
  const [, setTotalGameLocksUsed] = useState<number>(0);
  const previousTurnIdxRef = useRef<number>(-1);
  const [currentPlayerLockedCells, setCurrentPlayerLockedCells] = useState<Set<string>>(new Set());
  const [moveEndTime, setMoveEndTime] = useState<number>(0);
  const [lockEndTime, setLockEndTime] = useState<number>(0);
  const setBalance = useWalletStore(state => state.setBalance);
  const [isRequestingRematch, setIsRequestingRematch] = useState<boolean>(false);
  const [rematchRequest, setRematchRequest] = useState<{ game_id: string; requester_id: string } | null>(null);
  const [previousGameId, setPreviousGameId] = useState<string | null>(null);
  const [showRematchDeclinedMessage, setShowRematchDeclinedMessage] = useState<boolean>(false);
  const [showGameAbortedMessage, setShowGameAbortedMessage] = useState<boolean>(false);
  const [ownedGifs, setOwnedGifs] = useState<Array<{id: number, name: string, url: string, rarity: string, price: number}>>([]);
  const [incomingGif, setIncomingGif] = useState<{id: number, url: string, playerId: string, playerName: string} | null>(null);
  const [showTauntButton, setShowTauntButton] = useState<boolean>(false);

  const [blockchainUpdate, setBlockchainUpdate] = useState<{
    hash: string;
    type: string;
    show: boolean;
  } | null>(null);

  // Sound references
  const notificationSound = useRef(new Audio('/assets/sounds/notification.mp3'));
  const startGameSound = useRef(new Audio('/assets/sounds/start_game.wav'));
  // const defeatSound = useRef(new Audio('/assets/sounds/defeatSound.mp3'));
  // const victorySound = useRef(new Audio('/assets/sounds/victorySound.mp3'));
  // const transactionSound = useRef(new Audio('/assets/sounds/transaction_notification.wav'));


  const moveTimeoutRef = useRef<number>();
  const lockTimeoutRef = useRef<number>();
  const waitTimeoutRef = useRef<number>();
  const locksRemainingRef = useRef<number>(0);
  const totalGameLocksUsedRef = useRef<number>(0);
  const lastRevealedCountRef = useRef<number>(0);
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [showShareOverlay, setShowShareOverlay] = useState<boolean>(false);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [, setIsCreatingRoom] = useState<boolean>(false);
  const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false);
  const didJoinGameRef = useRef<boolean>(false);
  const isCreatingRoomRef = useRef<boolean>(false);
  // First, add a new ref to track if a player has made a move in their current turn
  const playerMadeMoveRef = useRef<boolean>(false);
  const betAmountRef = useRef<number>(0);
  const balanceRef = useRef<number>(0);
  // Add a ref to ensure balance update only runs once per game
  const balanceUpdateCounterRef = useRef<number>(0);
  
  // Keep the balance ref updated
  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    betAmountRef.current = betAmount;
  }, [betAmount]);

  // Ensure the playerHasSufficientFunds state is updated when balance changes
  useEffect(() => {
    if (betAmount > 0) {
      setPlayerHasSufficientFunds(balance >= betAmountRef.current);
    }
  }, [balance, betAmount]);

  const lockSound = useRef(new Audio('/assets/sounds/lockSound.wav'));

  const ParticlesComponent = useParticles();

  const userDataRef = useRef(userData);
  // console.log("userData", userData);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  // Add this effect to fetch owned GIFs from localStorage or API
useEffect(() => {
  try {
    // Add these two free GIFs for every user
    const freeGifs = [
      {
        id: 18,
        name: "Angry Squidward",
        price: 0,
        url: "/assets/gifs/Angry Spongebob Squarepants GIF.gif",
        rarity: "Epic"
      },
      {
        id: 19,
        name: "The Booty Shake",
        price: 0,
        url: "/assets/gifs/The Simpsons Dance GIF.gif",
        rarity: "Epic"
      }
    ];
    
    // Start with the free GIFs that every user gets
    let userGifs = [...freeGifs];
    
    // If user has owned GIFs from backend (userData.gif_ids), add those to their collection
    if (userData?.gif_ids && userData.gif_ids.length > 0) {
      // Import GIF data from gifData.ts
      import('../../data/gifData').then(({ gifNfts }) => {
        // Find GIFs that match the IDs in userData.gif_ids
        const ownedGifs = userData?.gif_ids
          ? userData.gif_ids
              .map(id => gifNfts.find(gif => gif.id === id))
              .filter(Boolean) // Remove any undefined entries
              .map(gif => ({
                id: gif?.id || 0,
                name: gif?.name || "",
                price: gif?.price || 0,
                url: gif?.url || "",
                rarity: gif?.rarity || "Common"
              }))
          : [];
          
        // Combine free GIFs with owned GIFs
        userGifs = [...userGifs, ...ownedGifs];
        setOwnedGifs(userGifs);
      }).catch(error => {
        console.error("Failed to import GIF data:", error);
        // If import fails, at least give them the free GIFs
        setOwnedGifs(userGifs);
      });
    } else {
      // If user doesn't have any purchased GIFs, just set the free ones
      setOwnedGifs(userGifs);
    }
  } catch (error) {
    console.error("Failed to load owned GIFs:", error);
    // In case of any error, at least set the free GIFs
    setOwnedGifs([
      {
        id: 18,
        name: "Angry Squidward",
        price: 0,
        url: "/assets/gifs/Angry Spongebob Squarepants GIF.gif",
        rarity: "Epic"
      },
      {
        id: 19,
        name: "The Booty Shake",
        price: 0,
        url: "/assets/gifs/The Simpsons Dance GIF.gif",
        rarity: "Epic"
      }
    ]);
  }
}, [userData?.id, userData?.gif_ids]);

  // // Add this effect to fetch owned GIFs from localStorage or API
  // useEffect(() => {
  //   // For demonstration, we'll use GIFs from marketplace as owned GIFs
  //   // In a real implementation, you would fetch this from an API based on user ownership
  //   try {
  //     // This is just a mock implementation - replace with actual API call
  //     const mockOwnedGifs = [
  //       {
  //         id: 1,
  //         name: "Adult Dance",
  //         price: 0.15,
  //         url: "/assets/gifs/Adult Swim Dance GIF.gif",
  //         rarity: "Rare"
  //       },
  //       {
  //         id: 5,
  //         name: "Opponent Down",
  //         price: 0.20,
  //         url: "/assets/gifs/Celebrate Good Game GIF by Nounish.gif",
  //         rarity: "Epic"
  //       }
  //     ];
      
  //     setOwnedGifs(mockOwnedGifs);
  //   } catch (error) {
  //     console.error("Failed to load owned GIFs:", error);
  //   }
  // }, [userData?.id]);

  const [matchmakingParams, setMatchmakingParams] = useState<{
    gridSize: number;
    bombs: number;
    betAmount: number;
  } | null>(null);

  // Helper function to count revealed cells
  const countRevealedCells = useCallback((board: Board) => {
    if (!board || !board.grid) return 0;
    let count = 0;
    board.grid.forEach((row: ("Hidden" | "Revealed" | "Mined")[]) => {
      row.forEach((cell: "Hidden" | "Revealed" | "Mined") => {
        if (cell === 'Mined' || cell === 'Revealed') {
          count++;
        }
      });
    });
    return count;
  }, []);

  const calculateMaxLocks = useCallback((gameState: GameState) => {
    if (!('RUNNING' in gameState)) {
      console.error('Cannot calculate locks: Not in RUNNING state');
      return 0;
    }
  
    const board = gameState.RUNNING.board;
    const gridSize = board.grid.length;
    
    // Calculate the theoretical maximum locks for the entire game
    const totalGameMaxLocks = Math.floor(gridSize * (gridSize + 1) / 2);
    
    // Count unopened cells to ensure we leave at least one for the next player
    let unopenedCells = 0;
    board.grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell !== 'Revealed' && cell !== 'Mined') {
          unopenedCells++;
        }
      });
    });
  
    // Calculate the remaining locks available for the game
    const remainingGameLocks = Math.max(0, totalGameMaxLocks - totalGameLocksUsedRef.current);
    
    // Calculate the maximum locks allowed for this turn
    let availableLocks;
    if (unopenedCells > remainingGameLocks + 1) {
      // If we have plenty of unopened cells, use the remaining game locks
      availableLocks = remainingGameLocks;
    } else {
      // If cells are running low, ensure we leave at least 2 cells (1 for next move + buffer)
      availableLocks = Math.max(0, unopenedCells - 2);
    }
    
    return availableLocks;
  }, []);
  

  const handleGameMessage = useCallback((message: GameMessage) => {
    // console.log("balanceref in handleGamemessage", balanceRef.current)
    if (typeof message === "string") {
      if (message === "Pong") {
        console.log("Received pong from server");
        return;
      }
      return;
    }

    if ('BlockchainUpdate' in message) {
      const updateData = message.BlockchainUpdate;
      
      // Set the blockchain update state to trigger notification
      setBlockchainUpdate({
        hash: updateData.transaction_hash,
        type: updateData.update_type,
        show: true
      });
      
      // You could also log this for debugging
      console.log(`Blockchain update: ${updateData.update_type} - ${updateData.transaction_hash}`);
    }

    // Add this new handling for Gif messages
    if ('Gif' in message) {
      const gifData = message.Gif;
      const gifId = gifData.gif_id;
      const senderId = gifData.player_id;
      
      // Don't show your own GIFs as incoming
      // if (senderId === userData?.id?.toString()) {
      //   return;
      // }
      
      // Find the GIF URL from the GIF ID
      // This is a mock implementation - you should adjust based on your actual GIF data structure
      const gifUrls = {
        1: "/assets/gifs/Adult Swim Dance GIF.gif",
        2: "/assets/gifs/Angry GIF.gif",
        3: "/assets/gifs/Animation Smile by Mashed.gif",
        4: "/assets/gifs/Bear Reaction GIF - The Comedy Bar.gif",
        5: "/assets/gifs/Celebrate Good Game GIF by Nounish.gif",
        6: "/assets/gifs/Dick Armstrong GIF by gifnews.gif",
        7: "/assets/gifs/Excited Shake It GIF by Sherchle.gif",
        8: "/assets/gifs/Happy Excitement GIF.gif",
        9: "/assets/gifs/Happy Robot GIF.gif",
        10: "/assets/gifs/Homer Simpson Reaction GIF.gif",
        11: "/assets/gifs/Middle Finger GIF.gif",
        12: "/assets/gifs/Sad Cry SpongeBob GIF.gif",
        13: "/assets/gifs/Suck It Ha Ha GIF Pudgy Penguins.gif",
        14: "/assets/gifs/Sexy Funny Face GIF by Globkins.gif",
        15: "/assets/gifs/Suck It Ha Ha GIF Pudgy Penguins.gif",
        16: "/assets/gifs/Teenage Mutant Ninja Turtles GIF.gif",
        17: "/assets/gifs/Valentines Day Love GIF.gif",
        18: "/assets/gifs/Angry Spongebob Squarepants GIF.gif",
        19: "/assets/gifs/The Simpsons Dance GIF.gif",
      };
      
      // Find the sender player name
      let senderName = "Opponent";
      if (gameState && 'RUNNING' in gameState) {
        const sender = gameState.RUNNING.players.find(p => p.id?.toString() === senderId);
        if (sender) {
          senderName = sender.name;
        }
      }
      
      // Set the incoming GIF to display
      setIncomingGif({
        id: gifId,
        url: gifUrls[gifId as keyof typeof gifUrls] || "/assets/gifs/default.gif",
        playerId: senderId || "",
        playerName: senderName
      });
      
      // Auto-clear the GIF after 5 seconds
      setTimeout(() => {
        setIncomingGif(null);
      }, 5000);

      // Play notification sound
      notificationSound.current.play().catch(console.error);
    }
  
    if ('GameUpdate' in message) {
      const updateData = message.GameUpdate;
      if (updateData && typeof updateData === 'object' && 'RematchRejected' in updateData) {
        console.log("Rematch was rejected:", updateData.RematchRejected);
        
        // Clear rematch state
        setRematchRequest(null);
        setIsRequestingRematch(false);
        
        // Show rematch declined message
        setShowRematchDeclinedMessage(true);
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setShowRematchDeclinedMessage(false);
        }, 5000);
        
        // Reset game state to show lobby
        resetGameState();
        
        // Explicitly set game state to null to force lobby display
        setGameState(null);
        
        // Navigate to multiplayer route
        navigate('/multiplayer', { replace: true });
        
        // Return early since we've handled this message type
        return;
      }

      const newGameState = message.GameUpdate;

      // Update the game state
      setGameState(newGameState ?? null);
      
      // Hide joining indicator when we receive any game state
      if (newGameState) {
        setIsJoiningGame(false);
      }

      if (newGameState && 'ABORTED' in newGameState) {
        // Show game aborted message
        setShowGameAbortedMessage(true);
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setShowGameAbortedMessage(false);
        }, 5000);
      }

      // IMPORTANT: Check using the ref for reliability
      if (newGameState && 'WAITING' in newGameState) {
        if (isCreatingRoomRef.current) {
          console.log("✅ SHOWING SHARE OVERLAY - Creating room + WAITING state");
          const roomId = newGameState.WAITING.game_id;
          setGameRoomId(roomId);
          setShowShareOverlay(true);
          
          // Update URL
          // navigate(`/multiplayer/${roomId}`, { replace: true });
        } else {
          console.log("❌ NOT showing share overlay - not in creation mode");
        }
      }
      
      // Clear matchmaking parameters when game state changes from WAITING to something else
      if (newGameState && ('RUNNING' in newGameState || 'FINISHED' in newGameState)) {
        setMatchmakingParams(null);
        setShowShareOverlay(false);
      }
      
      if (newGameState) {
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
  
        if ('RUNNING' in newGameState) {
          // Reset the balance update counter for a new game
          balanceUpdateCounterRef.current = 0;

          // Clear the wait timeout if game has started running
          if (waitTimeoutRef.current) {
            clearTimeout(waitTimeoutRef.current);
            waitTimeoutRef.current = undefined;
          }

          const currentUserData = userDataRef.current;
          const currentTurnIdx = newGameState.RUNNING.turn_idx;
          const currentPlayer = newGameState.RUNNING.players[currentTurnIdx];
          const isCurrentPlayerTurn = currentPlayer.id === currentUserData?.id?.toString();

          // Save game ID for potential rematch
          if (previousGameId !== newGameState.RUNNING.game_id) {
            setPreviousGameId(newGameState.RUNNING.game_id);
          }

          // Add this special handling for rematch games:
          // Special handling for new games or rematch games - IMPORTANT FOR TIMER ISSUES
          const isNewGameOrRematch = previousTurnIdxRef.current === -1;

          // // Check if turn has changed
          // if (previousTurnIdxRef.current !== currentTurnIdx) {
          // Check if turn has changed or if this is a new/rematch game
          if (previousTurnIdxRef.current !== currentTurnIdx || isNewGameOrRematch) {
            // console.log("Turn changed or new game detected, resetting timer");
            // For all players: set move timer and exit lock phase
            setMoveEndTime(Date.now() + MOVE_TIMEOUT);
            setIsLockPhase(false);

            // Reset the move made flag when turn changes
            playerMadeMoveRef.current = false;
            
            // Only reset locks for the current player
            if (isCurrentPlayerTurn) {
              const maxLocks = calculateMaxLocks(newGameState);
              locksRemainingRef.current = maxLocks;
              setLocksRemaining(maxLocks);
            } else {
              // Just reset the player's local locked cells
              setCurrentPlayerLockedCells(new Set());
            }
            
            // Update turn reference
            previousTurnIdxRef.current = currentTurnIdx;
          }

          // Detect if a move was just made(by this player) by checking revealed cells
          const currentRevealedCount = countRevealedCells(newGameState.RUNNING.board);

          // Only enter lock phase if:
          // 1. More cells are revealed than before
          // 2. The turn hasn't changed
          // 3. This player has made a move in their turn (not just server state updates)          
          if (currentRevealedCount > lastRevealedCountRef.current && 
              previousTurnIdxRef.current === currentTurnIdx &&
              playerMadeMoveRef.current) {
            // A move was made without turn change - entering lock phase 
            setIsLockPhase(true);
            setLockEndTime(Date.now() + LOCK_PHASE_TIMEOUT);
          }
          
          // Update our reference of revealed cell count
          lastRevealedCountRef.current = currentRevealedCount;

          // Set move timeout only for the current player
          if (isCurrentPlayerTurn) {
            // Clear any existing timeout before setting a new one
            if (moveTimeoutRef.current) {
              clearTimeout(moveTimeoutRef.current);
            }

            moveTimeoutRef.current = window.setTimeout(() => {
              setTurnCount((prevCount) => {
                const abort = prevCount === 0;
                console.log("###### Aborting due to movetimeout this is the turn count: ", prevCount)
                sendMessage({
                  Stop: {
                    game_id: newGameState.RUNNING.game_id,
                    abort,
                  },
                });
                return prevCount;
              });
            }, MOVE_TIMEOUT);
          }

          // Update locked cells
          const newLockedCells = new Set<string>();
          if (newGameState.RUNNING.locks) {
            newGameState.RUNNING.locks.forEach((lock: [number, number]) => {
              newLockedCells.add(`${lock[0]}-${lock[1]}`);
            });
          }
          setLockedCells(newLockedCells);

          // Update revealed cells
          const newRevealedCells = new Set<string>();
          const board = newGameState.RUNNING.board;
          board.grid.forEach((row, x) => {
            row.forEach((cell, y) => {
              if (cell === 'Mined' || cell === 'Revealed') {
                newRevealedCells.add(`${x}-${y}`);
              }
            });
          });
          setRevealedCells(newRevealedCells);

          // Only clear timeouts for non-current players
          if (!isCurrentPlayerTurn && lockTimeoutRef.current) {
            clearTimeout(lockTimeoutRef.current);
            lockTimeoutRef.current = undefined;
          }
        } else if ('WAITING' in newGameState) {
          // Set wait timeout only when in WAITING state
          if (waitTimeoutRef.current) {
            clearTimeout(waitTimeoutRef.current);
          }
          waitTimeoutRef.current = window.setTimeout(() => {
            console.log("###### Aborting due to waitTimeOut")
            sendMessage({
              Stop: {
                game_id: newGameState.WAITING.game_id,
                abort: true,
              },
            });
            resetGameState();
            // setError('Game aborted due to inactivity.');
            
            // Clear matchmaking overlay
            setMatchmakingParams(null);
          }, WAIT_TIMEOUT);
        } else if ('FINISHED' in newGameState) {
          // Handle finished state
          const newRevealedCells = new Set<string>();
          const board = newGameState.FINISHED.board;
          board.grid.forEach((row, x) => {
            row.forEach((cell, y) => {
              if (cell === 'Mined' || cell === 'Revealed') {
                newRevealedCells.add(`${x}-${y}`);
              }
            });
          });
          setRevealedCells(newRevealedCells);

          // Reset rematch state when game finishes
          setIsRequestingRematch(false);
          setRematchRequest(null);

          // Only run the balance update code once per game
          if (balanceUpdateCounterRef.current === 0) {
            balanceUpdateCounterRef.current = 1;
            // Identify winner and loser for balance updates
            const isLoser = newGameState.FINISHED.players[newGameState.FINISHED.loser_idx].id === userDataRef.current?.id?.toString();
            
            const currentBetAmount = betAmountRef.current
            const currentBalance = balanceRef.current;

            // Update the local balance immediately based on win/loss
            if (isLoser) {
              // This player lost - decrease balance by bet amount
              // Use the balance from ref to ensure we have the latest value
              console.log("Current balance before update:", currentBalance);
              const newBalance = Math.max(currentBalance - currentBetAmount, 0);
              setBalance(newBalance);
              console.log("Updated balance after loss:", newBalance);
              // Check if they still have sufficient funds for a rematch
              setPlayerHasSufficientFunds(newBalance >= currentBetAmount);
            } else {
              // This player won - increase balance
              // Calculate winnings: betting amount divided by (number of players - 1)
              const numberOfPlayers = newGameState.FINISHED.players.length;
              const winAmount = currentBetAmount / (numberOfPlayers - 1);
              console.log("Current balance before update:", currentBalance);
              const newBalance = currentBalance + winAmount;
              setBalance(newBalance);
              console.log("Updated balance after win:", newBalance);
              // They have sufficient funds since they won
              setPlayerHasSufficientFunds(true);
            }

            // // Prepare the request data
            // const currentUserData = userDataRef.current;
            // const newUserData = {
            //   privy_id: currentUserData?.privy_id,
            //   email: currentUserData?.email,
            //   name: currentUserData?.name || '',
            // };
            
            // // Add delay and make the direct API call
            // setTimeout(() => {
            //   fetch(import.meta.env.VITE_USER_DETAILS_ENDPOINT_URL, {
            //     method: 'POST',
            //     headers: {
            //       'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(newUserData),
            //   })
            //   .then(response => {
            //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            //     return response.json();
            //   })
            //   .then(userDetailsData => {
            //     setBalance(userDetailsData.balance);
            //     console.log("Balance update of the user after the game is finished (server responded): ", userDetailsData);
            //   })
            //   .catch(error => {
            //     console.error('Failed to update user balance:', error);
            //   });
            // }, 3000);
          }
        } else if ('REMATCH' in newGameState) {
          // Handle rematch state
          setIsRequestingRematch(false);

          // Clear any existing move timeout - IMPORTANT FOR TIMER ISSUES
          if (moveTimeoutRef.current) {
            clearTimeout(moveTimeoutRef.current);
            moveTimeoutRef.current = undefined;
          }

          // Reset move end time to ensure a fresh timer when transitioning to RUNNING
          setMoveEndTime(0);

          // Reset the turn index reference to ensure a fresh turn detection
          previousTurnIdxRef.current = -1;
          
          // Reset the player made move flag to ensure proper lock phase detection
          playerMadeMoveRef.current = false;
          
          const newRevealedCells = new Set<string>();
          const board = newGameState.REMATCH.board;
          board.grid.forEach((row, x) => {
            row.forEach((cell, y) => {
              if (cell === 'Mined' || cell === 'Revealed') {
                newRevealedCells.add(`${x}-${y}`);
              }
            });
          });
          setRevealedCells(newRevealedCells);
          
          // Check if all players have accepted and the game should transition to RUNNING state
          const allPlayersAccepted = newGameState.REMATCH.accepted.every(status => status === 1);
          if (allPlayersAccepted) {
            // The server should transition the game to RUNNING state
            console.log("All players accepted rematch, waiting for server to transition to RUNNING state");
          }
        }
      } 
    } else if ('RematchRequest' in message) {
      // Show rematch dialog when receiving a rematch request
      const request = message.RematchRequest;

      // Clear any existing move timeout to prevent timer issues
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = undefined;
      }
      
      // Don't show the request if the current user is the requester
      if (userData?.id?.toString() !== request.requester_id) {
        // Play notification sound for the receiver
        notificationSound.current.play().catch(console.error);
        setRematchRequest(request);
      }
    } else if ('Error' in message) {
      const errorMessage = typeof message.Error === 'string' ? message.Error : 'An error occurred';
      setError(errorMessage);

      // Reset rematch state if there's an error with the rematch
      if (errorMessage.includes("rematch")) {
        setIsRequestingRematch(false);
        setRematchRequest(null);
      }
      
      // Add these lines to handle join errors
      if (
        errorMessage.includes("not accepting players") || 
        errorMessage.includes("game not found") ||
        errorMessage.includes("game is over")
      ) {
        // console.log("Game cannot be joined, redirecting to lobby");
        // Hide the joining indicator
        setIsJoiningGame(false);
        // Reset the join flag
        didJoinGameRef.current = false;
        // Navigate to lobby
        navigate('/multiplayer', { replace: true });
      }
    }
  }, [calculateMaxLocks, countRevealedCells]);

  const { sendMessage, isConnected, isRedirecting } = useWebSocket({
    onMessage: handleGameMessage,
    onError: setError,
    gameState
  });

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
      }
    };
  }, []);

  // 3. Add an additional effect to reset the join flag when URL changes
  useEffect(() => {
    // If we're on the base multiplayer route (no gameId in URL)
    // Make sure didJoinGameRef is reset
    if (!gameId && window.location.pathname === '/multiplayer') {
      didJoinGameRef.current = false;
      setIsJoiningGame(false);
    }
  }, [gameId]);

  // Update the joining effect to be more precise about when to join
  useEffect(() => {
    // Only attempt to join if:
    // 1. We have a gameId in the URL
    // 2. We have user data
    // 3. We're connected to the server
    // 4. We haven't already tried to join
    // 5. We're not already in a game
    // 6. We're actually on the gameId route (not the base multiplayer route)
    if (
      gameId && 
      userData?.id && 
      isConnected && 
      !didJoinGameRef.current && 
      !gameState &&
      window.location.pathname.includes(`/multiplayer/${gameId}`) // Check we're on the game route
    ) {
      console.log(`Attempting to join game with ID: ${gameId}`);
      didJoinGameRef.current = true;
      setIsJoiningGame(true);
      
      // Send the join message to the server
      sendMessage({
        Join: {
          player_id: userData.id.toString(),
          game_id: gameId,
          name: userData.name
        }
      });
    }
  }, [gameId, userData, isConnected, sendMessage, gameState, navigate]);

  // Add a timeout for join attempts
  useEffect(() => {
    if (isJoiningGame) {
      // If we're trying to join a game, set a timeout to redirect if it takes too long
      const joinTimeout = setTimeout(() => {
        console.log("Join attempt timed out, redirecting to lobby");
        setIsJoiningGame(false);
        didJoinGameRef.current = false;
        setError("Unable to join game - the game may have ended or is not accepting players.");
        navigate('/multiplayer', { replace: true });
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(joinTimeout);
    }
  }, [isJoiningGame, navigate]);

  // First, add a useEffect to automatically clear error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      
      // Cleanup function to clear timer if component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Add this effect to determine when to show the taunt button
  useEffect(() => {
    // Only show taunt button during an active game
    setShowTauntButton(!!gameState && 'RUNNING' in gameState);
  }, [gameState]);

  // Add a function to hide the blockchain notification
  const hideBlockchainNotification = useCallback(() => {
    setBlockchainUpdate(prev => prev ? { ...prev, show: false } : null);
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    if (!gameState || !('RUNNING' in gameState)) return;
  
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
  
    // Check if the cell being clicked is a bomb
    const board = gameState.RUNNING.board;
    const gridSize = board.grid.length;
    const cellIndex = x * gridSize + y;
    const isBomb = board.bomb_coordinates.includes(cellIndex);
    
    // Set the flag to indicate this player made a move
    playerMadeMoveRef.current = true;
    
    // Send the move to the server
    sendMessage({
      MakeMove: {
        game_id: gameState.RUNNING.game_id,
        x,
        y,
      },
    });
    
    setTurnCount(prev => prev + 1);
    
    // If the cell is a bomb, don't enter lock phase - instead show a brief pause
    if (isBomb) {
      // console.log("Player hit a bomb! Pausing before next turn...");
      
      // Don't enter lock phase
      setIsLockPhase(false);
      
      // Clear any lock timeout
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
        lockTimeoutRef.current = undefined;
      }
      
      // After a brief pause, tell the server we're done (if game hasn't ended already)
      setTimeout(() => {
        // Double-check if game is still running (it might have ended already due to bomb)
        if (gameState && 'RUNNING' in gameState) {
          console.log("Sending lock complete after bomb pause");
          sendMessage({
            LockComplete: {
              game_id: gameState.RUNNING.game_id,
            },
          });
        }
      }, 2000); // 2 second delay for visual feedback
    } else {
      // Normal flow for non-bomb cells - calculate locks and potentially enter lock phase
      const maxLocks = calculateMaxLocks(gameState);
      
      if (maxLocks <= 0) {
        // Skip lock phase if no locks are available
        console.log("No locks available - skipping lock phase");
        setIsLockPhase(false);
        
        // Immediately send lock complete to move to next player
        sendMessage({
          LockComplete: {
            game_id: gameState.RUNNING.game_id,
          },
        });
        
        // Clear any existing lock timeout
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
          lockTimeoutRef.current = undefined;
        }
      } else {
        // Normal flow - enter lock phase
        setIsLockPhase(true);
        setCurrentPlayerLockedCells(new Set());
        setLockEndTime(Date.now() + LOCK_PHASE_TIMEOUT);
        locksRemainingRef.current = maxLocks;
        setLocksRemaining(maxLocks);
    
        // Set timeout for locking phase
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
        }
        
        lockTimeoutRef.current = window.setTimeout(() => {
          sendMessage({
            LockComplete: {
              game_id: gameState.RUNNING.game_id,
            },
          });
        }, LOCK_PHASE_TIMEOUT);
      }
    }
  }, [gameState, sendMessage, calculateMaxLocks]);

  const handleLock = useCallback((x: number, y: number) => {
    if (!gameState || !('RUNNING' in gameState)) {
      console.error('Cannot lock: Invalid game state');
      return;
    }

    // Strict lock check
    if (locksRemainingRef.current <= 0) {
      console.error('No locks remaining');
      return;
    }

    const cellKey = `${x}-${y}`;
    
    // Prevent locking revealed or already locked cells
    if (revealedCells.has(cellKey) || lockedCells.has(cellKey)) {
      console.error(`Cannot lock cell ${cellKey}: Already revealed or locked`);
      return;
    }

    // Decrement locks for this turn
    locksRemainingRef.current -= 1;
    setLocksRemaining(locksRemainingRef.current);

    // Increment total game locks used
    totalGameLocksUsedRef.current += 1;
    setTotalGameLocksUsed(totalGameLocksUsedRef.current);

    // Update locked cells
    setCurrentPlayerLockedCells(prev => {
      const updated = new Set(prev);
      updated.add(cellKey);
      return updated;
    });

    // Play lock sound
    lockSound.current.play().catch(console.error);

    // Send lock message to server
    sendMessage({
      Lock: {
        game_id: gameState.RUNNING.game_id,
        x,
        y,
      },
    });

    // Check if lock phase should complete
    if (locksRemainingRef.current === 0) {
      // Clear lock timeout
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }

      // Send lock complete message
      sendMessage({
        LockComplete: {
          game_id: gameState.RUNNING.game_id,
        },
      });

      // Reset lock phase
      setIsLockPhase(false);
      setLockEndTime(0);
    }
  }, [gameState, sendMessage, revealedCells, lockedCells]);

  const resetGameState = useCallback(() => {
    // Clear any existing timeouts
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = undefined;
    }
    
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = undefined;
    }
    
    // Reset all state variables
    setGameState(null);
    setRevealedCells(new Set());
    setLockedCells(new Set());
    setIsLockPhase(false);
    setCurrentPlayerLockedCells(new Set());
    setError('');
    // setBetAmount(0);
    
    // Reset the move and lock end times
    setMoveEndTime(0);
    setLockEndTime(0);
    
    // Reset turn count and locks
    setTurnCount(0);
    setTotalGameLocksUsed(0);
    setLocksRemaining(0);
    
    // Reset all reference variables
    totalGameLocksUsedRef.current = 0;
    lastRevealedCountRef.current = 0;
    locksRemainingRef.current = 0;
    previousTurnIdxRef.current = -1;
    didJoinGameRef.current = false;
    setGameRoomId(null);
    setShowShareOverlay(false);
    setIsCreatingRoom(false);
    setIsJoiningGame(false);
    isCreatingRoomRef.current = false;
    
    // Reset rematch state
    setIsRequestingRematch(false);
    setRematchRequest(null);
  }, []);

  // Add these handler functions for rematch functionality
  const handleRequestRematch = useCallback(() => {
    if (!gameState || !('FINISHED' in gameState) || !userData?.id) return;

    // Check if player has sufficient funds
    if (balanceRef.current < betAmount) {
      setError('Insufficient funds for rematch.');
      return
    }
  
    setIsRequestingRematch(true);
    
    // Store the request locally to show the waiting UI to the requester
    const request = {
      game_id: gameState.FINISHED.game_id,
      requester_id: userData.id.toString(),
    };
    
    setRematchRequest(request);
    
    // Clear any existing move timeout to prevent timer issues
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = undefined;
    }

    setTotalGameLocksUsed(0);
    setLocksRemaining(0);
    totalGameLocksUsedRef.current = 0;
    locksRemainingRef.current = 0;
    
    // Reset turn tracking to force fresh timer on new game
    previousTurnIdxRef.current = -1;
    
    // Play notification sound for the requester
    notificationSound.current.play().catch(console.error);
    
    // Send the rematch request to the server
    sendMessage({
      RematchRequest: request
    });
  }, [gameState, userData, sendMessage, playerHasSufficientFunds]);
  
  const handleAcceptRematch = useCallback(() => {
    // We can accept a direct rematch request or a rematch state
    const gameId = rematchRequest?.game_id || 
                  (gameState && 'REMATCH' in gameState ? gameState.REMATCH.game_id : null);
    
    if (!gameId || !userData?.id) return;

    // Check if player has sufficient funds
    if (balanceRef.current < betAmount) {
      setError(`Insufficient funds to accept rematch. You need ${betAmount} SOL.`);
      // Automatically decline the rematch
      sendMessage({
        RematchResponse: {
          game_id: gameId,
          player_id: userData.id.toString(),
          want_rematch: false,
        },
      });
      
      // Clear the request
      setRematchRequest(null);
      return;
    }
  
    // Clear any existing move timeout to prevent timer issues
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = undefined;
    }

    setTotalGameLocksUsed(0);
    setLocksRemaining(0);
    totalGameLocksUsedRef.current = 0;
    locksRemainingRef.current = 0;
    
    // Reset the turn index reference to ensure fresh turn detection
    previousTurnIdxRef.current = -1;
    
    // Play notification sound for the requester
    startGameSound.current.play().catch(console.error);
  
    sendMessage({
      RematchResponse: {
        game_id: gameId,
        player_id: userData.id.toString(),
        want_rematch: true,
      },
    });
    
    // Only clear the direct request if it exists
    if (rematchRequest) {
      setRematchRequest(null);
    }
  }, [rematchRequest, gameState, userData, sendMessage, betAmount]);
  
  const handleDeclineRematch = useCallback(() => {
    // We can decline a direct rematch request or a rematch state
    const gameId = rematchRequest?.game_id || 
                  (gameState && 'REMATCH' in gameState ? gameState.REMATCH.game_id : null);
    
    if (!gameId || !userData?.id) return;
  
    sendMessage({
      RematchResponse: {
        game_id: gameId,
        player_id: userData.id.toString(),
        want_rematch: false,
      },
    });
    
    // Clear the request and go back to lobby
    setRematchRequest(null);
    
    // Only navigate to lobby if we're declining (not canceling our own request)
    if (!rematchRequest || userData.id.toString() !== rematchRequest.requester_id) {
      // Reset the game state
      resetGameState();
      
      // Clear the didJoinGameRef to prevent auto-join on navigation
      didJoinGameRef.current = false;
      
      // Navigate to the base multiplayer route, replacing the current URL
      // navigate('/multiplayer', { replace: true });
    }
  }, [rematchRequest, gameState, userData, sendMessage, resetGameState]);
  
  const playGame = useCallback((gridSize: number, bombs: number, minPlayers: number) => {
    if (!userData?.id) return;
    
    resetGameState();
  
    // Set BOTH the ref and the state to false
    isCreatingRoomRef.current = false;
    setIsCreatingRoom(false);
    console.log("isCreatingRoomRef set to:", isCreatingRoomRef.current);
    
    // Store matchmaking parameters
    setMatchmakingParams({ gridSize, bombs, betAmount });
  
    sendMessage({
      Play: {
        player_id: userData.id.toString(),
        single_bet_size: betAmount,
        name: userData.name.toString(),
        grid: gridSize,
        bombs,
        min_players: minPlayers,
        is_creating_room: false
      },
    });
  }, [userData, betAmount, sendMessage, resetGameState]);

  // Add this function to handle sending GIFs
  const handleSendGif = useCallback((gifId: number) => {
    if (!gameState || !('RUNNING' in gameState) || !userData?.id) {
      console.error("Cannot send GIF: Game not running or user not identified");
      return;
    }
    
    sendMessage({
      Gif: {
        game_id: gameState.RUNNING.game_id,
        player_id: userData.id.toString(),
        gif_id: gifId
      }
    });
  }, [gameState, userData, sendMessage]);


  // 3. Make sure the createGameRoom function explicitly sets isCreatingRoom to true
  const createGameRoom = useCallback((gridSize: number, bombs: number, minPlayers: number) => {
    if (!userData?.id) return;
    
    console.log("===== CREATE GAME ROOM CLICKED =====");
    
    // Clear everything and start fresh
    resetGameState();
    
    // Set BOTH the ref and the state for redundancy
    isCreatingRoomRef.current = true;
    setIsCreatingRoom(true);
    console.log("isCreatingRoomRef set to:", isCreatingRoomRef.current);
    
    // Send the Play message to create a game
    sendMessage({
      Play: {
        player_id: userData.id.toString(),
        single_bet_size: betAmount,
        name: userData.name.toString(),
        grid: gridSize,
        bombs,
        min_players: minPlayers,
        is_creating_room: true
      },
    });
  }, [userData, betAmount, sendMessage, resetGameState]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-4">

      {/* Matchmaking overlay */}
      {matchmakingParams && (
        <MatchmakingAnimation 
          gridSize={matchmakingParams.gridSize}
          bombs={matchmakingParams.bombs}
          betAmount={matchmakingParams.betAmount}
        />
      )}
      
      {/* Game room sharing overlay */}
      {showShareOverlay && gameRoomId && (
        <GameRoomShare 
          gameId={gameRoomId} 
          onClose={() => setShowShareOverlay(false)}
          onCancel={() => {
            // Cancel the game and reset
            if (gameState && 'WAITING' in gameState) {
              sendMessage({
                Stop: {
                  game_id: gameState.WAITING.game_id,
                  abort: true,
                },
              });
            }
            resetGameState();
            navigate('/multiplayer', { replace: true });
          }}
        />
      )}

      {/* Joining Game Indicator */}
      {isJoiningGame && gameId && (
        <JoiningGameIndicator gameId={gameId} />
      )}

      <RematchDialog
        gameState={gameState}
        userData={userData}
        onAccept={handleAcceptRematch}
        onDecline={handleDeclineRematch}
        isRequesting={isRequestingRematch}
        onRequestRematch={handleRequestRematch}
        playerHasSufficientFunds={playerHasSufficientFunds}
        betAmount={betAmount}
        rematchRequest={rematchRequest}
      />

      {showTauntButton && (
        <GifTauntFeature 
          onSelectGif={handleSendGif}
          ownedGifs={ownedGifs}
          incomingGif={incomingGif}
          players={gameState && 'RUNNING' in gameState ? (gameState as { RUNNING: { players: Player[] } }).RUNNING.players : []}
        />
      )}

      {/* Add Blockchain Notification */}
      {blockchainUpdate && (
        <BlockchainNotification
          transactionHash={blockchainUpdate.hash}
          updateType={blockchainUpdate.type}
          show={blockchainUpdate.show}
          onHide={hideBlockchainNotification}
        />
      )}

      {ParticlesComponent}
      
      <div className="relative w-full max-w-md z-10">
        <h1 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent invisible">Diamond Hunters</h1>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm mb-6 bg-red-950/30 border border-red-900/50 rounded-lg p-3"
          >
            {error}
          </motion.div>
        )}
        {showRematchDeclinedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-yellow-400 text-sm mb-6 bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3"
          >
            Rematch request declined
          </motion.div>
        )}

        {showGameAbortedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-orange-400 text-sm mb-6 bg-orange-950/30 border border-orange-900/50 rounded-lg p-3"
          >
            Game aborted due to inactivity
          </motion.div>
        )}

        {(!gameState || 'ABORTED' in gameState) && (
          <LobbyDetails
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            playGame={playGame}
            createGameRoom={createGameRoom}
            isConnected={isConnected}
          />
        )}

        {gameState && 'RUNNING' in gameState && (
          <EnhancedTurnIndicator 
            gameState={gameState}
            userData={userData}
            isLockPhase={isLockPhase}
            moveEndTime={moveEndTime}
            lockEndTime={lockEndTime}
          />
        )}

        <GameStatus 
          gameState={gameState} 
          userData={userData}
        />
      </div>

      <div className="relative w-auto z-10">
        <GameBoard
          gameState={gameState}
          userData={userData}
          revealedCells={revealedCells}
          lockedCells={lockedCells}
          currentPlayerLockedCells={currentPlayerLockedCells}
          onMove={handleMove}
          onLock={handleLock}
          isLockPhase={isLockPhase}
          locksRemaining={locksRemaining}
        />
      </div>

      <div className="relative w-full max-w-md z-10">
        {!isConnected && !isRedirecting && (
          <div className="text-zinc-400 text-sm mt-6 flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Reconnecting...</span>
          </div>
        )}

        {isRedirecting && (
          <div className="text-emerald-400 text-sm mt-6 flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" size={16} />
            <span>Connecting to optimal game server...</span>
          </div>
        )}

        {gameState && (('FINISHED' in gameState || 'ABORTED' in gameState) && !rematchRequest) && (
          <>
            {showTauntButton && (
              <GifTauntFeature 
                onSelectGif={handleSendGif}
                ownedGifs={ownedGifs}
                incomingGif={incomingGif}
                players={gameState && 'RUNNING' in gameState ? (gameState as { RUNNING: { players: Player[] } }).RUNNING.players : []}
              />
            )}
            <div className="flex gap-3 w-full mt-6">
              {/* Rematch Button (only show for FINISHED state, not ABORTED, and only if playerHasSufficientFunds) */}
              {'FINISHED' in gameState && playerHasSufficientFunds && (
                <button
                  onClick={handleRequestRematch}
                  disabled={isRequestingRematch}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isRequestingRematch
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  {isRequestingRematch ? 'Requesting Rematch...' : 'Rematch'}
                </button>
              )}
              {/* Back to Lobby Button remains unchanged */}
              {'FINISHED' in gameState && (
                <button
                  onClick={() => {
                    resetGameState();
                    didJoinGameRef.current = false;
                    navigate('/multiplayer', { replace: true });
                  }}
                  className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border border-zinc-500/30"
                >
                  Back to Lobby
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGame;