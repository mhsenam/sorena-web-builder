# Ultra-fast completion sound hook for Windows PowerShell

# Configuration
$ENABLED = 1

# Exit immediately if disabled
if ($ENABLED -eq 0) { exit 0 }

# Play Windows system sound in background (non-blocking)
# Using Windows beep sound as a simple notification
try {
    # Option 1: System beep (fastest)
    [System.Console]::Beep(800, 200)
    
    # Option 2: Use Windows default notification sound (if you prefer)
    # Add-Type -TypeDefinition @"
    #     using System.Media;
    #     public class Sound {
    #         public static void PlayNotification() {
    #             SystemSounds.Asterisk.Play();
    #         }
    #     }
    # "@
    # [Sound]::PlayNotification()
} catch {
    # Silently fail if sound cannot be played
}

# Exit immediately without waiting
exit 0