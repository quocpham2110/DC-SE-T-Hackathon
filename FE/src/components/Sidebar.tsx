import SearchBox from './SearchBox';

// This component show the side bar for user interaction
const Sidebar = () => {
    return (
        <div className="w-[25%] h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl overflow-y-auto">
            <div className="border-b border-gray-700 text-center px-2 py-6 mb-4 bg-gradient-to-r from-map-secondary to-map-primary">
                <div className="flex items-center justify-center space-x-3 text-3xl font-bold">
                    <span className='animate-slide-in'>🚌</span>
                    <span className='text-sm animate-popup mt-4'>💨</span>
                    <h1 className="text-gray-50 tracking-wide">
                        <span className='text-4xl text-map-secondary'>B</span>us <span className='text-4xl text-map-secondary'>B</span>uddy
                    </h1>
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
