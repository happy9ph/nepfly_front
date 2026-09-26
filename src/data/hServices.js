// Icônes + libellés de secours pour le catalogue des services H-Company
// (H-Transport, H-Restaurant, H-Learning, H-Money, H-Translate, H-Shopping...).
// Le contenu réel (label/description/disponibilité) vient de
// GET /api/v1/services/catalog — ce fichier ne fournit que la présentation
// (icône, couleur) associée à chaque `service_key`, indexée sur la même clé
// que le backend (voir backend/app/routers/services.py::SERVICE_CATALOG).
import { Bus, Package, BedDouble, UtensilsCrossed, GraduationCap, Banknote, Languages, ShoppingBag } from "lucide-react";

export const SERVICE_PRESENTATION = {
  h_transport_bus: { Icon: Bus, fallbackLabel: "H-Transport (Bus)" },
  h_transport_colis: { Icon: Package, fallbackLabel: "H-Transport (Colis)" },
  h_logement: { Icon: BedDouble, fallbackLabel: "H-Logement" },
  h_restaurant: { Icon: UtensilsCrossed, fallbackLabel: "H-Restaurant" },
  h_learning: { Icon: GraduationCap, fallbackLabel: "H-Learning" },
  h_money: { Icon: Banknote, fallbackLabel: "H-Money" },
  h_translate: { Icon: Languages, fallbackLabel: "H-Translate" },
  h_shopping: { Icon: ShoppingBag, fallbackLabel: "H-Shopping" },
};

export function presentationFor(key) {
  return SERVICE_PRESENTATION[key] || { Icon: Package, fallbackLabel: key };
}
