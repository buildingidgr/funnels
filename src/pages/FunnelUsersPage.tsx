import { useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  email: string;
  name: string;
  country?: string;
  device?: string;
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function getInitials(name?: string, fallback?: string) {
  const source = (name || fallback || '').trim();
  if (!source) return 'U';
  const parts = source.split(/\s+/);
  if (parts.length === 1) {
    const segs = source.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/);
    const first = segs[0]?.[0] || source[0];
    const last = segs[1]?.[0] || source[source.length - 1];
    return (first + (last || '')).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFromString(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 85%)`;
}

export default function FunnelUsersPage() {
  const { id } = useParams();
  const q = useQuery();

  const type = q.get('type'); // 'node' | 'link'
  const nodeId = q.get('nodeId') || undefined;
  const sourceId = q.get('sourceId') || undefined;
  const targetId = q.get('targetId') || undefined;
  const value = Number(q.get('value') || '0');

  // Mock data generator for demo purposes
  const users: User[] = useMemo(() => {
    const count = Math.min(1000, Math.max(0, Math.floor(value)));
    const seed = (nodeId || `${sourceId}-${targetId}` || 'seed').length;
    const list: User[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: `${seed}-${i}`,
        email: `user${seed}${i}@example.com`,
        name: `User ${seed}-${i}`,
        country: ['US', 'GB', 'DE', 'FR', 'NG', 'KE', 'GH'][i % 7],
        device: ['iOS', 'Android', 'Desktop'][i % 3]
      });
    }
    return list;
  }, [nodeId, sourceId, targetId, value]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, users.length);
  const pagedUsers = users.slice(start, end);

  const title = type === 'link'
    ? `Users from ${sourceId} to ${targetId}`
    : `Users at ${nodeId}`;

  const handleChangePageSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-600">Funnel: {id}</p>
          </div>
          <Link to={`/funnels/${id}/analysis`}>
            <Button variant="outline">Back to Analysis</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-3 border-b text-sm text-gray-600 flex items-center justify-between gap-3 flex-wrap">
            <div>
              Showing {start + 1}-{end} of {users.length.toLocaleString()} users
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600">Rows per page</label>
              <select
                value={pageSize}
                onChange={handleChangePageSize}
                className="border rounded px-2 py-1 text-sm"
              >
                {[10, 20, 50, 100].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <span className="text-xs text-gray-600">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="px-3 py-2 w-12">Avatar</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Device</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map(u => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-700"
                        style={{ backgroundColor: colorFromString(u.email || u.id) }}
                        title={u.name}
                      >
                        {getInitials(u.name, u.email)}
                      </div>
                    </td>
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.country}</td>
                    <td className="px-3 py-2">{u.device}</td>
                  </tr>
                ))}
                {pagedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-500">No users on this page</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t text-sm text-gray-600 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <span className="text-xs">{start + 1}-{end} of {users.length.toLocaleString()}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


