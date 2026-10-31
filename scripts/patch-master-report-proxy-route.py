"""Use the current SoulCode app for its non-streaming report fallback.

Only SoulCode hostnames change; other sites keep their report-api routing.
Run on the proxy host, then reload PM2 after the syntax check succeeds.
"""

from datetime import datetime, timezone
from pathlib import Path
import subprocess
import sys


OLD = 'if (req.url && (req.url.startsWith("/api/master-report") || (!["aisoulcode.cn", "www.aisoulcode.cn"].includes(host) && req.url.startsWith("/api/hd-")))) {'
NEW = 'if (req.url && !["aisoulcode.cn", "www.aisoulcode.cn"].includes(host) && (req.url.startsWith("/api/master-report") || req.url.startsWith("/api/hd-"))) {'


def main() -> None:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "/root/proxy-v4.js")
    source = path.read_text()
    if source.count(OLD) != 1 or source.count(NEW):
        raise SystemExit("Unexpected proxy rule; no changes made")
    backup = path.with_name(path.name + ".bak-" + datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S") + "-report-route")
    backup.write_bytes(path.read_bytes())
    path.write_text(source.replace(OLD, NEW, 1))
    try:
        subprocess.run(["node", "--check", str(path)], check=True)
    except Exception:
        path.write_bytes(backup.read_bytes())
        raise
    print(f"patched={path} backup={backup}")


if __name__ == "__main__":
    main()
