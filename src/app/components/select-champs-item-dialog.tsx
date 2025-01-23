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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tournament } from '../types'
import CreateChampsDialog from './create-champs-dialog'
import ChampsDetailsDialog from './champs-detail-dialog'

type SelectTournamentItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tournaments: Tournament[];
  onRefresh: () => Promise<void>;
}

export default function SelectChampsItemDialog({
  isOpen,
  onOpenChange,
  tournaments,
  onRefresh
}: SelectTournamentItemDialogProps) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament)
    setIsDetailsOpen(true)
  }

  const handleCreateNew = () => {
    setIsCreateOpen(true)
  }

  const handleTournamentCreated = async () => {
    setIsCreateOpen(false)
    await onRefresh()
  }

  const handleTournamentUpdated = async () => {
    setIsDetailsOpen(false)
    setSelectedTournament(null)
    await onRefresh()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Select a Tournament</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Players</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow 
                  key={tournament.id}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleTournamentClick(tournament)}
                >
                  <TableCell>{tournament.name}</TableCell>
                  <TableCell className="text-right">{tournament.results.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button onClick={handleCreateNew}>Create New Champs Tournament</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTournament && (
        <ChampsDetailsDialog
          tournament={selectedTournament}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onChampUpdated={handleTournamentUpdated}/>
      )}

      <CreateChampsDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onChampCreated={handleTournamentCreated}
      />
    </>
  )
}