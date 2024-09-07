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
import { Input } from "@/components/ui/input"
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
import { updateTournament, finishTournament } from '../firebase/firebase'
import EditResultDialog from './edit-result-dialog'
import AddTournamentResultDialog from './add-tournament-result-dialog'

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
  const [name, setName] = useState(tournament.name)
  const [type, setType] = useState(tournament.type)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingResult, setEditingResult] = useState<TournamentResult | null>(null)
  const [isAddingResult, setIsAddingResult] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      await updateTournament({
        ...tournament,
        name,
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
    try {
      await finishTournament(tournament.id)
      onTournamentUpdated()
    } catch (err) {
      console.error("Error finishing tournament:", err)
      setError("Failed to finish tournament. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditResult = (result: TournamentResult) => {
    setEditingResult(result)
  }

  const handleResultUpdated = () => {
    setEditingResult(null)
    onTournamentUpdated()
  }

  const handleAddResult = () => {
    setIsAddingResult(true)
  }

  const handleResultAdded = () => {
    setIsAddingResult(false)
    onTournamentUpdated()
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
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
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
                      <Button variant="outline" size="sm" onClick={() => handleEditResult(result)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <DialogFooter>
            <Button onClick={handleAddResult}>Add Result</Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Tournament'}
            </Button>
            {tournament.isActive && (
              <Button onClick={handleFinishTournament} disabled={isUpdating}>
                Finish Tournament
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingResult && (
        <EditResultDialog
          isOpen={!!editingResult}
          onOpenChange={(open) => !open && setEditingResult(null)}
          result={editingResult}
          tournamentId={tournament.id}
          tournamentType={tournament.type}
          onResultUpdated={handleResultUpdated}
        />
      )}

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