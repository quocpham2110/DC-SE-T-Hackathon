import { create } from 'zustand';
import { BusTrackingData } from '../models/busTracking';

export const initialBusTracingkData: BusTrackingData = {
	info: {
		position: {
			latitude: 0,
			longitude: 0,
		},
		timestamp: 0,
		trip_id: '',
		vehicle_id: '',
		trip_headsign: '',
		direction_name: '',
		route_id: '',
	},
	shapes: [],
	crowd: {
		status: false,
		crowd_color: 'Blue',
		total_passenger: 0,
	},
};

export type BusStore = {
	data: BusTrackingData;
	setData: (data: BusTrackingData) => void;
};

const useBusTrackingStore = create<BusStore>((set) => ({
	data: initialBusTracingkData,
	setData: (data: BusTrackingData) => set({ data }),
}));

export default useBusTrackingStore;
