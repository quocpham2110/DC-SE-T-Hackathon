import { useCallback, useMemo, useState } from 'react';
import { apiURL, endPoints } from '../config';
import { MdRefresh } from 'react-icons/md';
import { TripsData, TripsEntity } from '../models/trips';
import { VehiclePosition } from '../models/vehiclePosition';
import { FilteredBusData } from '../models/filteredBus';
import useBusTrackingStore from '../stores/busTrackingStore';

const SearchBox = () => {
    const [query, setQuery] = useState<string>("")
    const [filterRoutes, setFilteredRoutes] = useState<string[]>([])
    const [selectedRoute, setSelectedRoute] = useState<string>("")
    const [filteredTrips, setFilteredTrips] = useState<FilteredBusData[]>([])
    const [selectedTrip, setSelectedTrip] = useState<FilteredBusData | undefined>(undefined)

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
        fetchingTrips(route)
    }

    const [fetching, setFetching] = useState<boolean>(false)


    // Everytime route is selected => fetch API get the trips (realtime) and filter it.
    const fetchingVehiclePosition = useCallback(() => {
        return fetch(`${apiURL}/${endPoints.vehiclePosition}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(`[API-GET-vehiclePosition] `, data)
                return data
            })
    }, [])

    const fetchingTrips = useCallback((route: string) => {
        if (routeIds.includes(route)) {
            setFetching(true)
            fetch(`${apiURL}/${endPoints.trips}`)
                .then(res => res.json())
                .then((data: TripsData) => {
                    console.log(`[API-GET-trips] `, data)
                    const currentTime = new Date().getTime();
                    const trips = data.entity
                    const filteredData = trips.filter((trip: TripsEntity) => {
                        const firstStop = trip.tripUpdate.stopTimeUpdate[0]
                        const lastStop = trip.tripUpdate.stopTimeUpdate[trip.tripUpdate.stopTimeUpdate.length - 1]

                        return (
                            trip.tripUpdate.trip.routeId === route
                            && (+firstStop.arrival.time * 1000) <= currentTime
                            && (+lastStop.arrival.time * 1000) >= currentTime
                        )
                    })

                    console.log(`filtered trip: ${route} `, filteredData)
                    return filteredData.map((data: TripsEntity) => ({
                        trip_id: data.tripUpdate.trip.tripId,
                        timestamp: data.tripUpdate.timestamp,
                        vehicle_id: data.tripUpdate.vehicle.id,
                        direction_name: data.direction_name,
                        trip_headsign: data.trip_headsign,
                        latitude: 0,
                        longitude: 0,
                    }))
                })
                .then(async (buses: FilteredBusData[]) => {
                    if (!buses.length) {
                        return;
                    }
                    try {
                        const result: FilteredBusData[] = []
                        const vehiclePositionData = await fetchingVehiclePosition()

                        vehiclePositionData.forEach((vehicle: VehiclePosition) => {
                            const idx = buses.findIndex((bus: FilteredBusData) =>
                                bus.trip_id === vehicle.trip_id
                                && bus.vehicle_id === vehicle.vehicle_id
                            )
                            if (idx > -1) {
                                result.push({ ...buses[idx], latitude: vehicle.latitude, longitude: vehicle.longitude })
                            }
                        })
                        console.log(`Transformed data - result: `, result)
                        setFilteredTrips(result)
                    } catch (e: unknown) {
                        console.log(`[ERROR] vehicle position API ${e}`)
                    }
                })
                .finally(() => {
                    setFetching(false)
                })
        }
    }, [routeIds, fetchingVehiclePosition])


    const { setData } = useBusTrackingStore(state => state)

    // Keep tracking bus 
    const handlekBusTracking = (busData: FilteredBusData) => {
        if (busData.trip_id === selectedTrip?.trip_id)

            console.log(`bus data: `, busData)
        const body = {
            trip_id: busData.trip_id,
            vehicle_id: busData.vehicle_id
        }

        fetch(`${apiURL}/${endPoints.trackBus}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(`[API-POST-track-bus] `, data)
                if (data.length) {
                    setSelectedTrip(busData)
                    setData({
                        info: {
                            position: {
                                latitude: data[0].latitude,
                                longitude: data[0].longitude,
                            },
                            timestamp: data[0].timestamp,
                            trip_id: data[0].trip_id,
                            vehicle_id: data[0].vehicle_id,
                            trip_headsign: data[0].trip_headsign,
                            direction_name: data[0].direction_name,
                            route_id: data[0].route_id,
                            crowd_color: data[3].crowd_color
                        },
                        shapes: data[1],
                    })
                } else {
                    alert('Cannot track this bus right now')
                }
            })
    }

    return (
        <>
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
            </div >
            <div className='mt-4 text-gray-200 flex flex-row items-center'>
                <p className=''>
                    Selected bus:
                </p>
                {
                    selectedRoute && (
                        <div className='flex-1 flex items-center justify-between'>
                            <p className='bg-map-primary rounded-lg px-4 py-2 ml-3 text-map-secondary'>
                                {selectedRoute}
                            </p>
                            <button className='p-2 text-map-primary cursor-pointer 
                            hover:bg-map-primary hover:text-map-secondary hover:shadow-md rounded-full'
                                onClick={() => fetchingTrips(selectedRoute)}
                            >
                                <MdRefresh size={20} />
                            </button>
                        </div>
                    )
                }
            </div>

            {/* Show the list of filterd and transformed buses data */}
            {
                selectedRoute && !fetching && (
                    <div className='text-map-primary mt-3'>
                        <p className='italic text-sm'>
                            {filteredTrips.length} live bus{filteredTrips.length > 1 ? 'es' : ''} found
                        </p>
                        <ul className='flex flex-col gap-y-2 mt-2 px-2 py-1 max-h-[50vh] overflow-y-auto rounded-md'>
                            {
                                filteredTrips.length > 0 && filteredTrips.map((busData: FilteredBusData) => (
                                    <li key={busData.trip_id}
                                        className={selectedTrip?.trip_id === busData.trip_id ?
                                            `px-3 py-2 text-smrounded-md border  bg-gray-600 rounded-md` :
                                            `text-gray-100 px-3 py-2 rounded-md border border-map-primary
                                            hover:bg-map-primary hover:text-map-secondary cursor-pointer`}
                                        onClick={() => handlekBusTracking(busData)}
                                    >
                                        <p>
                                            {busData.direction_name}
                                        </p>
                                        <p>
                                            {busData.trip_headsign}
                                        </p>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )
            }

            {/* Show the loading icon */}
            {
                fetching && (
                    <div className='text-center mt-4'>
                        <span className='inline-block w-10 h-10 border-4 border-t-transparent border-map-primary animate-spin rounded-full'></span>
                    </div>
                )
            }

        </>
    );
}

export default SearchBox
