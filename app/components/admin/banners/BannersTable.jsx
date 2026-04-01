"use client";

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
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Link (Slug)</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Active Until</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-400">
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
                    <a
                      href={banner.slug}
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
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        isActive(banner.active_until)
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isActive(banner.active_until) ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(banner)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onArchive(banner.uuid)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Archive
                      </button>
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
