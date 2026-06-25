#!/usr/bin/env python3
"""Test script for KimiCode to run"""
import urllib.request
import sys

base = "https://soul-decode.vercel.app"
pages = ["/", "/auth/login", "/auth/register", "/payment", "/compatibility", 
         "/mbti", "/astrology", "/dharma", "/health", "/tcm", "/my", "/tools"]

results = []
for p in pages:
    url = base + p
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read()
            status = resp.status
            size = len(content)
            icon = "PASS" if status == 200 and size > 100 else "WARN"
            results.append(f"[{icon}] {p:25s} {status} {size:>8,} bytes")
    except Exception as e:
        results.append(f"[FAIL] {p:25s} {str(e)[:50]}")

for r in results:
    print(r)

passed = sum(1 for r in results if r.startswith("[PASS]"))
total = len(results)
print(f"\nResults: {passed}/{total} passed")
