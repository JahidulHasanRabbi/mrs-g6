"use client";

import RowActions from "./RowActions";
import ImageCell from "./ImageCell";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

export default function BannerTable({ banners = [], onEdit, onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Banner Title</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Banner Subtitle</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Label Text</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Section Title</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Description</th>
              <th className="px-5 py-4 text-center text-[13px] font-semibold text-[#fbeed2]">Image</th>
              <th className="px-5 py-4 text-right text-[13px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No banner information yet.
                </td>
              </tr>
            ) : (
              banners.map((b) => (
                <tr key={b.id} className="border-b border-white/5 align-top last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] font-medium uppercase text-white">{b.title}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{b.subtitle}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{b.label}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{b.section}</td>
                  <td className="px-5 py-5 text-[12px] leading-[1.6] text-white">{b.description}</td>
                  <td className="px-5 py-5 align-middle"><ImageCell src={b.image} alt={b.title} /></td>
                  <td className="px-5 py-5 align-middle">
                    <RowActions
                      onEdit={() => onEdit?.(b)}
                      onArchive={() => onArchive?.(b)}
                      showArchive={false}
                    />
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
