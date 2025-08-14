#!/bin/bash
# Ultra-fast completion sound hook using native shell

# Configuration
ENABLED=1
SOUND="/System/Library/Sounds/Glass.aiff"

# Exit immediately if disabled
[ $ENABLED -eq 0 ] && exit 0

# Play sound in background (non-blocking)
afplay "$SOUND" 2>/dev/null &

# Exit immediately without waiting
exit 0