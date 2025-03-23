import SearchBox from './SearchBox';

// This component show the side bar for user interaction
const Sidebar = () => {
    return (
        <div className="w-[25%] h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl overflow-y-auto">
            <div className="border-b border-gray-700 text-center py-6 mb-4 bg-gradient-to-r from-map-secondary to-map-primary">
                <div className="flex items-center justify-center space-x-3">
                    <span className='text-3xl animate-slide-in'>🚌</span>
                    <h1 className="text-3xl font-bold text-white tracking-wide">Bus Buddy</h1>
                </div>
                <p className="text-gray-100 text-sm mt-2 font-medium">Track your bus crowd in real-time</p>
            </div>
            <div className='px-3'>
                <SearchBox />
            </div>
        </div>
    );
}

export default Sidebar  
