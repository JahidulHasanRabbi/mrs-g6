"use client";

export default function RedeemLinksLayout({ children }) {
  return (
    <main className="xl:admin-content-pl min-h-screen px-6 py-6 xl:pr-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-end px-2">
          <div className="flex w-full flex-col gap-1">
            <p className="text-[12px] font-medium leading-[18px] text-white">MRS SYSTEM</p>
            <h1
              className="bg-clip-text text-[46px] font-bold leading-[1.05] text-transparent"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
              }}
            >
              Redeem Links
            </h1>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
