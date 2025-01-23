"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Tournament, type TournamentResult, Player } from "../types"
import { updateChamp, deleteResultFromChamp, deleteChamp, addChampResult } from "../firebase/firebase"
import AddChampResultDialog from "./add-champ-result-dialog"
import { toast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"

type ChampsDetailsDialogProps = {
  tournament: Tournament
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onChampUpdated: () => void
}

export default function ChampsDetailsDialog({
  tournament,
  isOpen,
  onOpenChange,
  onChampUpdated,
}: ChampsDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingResult, setIsAddingResult] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      await updateChamp(tournament)
      onChampUpdated()
    } catch (err) {
      console.error("Error updating championship:", err)
      setError("Failed to update championship. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteResult = async (result: TournamentResult) => {
    setIsUpdating(true)
    setError(null)
    try {
      await deleteResultFromChamp(tournament.id, result.name)
      onChampUpdated()
      toast({
        title: "Result Deleted",
        description: `${result.name}'s result has been deleted.`,
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
    onChampUpdated()
  }

  const handleDeleteChamp = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      await deleteChamp(tournament.id)
      onOpenChange(false)
      toast({
        title: "Championship Deleted",
        description: "The championship has been successfully deleted.",
      })
    } catch (err) {
      console.error("Error deleting championship:", err)
      setError("Failed to delete championship. Please try again.")
      toast({
        title: "Error",
        description: "Failed to delete championship. Please try again.",
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
            <DialogTitle>Championship Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3 font-medium">{tournament.name}</div>
            </div>
          </div>
          <ScrollArea className="h-[300px] w-full border rounded-md p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournament.results
                  .sort((a, b) => a.rank - b.rank)
                  .map((result) => (
                    <TableRow key={result.name}>
                      <TableCell>{result.rank}</TableCell>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
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
            <Button onClick={handleDeleteChamp} disabled={isUpdating} variant="destructive">
              {isUpdating ? "Deleting..." : "Delete Championship"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddChampResultDialog
        isOpen={isAddingResult}
        onOpenChange={setIsAddingResult}
        tournamentId={tournament.id}
        onResultAdded={handleResultAdded}
      />
    </>
  )
}