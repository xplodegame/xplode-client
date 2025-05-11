// Complete updated gameTypes.ts file for reference
// Types matching Rust backend exactly
export type Player = {
  id?: number;
  privy_id: string;
  email: string;
  name: string;
  wallet_balance?: number;
};

export type Board = {
  n: number;
  grid: ("Hidden" | "Revealed" | "Mined")[][];
  bomb_coordinates: number[];
};

export type GameState =
  | {
      WAITING: {
        game_id: string;
        creator: Player;
        board: Board;
        single_bet_size: number;
      };
    }
  | {
      RUNNING: {
        game_id: string;
        players: Player[];
        board: Board;
        turn_idx: number;
        single_bet_size: number;
        locks: [number, number][];
      };
    }
  | {
      FINISHED: {
        game_id: string;
        loser_idx: number;
        board: Board;
        players: Player[];
        single_bet_size: number;
      };
    }
  | {
      REMATCH: {
        game_id: string;
        players: Player[];
        board: Board;
        single_bet_size: number;
        accepted: number[]; // Array tracking which players have accepted (1 for accepted, 0 for not yet)
      };
    }
  | { ABORTED: { game_id: string } };

export type GameMessage =
  | "Ping" // Unit variant for initial ping
  | "Pong" // Unit variant for pong response
  | { Ping: { game_id: string } } // Object variant for game-specific ping
  | {
      Play: {
        player_id: string;
        name: string;
        single_bet_size: number;
        min_players: number;
        bombs: number;
        grid: number;
        is_creating_room: boolean;
      };
    }
  | {
      Join: {
        player_id: string;
        game_id: string;
        name: string;
      };
    }
  | { MakeMove: { game_id: string; x: number; y: number } }
  | { Stop: { game_id: string; abort: boolean } }
  | { GameUpdate: GameState }
  | { Error: string }
  | { Lock: { game_id: string; x: number; y: number } }
  | { LockComplete: { game_id: string } }
  | {
      RedirectToServer: {
        game_id: string;
        machine_id: string;
      };
    }
  | {
      RematchRequest: {
        game_id: string;
        requester_id: string; // Player ID of the player requesting rematch
      };
    }
  | {
      RematchResponse: {
        game_id: string;
        player_id: string;
        want_rematch: boolean; // true for accept, false for decline
      };
    }
  |
    {
      Gif: {
        game_id: string;
        player_id?: string;
        gif_id: number;
      }
    }
  | 
    {
      BlockchainUpdate: {
        game_id: string;
        update_type: "MoveRecorded" | "LockRecorded" | "GameStarted" | "GameFinished";
        transaction_hash: string;
      };
    }
