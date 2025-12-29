// Loading page component for use in loading.tsx files
import { FunLoader } from "@/components/ui/fun-loader"

export function LoadingPage() {
  return <FunLoader fullScreen message="Loading your journey..." size="lg" />
}

