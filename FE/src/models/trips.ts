export type TripsData = {
	header: {
		gtfsRealtimeVersion: string;
		incrementality: string;
		timestamp: string;
	};
	entity: TripsEntity[];
};

export type TripsEntity = {
	id: string;
	isDeleted: boolean;
	direction_name: string;
	trip_headsign: string;
	tripUpdate: {
		stopTimeUpdate: {
			arrival: { time: string };
			departure: { time: string };
			scheduleRelationship: string;
			stopId: string;
			stopSequence: number;
		}[];
		timestamp: string;
		trip: {
			routeId: string;
			startDate: string;
			tripId: string;
		};
		vehicle: { id: string };
	};
};
