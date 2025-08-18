#include <WiFi.h>
#include <WebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

// WiFi Access Point Configuration
const char* ssid = "DailyPebble";
const char* password = "dailypebble123";

// Create WebServer object on port 80
WebServer server(80);

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  delay(1000);

  // Initialize LittleFS
  if (!LittleFS.begin(true)) {
    Serial.println("An Error has occurred while mounting LittleFS");
    return;
  }
  Serial.println("LittleFS mounted successfully");

  // Initialize default data files if they don't exist
  initializeDataFiles();

  // Set up WiFi Access Point
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  Serial.println("Connect to WiFi: DailyPebble");
  Serial.println("Password: dailypebble123");
  Serial.print("Then open: http://");
  Serial.println(IP);

  // Serve static files
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", readFile("/index.html"));
  });

  server.on("/index.html", HTTP_GET, []() {
    server.send(200, "text/html", readFile("/index.html"));
  });

  server.on("/add_category.html", HTTP_GET, []() {
    server.send(200, "text/html", readFile("/add_category.html"));
  });

  server.on("/detail.html", HTTP_GET, []() {
    server.send(200, "text/html", readFile("/detail.html"));
  });

  // Serve CSS files
  server.on("/styles/main.css", HTTP_GET, []() {
    server.send(200, "text/css", readFile("/styles/main.css"));
  });

  server.on("/styles/home.css", HTTP_GET, []() {
    server.send(200, "text/css", readFile("/styles/home.css"));
  });

  server.on("/styles/add_category.css", HTTP_GET, []() {
    server.send(200, "text/css", readFile("/styles/add_category.css"));
  });

  server.on("/styles/detail.css", HTTP_GET, []() {
    server.send(200, "text/css", readFile("/styles/detail.css"));
  });

  // Serve JavaScript files
  server.on("/scripts/home.js", HTTP_GET, []() {
    server.send(200, "application/javascript", readFile("/scripts/home.js"));
  });

  server.on("/scripts/add_category.js", HTTP_GET, []() {
    server.send(200, "application/javascript", readFile("/scripts/add_category.js"));
  });

  server.on("/scripts/detail.js", HTTP_GET, []() {
    server.send(200, "application/javascript", readFile("/scripts/detail.js"));
  });

  // Serve font files
  server.on("/fonts/Merriweather_24pt-Regular.ttf", HTTP_GET, []() {
    File file = LittleFS.open("/fonts/Merriweather_24pt-Regular.ttf", "r");
    if (file) {
      server.streamFile(file, "font/ttf");
      file.close();
    } else {
      server.send(404, "text/plain", "Font not found");
    }
  });

  server.on("/fonts/Merriweather_24pt-Bold.ttf", HTTP_GET, []() {
    File file = LittleFS.open("/fonts/Merriweather_24pt-Bold.ttf", "r");
    if (file) {
      server.streamFile(file, "font/ttf");
      file.close();
    } else {
      server.send(404, "text/plain", "Font not found");
    }
  });

  server.on("/fonts/Merriweather_24pt-Italic.ttf", HTTP_GET, []() {
    File file = LittleFS.open("/fonts/Merriweather_24pt-Italic.ttf", "r");
    if (file) {
      server.streamFile(file, "font/ttf");
      file.close();
    } else {
      server.send(404, "text/plain", "Font not found");
    }
  });

  // API Routes for categories
  server.on("/api/categories", HTTP_GET, []() {
    String categoriesData = readFile("/categories.json");
    server.send(200, "application/json", categoriesData);
  });

  server.on("/api/categories", HTTP_POST, []() {
    String categoriesData = server.arg("plain");
    
    // Validate JSON
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, categoriesData);
    
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    // Save to file
    if (writeFile("/categories.json", categoriesData)) {
      server.send(200, "application/json", "{\"success\":true}");
    } else {
      server.send(500, "application/json", "{\"error\":\"Failed to save data\"}");
    }
  });

  // API Routes for entries
  server.on("/api/entries", HTTP_GET, []() {
    String entriesData = readFile("/entries.json");
    server.send(200, "application/json", entriesData);
  });

  server.on("/api/entries", HTTP_POST, []() {
    String entriesData = server.arg("plain");
    
    // Validate JSON
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, entriesData);
    
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    // Save to file
    if (writeFile("/entries.json", entriesData)) {
      server.send(200, "application/json", "{\"success\":true}");
    } else {
      server.send(500, "application/json", "{\"error\":\"Failed to save data\"}");
    }
  });

  // Handle 404
  server.onNotFound([]() {
    server.send(404, "text/plain", "File Not Found");
  });

  // Start server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  // Handle client requests
  server.handleClient();
  delay(10);
}

// Initialize default data files
void initializeDataFiles() {
  // Initialize categories.json if it doesn't exist
  if (!LittleFS.exists("/categories.json")) {
    String defaultCategories = "{\"categories\":[]}";
    writeFile("/categories.json", defaultCategories);
    Serial.println("Created default categories.json");
  }

  // Initialize entries.json if it doesn't exist
  if (!LittleFS.exists("/entries.json")) {
    String defaultEntries = "{\"entries\":[]}";
    writeFile("/entries.json", defaultEntries);
    Serial.println("Created default entries.json");
  }
}

// Read file from LittleFS
String readFile(const char* path) {
  File file = LittleFS.open(path, "r");
  if (!file) {
    Serial.println("Failed to open file for reading: " + String(path));
    return "{}";
  }

  String content = file.readString();
  file.close();
  return content;
}

// Write file to LittleFS
bool writeFile(const char* path, const String& content) {
  File file = LittleFS.open(path, "w");
  if (!file) {
    Serial.println("Failed to open file for writing: " + String(path));
    return false;
  }

  size_t bytesWritten = file.print(content);
  file.close();
  
  if (bytesWritten > 0) {
    Serial.println("File written successfully: " + String(path));
    return true;
  } else {
    Serial.println("Failed to write file: " + String(path));
    return false;
  }
}
