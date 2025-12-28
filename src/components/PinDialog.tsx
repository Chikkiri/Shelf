import { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "enter" | "setup" | "change";
  onSubmit: (pin: string, oldPin?: string) => boolean;
}

export function PinDialog({ open, onOpenChange, mode, onSubmit }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      setConfirmPin("");
      setOldPin("");
      setError("");
      setShowPin(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const validatePin = (value: string) => {
    return /^\d{4,6}$/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "enter") {
      if (!validatePin(pin)) {
        setError("PIN must be 4-6 digits");
        return;
      }
      const success = onSubmit(pin);
      if (!success) {
        setError("Incorrect PIN");
        setPin("");
      }
    } else if (mode === "setup") {
      if (!validatePin(pin)) {
        setError("PIN must be 4-6 digits");
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs don't match");
        return;
      }
      onSubmit(pin);
    } else if (mode === "change") {
      if (!validatePin(oldPin)) {
        setError("Current PIN must be 4-6 digits");
        return;
      }
      if (!validatePin(pin)) {
        setError("New PIN must be 4-6 digits");
        return;
      }
      if (pin !== confirmPin) {
        setError("New PINs don't match");
        return;
      }
      const success = onSubmit(pin, oldPin);
      if (!success) {
        setError("Current PIN is incorrect");
        setOldPin("");
      }
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "enter": return "Enter PIN";
      case "setup": return "Create PIN";
      case "change": return "Change PIN";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "enter": return "Enter your PIN to access Private Space";
      case "setup": return "Create a 4-6 digit PIN to protect your private items";
      case "change": return "Enter your current PIN and choose a new one";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "change" && (
            <div className="space-y-2">
              <Label htmlFor="oldPin">Current PIN</Label>
              <div className="relative">
                <Input
                  id="oldPin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="pr-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin">{mode === "change" ? "New PIN" : "PIN"}</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {(mode === "setup" || mode === "change") && (
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full">
            {mode === "enter" ? "Unlock" : mode === "setup" ? "Create PIN" : "Change PIN"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
