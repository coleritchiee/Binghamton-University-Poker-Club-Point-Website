"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addChamp } from "../firebase/firebase"

type CreateChampsDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onChampCreated: () => void
}

export default function CreateChampsDialog({ isOpen, onOpenChange, onChampCreated }: CreateChampsDialogProps) {
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setIsCreating(true)
    setError(null)
    try {
      await addChamp({
        name,
        type: "Champs",
        isActive: false,
        results: [],
      })
      onChampCreated()
      setName("")
    } catch (err) {
      console.error("Error creating championship:", err)
      setError("Failed to create championship. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Create New Championship</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isCreating || !name}>
            {isCreating ? "Creating..." : "Create Championship"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

