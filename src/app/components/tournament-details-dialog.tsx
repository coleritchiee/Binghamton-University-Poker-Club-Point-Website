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
import { Tournament, TournamentResult } from '../types'
import { updateTournament, finishTournament, deleteResultFromTournament, deleteTournament } from '../firebase/firebase'
import AddTournamentResultDialog from './add-tournament-result-dialog'
import { toast } from "@/hooks/use-toast"
import { Trash2 } from 'lucide-react'

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
      await deleteResultFromTournament(tournament.id, result.name)
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
    setIsAddingResult(true)
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
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteResult(result)}
                        disabled={isUpdating}
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
            <Button onClick={handleAddResult}>Add Result</Button>
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
    </>
  )
}