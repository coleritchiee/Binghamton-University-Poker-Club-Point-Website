import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, DocumentData, doc, setDoc, addDoc, deleteDoc, updateDoc, arrayRemove, getDoc, arrayUnion, increment, writeBatch, DocumentReference } from 'firebase/firestore';
import { LeaderboardEntry, Meeting, Tournament, MeetingResult, TournamentResult, Player} from '../types';

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

export async function addWeeklyMeeting(date: string): Promise<void> {
  try {
    const meetingsCollection = collection(db, 'meetings')
    await addDoc(meetingsCollection, {
      name: `${date}`,
      date: date,
      results: []
    })
  } catch (error) {
    console.error("Error adding weekly meeting:", error)
    throw error
  }
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    const meetingRef = doc(db, 'meetings', meetingId)
    const meetingSnap = await getDoc(meetingRef)

    if (!meetingSnap.exists()) {
      throw new Error("Meeting not found")
    }

    const meetingData = meetingSnap.data() as Meeting
    const batch = writeBatch(db)

    for (const result of meetingData.results) {
      const playerRef = doc(db, 'players', result.name.toLowerCase().replace(/\s+/g, ''))
      batch.update(playerRef, {
        points: increment(-result.points)
      })
    }

    batch.delete(meetingRef)

    await batch.commit()
  } catch (error) {
    console.error("Error deleting meeting:", error)
    throw error
  }
}

export async function getMeetingById(meetingId: string): Promise<Meeting | null> {
  try {
    const meetingRef = doc(db, 'meetings', meetingId)
    const meetingSnap = await getDoc(meetingRef)
    
    if (meetingSnap.exists()) {
      const meetingData = meetingSnap.data()
      return {
        id: meetingSnap.id,
        name: meetingData.name,
        results: meetingData.results || []
      }
    } else {
      console.log("No such meeting!")
      return null
    }
  } catch (error) {
    console.error("Error getting meeting:", error)
    throw error
  }
}

export async function addResult(meetingId: string, result: {
  playerId: string,
  rank: number,
  knockouts: number,
  hourGame: boolean
}): Promise<void> {
  try {
    const meetingRef = doc(db, 'meetings', meetingId)
    const playerRef = doc(db, 'players', result.playerId)

    let points = result.knockouts * 3
    if (result.rank === 1) points += 20
    else if (result.rank === 2) points += 10
    else if (result.rank === 3) points += 6

    if (result.hourGame) points = Math.floor(points / 2)

    const playerSnap = await getDoc(playerRef)
    const playerName = playerSnap.data()?.name || 'Unknown Player'

    const newResult: MeetingResult = {
      name: playerName,
      rank: result.rank,
      knockouts: result.knockouts,
      hourGame: result.hourGame,
      points: points
    }

    await updateDoc(meetingRef, {
      results: arrayUnion(newResult)
    })

    await updateDoc(playerRef, {
      points: increment(points)
    })
  } catch (error) {
    console.error("Error adding result:", error)
    throw error
  }
}

export async function deleteResult(meetingId: string, result: MeetingResult): Promise<void> {
  try {
    const meetingRef = doc(db, 'meetings', meetingId)
    const playerRef = doc(db, 'players', result.name.toLowerCase().replace(/\s+/g, ''))

    const batch = writeBatch(db)

    batch.update(meetingRef, {
      results: arrayRemove(result)
    })

    batch.update(playerRef, {
      points: increment(-result.points)
    })

    await batch.commit()
  } catch (error) {
    console.error("Error deleting result:", error)
    throw error
  }
}

export async function addPlayer(name: string): Promise<void> {
  try {
    const playerId = name.toLowerCase().replace(/\s+/g, '')
    const playerRef = doc(db, 'players', playerId)
    await setDoc(playerRef, {
      name: name,
      points: 0
    })
  } catch (error) {
    console.error("Error adding player:", error)
    throw error
  }
}

export async function getPlayersData(): Promise<Player[]> {
  try {
    const playersCollection = collection(db, 'players')
    const playerSnapshot = await getDocs(playersCollection)
    return playerSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
      points: doc.data().points || 0
    }))
  } catch (error) {
    console.error("Error fetching players data:", error)
    return []
  }
}

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

export async function getTournaments(): Promise<Tournament[]> {
  try {
    const tournamentsCollection = collection(db, 'tournaments')
    const tournamentSnapshot = await getDocs(tournamentsCollection)
    return tournamentSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        type: data.type as string,
        isActive: data.isActive,
        results: data.results as TournamentResult[]
      }
    })
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    throw error
  }
}

export async function updateTournamentResult(tournamentId: string, result: TournamentResult): Promise<void> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId)
    const playerRef = doc(db, 'players', result.name.toLowerCase().replace(/\s+/g, ''))

    const batch = writeBatch(db)

    batch.update(tournamentRef, {
      results: arrayUnion(result)
    })

    batch.update(playerRef, {
      points: increment(result.points)
    })

    await batch.commit()
  } catch (error) {
    console.error("Error updating tournament result:", error)
    throw error
  }
}

export async function deleteTournamentResult(tournamentId: string, result: TournamentResult): Promise<void> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId)
    const playerRef = doc(db, 'players', result.name.toLowerCase().replace(/\s+/g, ''))

    const batch = writeBatch(db)

    batch.update(tournamentRef, {
      results: arrayRemove(result)
    })

    batch.update(playerRef, {
      points: increment(-result.points)
    })

    await batch.commit()
  } catch (error) {
    console.error("Error deleting tournament result:", error)
    throw error
  }
}

export async function deleteTournament(tournamentId: string): Promise<void> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId)
    const tournamentSnap = await getDoc(tournamentRef)

    if (!tournamentSnap.exists()) {
      throw new Error("Tournament not found")
    }

    const tournamentData = tournamentSnap.data() as Tournament
    const batch = writeBatch(db)
    for (const result of tournamentData.results) {
      const playerRef = doc(db, 'players', result.name.toLowerCase().replace(/\s+/g, ''))
      batch.update(playerRef, {
        points: increment(-result.points)
      })
    }
    batch.delete(tournamentRef)

    await batch.commit()
  } catch (error) {
    console.error("Error deleting tournament:", error)
    throw error
  }
}

export async function addTournament(tournament: Omit<Tournament, 'id'>): Promise<string> {
  try {
    const tournamentsCollection = collection(db, 'tournaments')
    const docRef = await addDoc(tournamentsCollection, tournament)
    return docRef.id
  } catch (error) {
    console.error("Error adding tournament:", error)
    throw error
  }
}

export async function addKnockout(tournamentId: string, playerName: string, knockouts: number = 0): Promise<void> {
  const tournamentRef = doc(db, 'tournaments', tournamentId)
  const batch = writeBatch(db)

  try {
    const tournamentSnap = await getDoc(tournamentRef)
    if (!tournamentSnap.exists()) {
      throw new Error("Tournament not found")
    }

    const tournamentData = tournamentSnap.data() as Tournament
    const updatedResults = tournamentData.results.map((result: TournamentResult) => ({
      ...result,
      rank: result.rank + 1
    }))

    const newResult: TournamentResult = {
      name: playerName,
      rank: 1,
      points: 0,
      knockouts: knockouts
    }

    batch.update(tournamentRef, {
      results: [newResult, ...updatedResults]
    })

    if (tournamentData.type === 'PKO') {
      const playerRef = doc(db, 'players', playerName.toLowerCase().replace(/\s+/g, ''))
      batch.update(playerRef, {
        knockouts: increment(knockouts)
      })
    }

    await batch.commit()
  } catch (error) {
    console.error("Error adding knockout:", error)
    throw error
  }
}

export async function deletePlayerFromTournament(tournamentId: string, playerName: string): Promise<void> {
  const tournamentRef = doc(db, 'tournaments', tournamentId)

  try {
    const tournamentSnap = await getDoc(tournamentRef)
    if (!tournamentSnap.exists()) {
      throw new Error("Tournament not found")
    }

    const tournamentData = tournamentSnap.data() as Tournament
    const updatedResults = tournamentData.results.filter(result => result.name !== playerName)
    
    const rerankedResults = updatedResults.map((result, index) => ({
      ...result,
      rank: index + 1
    }))

    await updateDoc(tournamentRef, {
      results: rerankedResults
    })
  } catch (error) {
    console.error("Error deleting player from tournament:", error)
    throw error
  }
}

export async function getTournamentById(tournamentId: string): Promise<Tournament | null> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId)
    const tournamentSnap = await getDoc(tournamentRef)
    
    if (tournamentSnap.exists()) {
      return { id: tournamentSnap.id, ...tournamentSnap.data() } as Tournament
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching tournament:", error)
    throw error
  }
}

export async function updateTournament(tournament: Tournament): Promise<void> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournament.id)
    
    const updateData = {
      name: tournament.name,
      type: tournament.type,
      isActive: tournament.isActive,
    }

    await updateDoc(tournamentRef, updateData)
  } catch (error) {
    console.error("Error updating tournament:", error)
    throw error
  }
}

export async function addTournamentResult(tournamentId: string, result: TournamentResult): Promise<void> {
  const tournamentRef = doc(db, 'tournaments', tournamentId)
  await updateDoc(tournamentRef, {
    results: arrayUnion(result)
  })
}

function calculateTournamentPoints(tournament: Tournament): TournamentResult[] {
  const playerCount = tournament.results.length
  const isHeadsUp = tournament.type === 'HeadsUp'
  
  let pointsTable: number[]

  if (isHeadsUp) {
    if (playerCount <= 64) {
      pointsTable = [125, 90, 70, 70, 45, 45, 45, 45, ...Array(8).fill(25), ...Array(16).fill(15), ...Array(32).fill(10)]
    } else {
      pointsTable = [150, 115, 90, 90, 70, 70, 70, 70, ...Array(8).fill(45), ...Array(16).fill(25), ...Array(32).fill(15), ...Array(playerCount - 64).fill(10)]
    }
  } else {
    if (playerCount <= 49) {
      pointsTable = [125, 115, 100, 90, 80, 75, 70, 60, 50, 40, 30, 20, 10, 10, 9, 9, 9, 8, 8, 8, ...Array(4).fill(7), ...Array(4).fill(6), ...Array(21).fill(5)]
    } else if (playerCount <= 99) {
      pointsTable = [150, 125, 115, 100, 90, 80, 75, 70, 60, 50, 40, 30, 20, 10, 10, 9, 9, 9, 8, 8, 8, ...Array(4).fill(7), ...Array(4).fill(6), ...Array(70).fill(5)]
    } else {
      pointsTable = [225, 188, 173, 150, 135, 120, 113, 105, 90, 75, 60, 45, 30, 15, 15, 14, 14, 14, 12, 12, 12, ...Array(4).fill(11), ...Array(4).fill(9), ...Array(16).fill(8), ...Array(30).fill(7), ...Array(playerCount - 75).fill(5)]
    }
  }

  return tournament.results.map((result, index) => ({
    ...result,
    points: (pointsTable[index] || 5) + (result.knockouts ? result.knockouts * 2 : 0)
  }))
}

export async function finishTournament(tournamentId: string): Promise<void> {
  const tournamentRef = doc(db, 'tournaments', tournamentId)
  
  try {
    console.log('Starting to finish tournament:', tournamentId)
    const tournamentDoc = await getDoc(tournamentRef)
    
    if (!tournamentDoc.exists()) {
      console.log('Tournament not found')
      throw new Error('Tournament not found')
    }

    console.log('Tournament found, calculating points')
    const tournament = tournamentDoc.data() as Tournament
    const updatedResults = calculateTournamentPoints(tournament)

    console.log('Updating tournament document')
    await updateDoc(tournamentRef, { 
      isActive: false,
      results: updatedResults
    })

    console.log('Tournament document updated, now updating player points')
    const batch = writeBatch(db)
    const playerUpdates: { ref: DocumentReference, points: number }[] = []

    for (const result of updatedResults) {
      const playerDocId = result.name.toLowerCase().replace(/\s+/g, '')
      const playerRef = doc(db, 'players', playerDocId)
      batch.update(playerRef, {
        points: increment(result.points)
      })
      playerUpdates.push({ ref: playerRef, points: result.points })
    }
    
    console.log('Committing batch update for player points')
    await batch.commit()

    console.log('Batch update committed successfully')

    console.log('Verifying player updates')
    for (const update of playerUpdates) {
      const playerDoc = await getDoc(update.ref)
      if (playerDoc.exists()) {
        const playerData = playerDoc.data() as Player
        console.log(`Player ${playerDoc.id} updated. New points: ${playerData.points}`)
      } else {
        console.error(`Player document ${update.ref.path} not found after update`)
      }
    }

    console.log('Tournament finished successfully')
  } catch (error) {
    console.error('Error finishing tournament:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
    }
    throw new Error('Failed to finish tournament. Please try again.')
  }
}

export { db };