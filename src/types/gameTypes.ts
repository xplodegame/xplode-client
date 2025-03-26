// Types matching Rust backend exactly
export type Player = {
  privy_id: string;
  email: string;
  name: string;
  wallet_balance?: number;
  id?: number;
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
  | { ABORTED: { game_id: string } };

export type GameMessage =
  | "Ping" // Unit variant for initial ping
  | "Pong" // Unit variant for pong response
  | { Ping: { game_id: string } } // Object variant for game-specific ping
  | {
      Play: {
        player_id: string;
        single_bet_size: number;
        min_players: number;
        bombs: number;
        grid: number;
      };
    }
  | {
      Join: {
        player_id: string;
        game_id: string;
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
    };
