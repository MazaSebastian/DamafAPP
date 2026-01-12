import { Skeleton } from "../ui/Skeleton"

export const MenuSkeleton = () => {
    return (
        <div className="grid grid-cols-2 gap-4 pb-24 content-start">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-2xl p-3 border border-white/5 flex flex-col h-full">
                    {/* Image Skeleton */}
                    <Skeleton className="w-full aspect-square rounded-xl mb-3" />

                    {/* Text Skeletons */}
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>

                    {/* Button Skeleton */}
                    <Skeleton className="h-8 w-full mt-3 rounded-lg" />
                </div>
            ))}
        </div>
    )
}
