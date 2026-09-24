import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class StaticAppTests(unittest.TestCase):
    def test_required_assets_exist(self):
        for name in ["index.html", "styles.css", "app.js", "sw.js", "manifest.webmanifest", "icons/icon.svg"]:
            self.assertTrue((ROOT / name).is_file(), name)

    def test_manifest_is_valid_and_installable(self):
        manifest = json.loads((ROOT / "manifest.webmanifest").read_text())
        self.assertEqual(manifest["display"], "standalone")
        self.assertEqual(manifest["start_url"], "./")
        self.assertTrue(manifest["icons"])

    def test_service_worker_precaches_core_assets(self):
        source = (ROOT / "sw.js").read_text()
        for asset in ["index.html", "styles.css", "app.js", "manifest.webmanifest", "icons/icon.svg"]:
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

    def test_access_and_history_flows_present(self):
        source = (ROOT / "app.js").read_text()
        for marker in ["pinHash", "SHA-256", "saveOrder", "repeatOrder", "localStorage"]:
            self.assertIn(marker, source)

    def test_operational_catalog_is_seeded(self):
        source = (ROOT / "app.js").read_text()
        for supplier in ["Pachu", "Coca-Cola", "Disceas", "PepsiCo", "Oquendo", "La Bodeguita"]:
            self.assertIn(supplier, source)
        self.assertIn("Fuze Tea maracuyá", source)
        self.assertIn("Añadir teléfono para enviar", source)


if __name__ == "__main__":
    unittest.main()
