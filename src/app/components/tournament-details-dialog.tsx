'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tournament, TournamentResult, Player } from '../types'
import { updateTournament, finishTournament, deleteResultFromTournament, deleteTournament, addKnockout, deletePlayerFromTournament } from '../firebase/firebase'
import AddTournamentResultDialog from './add-tournament-result-dialog'
import { toast } from "@/hooks/use-toast"
import { Trash2 } from 'lucide-react'
import { PlayerAutocomplete } from './player-autocomplete'
import { Input } from "@/components/ui/input"

type TournamentDetailsDialogProps = {
  tournament: Tournament;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTournamentUpdated: () => void;
}

export default function TournamentDetailsDialog({
  tournament,
  isOpen,
  onOpenChange,
  onTournamentUpdated
}: TournamentDetailsDialogProps) {
  const [type, setType] = useState(tournament.type)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingResult, setIsAddingResult] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [isKnockoutDialogOpen, setIsKnockoutDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [knockouts, setKnockouts] = useState<number>(0)
  const [isAddingKnockout, setIsAddingKnockout] = useState(false)
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      await updateTournament({
        ...tournament,
        type,
      })
      onTournamentUpdated()
    } catch (err) {
      console.error("Error updating tournament:", err)
      setError("Failed to update tournament. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFinishTournament = async () => {
    setIsUpdating(true)
    setError(null)
    setLogs([])
    try {
      const originalConsoleLog = console.log
      const originalConsoleError = console.error
      
      console.log = (...args) => {
        setLogs(prev => [...prev, args.join(' ')])
        originalConsoleLog(...args)
      }
      console.error = (...args) => {
        setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`])
        originalConsoleError(...args)
      }

      await finishTournament(tournament.id)
      onTournamentUpdated()
      toast({
        title: "Tournament Finished",
        description: "The tournament has been successfully finished and points have been awarded.",
      })

      console.log = originalConsoleLog
      console.error = originalConsoleError
    } catch (err) {
      console.error("Error finishing tournament:", err)
      setError("Failed to finish tournament. Please check the logs and try again.")
      toast({
        title: "Error",
        description: "Failed to finish tournament. Please check the logs and try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteResult = async (result: TournamentResult) => {
    setIsUpdating(true)
    setError(null)
    try {
      if (tournament.isActive) {
        await deletePlayerFromTournament(tournament.id, result.name)
      } else {
        await deleteResultFromTournament(tournament.id, result.name)
      }
      onTournamentUpdated()
      toast({
        title: "Result Deleted",
        description: `${result.name}'s result has been deleted and points have been recalculated.`,
      })
    } catch (err) {
      console.error("Error deleting result:", err)
      setError("Failed to delete result. Please try again.")
      toast({
        title: "Error",
        description: "Failed to delete result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddResult = () => {
    if (tournament.isActive) {
      setIsKnockoutDialogOpen(true)
    } else {
      setIsAddingResult(true)
    }
  }

  const handleResultAdded = () => {
    setIsAddingResult(false)
    onTournamentUpdated()
  }

  const handleDeleteTournament = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      await deleteTournament(tournament.id)
      onOpenChange(false)
      toast({
        title: "Tournament Deleted",
        description: "The tournament has been successfully deleted and points have been removed from players.",
      })
    } catch (err) {
      console.error("Error deleting tournament:", err)
      setError("Failed to delete tournament. Please try again.")
      toast({
        title: "Error",
        description: "Failed to delete tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddKnockout = async () => {
    if (!selectedPlayer) return
    const isPlayerInTournament = tournament.results.some(
      result => result.name.toLowerCase() === selectedPlayer.name.toLowerCase()
    )

    if (isPlayerInTournament) {
      setError("This player is already in the tournament.")
      return
    }

    setIsAddingKnockout(true)
    try {
      await addKnockout(tournament.id, selectedPlayer.name, knockouts)
      onTournamentUpdated()
      setIsKnockoutDialogOpen(false)
      setSelectedPlayer(null)
      setKnockouts(0)
      setError(null)
      toast({
        title: "Knockout Added",
        description: `${selectedPlayer.name} has been added to the tournament with ${knockouts} knockouts.`,
      })
    } catch (err) {
      console.error("Error adding knockout:", err)
      setError("Failed to add knockout. Please try again.")
    } finally {
      setIsAddingKnockout(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Tournament Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3 font-medium">{tournament.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={(value: string) => setType(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="HeadsUp">Heads Up</SelectItem>
                  <SelectItem value="PKO">PKO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="h-[300px] w-full border rounded-md p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  {type === 'PKO' && <TableHead>Knockouts</TableHead>}
                  <TableHead>Points</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournament.results.sort((a, b) => a.rank - b.rank).map((result) => (
                  <TableRow key={result.name}>
                    <TableCell>{result.rank}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    {type === 'PKO' && <TableCell>{result.knockouts}</TableCell>}
                    <TableCell>{result.points}</TableCell>
                    <TableCell>
                      <Button
                        variant={tournament.isActive ? "ghost" : "destructive"}
                        size="icon"
                        onClick={() => handleDeleteResult(result)}
                        disabled={isDeletingPlayer || isUpdating}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete result</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          {error && <div className="text-sm text-destructive">{error}</div>}
          {logs.length > 0 && (
            <ScrollArea className="h-[200px] w-full border rounded-md p-4 mt-4">
              {logs.map((log, index) => (
                <div key={index} className="text-sm">
                  {log}
                </div>
              ))}
            </ScrollArea>
          )}
          <DialogFooter>
            <Button onClick={handleAddResult}>
              {tournament.isActive ? 'Add Knockout' : 'Add Result'}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Tournament'}
            </Button>
            {tournament.isActive && (
              <Button onClick={handleFinishTournament} disabled={isUpdating}>
                {isUpdating ? 'Finishing...' : 'Finish Tournament'}
              </Button>
            )}
            <Button onClick={handleDeleteTournament} disabled={isUpdating} variant="destructive">
              {isUpdating ? 'Deleting...' : 'Delete Tournament'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddTournamentResultDialog
        isOpen={isAddingResult}
        onOpenChange={setIsAddingResult}
        tournamentId={tournament.id}
        tournamentType={tournament.type}
        onResultAdded={handleResultAdded}
      />

      <Dialog open={isKnockoutDialogOpen} onOpenChange={setIsKnockoutDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>{tournament.name} - Add Knockout</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <PlayerAutocomplete onSelect={setSelectedPlayer} />
            {tournament.type === 'PKO' && (
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
          </div>
          <DialogFooter>
            <Button onClick={handleAddKnockout} disabled={!selectedPlayer || isAddingKnockout}>
              {isAddingKnockout ? 'Adding...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}