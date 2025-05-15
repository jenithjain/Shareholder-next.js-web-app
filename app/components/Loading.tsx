export default function Loading() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent shadow-lg"/>
      <span className="ml-3 text-blue-300">Loading data...</span>
    </div>
  );
}