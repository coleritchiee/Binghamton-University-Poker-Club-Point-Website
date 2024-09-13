'use client'

import { useEffect, useState } from 'react'
import { getTournaments, addKnockout, deletePlayerFromTournament, getTournamentById } from '../firebase/firebase'
import { Tournament, Player} from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlayerAutocomplete } from './player-autocomplete'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from 'lucide-react'

type ActiveTournamentsDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActiveTournamentsDialog({ isOpen, onOpenChange }: ActiveTournamentsDialogProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isKnockoutDialogOpen, setIsKnockoutDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [knockouts, setKnockouts] = useState<number>(0)
  const [isAddingKnockout, setIsAddingKnockout] = useState(false)
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true)
        const allTournaments = await getTournaments()
        const activeTournaments = allTournaments.filter(tournament => tournament.isActive)
        setTournaments(activeTournaments)
        setError(null)
      } catch (err) {
        console.error("Error fetching tournaments:", err)
        setError("Failed to load tournaments. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchTournaments()
    }
  }, [isOpen])

  const handleTournamentClick = async (tournament: Tournament) => {
    try {
      setIsLoading(true)
      const updatedTournament = await getTournamentById(tournament.id)
      if (updatedTournament) {
        setSelectedTournament(updatedTournament)
        setIsKnockoutDialogOpen(true)
        setKnockouts(0)
        setSelectedPlayer(null)
        setError(null)
      } else {
        throw new Error("Tournament not found")
      }
    } catch (err) {
      console.error("Error fetching tournament details:", err)
      setError("Failed to load tournament details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddKnockout = async () => {
    if (!selectedTournament || !selectedPlayer) return
    const isPlayerInTournament = selectedTournament.results.some(
      result => result.name.toLowerCase() === selectedPlayer.name.toLowerCase()
    )

    if (isPlayerInTournament) {
      setError("This player is already in the tournament.")
      return
    }

    setIsAddingKnockout(true)
    try {
      await addKnockout(selectedTournament.id, selectedPlayer.name, knockouts)
      await refreshTournaments()
      setIsKnockoutDialogOpen(false)
      setSelectedPlayer(null)
      setKnockouts(0)
      setError(null)
    } catch (err) {
      console.error("Error adding knockout:", err)
      setError("Failed to add knockout. Please try again.")
    } finally {
      setIsAddingKnockout(false)
    }
  }

  const handleDeletePlayer = async (playerName: string) => {
    if (!selectedTournament) return

    setIsDeletingPlayer(true)
    try {
      await deletePlayerFromTournament(selectedTournament.id, playerName)
      await refreshTournaments()
      setError(null)
    } catch (err) {
      console.error("Error deleting player:", err)
      setError("Failed to delete player. Please try again.")
    } finally {
      setIsDeletingPlayer(false)
    }
  }

  const refreshTournaments = async () => {
    try {
      const updatedTournaments = await getTournaments()
      const activeTournaments = updatedTournaments.filter(tournament => tournament.isActive)
      setTournaments(activeTournaments)
      if (selectedTournament) {
        const updatedSelectedTournament = await getTournamentById(selectedTournament.id)
        setSelectedTournament(updatedSelectedTournament)
      }
    } catch (err) {
      console.error("Error refreshing tournaments:", err)
      setError("Failed to refresh tournaments. Please try again.")
    }
  }

  const renderTournamentResults = (tournament: Tournament) => {
    return (
      <ScrollArea className="h-[200px] w-full border rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              {tournament.type === 'PKO' && <TableHead>Knockouts</TableHead>}
              <TableHead>Points</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournament.results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.rank}</TableCell>
                <TableCell>{result.name}</TableCell>
                {tournament.type === 'PKO' && <TableCell>{result.knockouts}</TableCell>}
                <TableCell>{result.points}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlayer(result.name)}
                    disabled={isDeletingPlayer}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Active Tournaments</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="text-center py-4">Loading tournaments...</div>
          ) : error ? (
            <div className="text-center py-4 text-destructive">{error}</div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-4">No active tournaments at the moment.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Players</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>{tournament.name}</TableCell>
                    <TableCell>{tournament.type}</TableCell>
                    <TableCell className="text-right">{tournament.results.length}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTournamentClick(tournament)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {selectedTournament && (
        <Dialog open={isKnockoutDialogOpen} onOpenChange={setIsKnockoutDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-background/80 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle>{selectedTournament.name} - Add Knockout</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <PlayerAutocomplete onSelect={setSelectedPlayer} />
              {selectedTournament.type === 'PKO' && (
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="knockouts">Knockouts</Label>
                  <Input
                    id="knockouts"
                    type="number"
                    min="0"
                    value={knockouts}
                    onChange={(e) => setKnockouts(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
              {error && <div className="text-sm text-destructive">{error}</div>}
              {renderTournamentResults(selectedTournament)}
            </div>
            <DialogFooter>
              <Button onClick={handleAddKnockout} disabled={!selectedPlayer || isAddingKnockout}>
                {isAddingKnockout ? 'Adding...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}