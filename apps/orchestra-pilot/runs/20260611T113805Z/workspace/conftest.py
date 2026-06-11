"""Make the src-layout package importable in tests without an install."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
