//------ Ammeter ---------------------------------------------------------------
#include "ACS712.h"
// Arduino UNO has 5.0 volt with a max ADC value of 1023 steps
// ACS712 5A  uses 185 mV per A
// ACS712 20A uses 100 mV per A
// ACS712 30A uses  66 mV per A
// ESP 32 example (requires resistors to step down the logic voltage)
// ACS712  ACS(25, 5.0, 4095, 185);
ACS712 ACS(A1, 5.0, 1023, 66);
const float ACS_ADJUST = 0.9;
//------ Voltmeter --------------------------------------------------------------
const float V1 = 4.95;
const float R1 = 996500; // 1M
const float R2 = 99200;  // 100K
const int VOLTAGE_PIN = A0;
const float V_ADJUST = 1.005;
//------ Constants and States ---------------------------------------------------
const int MODE_PIN = 2;
const float ABSOLUTE = 1.0;
const float TOLERANCE = (ABSOLUTE + .5);
const int RESOLUTION = 100;
const String DENOISE = "DENOISE";
const String MEASURE = "MEASURE";
float voltageNoise = 0;
float ampereNoise = 0;
int ledState = LOW;

void blink()
{
  if (ledState == LOW)
    ledState = HIGH;
  else
    ledState = LOW;
  digitalWrite(LED_BUILTIN, ledState);
}

float maxVoltage() { return V1 / (R2 / (R1 + R2)); }

float volts() { return (analogRead(VOLTAGE_PIN) * (V1 / 1023.0)) / (R2 / (R1 + R2)); }

float getVoltage() { return volts() * V_ADJUST; }

float getAmperage() { return ACS.mA_DC() * ACS_ADJUST; }

String getMeasurement(int resolution, String mode)
{
  String message = "";
  float avgV = 0;
  float avgA = 0;
  for (int i = 0; i < resolution; i++)
  {
    blink();
    avgV += getVoltage();
    avgA += getAmperage();
    delay((1000 / resolution) - 1);
  }
  avgV /= resolution;
  avgA /= resolution;
  if (mode == DENOISE)
  {
    if (avgV > voltageNoise)
      voltageNoise = avgV * TOLERANCE;
    if (avgA > ampereNoise)
      ampereNoise = avgA * TOLERANCE;
  }
  else
  {
    if (avgV < voltageNoise)
      avgV = 0.0;
    if (avgA < ampereNoise)
      avgA = 0.0;
  }
  // This message was thought to be a JSON message to be captured by a node.js server
  return String("{\"mode\":\"" + mode + "\",\"voltage\":" + String(avgV, 2) + ",\"mAmps\":" + String(avgA, 2) + ",\"watts\":" + String(((avgV * avgA) / 1000), 2) + ",\"noiseWatts\":" + String((voltageNoise * ampereNoise) / 1000, 2) + "}");
}

void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(MODE_PIN, INPUT);
  ACS.autoMidPoint();
  Serial.begin(115200);
  Serial.println("Voltaje máximo: " + String(maxVoltage()));
  for (size_t i = 0; i < 5; i++)
    Serial.println(getMeasurement(RESOLUTION, DENOISE));
}

void loop()
{
  Serial.println(getMeasurement(RESOLUTION, digitalRead(MODE_PIN) ? DENOISE : MEASURE));
}