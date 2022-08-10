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

float V1 = 4.5;
const float R1 = 996500; // 1M
const float R2 = 99200;  // 100K
const int VOLTAGE_PIN = A0;
const float V_ADJUST = 0.85;

//------ Constants and States ---------------------------------------------------

const int MODE_PIN = 2;
const int CHARGE_OR_DISCHARGE_PIN = 3;
const int BATTERY_PIN = 4;
const int NO = LOW;
const int NC = HIGH;
const float ABSOLUTE = 1.0;
const float TOLERANCE = (ABSOLUTE + .5);
const int RESOLUTION = 100;
const bool CHARGE = true;
const bool DISCHARGE = false;
const bool CONNECT = true;
const bool DISCONNECT = false;
enum states
{
  DENOISE,
  CHARGING,
  DISCHARGING,
  FINISHED,
  MEASURE
};
const int MEMORY_SIZE = 10;
int state = DENOISE;
float voltageMem[MEMORY_SIZE];
float currentMem[MEMORY_SIZE];
float voltageNoise = 0;
float ampereNoise = 0;
int count = 0;
bool ledState = false;

//------ Functions --------------------------------------------------------------

float maxVoltage() { return V1 / (R2 / (R1 + R2)); }

void blink()
{
  ledState = !ledState;
  digitalWrite(LED_BUILTIN, ledState ? HIGH : LOW);
}

void inputVolts(float voltage)
{
  for (size_t i = 1; i < MEMORY_SIZE; i++)
    voltageMem[i - 1] = voltageMem[i];
  voltageMem[MEMORY_SIZE - 1] = voltage;
}

float getVolts()
{
  float voltage = 0;
  for (size_t i = 0; i < MEMORY_SIZE; i++)
    voltage += voltageMem[i];
  return voltage / MEMORY_SIZE;
}

void inputAmperes(float ampere)
{
  for (size_t i = 1; i < MEMORY_SIZE; i++)
    currentMem[i - 1] = currentMem[i];
  currentMem[MEMORY_SIZE - 1] = ampere;
}

float getAmperes()
{
  float ampere = 0;
  for (size_t i = 0; i < MEMORY_SIZE; i++)
    ampere += currentMem[i];
  return ampere / MEMORY_SIZE;
}

void clearMemory()
{
  for (size_t i = 0; i < MEMORY_SIZE; i++)
  {
    voltageMem[i] = 0;
    currentMem[i] = 0;
  }
}

float volts() { return (analogRead(VOLTAGE_PIN) * (V1 / 1023.0)) / (R2 / (R1 + R2)); }

float getVoltage() { return volts() * V_ADJUST; }

float getAmperage() { return ACS.mA_DC() * ACS_ADJUST; }

void battery(bool connected) { digitalWrite(BATTERY_PIN, connected ? NO : NC); }

void chargeOrDischarge(bool charge) { digitalWrite(CHARGE_OR_DISCHARGE_PIN, charge ? NO : NC); }

void getMeasurement(int resolution, int mode)
{
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
    inputVolts(avgV);
    if (avgA < ampereNoise)
      avgA = 0.0;
    inputAmperes(avgA);
  }
}

String denoise()
{
  if (count < 5)
  {
    getMeasurement(RESOLUTION, DENOISE);
    count++;
  }
  else
  {
    count = 0;
    state = CHARGING;
  }
  return ",\"voltageNoise\":" + String(voltageNoise) + ",\"ampereNoise\":" + String(ampereNoise, 2);
}

String charging()
{
  if (getVolts() < 4.25)
  {
    chargeOrDischarge(CHARGE);
    battery(CONNECT);
    getMeasurement(RESOLUTION, MEASURE);
  }
  else
    state = DISCHARGING;
  return ",\"voltage\":" + String(voltageMem[MEMORY_SIZE - 1], 2) + ",\"averageVolt\":" + String(getVolts(), 2);
}

String discharging()
{
  if (getVolts() > 3.75)
  {
    chargeOrDischarge(DISCHARGE);
    battery(CONNECT);
    getMeasurement(RESOLUTION, MEASURE);
  }
  else
    state = FINISHED;
  return ",\"voltage\":" + String(voltageMem[MEMORY_SIZE - 1], 2) + ",\"averageVolt\":" + String(getVolts(), 2) + ",\"ampere\":" + String(currentMem[MEMORY_SIZE - 1], 2) + ",\"averageAmpere\":" + String(getAmperes(), 2) + ",\"watts\":" + String(voltageMem[MEMORY_SIZE - 1] * currentMem[MEMORY_SIZE - 1], 2);
}

void finished()
{
  battery(DISCONNECT);
  chargeOrDischarge(DISCHARGE);
  delay(1000);
}

//------ Main ------------------------------------------------------------------

void setup()
{
  clearMemory();
  Serial.begin(115200);
  Serial.println("Voltaje máximo: " + String(maxVoltage()));
  ACS.autoMidPoint();
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(CHARGE_OR_DISCHARGE_PIN, OUTPUT);
  pinMode(BATTERY_PIN, OUTPUT);
  battery(DISCONNECT);
  chargeOrDischarge(DISCHARGE);
}

void loop()
{
  String message = "{\"mode\":\"";
  switch (state)
  {
  case DENOISE:
    message += "DENOISE\"" + denoise() + "}";
    break;
  case CHARGING:
    message += "CHARGING\"" + charging() + "}";
    break;
  case DISCHARGING:
    message += "DISCHARGING\"" + discharging() + "}";
    break;
  case FINISHED:
    finished();
    message += "FINISHED\"}";
    break;
  default:
    break;
  }
  Serial.println(message);
}