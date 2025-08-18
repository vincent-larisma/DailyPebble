# ESP32 DailyPebble Installation Guide

## Step 1: Install Required Libraries in Arduino IDE

1. **Open Arduino IDE**

2. **Install ESP32 Board Package** (if not already done):
   - Go to **File → Preferences**
   - In "Additional Board Manager URLs" add:
     ```
     https://dl.espressif.com/dl/package_esp32_index.json
     ```
   - Go to **Tools → Board → Boards Manager**
   - Search "ESP32" and install **"esp32" by Espressif Systems**

3. **Install Required Libraries**:
   - Go to **Sketch → Include Library → Manage Libraries**
   - Search and install this library:

   **ArduinoJson**
   - Search: "ArduinoJson"  
   - Install: **"ArduinoJson" by Benoit Blanchon** (version 6.x)

   **Note**: We're now using the built-in ESP32WebServer library instead of ESPAsyncWebServer to avoid compatibility issues

## Step 2: Upload Arduino Sketch to ESP32

1. **Connect your ESP32 board** to your computer via USB

2. **Open the Arduino sketch**:
   - Open `esp32/DailyPebble_ESP32.ino` in Arduino IDE

3. **Configure Board Settings**:
   - **Tools → Board** → Select your ESP32 board (e.g., "ESP32 Dev Module")
   - **Tools → Port** → Select the correct port (usually something like /dev/ttyUSB0 on Linux/Mac or COM3 on Windows)
   - **Tools → Partition Scheme** → Select **"No OTA (2MB APP/2MB SPIFFS)"** (important for file storage)

4. **Upload the sketch**:
   - Click the **Upload** button (→) in Arduino IDE
   - Wait for compilation and upload to complete

## Step 3: Upload Web Files to ESP32 File System

### **IMPORTANT: Arduino IDE Version Issue**

**If you're using Arduino IDE 2.x** (the newer version), the ESP32 data upload tool **does NOT work**. You have 3 options:

### Method 1: Use Arduino IDE 1.x (Simplest Solution)

1. **Download Arduino IDE 1.x**:
   - Go to: https://www.arduino.cc/en/software#legacy-ide-18x
   - Install Arduino IDE 1.x alongside your current IDE (they work together fine)

2. **Use Arduino IDE 1.x for file upload**:
   - Open `esp32/DailyPebble_ESP32/DailyPebble_ESP32.ino` in Arduino IDE 1.x
   - You'll see a `data/` folder with all web files
   - Go to **Tools → ESP32 Sketch Data Upload**
   - Wait for upload to complete

### Method 2: Skip File Upload - Basic Functionality (Recommended for Arduino IDE 2.x)

**Good news:** Your DailyPebble will work even without file upload!

1. **Just upload the Arduino sketch** (using Arduino IDE 2.x is fine for this)
2. **Connect to ESP32 WiFi** and test at http://192.168.4.1
3. **Full functionality works** - add categories, todos, data persistence!
4. **Only difference:** Basic styling instead of fancy fonts/colors

### Method 3: ESP32 File Manager (Advanced - If you want full styling)

1. **Upload a file manager sketch**:
   - Search online for "ESP32 File Manager sketch" 
   - Or use: https://github.com/smford22/esp32-asyncwebserver-fileupload-example
   
2. **Upload files via web interface**:
   - Connect to ESP32 WiFi
   - Use the web interface to upload each file from `esp32/web_files/`
   - Then upload your main DailyPebble sketch

## Step 4: Connect to ESP32 WiFi and Access Website

1. **Power on your ESP32** (via USB or external power)

2. **Check Serial Monitor** (optional):
   - Open **Tools → Serial Monitor** in Arduino IDE
   - Set baud rate to **115200**
   - You should see output like:
     ```
     LittleFS mounted successfully
     AP IP address: 192.168.4.1
     Connect to WiFi: DailyPebble
     Password: dailypebble123
     Then open: http://192.168.4.1
     ```

3. **Connect to ESP32 WiFi**:
   - On your phone/computer, look for WiFi network: **"DailyPebble"**
   - Connect using password: **"dailypebble123"**

4. **Access the website**:
   - Open a web browser
   - Go to: **http://192.168.4.1**
   - You should see the DailyPebble home page!

## Step 5: Using DailyPebble

1. **Add Categories**: Click the "+" button to create new task categories
2. **Add Todos**: Click on any category to add regular or scheduled todos
3. **Data Persistence**: All data is stored on the ESP32 and survives power cycles
4. **Multiple Devices**: Multiple phones/computers can connect and share the same data

## Troubleshooting

### Upload Issues:
- **"Failed to connect"**: Make sure ESP32 is in download mode (hold BOOT button while clicking upload)
- **"Port not found"**: Install ESP32 USB drivers for your specific board
- **"Compilation error"**: Make sure all libraries are installed correctly

### Library Compatibility Issues:
- **No compatibility issues**: We're now using the built-in ESP32WebServer library which is fully compatible with all ESP32 core versions
- **If you encounter any compilation errors**: Make sure ArduinoJson library is installed and you have a recent ESP32 board package

### File System Issues:
- **"LittleFS mount failed"**: Try re-uploading with partition scheme set to "No OTA (2MB APP/2MB SPIFFS)"
- **Web files not loading**: Make sure you uploaded the data folder correctly

### WiFi Issues:
- **Can't find network**: Wait 30-60 seconds after powering on for network to appear
- **Can't access website**: Make sure you're connected to "DailyPebble" network and try http://192.168.4.1

### Performance:
- **Slow loading**: Normal for first load, subsequent loads should be faster
- **Multiple users**: ESP32 can handle several concurrent users but performance may vary

## File Structure Summary

```
esp32/
├── DailyPebble_ESP32.ino          # Main Arduino sketch
├── INSTALLATION_INSTRUCTIONS.md   # This file
└── web_files/                     # All web files (copy to "data" folder)
    ├── index.html
    ├── add_category.html
    ├── detail.html
    ├── scripts/
    │   ├── home.js
    │   ├── add_category.js
    │   └── detail.js
    ├── styles/
    │   ├── main.css
    │   ├── home.css
    │   ├── add_category.css
    │   └── detail.css
    └── fonts/
        ├── Merriweather_24pt-Regular.ttf
        ├── Merriweather_24pt-Bold.ttf
        └── Merriweather_24pt-Italic.ttf
```

## Default WiFi Credentials

- **Network Name**: DailyPebble
- **Password**: dailypebble123
- **IP Address**: http://192.168.4.1

You can change these in the Arduino code if needed.

---

**Congratulations!** Your ESP32 DailyPebble is now ready to use. You have a completely offline task management system that works without internet!
