import { notFound } from 'next/navigation';

// The former client-side PIN and in-memory gift codes were not an admin system.
// Keep this route closed until server-side authorization and persistent codes exist.
export default function AdminPage() {
  notFound();
}
