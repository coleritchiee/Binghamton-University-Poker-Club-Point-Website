export interface LeaderboardEntry {
    rank: number;
    name: string;
    points: number;
  }
  
  export interface MeetingResult {
    rank: number;
    name: string;
    knockouts: number;
    hourGame: boolean;
    points: number;
  }
  
  export interface Meeting {
    id: string;
    name: string;
    results: MeetingResult[];
  }
  
  export interface TournamentResult {
    rank: number;
    name: string;
    points: number;
  }
  
  export interface Tournament {
    id: string;
    name: string;
    results: TournamentResult[];
  }