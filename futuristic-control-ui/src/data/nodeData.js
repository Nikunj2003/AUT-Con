import config from "../config";

export const nodeData = [
  {
    id: 'system',
    title: 'System Control',
    type: 'primary',
    children: [
      { id: 'sys_lock', title: 'Lock Screen', type: 'secondary', command: 'lock_screen' },
      { id: 'sys_shutdown', title: 'Shutdown', type: 'secondary', command: 'shutdown' },
      { id: 'sys_restart', title: 'Restart', type: 'secondary', command: 'restart' },
      { id: 'sys_sleep', title: 'Sleep', type: 'secondary', command: 'sleep' },
      { id: 'sys_mute', title: 'Mute Audio', type: 'secondary', command: 'mute_audio' },
      { id: 'sys_volume', title: 'Volume Control', type: 'secondary', command: 'volume_control' }
    ]
  },
  {
    id: 'applications',
    title: 'Applications',
    type: 'primary',
    children: [
      { id: 'app_browser', title: 'Web Browser', type: 'secondary', command: 'open_browser' },
      { id: 'app_terminal', title: 'Terminal', type: 'secondary', command: 'open_terminal' },
      { id: 'app_editor', title: 'Code Editor', type: 'secondary', command: 'open_editor' },
      { id: 'app_files', title: 'File Manager', type: 'secondary', command: 'open_files' },
      { id: 'app_calculator', title: 'Calculator', type: 'secondary', command: 'open_calculator' },
      { id: 'app_settings', title: 'Settings', type: 'secondary', command: 'open_settings' }
    ]
  },
  {
    id: 'media',
    title: 'Media Control',
    type: 'primary',
    children: [
      { id: 'media_play', title: 'Play/Pause', type: 'accent', command: 'media_play_pause' },
      { id: 'media_next', title: 'Next Track', type: 'accent', command: 'media_next' },
      { id: 'media_prev', title: 'Previous Track', type: 'accent', command: 'media_previous' },
      { id: 'media_spotify', title: 'Open Spotify', type: 'accent', command: 'open_spotify' },
      { id: 'media_youtube', title: 'Open YouTube', type: 'accent', command: 'open_youtube' }
    ]
  },
  {
    id: 'network',
    title: 'Network',
    type: 'primary',
    children: [
      { id: 'net_wifi', title: 'WiFi Settings', type: 'secondary', command: 'wifi_settings' },
      { id: 'net_bluetooth', title: 'Bluetooth', type: 'secondary', command: 'bluetooth_settings' },
      { id: 'net_vpn', title: 'VPN Control', type: 'secondary', command: 'vpn_control' },
      { id: 'net_hotspot', title: 'Mobile Hotspot', type: 'secondary', command: 'mobile_hotspot' }
    ]
  },
  {
    id: 'productivity',
    title: 'Productivity',
    type: 'primary',
    children: [
      { id: 'prod_screenshot', title: 'Screenshot', type: 'accent', command: 'take_screenshot' },
      { id: 'prod_clipboard', title: 'Clipboard', type: 'accent', command: 'clipboard_manager' },
      { id: 'prod_notes', title: 'Quick Notes', type: 'accent', command: 'quick_notes' },
      { id: 'prod_timer', title: 'Timer', type: 'accent', command: 'start_timer' },
      { id: 'prod_calendar', title: 'Calendar', type: 'accent', command: 'open_calendar' }
    ]
  },
  {
    id: 'monitoring',
    title: 'System Monitor',
    type: 'primary',
    children: [
      { id: 'mon_cpu', title: 'CPU Usage', type: 'secondary', command: 'show_cpu' },
      { id: 'mon_memory', title: 'Memory Usage', type: 'secondary', command: 'show_memory' },
      { id: 'mon_disk', title: 'Disk Usage', type: 'secondary', command: 'show_disk' },
      { id: 'mon_network', title: 'Network Activity', type: 'secondary', command: 'show_network' },
      { id: 'mon_processes', title: 'Task Manager', type: 'secondary', command: 'task_manager' }
    ]
  }
];

// Command execution with backend API
export const executeCommand = async (node) => {
  console.debug(`Executing command: ${node.command} for ${node.title}`);
  
  try {
    const response = await fetch(`http://localhost:5134/api/system/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: node.command }),
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        message: result.message || `${node.title} command executed successfully`,
        output: result.output,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: result.error || `Failed to execute ${node.title}`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: `Network error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
};

// System commands mapping
export const systemCommands = {
  // System Control
  lock_screen: () => console.log('Locking screen...'),
  shutdown: () => console.log('Shutting down system...'),
  restart: () => console.log('Restarting system...'),
  sleep: () => console.log('Putting system to sleep...'),
  mute_audio: () => console.log('Muting audio...'),
  volume_control: () => console.log('Opening volume control...'),
  
  // Applications
  open_browser: () => window.open('https://google.com', '_blank'),
  open_terminal: () => console.log('Opening terminal...'),
  open_editor: () => console.log('Opening code editor...'),
  open_files: () => console.log('Opening file manager...'),
  open_calculator: () => console.log('Opening calculator...'),
  open_settings: () => console.log('Opening system settings...'),
  
  // Media Control
  media_play_pause: () => console.log('Toggling media playback...'),
  media_next: () => console.log('Next track...'),
  media_previous: () => console.log('Previous track...'),
  open_spotify: () => window.open('https://open.spotify.com', '_blank'),
  open_youtube: () => window.open('https://youtube.com', '_blank'),
  
  // Network
  wifi_settings: () => console.log('Opening WiFi settings...'),
  bluetooth_settings: () => console.log('Opening Bluetooth settings...'),
  vpn_control: () => console.log('Opening VPN control...'),
  mobile_hotspot: () => console.log('Toggling mobile hotspot...'),
  
  // Productivity
  take_screenshot: () => console.log('Taking screenshot...'),
  clipboard_manager: () => console.log('Opening clipboard manager...'),
  quick_notes: () => console.log('Opening quick notes...'),
  start_timer: () => console.log('Starting timer...'),
  open_calendar: () => console.log('Opening calendar...'),
  
  // Monitoring
  show_cpu: () => console.log('Showing CPU usage...'),
  show_memory: () => console.log('Showing memory usage...'),
  show_disk: () => console.log('Showing disk usage...'),
  show_network: () => console.log('Showing network activity...'),
  task_manager: () => console.log('Opening task manager...')
};

