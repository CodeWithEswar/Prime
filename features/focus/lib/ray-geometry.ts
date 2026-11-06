/**
 * PRIME Focus Mode — 360° Magnetic Blaze Ray Geometry
 * Polar coordinate transforms, elliptical exclusion math, and inward progression curves.
 */

/**
 * Computes Cartesian coordinates from polar coordinates
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  angle: number,
  radius: number
): { x: number; y: number } {
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

/**
 * Calculates the elliptical exclusion boundary radius at a given angle theta.
 * Aligns tightly with the horizontal aspect ratio of the centered countdown timer
 * so text digits remain 100% unoccluded and legible.
 */
export function getEllipticalBoundaryRadius(
  radiusX: number,
  radiusY: number,
  angle: number
): number {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const denom = Math.sqrt((radiusY * cos) ** 2 + (radiusX * sin) ** 2);
  if (denom === 0) return radiusX;
  return (radiusX * radiusY) / denom;
}

/**
 * Computes normalized inward travel progress:
 * 0.0 at outer boundary (entering viewport)
 * 1.0 at central exclusion boundary (fading before countdown digits)
 */
export function computeInwardProgress(
  currentRadius: number,
  innerBoundary: number,
  maxRadius: number
): number {
  if (maxRadius <= innerBoundary) return 1;
  const ratio = 1 - (currentRadius - innerBoundary) / (maxRadius - innerBoundary);
  return Math.max(0, Math.min(1, ratio));
}

/**
 * Calculates gravitational inward acceleration:
 * As rays plunge inward toward the center, velocity increases non-linearly.
 */
export function computeInwardAcceleration(progress: number): number {
  return 1 + 1.8 * Math.pow(progress, 1.7);
}

/**
 * Calculates alpha opacity envelope across radial depth:
 * - Smooth fade-in at outer perimeter (progress 0 -> 0.12)
 * - Maximum luminous intensity through mid-field (progress 0.12 -> 0.72)
 * - Rapid, clean fade-out before entering inner exclusion radius (progress 0.72 -> 1.0)
 */
export function computeRayAlpha(baseOpacity: number, progress: number): number {
  if (progress < 0.12) {
    return baseOpacity * (progress / 0.12);
  }
  if (progress > 0.72) {
    const fadeOutProgress = (progress - 0.72) / 0.28;
    return baseOpacity * Math.max(0, 1 - Math.pow(fadeOutProgress, 1.4));
  }
  return baseOpacity;
}

