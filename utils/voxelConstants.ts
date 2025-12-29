
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ThemeType } from '../types';

export const COLORS = {
  DARK: 0x4A3728,
  LIGHT: 0x654321,
  WHITE: 0xF0F0F0,
  GOLD: 0xFFD700,
  BLACK: 0x111111,
  WOOD: 0x3B2F2F,
  GREEN: 0x228B22,
  TALON: 0xE5C100,
  NEON_CYAN: 0x00ffff,
};

export interface ThemeConfig {
  bg: number;
  floor: number;
  pedestal: number;
  pedestalAccent: number;
  fogNear: number;
  fogFar: number;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  classic: {
    bg: 0xf0f2f5,
    floor: 0xe2e8f0,
    pedestal: 0xffffff,
    pedestalAccent: 0xFFD700,
    fogNear: 60,
    fogFar: 140
  },
  neon: {
    bg: 0x0a0a0f,
    floor: 0x1a1a2e,
    pedestal: 0x111111,
    pedestalAccent: 0x00ffff,
    fogNear: 20,
    fogFar: 100
  },
  pastel: {
    bg: 0xfff5f5,
    floor: 0xffe3e3,
    pedestal: 0xffffff,
    pedestalAccent: 0xffb3ba,
    fogNear: 40,
    fogFar: 120
  },
  midnight: {
    bg: 0x0f172a,
    floor: 0x1e293b,
    pedestal: 0x020617,
    pedestalAccent: 0x6366f1,
    fogNear: 30,
    fogFar: 110
  }
};

export const CONFIG = {
  VOXEL_SIZE: 1,
  FLOOR_Y: -12,
};
