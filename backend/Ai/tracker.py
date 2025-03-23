from ultralytics.solutions.solutions import BaseSolution
from ultralytics.utils.plotting import Annotator, colors
import csv
from datetime import datetime, timedelta  # Import timedelta
import os
import cv2


class ObjectCounter(BaseSolution):
    """
    A class to manage the counting of objects in a real-time video stream based on their tracks.
    ... (rest of the class docstring as before)

        reset_interval (int): Time interval in seconds after which counts are reset if no objects are detected.
    """

    def __init__(self, **kwargs):
        """Initializes the ObjectCounter class for real-time object counting in video streams."""
        super().__init__(**kwargs)

        self.in_count = 0  # Counter for objects moving inward
        self.out_count = 0  # Counter for objects moving outward
        self.counted_ids = []  # List of IDs of objects that have been counted
        self.saved_ids = []  # List of IDs already saved to CSV
        self.classwise_counts = {}  # Dictionary for counts, categorized by object class
        self.region_initialized = False  # Bool variable for region initialization

        self.show_in = self.CFG.get("show_in", True)
        self.show_out = self.CFG.get("show_out", True)

        self.last_detection_time = None  # Timestamp of the last person detection
        # Default reset interval is 5 seconds
        self.reset_interval = self.CFG.get("reset_interval", 5)

    def save_label_to_csv(self, track_id, label, action):
        """Save the label, track_id, action, and current time to a new CSV file with the current date."""
        if track_id in self.saved_ids:
            return  # Skip saving if the ID is already saved

        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        current_date = datetime.now().strftime(
            "%Y-%m-%d")  # Get the current date as a string

        # Create a filename using the current date
        filename = f'tracked_objects_{current_date}.csv'

        # Check if the file exists to decide if headers need to be written
        file_exists = os.path.isfile(filename)

        with open(filename, mode='a', newline='') as file:
            writer = csv.writer(file)

            # Write headers only if the file does not exist
            if not file_exists:
                writer.writerow(
                    ['track_id', 'label', 'action', 'date', 'time'])

            # Write the data row with the action column
            writer.writerow([track_id, label, action, current_time.split()[
                            0], current_time.split()[1]])
            self.saved_ids.append(track_id)  # Mark the ID as saved

    def count_objects(self, current_centroid, track_id, prev_position, cls):
        """
        Counts objects within a polygonal or linear region based on their tracks.

        Args:
            current_centroid (Tuple[float, float]): Current centroid values in the current frame.
            track_id (int): Unique identifier for the tracked object.
            prev_position (Tuple[float, float]): Last frame position coordinates (x, y) of the track.
            cls (int): Class index for classwise count updates.
        """
        if prev_position is None or track_id in self.counted_ids:
            return

        action = None  # Default action is None

        if len(self.region) == 2:  # Linear region (defined as a line segment)
            line = self.LineString(self.region)
            if line.intersects(self.LineString([prev_position, current_centroid])):
                if abs(self.region[0][0] - self.region[1][0]) < abs(self.region[0][1] - self.region[1][1]):
                    if current_centroid[0] > prev_position[0]:  # Moving right
                        self.in_count += 1
                        self.classwise_counts[self.names[cls]]["IN"] += 1
                        action = "IN"
                    else:  # Moving left
                        self.out_count += 1
                        self.classwise_counts[self.names[cls]]["OUT"] += 1
                        action = "OUT"
                else:
                    if current_centroid[1] > prev_position[1]:  # Moving downward
                        self.in_count += 1
                        self.classwise_counts[self.names[cls]]["IN"] += 1
                        action = "IN"
                    else:  # Moving upward
                        self.out_count += 1
                        self.classwise_counts[self.names[cls]]["OUT"] += 1
                        action = "OUT"
                self.counted_ids.append(track_id)

        elif len(self.region) > 2:  # Polygonal region
            polygon = self.Polygon(self.region)
            if polygon.contains(self.Point(current_centroid)):
                region_width = max([p[0] for p in self.region]) - \
                    min([p[0] for p in self.region])
                region_height = max([p[1] for p in self.region]) - \
                    min([p[1] for p in self.region])

                if region_width < region_height:
                    if current_centroid[0] > prev_position[0]:  # Moving right
                        self.in_count += 1
                        self.classwise_counts[self.names[cls]]["IN"] += 1
                        action = "IN"
                    else:  # Moving left
                        self.out_count += 1
                        self.classwise_counts[self.names[cls]]["OUT"] += 1
                        action = "OUT"
                else:
                    if current_centroid[1] > prev_position[1]:  # Moving downward
                        self.in_count += 1
                        self.classwise_counts[self.names[cls]]["IN"] += 1
                        action = "IN"
                    else:  # Moving upward
                        self.out_count += 1
                        self.classwise_counts[self.names[cls]]["OUT"] += 1
                        action = "OUT"
                self.counted_ids.append(track_id)

        # Save the label with the action
        if action:
            label = f"{self.names[cls]} ID: {track_id}"
            self.save_label_to_csv(track_id, label, action)

    def store_classwise_counts(self, cls):
        """Initialize class-wise counts for a specific object class if not already present."""
        if self.names[cls] not in self.classwise_counts:
            self.classwise_counts[self.names[cls]] = {"IN": 0, "OUT": 0}

    def display_analytics(self, image, labels_dict, text_color=(104, 31, 17), bg_color=(255, 255, 255), font_scale=0.5, thickness=1):
        y_offset = 20  # Initial y-offset for text placement
        for label, text in labels_dict.items():
            text_size = cv2.getTextSize(
                text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
            text_x = 10  # x-coordinate for text placement
            text_y = y_offset + text_size[1]  # y-coordinate for text placement
            cv2.putText(image, f'{label}: {text}', (text_x, text_y),
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, thickness)
            # Update y-offset for the next line of text
            y_offset += text_size[1] + 10

    def display_counts(self, im0):
        """Displays object counts on the input image or frame."""
        labels_dict = {
            str.capitalize(key): f"{'IN ' + str(value['IN']) if self.show_in else ''} "
            f"{'OUT ' + str(value['OUT']) if self.show_out else ''}".strip()
            for key, value in self.classwise_counts.items()
            if value["IN"] != 0 or value["OUT"] != 0
        }

        if labels_dict:
            self.display_analytics(
                im0, labels_dict, (104, 31, 17), (255, 255, 255), 0.5, 1)

        for track_id in self.track_ids:
            if track_id in self.counted_ids:
                in_count = self.in_count
                label = f"ID:{track_id} count at number {in_count}"
                self.annotator.box_label(self.boxes[self.track_ids.index(
                    track_id)], label=label, color=(255, 255, 0))

    def count(self, im0):
        """Processes input data (frames or object tracks) and updates object counts."""

        # --- START of 5-second refresh logic ---
        current_time = datetime.now()
        if self.last_detection_time is not None:
            time_diff = current_time - self.last_detection_time
            if time_diff >= timedelta(seconds=self.reset_interval) and not self.track_ids:
                # Optional print for debugging
                print("Resetting counts after 5 seconds of no person detection.")
                self.in_count = 0
                self.out_count = 0
                self.counted_ids = []
                self.classwise_counts = {}
                self.saved_ids = []  # Optionally clear saved_ids as well if you want to resave after reset
                # Reset last_detection_time to start the timer again
                self.last_detection_time = None
        # --- END of 5-second refresh logic ---

        if not self.region_initialized:
            self.initialize_region()
            self.region_initialized = True

        self.annotator = Annotator(im0, line_width=self.line_width)
        self.extract_tracks(im0)
        draw_region(im0, self.region, color=(104, 0, 123),
                    thickness=self.line_width * 2)

        # Flag to check if any person is detected in the current frame
        person_detected_in_frame = False

        for box, track_id, cls in zip(self.boxes, self.track_ids, self.clss):
            if self.names[cls] == 'person':  # Check if the detected object is a person
                person_detected_in_frame = True  # Set flag to True if person is detected
                # Update last detection time whenever a person is detected
                self.last_detection_time = current_time

            self.store_tracking_history(track_id, box)
            self.store_classwise_counts(cls)

            label = f"{self.names[cls]} ID: {track_id}"
            self.annotator.box_label(box, label=label, color=colors(cls, True))

            current_centroid = ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
            prev_position = self.track_history[track_id][-2] if len(
                self.track_history[track_id]) > 1 else None
            self.count_objects(current_centroid, track_id, prev_position, cls)

        if not person_detected_in_frame and self.last_detection_time is None and self.track_ids:
            # if no person detected in this frame, and last_detection_time is still None but there are track_ids (meaning objects were tracked before but maybe not persons), we should initialize last_detection_time.
            # only initialize if there are still tracks from previous frames (even if not persons)
            if self.track_ids:
                # Initialize even if no person to start the timer for reset if persons disappear later
                self.last_detection_time = current_time

        self.display_counts(im0)
        self.display_output(im0)

        return im0


def draw_region(image, region_points, color=(104, 0, 123), thickness=2):
    # Draw lines between each pair of points in the region
    for i in range(len(region_points)):
        start_point = region_points[i]
        end_point = region_points[(i + 1) % len(region_points)]
        cv2.line(image, start_point, end_point, color, thickness)
