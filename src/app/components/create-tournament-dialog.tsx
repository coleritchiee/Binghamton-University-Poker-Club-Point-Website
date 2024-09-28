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
import { addTournament } from '../firebase/firebase'
import { Checkbox } from '@/components/ui/checkbox'

type CreateTournamentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTournamentCreated: () => void;
}

export default function CreateTournamentDialog({
  isOpen,
  onOpenChange,
  onTournamentCreated
}: CreateTournamentDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Standard')
  const [isActive, setIsActive] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setIsCreating(true)
    setError(null)
    try {
      await addTournament({
        name,
        type,
        isActive,
        results: []
      })
      onTournamentCreated()
      setName('')
      setType('Standard')
      setIsActive(true)
    } catch (err) {
      console.error("Error creating tournament:", err)
      setError("Failed to create tournament. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
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
                <SelectItem value="KO">KO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>setIsActive(checked as boolean)}
            />
          </div>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isCreating || !name}>
            {isCreating ? 'Creating...' : 'Create Tournament'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}