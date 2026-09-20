"""Download the 18 named catalog photos from Drive by file id."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

DEST = Path("public/products")

FILES = {
    "colla-inle": "1vmVjSIN6_SzGRbzMGRNhYJ_V_3QnmdOO",
    "collar-babalu-aye": "1AYoDPAUlNqLXrJZkPr4iFlrHugNc49eN",
    "collar-eggun": "1OUQNTJmtNRmrunDcSpPSaKoctsTKI2Kw",
    "collar-elegua": "1Sa6kWxCx4AJTCkt342gCrt6Y7-jMQREN",
    "collar-mazo-elegua": "1Trmw_zSwX12WHIyhWzcPX-lc0OEf9BXj",
    "collar-mazo-obatala": "1aKUxcc_D4pp0MVKu1789C_nmtxng4urL",
    "collar-mazo-oggun": "11vtZvt9JGGX35w0WFaCyTujcKIB0u36R",
    "collar-mazo-olokun": "1LY9Q03PKyUBHz0nAHSin01MDJAU8H0qO",
    "collar-mazo-orula": "1952dyYRzJpCUA5jccX5KxFaS-VwpAdSB",
    "collar-mazo-oshun": "1L5YVQA3f8uMQCgvegWbBgvi0h0Wq5qos",
    "collar-mazo-oya": "1UCdE_9wNTFybWcVi14cvD6OvgN7vweV1",
    "collar-mazo-shango": "1WDL-C98W_yAGqvHJMNU44UYV2ims5ZOX",
    "collar-mazo-yemaya": "1EA3PZ95kIibJ4mZGA3wzUDI0swlDp08e",
    "collar-obatala": "1XM6Bh9Wq1cEAxCrjzXw9Xmqn20muEAoH",
    "collar-oggun": "16w47fvUTtfdf3wIuTfkWKmXZlM0GQSdB",
    "collar-olokun": "1BMCmYGDrizpX4sjQRQ1ihIC6Pa6VxQvy",
    "collar-orula": "1X9b2yAfAdi1KuMxOxngD9KvuCknlh4Q9",
    "collar-oshun": "1hyOUCVbjGsbNYARMr4okVAdI41iBlpEU",
}


def main() -> int:
    DEST.mkdir(parents=True, exist_ok=True)
    for slug, file_id in FILES.items():
        target = DEST / f"{slug}.jpg"
        if target.exists() and target.stat().st_size > 1000:
            print("skip", slug)
            continue
        cmd = [
            sys.executable,
            "-m",
            "gdown",
            file_id,
            "-O",
            str(target),
            "--no-check-certificate",
        ]
        print(" ".join(cmd))
        result = subprocess.run(cmd, check=False)
        if result.returncode != 0 or not target.exists():
            print("failed", slug)
            return result.returncode or 1
    print("ok", len(FILES))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
