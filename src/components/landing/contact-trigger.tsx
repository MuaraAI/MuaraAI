"use client";

import React, { useState } from "react";
import ContactModal from "./contact-modal";
import Icon from "@/components/ui/icon";

export default function ContactTrigger({
  label = "Hubungi Kami",
  className = "hover:text-muara-ocean transition-colors flex items-center gap-1.5 cursor-pointer",
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Icon name="mail" className="w-4 h-4 text-muara-ocean" />
        <span>{label}</span>
      </button>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
