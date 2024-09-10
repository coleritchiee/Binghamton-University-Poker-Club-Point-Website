'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPlayersData, deletePlayer } from '../firebase/firebase'
import { Player } from '../types'
import AddPlayerDialog from './add-player-dialog'
import { Trash2, UserPlus } from 'lucide-react'

type PlayersListDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlayersListDialog({ isOpen, onOpenChange }: PlayersListDialogProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchPlayers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const playersData = await getPlayersData()
      setPlayers(playersData)
    } catch (error) {
      console.error("Error fetching players:", error)
      setError("Failed to load players. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return players
    const term = searchTerm.toLowerCase().replace(/\s+/g, '')
    return players.filter(player => 
      player.id.includes(term) || 
      player.name.toLowerCase().replace(/\s+/g, '').includes(term)
    )
  }, [players, searchTerm])

  const handleDeletePlayer = async (playerId: string) => {
    setDeleteError(null)
    try {
      await deletePlayer(playerId)
      await fetchPlayers()
    } catch (error) {
      console.error("Error deleting player:", error)
      if (error instanceof Error) {
        if (error.message.includes('Cannot delete player with more than 0 points')) {
          setDeleteError("The player must have 0 points before they can be deleted. Please manually delete points from tournaments/weekly meetings first.")
        } else {
          setDeleteError(error.message || "Failed to delete player. Please try again.")
        }
      } else {
        setDeleteError("An unknown error occurred. Please try again.")
      }
    }
  }

  const handleAddPlayer = () => {
    setIsAddPlayerDialogOpen(true)
  }

  const handlePlayerAdded = async () => {
    await fetchPlayers()
    setIsAddPlayerDialogOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Players List</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            {isLoading && <div className="text-center">Loading players...</div>}
            {error && <div className="text-center text-destructive">{error}</div>}
            {!isLoading && !error && (
              <>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlayers.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell className="text-right">{player.points}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePlayer(player.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete player</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {deleteError && (
                  <div className="text-destructive text-sm mt-2">{deleteError}</div>
                )}
              </>
            )}
            <Button onClick={handleAddPlayer} className="mt-2">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Player
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AddPlayerDialog
        isOpen={isAddPlayerDialogOpen}
        onOpenChange={setIsAddPlayerDialogOpen}
        onSuccess={handlePlayerAdded}
      />
    </>
  )
}