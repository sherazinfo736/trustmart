import type { ReactNode } from "react";
import { AlertCircle, Inbox, Lock, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingBlock({ rows = 3, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

type StateProps = {
  title: string;
  description: string;
  action?: ReactNode | undefined;
};

function Frame({
  icon,
  title,
  description,
  action,
}: StateProps & { icon: ReactNode }) {
  return (
    <div className="tm-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="max-w-md">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export const EmptyBlock = (props: StateProps) => (
  <Frame {...props} icon={<Inbox className="size-5" aria-hidden />} />
);

export const ErrorBlock = ({
  onRetry,
  ...props
}: StateProps & { onRetry?: (() => void) | undefined }) => (
  <Frame
    {...props}
    icon={<AlertCircle className="size-5" aria-hidden />}
    action={
      props.action ??
      (onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : undefined)
    }
  />
);

export const PermissionBlock = (props: StateProps) => (
  <Frame {...props} icon={<Lock className="size-5" aria-hidden />} />
);

export const OfflineBlock = (props: StateProps) => (
  <Frame {...props} icon={<WifiOff className="size-5" aria-hidden />} />
);