# fake_violations.py
"""
Generate random traffic violation records for testing.

Each record contains:
- id: short UUID
- timestamp: ISO 8601 timestamp (recent)
- vehicle_number: random vehicle plate (India-like format)
- violation_code: integer code for the violation
- violation_text: human-readable violation description
- offender_name: single random character (placeholder)
- challan_rupees: amount deducted (int)
- credits_rupees: amount added (int)

Outputs:
- prints records to stdout
- writes `violations_sample.json` and `violations_sample.csv`

Usage:
    python fake_violations.py
    python fake_violations.py --count 50 --seed 42
"""
from __future__ import annotations
import random
import string
import csv
import json
import uuid
from datetime import datetime, timedelta
import argparse
from typing import List, Dict

# Seed for reproducibility (optional)
DEFAULT_SEED = None

# Violation catalogue (code -> description)
VIOLATIONS = {
    101: "Speeding above limit",
    102: "Running red light",
    103: "Wrong-side driving",
    104: "No seatbelt",
    105: "Using mobile while driving",
    106: "Driving without license",
    107: "Expired registration",
    108: "Illegal parking",
    109: "Helmet missing (two-wheeler)",
    110: "Overloading"
}

# Typical challan (penalty) ranges per violation type (INR)
CHALLAN_RANGES = {
    101: (1500, 5000),
    102: (1000, 3000),
    103: (2000, 6000),
    104: (500, 1500),
    105: (800, 2500),
    106: (2000, 7000),
    107: (500, 2000),
    108: (300, 1500),
    109: (250, 1000),
    110: (1000, 5000),
}

# Credits ranges (some systems might add nominal credits when driver completes quick payment/rehab)
CREDITS_RANGE = (0, 500)  # INR added as credits (can be 0)


def random_vehicle_number() -> str:
    """
    Generate an India-like vehicle plate:
    Example: KA25AB1234 or DL4CAF5030 (a variety)
    We'll produce: 2 letters (state) + 1-2 digits (RTO) + 1-2 letters + 3-4 digits
    """
    state = ''.join(random.choices(string.ascii_uppercase, k=2))
    rto = str(random.randint(1, 99))
    mid = ''.join(random.choices(string.ascii_uppercase, k=random.choice([1, 2])))
    number = str(random.randint(100, 9999)).zfill(random.choice([3, 4]))
    return f"{state}{rto}{mid}{number}"


def random_timestamp(within_days: int = 30) -> str:
    """
    Generate a recent timestamp within the last `within_days` days.
    Returns ISO 8601 string.
    """
    now = datetime.now()
    delta_days = random.uniform(0, within_days)
    delta_seconds = random.uniform(0, 24 * 3600)
    ts = now - timedelta(days=delta_days, seconds=delta_seconds)
    return ts.replace(microsecond=0).isoformat()


def pick_violation() -> (int, str):
    """
    Randomly pick a violation code and its text.
    """
    code = random.choice(list(VIOLATIONS.keys()))
    return code, VIOLATIONS[code]


def random_challan_and_credits(code: int) -> (int, int):
    """
    Given a violation code, produce a challan amount and credits amount.
    Both are integer rupee amounts. Challan is drawn from a pre-defined range.
    Credits are small and optional.
    """
    low, high = CHALLAN_RANGES.get(code, (500, 2000))
    # compute a random integer in the inclusive range
    challan = random.randint(low, high)
    credits = random.randint(*CREDITS_RANGE)
    # ensure credits never exceed challan (sane rule)
    if credits > challan:
        credits = challan // 10
    return challan, credits


def generate_record() -> Dict:
    """
    Generate a single fake violation record.
    """
    violation_code, violation_text = pick_violation()
    challan, credits = random_challan_and_credits(violation_code)
    record = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": random_timestamp(30),
        "vehicle_number": random_vehicle_number(),
        "violation_code": violation_code,
        "violation_text": violation_text,
        "offender_name": random.choice(string.ascii_uppercase),  # single random character as requested
        "challan_rupees": challan,
        "credits_rupees": credits
    }
    return record


def generate_records(count: int = 10, seed: int | None = DEFAULT_SEED) -> List[Dict]:
    """
    Generate `count` records. Optionally seed the RNG for reproducibility.
    """
    if seed is not None:
        random.seed(seed)
    return [generate_record() for _ in range(count)]


def save_json(records: List[Dict], filename: str = "violations_sample.json") -> None:
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


def save_csv(records: List[Dict], filename: str = "violations_sample.csv") -> None:
    if not records:
        return
    keys = list(records[0].keys())
    with open(filename, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for r in records:
            writer.writerow(r)


def main():
    parser = argparse.ArgumentParser(description="Generate fake traffic violation records.")
    parser.add_argument("--count", "-n", type=int, default=10, help="Number of records to generate (default 10)")
    parser.add_argument("--seed", "-s", type=int, default=None, help="Optional random seed for reproducible output")
    parser.add_argument("--json", action="store_true", help="Also dump JSON (default true)")
    parser.add_argument("--csv", action="store_true", help="Also dump CSV (default true)")
    args = parser.parse_args()

    # default: save both CSV and JSON
    save_json_flag = True if not (args.json is False and args.csv is True) else True
    save_csv_flag = True if not (args.csv is False and args.json is True) else True
    # (simple: always save both unless user explicitly wants none - keep it easy)

    records = generate_records(count=args.count, seed=args.seed)

    # print a short table-like summary to console
    print(f"\nGenerated {len(records)} fake violation records\n")
    for r in records:
        # timestamp, vehicle, violation code/text, challan, credits
        print(f"{r['timestamp']} | {r['vehicle_number']} | {r['violation_code']} - {r['violation_text']} | "
              f"name={r['offender_name']} | -₹{r['challan_rupees']} | +₹{r['credits_rupees']}")

    if save_json_flag:
        save_json(records)
        print("\nSaved JSON -> violations_sample.json")
    if save_csv_flag:
        save_csv(records)
        print("Saved CSV  -> violations_sample.csv")
    print("\nDone.\n")


if __name__ == "__main__":
    main()
