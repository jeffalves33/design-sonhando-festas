import type { ReactNode, InputHTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
export const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-cream disabled:opacity-40";
export const inputClass =
  "w-full min-h-11 rounded-lg border border-ink/20 bg-cream px-3 py-2 text-base outline-none focus:ring-2 focus:ring-brand";
export const cardClass = "rounded-xl p-3.5 ring-1 ring-ink/15";
export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      <input {...props} className={inputClass} />
    </label>
  );
}
export function SelectField({
  label,
  children,
  value,
  onChange,
  required = true,
}: {
  label: string;
  children: ReactNode;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      <select
        required={required}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
export function Notes({
  label = "Observações",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-medium">
      {label}
      <textarea
        className={inputClass}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Empty({
  title = "Ainda não há registros",
  text = "Os próximos registros aparecerão aqui.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink/25 px-4 py-9 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-ink/55">{text}</p>
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-h-[85dvh] max-w-[410px] overflow-y-auto bg-cream">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Organize os detalhes do seu jeito, Marcia.</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full bg-ink text-cream"
    >
      <Plus className="size-5" />
    </button>
  );
}
export function MenuLink({
  to,
  title,
  subtitle,
}: {
  to: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-14 items-center justify-between gap-3 rounded-xl p-3.5 ring-1 ring-ink/15"
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-ink/55">{subtitle}</p>}
      </div>
      <ChevronRight className="size-4 shrink-0" />
    </Link>
  );
}
