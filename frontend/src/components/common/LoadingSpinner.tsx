export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-slate-700"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
      </div>
    </div>
  );
}
