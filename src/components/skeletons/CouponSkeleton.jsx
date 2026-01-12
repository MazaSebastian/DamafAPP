import { Skeleton } from "../ui/Skeleton"

export const CouponSkeleton = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-2xl p-4 border border-white/5 relative overflow-hidden h-40 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>

                    <Skeleton className="h-8 w-3/4 my-2" />
                    <Skeleton className="h-4 w-1/2" />

                    <div className="flex gap-2 mt-4">
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    )
}
