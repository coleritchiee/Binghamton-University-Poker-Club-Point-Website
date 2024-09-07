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
import TournamentDetailsDialog from './tournament-details-dialog'
import CreateTournamentDialog from './create-tournament-dialog'

type SelectTournamentItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tournaments: Tournament[];
  onRefresh: () => Promise<void>;
}

export default function SelectTournamentItemDialog({
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
                <TableHead>Type</TableHead>
                <TableHead>Active</TableHead>
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
                  <TableCell>{tournament.type}</TableCell>
                  <TableCell>{tournament.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">{tournament.results.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button onClick={handleCreateNew}>Create New Tournament</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTournament && (
        <TournamentDetailsDialog
          tournament={selectedTournament}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onTournamentUpdated={handleTournamentUpdated}/>
      )}

      <CreateTournamentDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onTournamentCreated={handleTournamentCreated}
      />
    </>
  )
}