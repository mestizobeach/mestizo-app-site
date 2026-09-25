import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class StaticAppTests(unittest.TestCase):
    def test_required_assets_exist(self):
        for name in ["index.html", "styles.css", "concerts.css", "orders.css", "app.js", "sw.js", "manifest.webmanifest", "icons/icon.svg"]:
            self.assertTrue((ROOT / name).is_file(), name)

    def test_manifest_is_valid_and_installable(self):
        manifest = json.loads((ROOT / "manifest.webmanifest").read_text())
        self.assertEqual(manifest["display"], "standalone")
        self.assertEqual(manifest["start_url"], "./")
        self.assertTrue(manifest["icons"])

    def test_service_worker_precaches_core_assets(self):
        source = (ROOT / "sw.js").read_text()
        for asset in ["index.html", "styles.css", "concerts.css", "orders.css", "app.js", "manifest.webmanifest", "icons/icon.svg"]:
            self.assertIn(asset, source)
        self.assertIn("client.navigate(client.url)", source)
        self.assertIn("e.request.mode==='navigate'", source)

    def test_whatsapp_is_user_confirmed_deep_link(self):
        source = (ROOT / "app.js").read_text()
        self.assertIn("https://wa.me/", source)
        self.assertIn("encodeURIComponent", source)
        self.assertNotIn("api.whatsapp.com/send", source)

    def test_zero_quantity_is_filtered(self):
        source = (ROOT / "app.js").read_text()
        self.assertGreaterEqual(len(re.findall(r"quantities\[p\.id\]\s*>\s*0", source)), 2)

    def test_review_button_is_fixed_above_navigation(self):
        styles = (ROOT / "styles.css").read_text()
        cta = re.search(r"\.cta-bar\{([^}]+)\}", styles).group(1)
        self.assertIn("position:fixed", cta)
        self.assertIn("bottom:calc(82px + env(safe-area-inset-bottom))", cta)

    def test_access_and_history_flows_present(self):
        source = (ROOT / "app.js").read_text()
        for marker in ["pinHash", "SHA-256", "recordSentOrder", "repeatOrder", "localStorage"]:
            self.assertIn(marker, source)

    def test_whatsapp_records_order_before_opening(self):
        source = (ROOT / "app.js").read_text()
        send = re.search(r"function sendWhatsApp\(id\)\{(.+?)\}\nrender", source, re.S).group(1)
        self.assertLess(send.index("recordSentOrder(s)"), send.index("window.open"))
        self.assertLess(send.index("delete state.quantities[p.id]"), send.index("window.open"))
        self.assertLess(send.index("render()"), send.index("window.open"))
        self.assertNotIn('data-action="save-order"', source)
        self.assertIn("isRecentDuplicate", source)

    def test_operational_catalog_is_seeded(self):
        source = (ROOT / "app.js").read_text()
        for supplier in ["Pachu", "Coca-Cola", "Disceas", "PepsiCo", "Oquendo", "La Bodeguita"]:
            self.assertIn(supplier, source)
        self.assertIn("Fuze Tea maracuyá", source)
        self.assertIn("Añadir teléfono para enviar", source)

    def test_concert_calendar_crud_and_season_range(self):
        source = (ROOT / "app.js").read_text()
        for marker in ["concertsView", "concertSubmit", "deleteConcert", "2027-03-21", "2027-09-30"]:
            self.assertIn(marker, source)

    def test_ordered_box_totals_are_available(self):
        source = (ROOT / "app.js").read_text()
        for marker in ["orderedTotals", "totalsView", "Cajas pedidas", "Acumulado de todos los pedidos enviados"]:
            self.assertIn(marker, source)


if __name__ == "__main__":
    unittest.main()
