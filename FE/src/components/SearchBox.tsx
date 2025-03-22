import { useEffect, useMemo, useState } from 'react';

const SearchBox = () => {
    const [query, setQuery] = useState<string>("")
    const [filterRoutes, setFilteredRoutes] = useState<string[]>([])
    const [selectedRoute, setSelectedRoute] = useState<string>("")

    const routeIds = useMemo(() => ([
        "101", "112", "118", "121", "211", "216", "224", "227", "301", "302",
        "306", "319", "392", "403", "405", "407", "409", "410", "411", "419",
        "421", "423", "502", "507", "605", "900", "901", "902", "905", "915",
        "916", "917", "920", "921", "N1", "N2"
    ]), [])

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value)
        if (value.trim()) {
            setFilteredRoutes(routeIds.filter(route => route.startsWith(value.trim())))
        } else {
            setFilteredRoutes(routeIds)
        }
    }

    // Show full list of route if search box empty
    const handleOnFocus = () => {
        if (!query.trim()) {
            setFilteredRoutes(routeIds)
        } else {
            setFilteredRoutes(routeIds.filter(route => route.startsWith(query)))
        }
    }

    const handleOnBlur = () => {
        // set a delay let browser accept clicking event from user if they choose a route
        setTimeout(() => setFilteredRoutes([]), 100)
    }

    //
    const handleSelectRoute = (route: string) => {
        console.log(`Selected route: ${route}`)
        setQuery(route)
        setSelectedRoute(route)
    }

    // Everytime route is selected => fetch API get the trips (realtime) and filter it.
    useEffect(() => {
        if (routeIds.includes(selectedRoute)) {
            // TODO
        }
    }, [selectedRoute, routeIds])

    return (
        <div className='relative'>
            <input className='w-full px-4 py-3 outline-map-primary bg-white rounded-lg'
                onChange={handleOnChange}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                type="text" value={query}
                placeholder='Search a bus...'
            />
            {
                filterRoutes.length > 0 && (
                    <ul className='absolute top-full mt-2 p-1 bg-white rounded-md w-full gap-y-1 max-h-[40vh] overflow-y-auto'>
                        {filterRoutes.map((route: string) =>
                            <li className='text-center py-2 rounded-md cursor-pointer
                            hover:bg-map-primary'
                                key={route}
                                onClick={() => handleSelectRoute(route)}
                            >
                                {route}
                            </li>
                        )}
                    </ul>
                )
            }
        </div>
    );
}

export default SearchBox
