import os

class Config:
    PORT = int(os.environ.get("PORT", 5134))
    DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    # Add other backend-specific configurations here
    # For example, a list of allowed commands or paths
    ALLOWED_COMMANDS = [
        "lock_screen", "shutdown", "restart", "sleep", "mute_audio", "volume_control",
        "open_browser", "open_terminal", "open_file_manager", "open_calculator",
        "play_pause_media", "next_track", "previous_track", "open_spotify", "open_youtube",
        "enable_wifi", "disable_wifi", "connect_vpn", "disconnect_vpn",
        "take_screenshot", "copy_to_clipboard", "open_notes", "start_timer", "open_calendar"
    ]


