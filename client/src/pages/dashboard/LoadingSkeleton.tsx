const LoadingSkeleton = () => (
    <div className="flex items-center justify-center h-48">
        <div className="h-6 w-6 bg-blue-300 rounded-lg animate-pulse mx-2"></div>
        <div className="h-6 w-6 bg-blue-300 rounded-lg animate-pulse mx-2"></div>
        <div className="h-6 w-6 bg-blue-300 rounded-lg animate-pulse mx-2"></div>
    </div>
);

export default LoadingSkeleton;