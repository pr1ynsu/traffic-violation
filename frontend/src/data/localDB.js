// src/data/localDB.js

// Mock users
const users = [
  { id: "u1", name: "John Doe", role: "user", vehicleId: "v1", credits: 400 },
  { id: "g1", name: "Officer Raj", role: "gov" },
];

// Mock vehicles
const vehicles = [
  { id: "v1", number: "AB101J1234", ownerId: "u1" },
  { id: "v2", number: "AB101J5678", ownerId: "u1" },
];

// Mock records
const violations = [
  { id: "vi1", vehicleId: "v1", violation: "Speeding", timestamp: "2025-10-27 10:00" },
  { id: "vi2", vehicleId: "v2", violation: "Wrong Parking", timestamp: "2025-10-27 12:00" },
];

const credits = [
  { id: "cr1", vehicleId: "v1", credits: "+100", timestamp: "2025-10-26 14:00" },
  { id: "cr2", vehicleId: "v1", credits: "-50", timestamp: "2025-10-27 08:00" },
];

const challans = [
  { id: "ch1", vehicleId: "v1", challan: 1000, violation: "Speeding", timestamp: "2025-10-27 10:00" },
  { id: "ch2", vehicleId: "v2", challan: 500, violation: "Wrong Parking", timestamp: "2025-10-27 12:00" },
];

// Simple join helper
function findVehicle(numberOrId) {
  return vehicles.find((v) => v.id === numberOrId || v.number === numberOrId);
}

// Database-like API
export const localDB = {
  // AUTH
  getUserByRole(role) {
    return users.find((u) => u.role === role);
  },
  getUserById(id) {
    return users.find((u) => u.id === id);
  },

  // RECORDS
  getRecords({ type, owner }) {
    let list = [];
    if (type === "violations") list = violations;
    if (type === "credits") list = credits;
    if (type === "all") list = challans;

    // filter for user (owner=me)
    if (owner === "me") {
      const user = users.find((u) => u.role === "user");
      const userVehicles = vehicles.filter((v) => v.ownerId === user.id).map((v) => v.id);
      list = list.filter((rec) => userVehicles.includes(rec.vehicleId));
    }

    // enrich with vehicle + owner info for gov
    return list.map((rec) => {
      const v = findVehicle(rec.vehicleId);
      const owner = users.find((u) => u.id === v.ownerId);
      return {
        ...rec,
        vehicle: v.number,
        ownerName: owner?.name,
        ownerPhone: owner?.phone || "9999999999",
      };
    });
  },
};
