import { LoadingSkeleton } from '@/components/features/loading-skeleton';

export default function ListDetailLoading() {
  return <LoadingSkeleton variant="list-items" count={5} />;
}
