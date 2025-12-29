
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';

// Helper to prevent overlapping voxels
function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    const xMin = Math.floor(cx - r);
    const xMax = Math.ceil(cx + r);
    const yMin = Math.floor(cy - r * sy);
    const yMax = Math.ceil(cy + r * sy);
    const zMin = Math.floor(cz - r);
    const zMax = Math.ceil(cz + r);

    for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
            for (let z = zMin; z <= zMax; z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) {
                    setBlock(map, x, y, z, col);
                }
            }
        }
    }
}

function generateBox(map: Map<string, VoxelData>, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: number) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
                setBlock(map, x, y, z, color);
            }
        }
    }
}

export const Generators = {
    Eagle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        // Branch
        for (let x = -8; x < 8; x++) {
            const y = Math.sin(x * 0.2) * 1.5;
            const z = Math.cos(x * 0.1) * 1.5;
            generateSphere(map, x, y, z, 1.8, COLORS.WOOD);
            if (Math.random() > 0.7) generateSphere(map, x, y + 2, z + (Math.random() - 0.5) * 3, 1.5, COLORS.GREEN);
        }
        // Body
        const EX = 0, EY = 2, EZ = 2;
        generateSphere(map, EX, EY + 6, EZ, 4.5, COLORS.DARK, 1.4);
        // Chest
        for (let x = EX - 2; x <= EX + 2; x++) for (let y = EY + 4; y <= EY + 9; y++) setBlock(map, x, y, EZ + 3, COLORS.LIGHT);
        // Wings (Rough approximation)
        for (let x of [-4, -3, 3, 4]) for (let y = EY + 4; y <= EY + 10; y++) for (let z = EZ - 2; z <= EZ + 3; z++) setBlock(map, x, y, z, COLORS.DARK);
        // Tail
        for (let x = EX - 2; x <= EX + 2; x++) for (let y = EY, yEnd = EY + 4; y <= yEnd; y++) for (let z = EZ - 5; z <= EZ - 3; z++) setBlock(map, x, y, z, COLORS.WHITE);
        // Head
        const HY = EY + 12, HZ = EZ + 1;
        generateSphere(map, EX, HY, HZ, 2.8, COLORS.WHITE);
        generateSphere(map, EX, HY - 2, HZ, 2.5, COLORS.WHITE);
        // Talons
        [[-2, 0], [-2, 1], [2, 0], [2, 1]].forEach(o => setBlock(map, EX + o[0], EY + o[1], EZ, COLORS.TALON));
        // Beak
        [[0, 1], [0, 2], [1, 1], [-1, 1]].forEach(o => setBlock(map, EX + o[0], HY, HZ + 2 + o[1], COLORS.GOLD));
        setBlock(map, EX, HY - 1, HZ + 3, COLORS.GOLD);
        // Eyes
        [[-1.5, COLORS.BLACK], [1.5, COLORS.BLACK]].forEach(o => setBlock(map, EX + o[0], HY + 0.5, HZ + 1.5, o[1]));
        [[-1.5, COLORS.WHITE], [1.5, COLORS.WHITE]].forEach(o => setBlock(map, EX + o[0], HY + 1.5, HZ + 1.5, o[1]));

        return Array.from(map.values());
    },

    Cat: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Paws
        generateSphere(map, CX - 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
        generateSphere(map, CX + 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
        // Body
        for (let y = 0; y < 7; y++) {
            const r = 3.5 - (y * 0.2);
            generateSphere(map, CX, CY + 2 + y, CZ, r, COLORS.DARK);
            generateSphere(map, CX, CY + 2 + y, CZ + 2, r * 0.6, COLORS.WHITE);
        }
        // Legs
        for (let y = 0; y < 5; y++) {
            setBlock(map, CX - 1.5, CY + y, CZ + 3, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 3, COLORS.WHITE);
            setBlock(map, CX - 1.5, CY + y, CZ + 2, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 2, COLORS.WHITE);
        }
        // Head
        const CHY = CY + 9;
        generateSphere(map, CX, CHY, CZ, 3.2, COLORS.LIGHT, 0.8);
        // Ears
        [[-2, 1], [2, 1]].forEach(side => {
            setBlock(map, CX + side[0], CHY + 3, CZ, COLORS.DARK); setBlock(map, CX + side[0] * 0.8, CHY + 3, CZ + 1, COLORS.WHITE);
            setBlock(map, CX + side[0], CHY + 4, CZ, COLORS.DARK);
        });
        // Tail
        for (let i = 0; i < 12; i++) {
            const a = i * 0.3, tx = Math.cos(a) * 4.5, tz = Math.sin(a) * 4.5;
            if (tz > -2) { setBlock(map, CX + tx, CY, CZ + tz, COLORS.DARK); setBlock(map, CX + tx, CY + 1, CZ + tz, COLORS.DARK); }
        }
        // Face
        setBlock(map, CX - 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD); setBlock(map, CX + 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD);
        setBlock(map, CX - 1, CHY + 0.5, CZ + 3, COLORS.BLACK); setBlock(map, CX + 1, CHY + 0.5, CZ + 3, COLORS.BLACK);
        setBlock(map, CX, CHY, CZ + 3, COLORS.TALON);
        return Array.from(map.values());
    },

    Rabbit: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const LOG_Y = CONFIG.FLOOR_Y + 2.5;
        const RX = 0, RZ = 0;
        // Log
        for (let x = -6; x <= 6; x++) {
            const radius = 2.8 + Math.sin(x * 0.5) * 0.2;
            generateSphere(map, x, LOG_Y, 0, radius, COLORS.DARK);
            if (x === -6 || x === 6) generateSphere(map, x, LOG_Y, 0, radius - 0.5, COLORS.WOOD);
            if (Math.random() > 0.8) setBlock(map, x, LOG_Y + radius, (Math.random() - 0.5) * 2, COLORS.GREEN);
        }
        // Body
        const BY = LOG_Y + 2.5;
        generateSphere(map, RX - 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
        generateSphere(map, RX + 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
        generateSphere(map, RX, BY + 2, RZ, 2.2, COLORS.WHITE, 0.8);
        generateSphere(map, RX, BY + 2.5, RZ + 1.5, 1.5, COLORS.WHITE);
        setBlock(map, RX - 1.2, BY, RZ + 2.2, COLORS.LIGHT); setBlock(map, RX + 1.2, BY, RZ + 2.2, COLORS.LIGHT);
        setBlock(map, RX - 2.2, BY, RZ - 0.5, COLORS.WHITE); setBlock(map, RX + 2.2, BY, RZ - 0.5, COLORS.WHITE);
        generateSphere(map, RX, BY + 1.5, RZ - 2.5, 1.0, COLORS.WHITE);
        // Head
        const HY = BY + 4.5; const HZ = RZ + 1;
        generateSphere(map, RX, HY, HZ, 1.7, COLORS.WHITE);
        generateSphere(map, RX - 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
        generateSphere(map, RX + 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
        // Ears
        for (let y = 0; y < 5; y++) {
            const curve = y * 0.2;
            setBlock(map, RX - 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX - 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
            setBlock(map, RX - 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
            setBlock(map, RX + 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX + 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
            setBlock(map, RX + 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
        }
        setBlock(map, RX - 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK); setBlock(map, RX + 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK);
        setBlock(map, RX, HY - 0.5, HZ + 1.8, COLORS.TALON);
        return Array.from(map.values());
    },

    Twins: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        function buildMiniEagle(offsetX: number, offsetZ: number, mirror: boolean) {
            // Branch
            for (let x = -5; x < 5; x++) {
                const y = Math.sin(x * 0.4) * 0.5;
                generateSphere(map, offsetX + x, y, offsetZ, 1.2, COLORS.WOOD);
                if (Math.random() > 0.8) generateSphere(map, offsetX + x, y + 1, offsetZ, 1, COLORS.GREEN);
            }
            const EX = offsetX, EY = 1.5, EZ = offsetZ;
            generateSphere(map, EX, EY + 4, EZ, 3.0, COLORS.DARK, 1.4);
            for (let x = EX - 1; x <= EX + 1; x++) for (let y = EY + 2; y <= EY + 6; y++) setBlock(map, x, y, EZ + 2, COLORS.LIGHT);
            for (let x = EX - 1; x <= EX + 1; x++) for (let y = EY + 2; y <= EY + 3; y++) setBlock(map, x, y, EZ - 3, COLORS.WHITE);
            for (let y = EY + 2; y <= EY + 6; y++) for (let z = EZ - 1; z <= EZ + 2; z++) { setBlock(map, EX - 3, y, z, COLORS.DARK); setBlock(map, EX + 3, y, z, COLORS.DARK); }
            const HY = EY + 8, HZ = EZ + 1;
            generateSphere(map, EX, HY, HZ, 2.0, COLORS.WHITE);
            setBlock(map, EX, HY, HZ + 2, COLORS.GOLD); setBlock(map, EX, HY - 0.5, HZ + 2, COLORS.GOLD);
            setBlock(map, EX - 1, HY + 0.5, HZ + 1, COLORS.BLACK); setBlock(map, EX + 1, HY + 0.5, HZ + 1, COLORS.BLACK);
            setBlock(map, EX - 1, EY, EZ, COLORS.TALON); setBlock(map, EX + 1, EY, EZ, COLORS.TALON);
        }
        buildMiniEagle(-10, 2, false);
        buildMiniEagle(10, -2, true);
        return Array.from(map.values());
    },

    Castle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const colorWall = 0x808080;
        const colorRoof = 0x4B0082;
        const colorAccent = 0x696969;
        
        // Base
        generateBox(map, -10, 0, -10, 10, 1, 10, colorAccent);
        
        // Main Block
        generateBox(map, -8, 1, -8, 8, 8, 8, colorWall);
        
        // Towers
        const towerSize = 3;
        const towerHeight = 14;
        const towerPos = [[-8,-8], [8,-8], [-8,8], [8,8]];
        towerPos.forEach(([tx, tz]) => {
            generateBox(map, tx - towerSize, 0, tz - towerSize, tx + towerSize, towerHeight, tz + towerSize, colorWall);
            // Conical Roofs
            for (let h = 0; h < 6; h++) {
                const r = towerSize + 1 - h;
                if (r > 0) generateSphere(map, tx, towerHeight + h, tz, r, colorRoof, 0.5);
            }
        });
        
        // Gate
        generateBox(map, -3, 1, 8, 3, 6, 9, 0x483C32);
        
        // Battlements
        for (let x = -8; x <= 8; x+=2) {
            setBlock(map, x, 9, 8, colorAccent);
            setBlock(map, x, 9, -8, colorAccent);
        }
        for (let z = -8; z <= 8; z+=2) {
            setBlock(map, 8, 9, z, colorAccent);
            setBlock(map, -8, 9, z, colorAccent);
        }

        return Array.from(map.values());
    },

    Robot: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const colorMetal = 0x95a5a6;
        const colorJoint = 0x34495e;
        const colorLight = 0x00ffff;

        // Torso
        generateBox(map, -4, 6, -2, 4, 14, 2, colorMetal);
        generateBox(map, -3, 8, 2, 3, 12, 3, colorJoint);
        
        // Head
        generateBox(map, -3, 15, -3, 3, 20, 3, colorMetal);
        // Eyes
        setBlock(map, -1.5, 18, 3, colorLight);
        setBlock(map, 1.5, 18, 3, colorLight);
        // Antenna
        generateBox(map, 0, 21, 0, 0, 24, 0, colorJoint);
        setBlock(map, 0, 24, 0, 0xe74c3c);

        // Legs
        const legColor = colorMetal;
        [[-2.5], [2.5]].forEach(([lx]) => {
            generateBox(map, lx - 1.5, 0, -1.5, lx + 1.5, 6, 1.5, legColor);
            setBlock(map, lx, 6, 0, colorJoint);
        });

        // Arms
        [[-5], [5]].forEach(([ax]) => {
            const side = ax < 0 ? -1 : 1;
            generateBox(map, ax - (side*1), 8, -1, ax + (side*1), 14, 1, colorMetal);
            setBlock(map, ax - (side*2), 11, 0, colorJoint);
        });

        return Array.from(map.values());
    },

    Spaceship: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const colorHull = 0xecf0f1;
        const colorGlass = 0x3498db;
        const colorEngine = 0xe67e22;

        // Fuselage
        for (let z = -10; z < 15; z++) {
            const r = 4 - Math.abs(z - 5) * 0.2;
            generateSphere(map, 0, 0, z, Math.max(1, r), colorHull, 0.6);
        }

        // Cockpit
        generateSphere(map, 0, 2, 8, 2, colorGlass, 0.5);

        // Wings
        for (let z = -5; z < 5; z++) {
            const w = 15 - Math.abs(z) * 1.5;
            generateBox(map, -w, -0.5, z, w, 0.5, z + 1, colorHull);
        }

        // Tail Fin
        generateBox(map, -0.5, 1, -8, 0.5, 6, -4, colorHull);

        // Engines
        [[-3], [3]].forEach(([ex]) => {
            generateBox(map, ex - 1.5, -1, -12, ex + 1.5, 1, -10, colorHull);
            generateSphere(map, ex, 0, -12.5, 1, colorEngine);
        });

        return Array.from(map.values());
    },

    Flower: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const colorStem = 0x27ae60;
        const colorPetal = 0xe91e63;
        const colorCenter = 0xf1c40f;

        // Stem
        generateBox(map, -0.5, 0, -0.5, 0.5, 15, 0.5, colorStem);
        
        // Leaves
        generateSphere(map, 3, 6, 0, 2, colorStem, 0.2);
        generateSphere(map, -3, 10, 0, 2, colorStem, 0.2);

        // Center
        generateSphere(map, 0, 17, 0, 3, colorCenter);

        // Petals
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const px = Math.cos(a) * 6;
            const py = 17 + Math.sin(a * 2) * 2;
            const pz = Math.sin(a) * 6;
            generateSphere(map, px, py, pz, 3.5, colorPetal, 0.3);
        }

        return Array.from(map.values());
    }
};
