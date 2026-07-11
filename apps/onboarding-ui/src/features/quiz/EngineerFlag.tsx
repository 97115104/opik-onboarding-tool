import { useContribution } from "../issues/ContributionContext";

interface EngineerFlagProps {
  className?: string;
}

export function EngineerFlag({ className = "" }: EngineerFlagProps) {
  const { isEngineer, setIsEngineer } = useContribution();

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 ${className}`}
      data-testid="engineer-flag"
    >
      <input
        type="checkbox"
        checked={isEngineer}
        onChange={(e) => setIsEngineer(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 accent-sky-500"
      />
      <span className="text-sm text-slate-400">
        I&apos;m an engineer (show advanced issue filters)
      </span>
    </label>
  );
}
