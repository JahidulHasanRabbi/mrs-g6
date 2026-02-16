"use client";

import FullWidthWrapper from './FullWidthWrapper';

export default function ExampleFullWidth() {
  return (
    <div className="bg-blue-500 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Full Width Example</h2>
      
      {/* Normal content within 475px container */}
      <div className="bg-white text-black p-4 rounded mb-4">
        <p>This content stays within the 475px max-width container.</p>
      </div>

      {/* Full width content that breaks out of container */}
      <FullWidthWrapper>
        <div className="bg-red-500 text-white p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Full Width Section</h3>
          <p>This section spans the entire viewport width (100vw)!</p>
          <p className="mt-2">Perfect for hero sections, banners, or full-width galleries.</p>
        </div>
      </FullWidthWrapper>

      {/* Back to normal constrained content */}
      <div className="bg-white text-black p-4 rounded mt-4">
        <p>This content is back within the 475px container.</p>
      </div>
    </div>
  );
}
