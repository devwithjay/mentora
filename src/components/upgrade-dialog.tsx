"use client";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeDialog({open, onClose}: UpgradeDialogProps) {
  const handleUpgradeClick = () => {
    window.location.href = "/pricing";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-primary max-w-sm rounded-2xl border bg-[#d9f5f1] p-6 shadow-xl dark:bg-[#1f2c2a]">
        <DialogHeader>
          <DialogTitle className="text-primary text-center text-xl font-semibold">
            Daily Message Limit Reached
          </DialogTitle>
        </DialogHeader>

        <p className="text-secondary mt-2 text-center text-sm">
          You’ve used all your messages for today on this plan.
          <br />
          Upgrade to keep talking with Mentora.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button className="btn-primary w-full" onClick={handleUpgradeClick}>
            Upgrade to Basic (₹349 / month)
          </Button>

          <Button
            variant="secondary"
            className="bg-primary text-primary hover:bg-secondary w-full cursor-pointer"
            onClick={handleUpgradeClick}
          >
            Go Pro (₹699 / month)
          </Button>

          <Button
            variant="ghost"
            className="btn-secondary w-full cursor-pointer border-0! text-xs"
            onClick={onClose}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
