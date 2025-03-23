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
		crowd_color: 'Blue',
	},
	shapes: [],
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
