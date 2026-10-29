/**
 * Détourage de photos produit DANS LE NAVIGATEUR (modèle IA, aucun calcul serveur).
 *
 * Tout le moteur est isolé ici : pour changer de bibliothèque/modèle, il suffit de
 * modifier `runEngine`. La bibliothèque est chargée à la demande (import dynamique),
 * elle n'alourdit donc pas le site pour les visiteurs ; le modèle (quelques dizaines
 * de Mo) est téléchargé à la 1re utilisation puis mis en cache par le navigateur.
 */

const MAX_INPUT_SIDE = 1600;       // on réduit avant traitement : plus rapide, qualité suffisante
const MAX_OUTPUT_BYTES = 3.8 * 1024 * 1024; // le serveur refuse > 4 Mo
const TRIM_PAD = 12;

let enginePromise;
const loadEngine = () => (enginePromise ||= import("@imgly/background-removal"));

async function runEngine(blob, onProgress) {
    const lib = await loadEngine();
    return lib.removeBackground(blob, {
        output: { format: "image/png" },
        progress: (_key, current, total) => { if (total) onProgress?.(Math.min(1, current / total)); },
    });
}

const canvasToBlob = (canvas, type = "image/png") =>
new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), type));

async function toBitmap(blob) {
    return createImageBitmap(blob);
}

/** Réduit l'image à `max` px sur son plus grand côté (JPEG/PNG/WebP -> PNG). */
async function downscale(file, max = MAX_INPUT_SIDE) {
    const bmp = await toBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    return canvasToBlob(c);
}

/** Recadre sur le contenu visible (+ marge) et garantit une taille de fichier acceptable. */
async function trimAndFit(blob) {
    const bmp = await toBitmap(blob);
    const c = document.createElement("canvas");
    c.width = bmp.width; c.height = bmp.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
    let x0 = width, y0 = height, x1 = -1, y1 = -1, opaque = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 12) {
                opaque++;
                if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
        }
    }
    // Résultat vide ou quasi vide (le modèle a tout effacé) : on le signale.
    if (x1 < 0 || opaque / (width * height) < 0.02) throw new Error("empty-cutout");
    x0 = Math.max(0, x0 - TRIM_PAD); y0 = Math.max(0, y0 - TRIM_PAD);
    x1 = Math.min(width - 1, x1 + TRIM_PAD); y1 = Math.min(height - 1, y1 + TRIM_PAD);
    let out = document.createElement("canvas");
    out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
    out.getContext("2d").drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    let result = await canvasToBlob(out);
    // Trop lourd pour le serveur : on réduit progressivement.
    for (let i = 0; i < 5 && result.size > MAX_OUTPUT_BYTES; i++) {
        const smaller = document.createElement("canvas");
        smaller.width = Math.round(out.width * 0.8); smaller.height = Math.round(out.height * 0.8);
        smaller.getContext("2d").drawImage(out, 0, 0, smaller.width, smaller.height);
        out = smaller;
        result = await canvasToBlob(out);
    }
    return result;
}

/**
 * Détoure `file`. Renvoie un `File` PNG transparent.
 * Lève une erreur si le détourage échoue (l'appelant garde alors la photo d'origine).
 */
export async function cutoutInBrowser(file, onProgress) {
    const input = await downscale(file);
    const cut = await runEngine(input, onProgress);
    const trimmed = await trimAndFit(cut);
    const base = (file.name || "photo").replace(/\.[^.]+$/, "");
    return new File([trimmed], `${base}.png`, { type: "image/png" });
}
