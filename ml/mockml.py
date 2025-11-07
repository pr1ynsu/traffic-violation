#!/usr/bin/env python3
"""
violation_generator.py

Generates mock traffic violation records every 30 seconds (≈5 records per interval),
saves them to a CSV file and writes a simple JPEG "photo" for each record.

Run:
    pip install pillow
    python violation_generator.py

Outputs:
  - ./output/violations.csv          (appended records)
  - ./output/photos/<id>_<safe_ts>.jpg
"""

import csv
import os
import random
import string
import time
import uuid
from datetime import datetime, timezone, timedelta

try:
    from PIL import Image, ImageDraw, ImageFont
except Exception:
    Image = None  # graceful fallback explained below

# ====== CONFIG ======
OUTPUT_DIR = "output"
PHOTOS_DIR = os.path.join(OUTPUT_DIR, "photos")
CSV_PATH = os.path.join(OUTPUT_DIR, "violations.csv")

RUN_DURATION_MINUTES = 30        # total run time
INTERVAL_SECONDS = 30            # frequency of batches
RECORDS_PER_INTERVAL = 5         # approx records generated each interval

IMAGE_SIZE = (1024, 680)         # pixels (w, h)
FONT_SIZE = 28

# Map of violation_code -> violation_text (extend as needed)
VIOLATIONS = {
    101: "Speeding above limit",
    102: "Running red light",
    103: "Dangerous driving",
    104: "No seatbelt",
    105: "Wrong-way driving",
    106: "Overloading",
    107: "Expired registration",
    108: "Illegal parking",
    109: "Helmet missing (two-wheeler)",
}

# rupee ranges for challan and credits (tunable)
CHALLAN_RANGE = (300, 3000)
CREDITS_RANGE = (30, 400)

# Offender name pattern in your examples: single uppercase letter
OFFENDER_LETTERS = string.ascii_uppercase

# Optional: font path for PIL overlay. If unavailable, PIL will use default font.
DEFAULT_FONT_PATH = None  # e.g., "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
# ====================


def ensure_dirs():
    os.makedirs(PHOTOS_DIR, exist_ok=True)
    # If CSV doesn't exist, create and write header
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "id",
                "timestamp",
                "vehicle_number",
                "violation_code",
                "violation_text",
                "offender_name",
                "challan_rupees",
                "credits_rupees",
                "photo_path"
            ])


def make_id():
    # 8 hex chars like your sample
    return uuid.uuid4().hex[:8]


def iso_now_utc():
    # returns ISO8601 timestamp with 'T' and seconds (UTC)
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def safe_ts_for_filename(ts_iso):
    # replace characters not good for filenames
    return ts_iso.replace(":", "-").replace("+", "_").replace("Z", "")


def random_vehicle_plate():
    """
    Generate plates with a few different realistic-ish patterns to mimic your samples.
    Patterns chosen randomly:
      - LLDDLLDDD  (e.g., WA67XR748)
      - LLDDLDDDD  (e.g., LA99I7578)
      - LLDLDDDDD
      - LLDDDDDD   (fallback)
    L = letter, D = digit
    """
    patterns = [
        ("LLDDLLDDD", lambda: "{}{:02d}{}{:03d}".format(
            random.choice(string.ascii_uppercase),
            random.randint(10, 99),
            "".join(random.choices(string.ascii_uppercase, k=2)),
            random.randint(0, 999),
        )),
        ("LLDDLDDDD", lambda: "{}{:02d}{}{:04d}".format(
            random.choice(string.ascii_uppercase),
            random.randint(10, 99),
            random.choice(string.ascii_uppercase),
            random.randint(0, 9999),
        )),
        ("LLDLDLDDD", lambda: "{}{}{:02d}{}{:03d}".format(
            random.choice(string.ascii_uppercase),
            random.choice(string.ascii_uppercase),
            random.randint(0, 99),
            random.choice(string.ascii_uppercase),
            random.randint(0, 999),
        )),
        ("LLDDDDDD", lambda: "{}{:02d}{:04d}".format(
            random.choice(string.ascii_uppercase),
            random.randint(10, 99),
            random.randint(0, 9999),
        )),
    ]
    _, fn = random.choice(patterns)
    plate = fn()
    # Uppercase & remove accidental spaces
    return plate.upper().replace(" ", "")


def pick_violation():
    code = random.choice(list(VIOLATIONS.keys()))
    return code, VIOLATIONS[code]


def random_rupees(range_min, range_max):
    return random.randint(range_min, range_max)


def offender_name():
    return random.choice(OFFENDER_LETTERS)


def draw_mock_photo(record_id, timestamp_iso, vehicle_number, violation_text):
    """
    Create a simple JPEG that looks like a mocked site photo.
    The image will contain the vehicle_number, violation_text and timestamp overlayed.
    """
    filename_ts = safe_ts_for_filename(timestamp_iso)
    filename = f"{record_id}_{filename_ts}.jpg"
    path = os.path.join(PHOTOS_DIR, filename)

    if Image is None:
        # Pillow not installed — create a tiny fallback text file to indicate "photo".
        with open(path + ".txt", "w", encoding="utf-8") as f:
            f.write(f"MOCK PHOTO\nid: {record_id}\nvehicle: {vehicle_number}\nviolation: {violation_text}\ntimestamp: {timestamp_iso}\n")
        return path + ".txt"

    # Create image
    img = Image.new("RGB", IMAGE_SIZE, color=random.choice([
        (220, 220, 220), (200, 180, 160), (180, 200, 220), (240, 230, 210)
    ]))
    draw = ImageDraw.Draw(img)

    # Load a font if available, otherwise default
    try:
        if DEFAULT_FONT_PATH:
            font = ImageFont.truetype(DEFAULT_FONT_PATH, FONT_SIZE)
        else:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    # Draw a rectangle "scene" to mimic a road background
    w, h = IMAGE_SIZE
    road_height = int(h * 0.45)
    draw.rectangle([0, h - road_height, w, h], fill=(60, 60, 60))
    draw.rectangle([0, h - road_height - 10, w, h - road_height + 10], fill=(100, 100, 100))

    # Mock "vehicle" as a rounded rectangle
    car_w, car_h = int(w * 0.5), int(road_height * 0.4)
    car_x = random.randint(20, w - car_w - 20)
    car_y = h - road_height + random.randint(10, 30)
    draw.rectangle([car_x, car_y, car_x + car_w, car_y + car_h], fill=(random.randint(30, 200), random.randint(30, 200), random.randint(30, 200)))

    # Overlay text block with metadata
    text_lines = [
        f"ID: {record_id}",
        f"TS: {timestamp_iso}",
        f"Plate: {vehicle_number}",
        f"Violation: {violation_text}",
    ]
    text_x = 20
    text_y = 20
    for line in text_lines:
        draw.text((text_x, text_y), line, fill=(10, 10, 10), font=font)
        text_y += FONT_SIZE + 8

    # Save compressed JPG
    img.save(path, format="JPEG", quality=75)
    return path


def generate_record():
    rid = make_id()
    ts = iso_now_utc()
    vehicle = random_vehicle_plate()
    vcode, vtext = pick_violation()
    offender = offender_name()
    challan = random_rupees(*CHALLAN_RANGE)
    credits = random_rupees(*CREDITS_RANGE)

    # Create or mock photo
    photo_path = draw_mock_photo(rid, ts, vehicle, vtext)

    return {
        "id": rid,
        "timestamp": ts,
        "vehicle_number": vehicle,
        "violation_code": vcode,
        "violation_text": vtext,
        "offender_name": offender,
        "challan_rupees": challan,
        "credits_rupees": credits,
        "photo_path": photo_path
    }


def append_records_to_csv(records):
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for r in records:
            writer.writerow([
                r["id"],
                r["timestamp"],
                r["vehicle_number"],
                r["violation_code"],
                r["violation_text"],
                r["offender_name"],
                r["challan_rupees"],
                r["credits_rupees"],
                r["photo_path"]
            ])


def main():
    ensure_dirs()
    start = time.time()
    run_seconds = RUN_DURATION_MINUTES * 60
    iteration = 0

    print(f"Starting mock generator: {RUN_DURATION_MINUTES} min, every {INTERVAL_SECONDS}s, ~{RECORDS_PER_INTERVAL} records / interval.")
    try:
        # first immediate batch
        while True:
            now = time.time()
            elapsed = now - start
            if elapsed >= run_seconds:
                print("Run duration completed. Stopping.")
                break

            iteration += 1
            batch = []
            for _ in range(RECORDS_PER_INTERVAL):
                rec = generate_record()
                batch.append(rec)

            append_records_to_csv(batch)

            # Print short summary to console
            print(f"[{iteration}] {datetime.now().isoformat(timespec='seconds')} -> generated {len(batch)} records; CSV appended, photos saved in '{PHOTOS_DIR}'")
            # Optionally: show first record (brief)
            print("  sample:", batch[0]["id"], batch[0]["vehicle_number"], batch[0]["violation_code"], batch[0]["photo_path"])

            # Sleep until next interval or until the run duration is over
            time_left = run_seconds - (time.time() - start)
            if time_left <= 0:
                break
            sleep_for = min(INTERVAL_SECONDS, time_left)
            time.sleep(sleep_for)

    except KeyboardInterrupt:
        print("Interrupted by user. Exiting and saving what we have.")

    print(f"Done. CSV: {CSV_PATH}   Photos dir: {PHOTOS_DIR}")


if __name__ == "__main__":
    main()
