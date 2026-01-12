import { Skeleton } from "../ui/Skeleton"

export const RewardSkeleton = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-xl overflow-hidden border border-white/5">
                    {/* Image Placeholder */}
                    <Skeleton className="h-32 w-full" />

                    <div className="p-3 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    )
}
