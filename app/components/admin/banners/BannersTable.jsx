"use client";

import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

export default function BannersTable({ banners, onEdit, onArchive }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = (activeUntil) => {
    return new Date(activeUntil) > new Date();
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Preview</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Name</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Location</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Link (Slug)</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Active Until</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-gray-400">
                  No banners found. Create your first banner to get started.
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.uuid} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-3">
                    <img
                      src={banner.image}
                      alt={banner.name}
                      className="w-24 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-5 py-3 text-sm text-white">{banner.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    <StatusBadge tone={banner.location === 'Side Panel' ? 'info' : 'neutral'} showDot={false}>
                      {banner.location || 'Main Page'}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    <a
                      href={banner.slug.startsWith('http://') || banner.slug.startsWith('https://') ? banner.slug : `https://${banner.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e9af41] hover:underline"
                    >
                      {banner.slug.length > 40 ? banner.slug.substring(0, 40) + '...' : banner.slug}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {formatDate(banner.active_until)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={isActive(banner.active_until) ? 'success' : 'danger'}>
                      {isActive(banner.active_until) ? 'Active' : 'Expired'}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEdit(banner)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onArchive(banner)}>
                        Archive
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
