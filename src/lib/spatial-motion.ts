/** Shared mechanical timing; decorative movement never changes navigation state. */
export const premiumSpringPreset = { type: "spring" as const, mass: 1.2, stiffness: 320, damping: 24 };
export const profileSpringPreset = { type: "spring" as const, mass: 1.2, stiffness: 400, damping: 25 };