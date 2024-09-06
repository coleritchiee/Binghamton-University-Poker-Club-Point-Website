import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, DocumentData } from 'firebase/firestore';
import { LeaderboardEntry, Meeting, Tournament, MeetingResult, TournamentResult } from '../types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, orderBy('points', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc, index): LeaderboardEntry => {
      const data = doc.data();
      return {
        rank: index + 1, 
        name: data.name as string,
        points: data.points as number,
      };
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    throw new Error("Failed to fetch leaderboard data");
  }
}

export async function getMeetingsData(): Promise<Meeting[]> {
  try {
    console.log("Fetching meetings data...");
    const meetingsRef = collection(db, 'meetings');
    const querySnapshot = await getDocs(meetingsRef);
    
    if (querySnapshot.empty) {
      console.log("No meetings found in the database.");
      return [];
    }

    const meetings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("Raw meeting data:", data);
      
      let results: MeetingResult[];
      if (Array.isArray(data.results)) {
        results = data.results.map((result: DocumentData): MeetingResult => ({
          rank: result.rank as number,
          name: result.name as string,
          knockouts: result.knockouts as number,
          hourGame: result.hourGame as boolean,
          points: result.points as number,
        }));
      } else if (typeof data.results === 'object' && data.results !== null) {
        // Handle the case where results is an object
        results = [{
          rank: data.results.rank as number,
          name: data.results.name as string,
          knockouts: data.results.knockouts as number,
          hourGame: data.results.hourGame as boolean,
          points: data.results.points as number,
        }];
      } else {
        results = [];
      }

      const meeting: Meeting = {
        id: doc.id,
        name: data.name as string,
        results: results,
      };
      
      console.log("Processed meeting:", meeting);
      return meeting;
    });

    console.log("Meetings fetched successfully:", meetings);
    return meetings;
  } catch (error) {
    console.error("Error fetching meetings data:", error);
    throw new Error("Failed to fetch meetings data");
  }
}

export async function getTournamentsData(): Promise<Tournament[]> {
  try {
    console.log("Fetching tournaments data...");
    const tournamentsRef = collection(db, 'tournaments');
    const querySnapshot = await getDocs(tournamentsRef);
    
    if (querySnapshot.empty) {
      console.log("No tournaments found in the database.");
      return [];
    }

    const tournaments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("Tournament data:", data);
      
      let results: TournamentResult[];
      if (Array.isArray(data.results)) {
        results = data.results.map((result: DocumentData): TournamentResult => ({
          rank: result.rank as number,
          name: result.name as string,
          points: result.points as number,
        }));
      } else if (typeof data.results === 'object' && data.results !== null) {
        results = [{
          rank: data.results.rank as number,
          name: data.results.name as string,
          points: data.results.points as number,
        }];
      } else {
        results = [];
      }
      results.sort((a, b) => a.rank - b.rank);

      return {
        id: doc.id,
        name: data.name as string,
        results: results,
      };
    });

    console.log("Tournaments fetched successfully:", tournaments);
    return tournaments;
  } catch (error) {
    console.error("Error fetching tournaments data:", error);
    throw new Error("Failed to fetch tournaments data");
  }
}

export { db };