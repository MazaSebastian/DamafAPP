import { Skeleton } from "../ui/Skeleton"

export const NewsSkeleton = () => {
    return (
        <div className="space-y-6">
            {[1, 2].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-white/5">
                    {/* Image Area */}
                    <Skeleton className="h-40 w-full" />

                    {/* Content Area */}
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-2/3" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-xl mt-2" />
                    </div>
                </div>
            ))}
        </div>
    )
}
