"""Route SoulCode's Human Design APIs to its Next.js app in proxy-v4.js.

The shared proxy serves other domains, so the exact-match guard leaves their
existing /api/hd-* behavior untouched. Run on the server before reloading PM2.
"""

from datetime import datetime, timezone
from pathlib import Path
import subprocess
import sys


OLD = 'if (req.url && (req.url.startsWith("/api/master-report") || req.url.startsWith("/api/hd-"))) {'
NEW = ('if (req.url && (req.url.startsWith("/api/master-report") || '
       '(!["aisoulcode.cn", "www.aisoulcode.cn"].includes(host) && req.url.startsWith("/api/hd-")))) {')


def main() -> None:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "/root/proxy-v4.js")
    source = path.read_text()
    if source.count(OLD) != 1:
        raise SystemExit("Expected exactly one original HD routing rule; no changes made")
    if source.count(NEW):
        raise SystemExit("New HD routing rule already present; no changes made")

    backup = path.with_name(path.name + ".bak-" + datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S") + "-hd-route")
    backup.write_bytes(path.read_bytes())
    replacement = source.replace(OLD, NEW, 1)
    path.write_text(replacement)
    try:
        subprocess.run(["node", "--check", str(path)], check=True)
    except Exception:
        path.write_bytes(backup.read_bytes())
        raise
    print(f"patched={path} backup={backup}")


if __name__ == "__main__":
    main()
