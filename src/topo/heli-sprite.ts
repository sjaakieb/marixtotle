// Retro pixel-helikopter van bovenaf (16x16 grid, neus naar +x/oost).
// 1-op-1 overgenomen uit Topokopter.
// K=omlijning, Y=romp geel, B=blauw, C=cockpit, .=transparant
export const HELI_SPRITE: readonly string[] = [
	"................",
	"................",
	"................",
	"................",
	"................",
	"KK......KKKK....",
	"KBK...KKYYYYK...",
	"KBKKKKKYYYYYCCK.",
	"KBKKKKKYYYYYCCK.",
	"KBK...KKYYYYK...",
	"KK......KKKK....",
	"................",
	"................",
	"................",
	"................",
	"................",
];

const HELI_KLEUREN: Record<string, string> = {
	K: "#0a0a12",
	Y: "#ffd23f",
	B: "#3f6fe0",
	C: "#cff6ff",
};

/** Aantal frames per rotoromwenteling (4-bladig, vloeiend). */
export const ROTOR_FRAMES_PER_OMWENTELING = 24;

export function rotorHoek(frame: number): number {
	return (
		((frame % ROTOR_FRAMES_PER_OMWENTELING) / ROTOR_FRAMES_PER_OMWENTELING) *
		Math.PI *
		2
	);
}

/** Kwantiseert een bewegingsvector naar 8 windrichtingen (45°-stappen, radialen). */
export function kwantiseerKoers(vx: number, vy: number): number {
	return Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) * (Math.PI / 4);
}

export function tekenHeliPixel(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	koers: number,
	frame: number,
): void {
	const u = size / 16;
	const kaart = (dx: number, dy: number, schaduw: boolean): void => {
		c.save();
		c.translate(x + dx, y + dy);
		c.rotate(koers);
		for (let r = 0; r < 16; r++) {
			const rij = HELI_SPRITE[r];
			for (let q = 0; q < 16; q++) {
				const t = rij[q];
				if (t === ".") continue;
				c.fillStyle = schaduw ? "rgba(0,0,0,.35)" : (HELI_KLEUREN[t] ?? "#fff");
				c.fillRect((q - 10) * u, (r - 8) * u, u + 0.5, u + 0.5);
			}
		}
		if (!schaduw) {
			c.save();
			c.rotate(rotorHoek(frame));
			c.fillStyle = "rgba(255,255,255,.08)";
			c.beginPath();
			c.arc(0, 0, 10 * u, 0, Math.PI * 2);
			c.fill();
			c.fillStyle = "#151522";
			c.fillRect(-10 * u, -0.5 * u, 20 * u, u);
			c.fillRect(-0.5 * u, -10 * u, u, 20 * u);
			c.fillStyle = "#ffd23f";
			c.fillRect(-10 * u, -0.5 * u, 2 * u, u);
			c.fillRect(8 * u, -0.5 * u, 2 * u, u);
			c.fillRect(-0.5 * u, -10 * u, u, 2 * u);
			c.fillRect(-0.5 * u, 8 * u, u, 2 * u);
			c.fillStyle = "#0a0a12";
			c.fillRect(-1 * u, -1 * u, 2 * u, 2 * u);
			c.fillStyle = "#ffd23f";
			c.fillRect(-0.5 * u, -0.5 * u, u, u);
			c.restore();
		}
		c.restore();
	};
	kaart(u * 1.5, u * 2, true); // slagschaduw
	kaart(0, 0, false); // heli zelf
}

/** Vaste schermgrootte van de heli (groeit niet mee met inzoomen). */
export const HELI_SCHERMGROOTTE = 36;
