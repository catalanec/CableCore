import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CONFIG = {
  cablePrices: { cat5: 0.30, cat6: 0.55, cat6a: 1.10, cat7: 2.00 },
  laborPerPoint: { basic: 30, conduit: 50, advanced: 90 },
  cableMultiplier: { cat5: 1.0, cat6: 1.1, cat6a: 1.25, cat7: 1.4 },
  installationMultiplier: {
    external: 1.0, ceiling: 1.1, existing_wall: 1.2,
    new_wall: 1.0, industrial: 1.5, trays: 1.4,
  },
  routingPricePerMeter: {
    external: 3, ceiling: 5, existing_wall: 8,
    new_wall: 10, industrial: 12, trays: 7,
  },
  trenchPricePerMeter: 45,
  materials: { keystone: 6, socket: 10, trunking: 4, pvc: 2, corrugated: 1, patchPanel: 60 },
  equipment: { router: 50, switch: 40, accessPoint: 70, configuration: 150 },
  upsell: { testing: 50, labeling: 20, cableManagement: 50, extendedWarranty: 30 },
  IVA_RATE: 0.21,
} as const;

type CableType = keyof typeof CONFIG.cablePrices;
type InstallType = keyof typeof CONFIG.installationMultiplier;

interface CalculatorState {
  // Inputs
  cableType: CableType;
  points: number;
  avgLength: number;
  installType: InstallType;
  trenchMode: 'full' | 'manual';
  trenchLengthInput: number;
  canetaMode: 'full' | 'manual';
  canetaLengthInput: number;
  additionalMaterials: Record<string, number>;
  equipment: Record<string, number>;
  upsellOptions: Record<string, boolean>;
  rack: string;
  urgency: string;

  // Actions
  setCableType: (type: CableType) => void;
  setPoints: (points: number) => void;
  setAvgLength: (length: number) => void;
  setInstallType: (type: InstallType) => void;
  setTrenchMode: (mode: 'full' | 'manual') => void;
  setTrenchLengthInput: (length: number) => void;
  setCanetaMode: (mode: 'full' | 'manual') => void;
  setCanetaLengthInput: (length: number) => void;
  setAdditionalMaterial: (id: string, qty: number) => void;
  setEquipmentObj: (id: string, qty: number) => void;
  toggleUpsell: (id: string) => void;
  setRack: (rackId: string) => void;
  setUrgency: (urgencyId: string) => void;
  resetFast: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      cableType: 'cat6',
      points: 4,
      avgLength: 15,
      installType: 'external',
      trenchMode: 'full',
      trenchLengthInput: 0,
      canetaMode: 'full',
      canetaLengthInput: 0,
      additionalMaterials: { trunking: 0, pvc: 0, corrugated: 0, patchPanel: 0 },
      equipment: { router: 0, switch: 0, accessPoint: 0, configuration: 0 },
      upsellOptions: { testing: true, labeling: true, cableManagement: false, extendedWarranty: false },
      rack: 'none',
      urgency: 'normal',

      setCableType: (t) => set({ cableType: t }),
      setPoints: (p) => set({ points: Math.max(1, Math.min(100, p)) }),
      setAvgLength: (l) => set({ avgLength: Math.max(1, l) }),
      setInstallType: (t) => set({ installType: t }),
      setTrenchMode: (m) => set({ trenchMode: m }),
      setTrenchLengthInput: (l) => set({ trenchLengthInput: Math.max(0, l) }),
      setCanetaMode: (m) => set({ canetaMode: m }),
      setCanetaLengthInput: (l) => set({ canetaLengthInput: Math.max(0, l) }),
      setAdditionalMaterial: (id, qty) =>
        set((state) => ({ additionalMaterials: { ...state.additionalMaterials, [id]: Math.max(0, qty) } })),
      setEquipmentObj: (id, qty) =>
        set((state) => ({ equipment: { ...state.equipment, [id]: Math.max(0, qty) } })),
      toggleUpsell: (id) =>
        set((state) => ({ upsellOptions: { ...state.upsellOptions, [id]: !state.upsellOptions[id] } })),
      setRack: (r) => set({ rack: r }),
      setUrgency: (u) => set({ urgency: u }),
      resetFast: () => set({
        cableType: 'cat6', points: 4, avgLength: 15, installType: 'external',
        rack: 'none', urgency: 'normal',
        additionalMaterials: { trunking: 0, pvc: 0, corrugated: 0, patchPanel: 0 },
        equipment: { router: 0, switch: 0, accessPoint: 0, configuration: 0 }
      })
    }),
    {
      name: 'cablecore-calc-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
