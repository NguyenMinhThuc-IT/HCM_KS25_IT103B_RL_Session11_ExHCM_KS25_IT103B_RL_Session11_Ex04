/**
 * PHAN TICH EDGE CASES:
 * 1. Ngu canh khong ton tai (Unknown Scene): He thong bao loi va giu nguyen trang thai.
 * 2. Nguy co qua tai dien (Overload Protection): Khi tong cong suat thiet bi dang bat
 *    vuot qua NGUONG_AN_TOAN_WATTS (3000W), he thong tu dong kich hoat Safety Cutoff
 *    ngat cac thiet bi cong suat lon.
 * 3. Thiet bi bi loi ket noi (Offline/Unreachable): Thiet bi co isConnected = false
 *    se khong the dieu khien bang triggerScene va đuoc canh bao trong bao cao.
 */

"use strict";

const OVERLOAD_SAFETY_LIMIT_WATTS = 3000;

const smartDevices = [
  {
    id: "DEV_001",
    name: "Dieu Hoa Phong Khach",
    room: "Living Room",
    isActive: true,
    powerWatts: 1500,
    isConnected: true
  },
  {
    id: "DEV_002",
    name: "Den Chieu Sang Phong Khach",
    room: "Living Room",
    isActive: true,
    powerWatts: 40,
    isConnected: true
  },
  {
    id: "DEV_003",
    name: "Binh Nuoc Nong",
    room: "Bathroom",
    isActive: false,
    powerWatts: 2500,
    isConnected: true
  },
  {
    id: "DEV_004",
    name: "Khoa Cua Thong Minh",
    room: "Main Door",
    isActive: true,
    powerWatts: 10,
    isConnected: false // Edge Case: Thiet bi bi mat ket noi
  }
];

let autoIdCounter = 5;

// ============================================================================
// 1. HAM KIEM CHUAN DU LIEU (VALIDATOR)
// ============================================================================
const validateDeviceInput = (deviceData) => {
  if (!deviceData || typeof deviceData !== "object") {
    return { isValid: false, message: "Du lieu thiet bi phai la object." };
  }

  const { name, room, powerWatts } = deviceData;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return { isValid: false, message: "Ten thiet bi khong duoc de rong." };
  }

  if (!room || typeof room !== "string" || room.trim().length === 0) {
    return { isValid: false, message: "Ten phong khong duoc de rong." };
  }

  if (typeof powerWatts !== "number" || powerWatts <= 0) {
    return { isValid: false, message: "Cong suat powerWatts phai > 0." };
  }

  return { isValid: true, message: "Hop le." };
};

// ============================================================================
// 2. HAM CREATEDEVICE: THEM THIET BI MOI
// ============================================================================
const createDevice = (list, newDev) => {
  const checkResult = validateDeviceInput(newDev);
  if (!checkResult.isValid) {
    console.log(`[CREATE ERROR]: ${checkResult.message}`);
    return null;
  }

  const generatedId = "DEV_" + autoIdCounter.toString().padStart(3, "0");
  autoIdCounter++;

  const createdDevice = {
    id: generatedId,
    name: newDev.name.trim(),
    room: newDev.room.trim(),
    isActive: newDev.isActive !== undefined ? Boolean(newDev.isActive) : false,
    powerWatts: newDev.powerWatts,
    isConnected: newDev.isConnected !== undefined ? Boolean(newDev.isConnected) : true
  };

  list.push(createdDevice);
  console.log(`[CREATE SUCCESS]: Da them thiet bi "${createdDevice.name}" (Ma: ${createdDevice.id})`);
  return createdDevice;
};

// ============================================================================
// 3. HAM CALCULATEENERGY: TINH TONG CONG SUAT DANG TIEU THU
// ============================================================================
const calculateEnergy = (list) => {
  let totalWatts = 0;

  for (let i = 0; i < list.length; i++) {
    const dev = list[i];
    if (dev.isActive && dev.isConnected) {
      totalWatts += dev.powerWatts;
    }
  }

  return totalWatts;
};

// ============================================================================
// 4. HAM NGAT AN TOAN KHI QUA TAI (SAFETY CUTOFF)
// ============================================================================
const triggerSafetyCutoff = (list) => {
  console.log("\n[SAFETY SYSTEM]: PHAT HIEN QUA TAI DIEN! TIEU CHUAN AN TOAN KICH HOAT NGAT NGAY.");

  for (let i = 0; i < list.length; i++) {
    const dev = list[i];
    // Tu dong ngat cac thiet bi tieu thu lon (> 1000W) de bao ve he thong
    if (dev.isActive && dev.powerWatts >= 1000) {
      dev.isActive = false;
      console.log(`[SAFETY CUTOFF]: Da tu dong ngat "${dev.name}" (${dev.powerWatts}W).`);
    }
  }
};

// ============================================================================
// 5. HAM TRIGGERSCENE: DIEU PHOI NGU CANH
// ============================================================================
const triggerScene = (list, sceneName) => {
  if (!sceneName || typeof sceneName !== "string") {
    console.log("[SCENE ERROR]: Ten ngu canh khong hop le.");
    return false;
  }

  const cleanScene = sceneName.trim().toUpperCase();
  console.log(`\n==============================================----------------`);
  console.log(`[DISPATCHER]: KICH HOAT NGU CANH AUTOMATION -> "${cleanScene}"`);
  console.log(`==============================================----------------`);

  let isSceneRecognized = true;

  switch (cleanScene) {
    case "GOODMORNING": {
      for (let i = 0; i < list.length; i++) {
        const dev = list[i];
        if (!dev.isConnected) {
          console.log(`[WARNING]: Thiet bi "${dev.name}" offline - khong the cap nhat status.`);
          continue;
        }

        if (dev.room === "Living Room") {
          dev.isActive = true;
        }
      }
      console.log("-> Che do GoodMorning: Biet dien phong khach da duoc mo.");
      break;
    }

    case "LEAVEHOME": {
      for (let i = 0; i < list.length; i++) {
        const dev = list[i];
        if (!dev.isConnected) {
          console.log(`[WARNING]: Thiet bi "${dev.name}" offline - khong the cap nhat status.`);
          continue;
        }

        // Tắt toàn bộ thiết bị trừ khóa cửa
        if (dev.room !== "Main Door") {
          dev.isActive = false;
        } else {
          dev.isActive = true;
        }
      }
      console.log("-> Che do LeaveHome: Da tat tat ca thiet bi dung dien lon va khoa cua.");
      break;
    }

    case "SLEEPMODE": {
      for (let i = 0; i < list.length; i++) {
        const dev = list[i];
        if (!dev.isConnected) continue;

        if (dev.name.includes("Binh Nuoc Nong") || dev.name.includes("Den Chieu Sang")) {
          dev.isActive = false;
        }
      }
      console.log("-> Che do SleepMode: Da tat binh nuoc nong va den chieu sang.");
      break;
    }

    default: {
      isSceneRecognized = false;
      console.log(`[EDGE CASE ERROR]: Ngu canh "${sceneName}" KHONG TON TAI trong he thong!`);
      break;
    }
  }

  if (!isSceneRecognized) {
    return false;
  }

  // Kiem tra nguy co qua tai dien sau khi kich hoat Scene
  const currentTotalPower = calculateEnergy(list);
  console.log(`Tong cong suat hien tai sau khi doi Scene: ${currentTotalPower} W`);

  if (currentTotalPower > OVERLOAD_SAFETY_LIMIT_WATTS) {
    triggerSafetyCutoff(list);
  }

  return true;
};

// ============================================================================
// 6. HAM IN BAO CAO TRANG THAI VA NANG LUONG
// ============================================================================
const printSystemEnergyReport = (list) => {
  const borderLine = "-".repeat(78);
  console.log("\n" + borderLine);
  console.log("             BAO CAO TRANG THAI & TIEU THU NANG LUONG SMART HOME          ");
  console.log(borderLine);
  console.log(
    "MA TB".padEnd(10) +
    "TEN THIET BI".padEnd(26) +
    "PHONG".padEnd(16) +
    "KET NOI".padEnd(12) +
    "TRANG THAI".padEnd(12) +
    "CONG SUAT".padStart(10)
  );
  console.log(borderLine);

  for (let i = 0; i < list.length; i++) {
    const dev = list[i];
    const colId = dev.id.padEnd(10);
    const colName = (dev.name.length > 24 ? dev.name.slice(0, 21) + "..." : dev.name).padEnd(26);
    const colRoom = dev.room.padEnd(16);
    const colConn = (dev.isConnected ? "ONLINE" : "OFFLINE").padEnd(12);
    const colStatus = (dev.isActive ? "ON" : "OFF").padEnd(12);
    const colPower = (dev.powerWatts + " W").padStart(10);

    console.log(`${colId}${colName}${colRoom}${colConn}${colStatus}${colPower}`);
  }

  const activePower = calculateEnergy(list);
  console.log(borderLine);
  console.log(`TONG THIET BI DANG QUAN LY   : ${list.length.toString().padStart(8)} thiet bi`);
  console.log(`TONG CONG SUAT TIEU THU HIEN TAI: ${activePower.toString().padStart(8)} Watts`);
  console.log(borderLine);
};

// ============================================================================
// 7. KICH BAN KIEM THU TOAN DIEN HE THONG
// ============================================================================

console.log("================================================");
console.log("KICH BAN 1: KHAC HOA KHOI TAO VAP IN BAO CAO BAN DAU");
console.log("================================================");
printSystemEnergyReport(smartDevices);

console.log("\n================================================");
console.log("KICH BAN 2: THEM THIET BI MOI (CREATE)");
console.log("================================================");
createDevice(smartDevices, {
  name: "Bep Tu Doi",
  room: "Kitchen",
  isActive: false,
  powerWatts: 2200,
  isConnected: true
});

console.log("\n================================================");
console.log("KICH BAN 3: KICH HOAT NGU CANH GOODMORNING");
console.log("================================================");
triggerScene(smartDevices, "GoodMorning");
printSystemEnergyReport(smartDevices);

console.log("\n================================================");
console.log("KICH BAN 4: THU KICH HOAT EDGE CASE NGU CANH KHONG TON TAI");
console.log("================================================");
triggerScene(smartDevices, "PartyHardMode");

console.log("\n================================================");
console.log("KICH BAN 5: THU KICH HOAT DONG THOI CAC THIET BI CONG SUAT LON (EDGE CASE QUA TAI)");
console.log("================================================");
// Bat ca Binh nuoc nong va Bep tu doi thu công de co tinh gay qua tai (> 3000W)
smartDevices[2].isActive = true; // Binh nuoc nong: 2500W
smartDevices[4].isActive = true; // Bep tu doi: 2200W
smartDevices[0].isActive = true; // Dieu hoa: 1500W

const totalUncheckedPower = calculateEnergy(smartDevices);
console.log(`Dien ap tai vuot muc du tinh: ${totalUncheckedPower} W`);

if (totalUncheckedPower > OVERLOAD_SAFETY_LIMIT_WATTS) {
  triggerSafetyCutoff(smartDevices);
}

printSystemEnergyReport(smartDevices);

console.log("\n================================================");
console.log("KICH BAN 6: KICH HOAT NGU CANH LEAVEHOME (RA KHOI NHA)");
console.log("================================================");
triggerScene(smartDevices, "LeaveHome");
printSystemEnergyReport(smartDevices);