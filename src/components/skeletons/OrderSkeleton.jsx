import { Skeleton } from "../ui/Skeleton"

export const OrderSkeleton = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-xl border border-white/5 p-4 flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                        <Skeleton className="h-5 w-16 ml-auto" />
                        <Skeleton className="h-3 w-20 ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    )
}
