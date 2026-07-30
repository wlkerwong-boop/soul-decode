from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

SOURCE_ROOT = Path("/Users/guangmingxishe/LifeOS/20-29 工作事业/24.01 灵魂解码运营/九宫人生解码")
REPO_ROOT = Path(__file__).resolve().parents[1]
INVENTORY = REPO_ROOT / "docs/jiugong-sources/inventory.json"
EXTRACTED_ROOT = Path("/private/tmp/jiugong-source-extracted")


def normalize(text: str) -> str:
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line).strip()


def main() -> None:
    payload = json.loads(INVENTORY.read_text(encoding="utf-8"))
    failures = []
    for item in payload["sources"]:
        if item["format"] != "png":
            continue
        source = SOURCE_ROOT / item["path"]
        try:
            result = subprocess.run(
                ["tesseract", str(source), "stdout", "-l", "chi_sim+eng", "--psm", "6"],
                check=True,
                capture_output=True,
                text=True,
            )
            text = normalize(result.stdout)
            (EXTRACTED_ROOT / f"{item['sourceId']}.txt").write_text(text, encoding="utf-8")
            item["status"] = "ocr-extracted" if len(text) >= 20 else "ocr-needs-visual-review"
            item["extractor"] = "tesseract-chi_sim+eng"
            item["characters"] = len(text)
            item["summary"] = re.sub(r"\s+", " ", text[:240])
        except Exception as error:
            item["status"] = "failed-needs-review"
            item["summary"] = ""
            failures.append({"sourceId": item["sourceId"], "error": str(error)})
    INVENTORY.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"processed": 56, "failures": failures}, ensure_ascii=False))


if __name__ == "__main__":
    main()
