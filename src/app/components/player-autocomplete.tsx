'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPlayersData } from '../firebase/firebase'
import { Player } from '../types'
import AddPlayerDialog from './add-player-dialog'
import { UserPlus } from 'lucide-react'

interface PlayerAutocompleteProps {
  onSelect: (player: Player) => void;
}

export function PlayerAutocomplete({ onSelect }: PlayerAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false)

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
    if (!inputValue) return players
    const searchTerm = inputValue.toLowerCase().replace(/\s+/g, '')
    return players.filter(player => 
      player.id.includes(searchTerm) || 
      player.name.toLowerCase().replace(/\s+/g, '').includes(searchTerm)
    )
  }, [players, inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowDropdown(true)
  }

  const handleSelectPlayer = (player: Player) => {
    setInputValue(player.name)
    setShowDropdown(false)
    onSelect(player)
  }

  const handleAddPlayer = () => {
    setIsAddPlayerDialogOpen(true)
  }

  const handlePlayerAdded = async () => {
    await fetchPlayers()
    setIsAddPlayerDialogOpen(false)
    setInputValue('')
    setShowDropdown(true)
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search for a player..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="w-full"
      />
      {isLoading && <div className="mt-2">Loading players...</div>}
      {error && <div className="mt-2 text-destructive">{error}</div>}
      {showDropdown && !isLoading && !error && (
        <div className="absolute z-10 w-full mt-1 rounded-md shadow-lg">
          <ScrollArea className="h-[200px] overflow-auto bg-background/80 backdrop-blur-sm border border-border">
            {filteredPlayers.length === 0 ? (
              <div className="p-2">
                <div className="text-muted-foreground mb-2">No players found</div>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={handleAddPlayer}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add new player
                </Button>
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <Button
                  key={player.id}
                  variant="ghost"
                  className="w-full justify-start text-left hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelectPlayer(player)}
                >
                  {player.name} ({player.points} points)
                </Button>
              ))
            )}
          </ScrollArea>
        </div>
      )}
      <AddPlayerDialog
        isOpen={isAddPlayerDialogOpen}
        onOpenChange={setIsAddPlayerDialogOpen}
        onSuccess={handlePlayerAdded}
      />
    </div>
  )
}