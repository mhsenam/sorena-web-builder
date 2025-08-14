#!/usr/bin/env python3
"""
Notification sound hook with proper JSON parsing
Follows Claude Code best practices for hook implementation
"""

import json
import sys
import subprocess
import os

# Sound configuration
SOUNDS = {
    "permission": "/System/Library/Sounds/Pop.aiff",
    "waiting": "/System/Library/Sounds/Purr.aiff", 
    "default": "/System/Library/Sounds/Tink.aiff"
}

def play_sound_async(sound_path: str) -> None:
    """Play sound asynchronously without blocking"""
    try:
        # Play sound in background (non-blocking)
        subprocess.Popen(
            ["afplay", sound_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except (OSError, subprocess.SubprocessError):
        pass  # Fail silently if sound can't play

def main():
    try:
        # Parse JSON input safely
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # If JSON parsing fails, use default sound
        play_sound_async(SOUNDS["default"])
        sys.exit(0)
    
    # Extract message content
    message = input_data.get("message", "").lower()
    
    # Select appropriate sound based on message content
    if "permission" in message:
        sound = SOUNDS["permission"]
    elif any(word in message for word in ["waiting", "pending_user_input", "input"]):
        sound = SOUNDS["waiting"] 
    else:
        sound = SOUNDS["default"]
    
    # Play sound asynchronously
    play_sound_async(sound)
    
    # Exit immediately
    sys.exit(0)

if __name__ == "__main__":
    main()