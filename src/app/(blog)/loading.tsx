export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin"
          />
          <div
            className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-accent/50 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
          />
        </div>
        <span className="text-sm text-text-tertiary animate-pulse">Loading...</span>
      </div>
    </div>
  );
}
