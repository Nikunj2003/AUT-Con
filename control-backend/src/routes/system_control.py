import os
import subprocess
import platform
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

system_bp = Blueprint('system', __name__)

@system_bp.route('/execute', methods=['POST'])
@cross_origin()
def execute_command():
    """Execute system commands safely"""
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debugging line to see incoming data
        command = data.get('command')
        
        if not command:
            return jsonify({'success': False, 'error': 'No command provided'}), 400
        
        # Map of safe commands to actual system commands
        command_map = {
            # System Control
            'lock_screen': get_lock_command(),
            'mute_audio': get_mute_command(),
            'volume_up': get_volume_command('up'),
            'volume_down': get_volume_command('down'),
            
            # Applications
            'open_browser': get_browser_command(),
            'open_terminal': get_terminal_command(),
            'open_files': get_file_manager_command(),
            'open_calculator': get_calculator_command(),
            
            # Media Control
            'media_play_pause': get_media_command('play-pause'),
            'media_next': get_media_command('next'),
            'media_previous': get_media_command('previous'),
            
            # System Info
            'show_cpu': 'echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | awk -F\'%\' \'{print $1}\')"',
            'show_memory': 'free -h',
            'show_disk': 'df -h',
            'show_processes': 'ps aux --sort=-%cpu | head -10',
            
            # Productivity
            'take_screenshot': get_screenshot_command(),
            'clipboard_manager': 'echo "Clipboard functionality not available in sandbox"',
            
            # Network
            'show_network': 'netstat -i',
            'wifi_settings': 'echo "WiFi settings not available in sandbox"',
        }
        
        if command not in command_map:
            return jsonify({
                'success': False, 
                'error': f'Command "{command}" not supported'
            }), 400
        
        # Execute the command
        system_command = command_map[command]
        
        if system_command.startswith('echo'):
            # For echo commands, just return the message
            result = system_command.replace('echo "', '').replace('"', '')
            return jsonify({
                'success': True,
                'message': result,
                'output': result
            })
        
        try:
            # Execute the actual command
            result = subprocess.run(
                system_command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return jsonify({
                    'success': True,
                    'message': f'Command "{command}" executed successfully',
                    'output': result.stdout.strip() if result.stdout else 'Command completed'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': f'Command failed: {result.stderr.strip()}',
                    'output': result.stderr.strip()
                })
                
        except subprocess.TimeoutExpired:
            return jsonify({
                'success': False,
                'error': 'Command timed out'
            }), 408
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Execution error: {str(e)}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@system_bp.route('/system-info', methods=['GET'])
@cross_origin()
def get_system_info():
    """Get basic system information"""
    try:
        info = {
            'platform': platform.system(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'processor': platform.processor(),
            'hostname': platform.node(),
            'python_version': platform.python_version()
        }
        
        # Get additional system stats
        try:
            # CPU count
            info['cpu_count'] = os.cpu_count()
            
            # Load average (Unix-like systems)
            if hasattr(os, 'getloadavg'):
                info['load_average'] = os.getloadavg()
            
            # Memory info (Linux)
            if platform.system() == 'Linux':
                with open('/proc/meminfo', 'r') as f:
                    meminfo = f.read()
                    for line in meminfo.split('\n'):
                        if 'MemTotal:' in line:
                            info['total_memory'] = line.split()[1] + ' kB'
                        elif 'MemAvailable:' in line:
                            info['available_memory'] = line.split()[1] + ' kB'
                            
        except Exception:
            pass  # Ignore errors getting additional info
            
        return jsonify({
            'success': True,
            'system_info': info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get system info: {str(e)}'
        }), 500

def get_lock_command():
    """Get the appropriate lock screen command for the current OS"""
    system = platform.system()
    if system == 'Linux':
        # Try different lock commands
        for cmd in ['gnome-screensaver-command -l', 'xdg-screensaver lock', 'loginctl lock-session']:
            if subprocess.run(['which', cmd.split()[0]], capture_output=True).returncode == 0:
                return cmd
        return 'echo "Screen lock not available"'
    elif system == 'Darwin':  # macOS
        return 'pmset displaysleepnow'
    elif system == 'Windows':
        return 'rundll32.exe user32.dll,LockWorkStation'
    else:
        return 'echo "Screen lock not supported on this platform"'

def get_mute_command():
    """Get the appropriate mute command for the current OS"""
    system = platform.system()
    if system == 'Linux':
        return 'amixer set Master toggle 2>/dev/null || echo "Audio control not available"'
    elif system == 'Darwin':  # macOS
        return 'osascript -e "set volume output muted not (output muted of (get volume settings))"'
    elif system == 'Windows':
        return 'nircmd.exe mutesysvolume 2'
    else:
        return 'echo "Audio control not supported on this platform"'

def get_volume_command(direction):
    """Get volume control commands"""
    system = platform.system()
    if system == 'Linux':
        if direction == 'up':
            return 'amixer set Master 5%+ 2>/dev/null || echo "Volume control not available"'
        else:
            return 'amixer set Master 5%- 2>/dev/null || echo "Volume control not available"'
    elif system == 'Darwin':  # macOS
        if direction == 'up':
            return 'osascript -e "set volume output volume (output volume of (get volume settings) + 10)"'
        else:
            return 'osascript -e "set volume output volume (output volume of (get volume settings) - 10)"'
    else:
        return f'echo "Volume {direction} not supported on this platform"'

def get_browser_command():
    """Get command to open default browser"""
    system = platform.system()
    if system == 'Linux':
        return 'xdg-open https://google.com 2>/dev/null || echo "Browser not available"'
    elif system == 'Darwin':  # macOS
        return 'open https://google.com'
    elif system == 'Windows':
        return 'start https://google.com'
    else:
        return 'echo "Browser not supported on this platform"'

def get_terminal_command():
    """Get command to open terminal"""
    system = platform.system()
    if system == 'Linux':
        for terminal in ['gnome-terminal', 'konsole', 'xterm', 'terminator']:
            if subprocess.run(['which', terminal], capture_output=True).returncode == 0:
                return f'{terminal} &'
        return 'echo "Terminal not available"'
    elif system == 'Darwin':  # macOS
        return 'open -a Terminal'
    elif system == 'Windows':
        return 'start cmd'
    else:
        return 'echo "Terminal not supported on this platform"'

def get_file_manager_command():
    """Get command to open file manager"""
    system = platform.system()
    if system == 'Linux':
        for fm in ['nautilus', 'dolphin', 'thunar', 'pcmanfm']:
            if subprocess.run(['which', fm], capture_output=True).returncode == 0:
                return f'{fm} ~ &'
        return 'echo "File manager not available"'
    elif system == 'Darwin':  # macOS
        return 'open ~'
    elif system == 'Windows':
        return 'explorer'
    else:
        return 'echo "File manager not supported on this platform"'

def get_calculator_command():
    """Get command to open calculator"""
    system = platform.system()
    if system == 'Linux':
        for calc in ['gnome-calculator', 'kcalc', 'galculator']:
            if subprocess.run(['which', calc], capture_output=True).returncode == 0:
                return f'{calc} &'
        return 'echo "Calculator not available"'
    elif system == 'Darwin':  # macOS
        return 'open -a Calculator'
    elif system == 'Windows':
        return 'calc'
    else:
        return 'echo "Calculator not supported on this platform"'

def get_media_command(action):
    """Get media control commands"""
    system = platform.system()
    if system == 'Linux':
        return f'playerctl {action} 2>/dev/null || echo "Media control not available"'
    elif system == 'Darwin':  # macOS
        if action == 'play-pause':
            return 'osascript -e "tell application \\"Spotify\\" to playpause"'
        elif action == 'next':
            return 'osascript -e "tell application \\"Spotify\\" to next track"'
        elif action == 'previous':
            return 'osascript -e "tell application \\"Spotify\\" to previous track"'
    else:
        return f'echo "Media {action} not supported on this platform"'

def get_screenshot_command():
    """Get screenshot command"""
    system = platform.system()
    if system == 'Linux':
        return 'gnome-screenshot -f ~/screenshot.png 2>/dev/null || scrot ~/screenshot.png 2>/dev/null || echo "Screenshot not available"'
    elif system == 'Darwin':  # macOS
        return 'screencapture ~/screenshot.png'
    elif system == 'Windows':
        return 'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\\"{PRTSC}\\")"'
    else:
        return 'echo "Screenshot not supported on this platform"'

