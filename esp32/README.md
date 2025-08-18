# ESP32 DailyPebble - Complete Implementation

This folder contains everything needed to run your DailyPebble website on an ESP32 microcontroller.

## What You Get

✅ **Offline-First**: Works without internet connection  
✅ **WiFi Access Point**: ESP32 creates its own "DailyPebble" network  
✅ **Data Persistence**: All data saved on ESP32, survives power cycles  
✅ **Multi-User**: Multiple devices can connect simultaneously  
✅ **API-Based**: RESTful API with localStorage fallback  
✅ **Complete UI**: All your existing features work perfectly  

## Quick Start

1. **Install libraries** in Arduino IDE:
   - ESPAsyncWebServer
   - ArduinoJson

2. **Upload sketch**: 
   - Open `DailyPebble_ESP32.ino` in Arduino IDE
   - Set partition scheme to "No OTA (2MB APP/2MB SPIFFS)"
   - Upload to ESP32

3. **Upload web files**:
   - Copy `web_files/` contents to a "data" folder next to your sketch
   - Use "ESP32 Sketch Data Upload" tool in Arduino IDE

4. **Connect and use**:
   - Connect to WiFi: "DailyPebble" (password: "dailypebble123")  
   - Open browser: http://192.168.4.1

## Files Overview

- `DailyPebble_ESP32.ino` - Main Arduino sketch
- `web_files/` - All website files (HTML, CSS, JS, fonts)
- `INSTALLATION_INSTRUCTIONS.md` - Detailed step-by-step guide

## Technical Details

**Data Storage**: JSON files on LittleFS file system  
**API Endpoints**: 
- `GET /api/categories` - Load categories
- `POST /api/categories` - Save categories  
- `GET /api/entries` - Load entries
- `POST /api/entries` - Save entries

**WiFi**: Access Point mode (ESP32 creates its own network)  
**IP Address**: 192.168.4.1 (fixed)  
**Concurrent Users**: Supports multiple devices  

## Your Original Features Preserved

✅ Category management with colors and notes  
✅ Todo and reminder items  
✅ Scheduled tasks with date ranges  
✅ Edit/delete functionality  
✅ Mobile-responsive design  
✅ All animations and interactions  

---

**Result**: Your web app now runs completely offline on a $10 ESP32 board!
