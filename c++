#include <WiFi.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;

// Ultrasonic Sensor Pins
const int trigPin = 5;
const int echoPin = 18;

// PIR Motion Sensor Pin
const int pirPin = 19;

// Define sound speed in cm/usec
const float soundSpeed = 0.034;

// Variables
long duration;
float distanceCm;
int motionDetected = 0;

// MQTT client
WiFiClient espClient;
PubSubClient client(espClient);

// Timing variables
unsigned long lastMsgTime = 0;
const long interval = 2000;  // Publish every 2 seconds

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  
  // Set sensor pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(pirPin, INPUT);
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Connect to MQTT
  client.setServer(mqtt_server, mqtt_port);
}

float readDistance() {
  // Clear the trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Set the trigPin HIGH for 10 microseconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  
  // Calculate the distance
  return duration * soundSpeed / 2;
}

int readMotion() {
  return digitalRead(pirPin);
}

void reconnect() {
  // Loop until reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  unsigned long now = millis();
  if (now - lastMsgTime > interval) {
    lastMsgTime = now;
    
    // Read distance from ultrasonic sensor
    distanceCm = readDistance();
    
    // Read motion from PIR sensor
    motionDetected = readMotion();
    
    // Print values to Serial Monitor
    Serial.print("Distance: ");
    Serial.print(distanceCm);
    Serial.println(" cm");
    
    Serial.print("Motion: ");
    Serial.println(motionDetected ? "Detected" : "Not Detected");
    
    // Convert to strings for MQTT
    char distanceStr[8];
    dtostrf(distanceCm, 4, 2, distanceStr);  // Convert float to string
    
    char motionStr[2];
    sprintf(motionStr, "%d", motionDetected);
    
    // Publish to MQTT
    client.publish("esp32/ultrasonic", distanceStr);
    client.publish("esp32/pir", motionStr);
  }
}