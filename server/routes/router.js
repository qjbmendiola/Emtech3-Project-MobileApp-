const express = require("express");
const router = express.Router();

const decisionTree = {
  start: {
    id: "start",
    type: "question",
    title: "Cisco Router Assistant",
    text: "Choose what you want to do.",
    options: [
      { label: "Cisco Router Configuration Guide", next: "config_menu" },
      { label: "Troubleshooting Guide", next: "troubleshoot_menu" }
    ]
  },

  // =========================
  // CONFIGURATION GUIDE
  // =========================
  config_menu: {
    id: "config_menu",
    type: "question",
    title: "Cisco Router Configuration Guide",
    text: "Which configuration task do you want to perform?",
    options: [
      { label: "Basic Initial Setup", next: "basic_setup" },
      { label: "Enable SSH Remote Access", next: "ssh_setup" },
      { label: "Configure LAN Interface", next: "lan_interface" },
      { label: "Configure WAN Interface", next: "wan_interface" },
      { label: "Set Default Route", next: "default_route" },
      { label: "Save Configuration", next: "save_config" }
    ]
  },

  basic_setup: {
    id: "basic_setup",
    type: "result",
    title: "Basic Initial Setup",
    text: "This setup configures the router hostname, privileged access, and console access.",
    commands: [
      "enable",
      "configure terminal",
      "hostname BranchRouter",
      "enable secret MySecurePass123",
      "line console 0",
      "password ConsolePass123",
      "login",
      "exit"
    ],
    notes: [
      "Use hostname to identify the router.",
      "Use enable secret for better security.",
      "Console line settings control direct local access."
    ]
  },

  ssh_setup: {
    id: "ssh_setup",
    type: "result",
    title: "Enable SSH Remote Access",
    text: "This setup enables SSH for secure remote access.",
    commands: [
      "enable",
      "configure terminal",
      "hostname BranchRouter",
      "ip domain-name lab.local",
      "username admin password AdminPass123",
      "crypto key generate rsa",
      "ip ssh version 2",
      "line vty 0 4",
      "login local",
      "transport input ssh",
      "exit"
    ],
    notes: [
      "Hostname and domain name are required before generating RSA keys.",
      "login local uses the local username for authentication.",
      "transport input ssh disables Telnet and allows SSH only."
    ]
  },

  lan_interface: {
    id: "lan_interface",
    type: "result",
    title: "Configure LAN Interface",
    text: "Use this to assign an IP address to a LAN-facing interface.",
    commands: [
      "enable",
      "configure terminal",
      "interface GigabitEthernet0/0",
      "description LAN Interface",
      "ip address 192.168.10.1 255.255.255.0",
      "no shutdown",
      "exit"
    ],
    notes: [
      "Replace the interface name if needed.",
      "The LAN IP often becomes the default gateway for client devices."
    ]
  },

  wan_interface: {
    id: "wan_interface",
    type: "result",
    title: "Configure WAN Interface",
    text: "Use this to assign an ISP-facing IP address to the WAN interface.",
    commands: [
      "enable",
      "configure terminal",
      "interface GigabitEthernet0/1",
      "description WAN Interface",
      "ip address 203.0.113.2 255.255.255.252",
      "no shutdown",
      "exit"
    ],
    notes: [
      "Use the IP details provided by your ISP or Packet Tracer topology.",
      "WAN addressing depends on the lab or provider."
    ]
  },

  default_route: {
    id: "default_route",
    type: "result",
    title: "Set Default Route",
    text: "Use a default route to send unknown traffic to the next-hop gateway.",
    commands: [
      "enable",
      "configure terminal",
      "ip route 0.0.0.0 0.0.0.0 203.0.113.1",
      "exit"
    ],
    notes: [
      "Replace 203.0.113.1 with the correct next-hop IP.",
      "This creates the gateway of last resort."
    ]
  },

  save_config: {
    id: "save_config",
    type: "result",
    title: "Save Configuration",
    text: "Save the running configuration so changes remain after reboot.",
    commands: [
      "enable",
      "copy running-config startup-config"
    ],
    notes: [
      "If you do not save, changes may be lost after restart."
    ]
  },

  // =========================
  // TROUBLESHOOTING GUIDE
  // =========================
  troubleshoot_menu: {
    id: "troubleshoot_menu",
    type: "question",
    title: "Router Troubleshooting Assistant",
    text: "What is your main router or internet concern?",
    options: [
      { label: "No internet connection", next: "check_los" },
      { label: "Slow internet", next: "slow_devices" },
      { label: "WiFi password concern", next: "change_password" },
      { label: "Need to restart/reset router", next: "reset_router" }
    ]
  },

  check_los: {
    id: "check_los",
    type: "question",
    title: "LOS Check",
    text: "Is the LOS light red on your router?",
    options: [
      { label: "Yes", next: "los_red_result" },
      { label: "No", next: "wifi_visible" }
    ]
  },

  los_red_result: {
    id: "los_red_result",
    type: "result",
    title: "Possible line or outage issue",
    text: "A red LOS light usually means a line issue or outage. Please check the Outage Map page and restart your router. If the issue continues, contact support for line verification."
  },

  wifi_visible: {
    id: "wifi_visible",
    type: "question",
    title: "WiFi Visibility",
    text: "Can you still see your WiFi name on your device?",
    options: [
      { label: "Yes", next: "other_devices" },
      { label: "No", next: "restart_router_result" }
    ]
  },

  other_devices: {
    id: "other_devices",
    type: "question",
    title: "Device Check",
    text: "Are other devices also affected?",
    options: [
      { label: "Yes", next: "restart_router_result" },
      { label: "No", next: "single_device_result" }
    ]
  },

  restart_router_result: {
    id: "restart_router_result",
    type: "result",
    title: "Restart the router",
    text: "Please restart your router by turning it off for 10 seconds, then turning it back on. Wait for the lights to stabilize, then test the connection again."
  },

  single_device_result: {
    id: "single_device_result",
    type: "result",
    title: "Single-device issue",
    text: "This looks like a device-specific issue. Try forgetting the WiFi network on the affected device, reconnecting, or restarting that device."
  },

  slow_devices: {
    id: "slow_devices",
    type: "question",
    title: "Slow Internet Check",
    text: "Is the slow connection affecting all devices?",
    options: [
      { label: "Yes", next: "router_position" },
      { label: "No", next: "single_device_result" }
    ]
  },

  router_position: {
    id: "router_position",
    type: "question",
    title: "Router Placement",
    text: "Is your router placed in an open area and not blocked by walls or appliances?",
    options: [
      { label: "Yes", next: "restart_router_result" },
      { label: "No", next: "reposition_router_result" }
    ]
  },

  reposition_router_result: {
    id: "reposition_router_result",
    type: "result",
    title: "Improve router placement",
    text: "Move your router to a more open and central location, away from walls and large appliances. Then test your connection again."
  },

  change_password: {
    id: "change_password",
    type: "result",
    title: "Change WiFi Password",
    text: "Open your browser and go to 192.168.1.1, log in to your router admin page, then go to the WiFi settings to update your network password."
  },

  reset_router: {
    id: "reset_router",
    type: "question",
    title: "Router Reset Type",
    text: "What would you like to do?",
    options: [
      { label: "Simple restart", next: "restart_router_result" },
      { label: "Factory reset", next: "factory_reset_result" }
    ]
  },

  factory_reset_result: {
    id: "factory_reset_result",
    type: "result",
    title: "Factory Reset Warning",
    text: "To factory reset, press and hold the reset button for about 10–15 seconds. This may erase your custom WiFi settings, so use it only if needed."
  }
};

// GET /api/router — returns the starting node
router.get("/", (req, res) => {
  res.json(decisionTree.start);
});

// POST /api/router/decision — returns the next node by ID
router.post("/decision", (req, res) => {
  const { nextId } = req.body;

  if (!nextId || !decisionTree[nextId]) {
    return res.status(400).json({ error: "Invalid next step." });
  }

  res.json(decisionTree[nextId]);
});

module.exports = router;