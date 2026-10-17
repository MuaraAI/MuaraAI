import React from "react";

type DataStateProps = {
  kind: "loading" | "empty" | "error";
  title: string;
  description: string;
  action?: React.ReactNode;
};

const stateRole: Record<DataStateProps["kind"], "status" | "alert"> = {
  loading: "status",
  empty: "status",
  error: "alert",
};

export default function DataState({
  kind,
  title,
  description,
  action,
}: DataStateProps) {
  return (
    <section
      role={stateRole[kind]}
      aria-live={kind === "error" ? "assertive" : "polite"}
      className="rounded-xl border border-stroke bg-surface-alt px-6 py-10 text-center"
    >
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-secondary">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
