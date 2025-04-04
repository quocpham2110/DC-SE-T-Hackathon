export type BusTrackingData = {
	info: {
		position: {
			latitude: number;
			longitude: number;
		};
		timestamp: number;
		trip_id: string;
		vehicle_id: string;
		trip_headsign: string;
		direction_name: string;
		route_id: string;
	};
	shapes: {
		shape_pt_lat: number;
		shape_pt_lon: number;
	}[];
	crowd: {
		status: boolean;
		crowd_color: string;
		total_passenger: number;
	};
};
