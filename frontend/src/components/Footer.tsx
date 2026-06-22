export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-1.5 text-sm font-semibold select-none">
          <span className="text-[#e53238]">e</span>
          <span className="text-[#0064d2]">b</span>
          <span className="text-[#f5af02]">a</span>
          <span className="text-[#86b817]">y</span>
          <span className="text-gray-400 font-bold ml-1 uppercase text-[10px]">Clone</span>
        </div>
        <p>(c) 2026 eBay, Inc. Full-stack sandboxed platform simulation. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="text-green-600 font-bold bg-green-50 px-2.0 py-1.0 rounded border border-green-200 uppercase tracking-wider text-[9px]">
            Verified Razorpay Checkout Sandbox
          </span>
        </div>
      </div>
    </footer>
  );
}
