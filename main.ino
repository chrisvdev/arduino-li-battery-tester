/*
Notes:

This require an regulated power supply. The power supply must be regulated
to 5V limited to 100mA.

Use 2 relays to control the power supply and the discharge circuit.
the voltmeter is a simple power divider to measure the voltage and
the ammeter is a ACS712 based module.

The discharge circuit can be any type of circuit of your choice.

*/
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
float V_ADJUST = 0.82;

//------ Constants and States ---------------------------------------------------

const int MODE_PIN = 2;
const int CHARGE_OR_DISCHARGE_PIN = 3;
const int BATTERY_PIN = 4;
const int NO = LOW;
const int NC = HIGH;
const float ABSOLUTE = 1.0;
const float TOLERANCE = (ABSOLUTE + .5);
const int RESOLUTION = 100;
const int DENOISE_LIMIT = 5;
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
const int MEMORY_SIZE = 60;
int state = DENOISE;
float voltageMem[MEMORY_SIZE];
float currentMem[MEMORY_SIZE];
uint16_t midPoint[DENOISE_LIMIT];
float voltageNoise = 0;
float ampereNoise = 0;
int count = 0;
bool ledState = false;
bool batteryCharged = false;

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
  voltageNoise = 0;
  ampereNoise = 0;
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

uint16_t getAverageMidPoint()
{
  uint16_t total = 0;
  for (size_t i = 0; i < DENOISE_LIMIT; i++)
  {
    total += midPoint[i];
  }
  return total / DENOISE_LIMIT;
}

String denoise()
{
  if (count < DENOISE_LIMIT * 2)
  {
    if (count == 0)
    {
      battery(DISCONNECT);
      chargeOrDischarge(DISCHARGE);
      clearMemory();
    }
    if (count < DENOISE_LIMIT)
    {
      ACS.autoMidPoint();
      midPoint[count] = ACS.getMidPoint();
    }
    else
    {
      if (count == DENOISE_LIMIT)
        ACS.setMidPoint(getAverageMidPoint());
      getMeasurement(RESOLUTION, DENOISE);
    }
    count++;
  }
  else
  {
    count = 0;
    state = batteryCharged ? DISCHARGING : CHARGING;
  }
  return ",\"voltageNoise\":" + String(voltageNoise) + ",\"ampereNoise\":" + String(ampereNoise, 2);
}

bool batteryWorking()
{
  float volts = getVolts();
  float amps = currentMem[MEMORY_SIZE - 1];
  return ((voltageMem[0] == 0) || (((volts > 2) && (volts < 5)) && (amps > 0)));
}

String charging()
{
  if (batteryWorking())
  {
    chargeOrDischarge(CHARGE);
    battery(CONNECT);
    getMeasurement(RESOLUTION, MEASURE);
  }
  else
  {
    batteryCharged = true;
    state = DENOISE;
  }
  return ",\"voltage\":" + String(voltageMem[MEMORY_SIZE - 1], 2) + ",\"averageVolt\":" + String(getVolts(), 2) + ",\"ampere\":" + String(currentMem[MEMORY_SIZE - 1], 2) + ",\"averageAmpere\":" + String(getAmperes(), 2) + ",\"mW\":" + String(voltageMem[MEMORY_SIZE - 1] * currentMem[MEMORY_SIZE - 1], 2);
}

String discharging()
{
  if (V1 != 4.73)
  {
    V1 = 4.73;
    V_ADJUST = 0.9904;
  }
  if (batteryWorking())
  {
    chargeOrDischarge(DISCHARGE);
    battery(CONNECT);
    getMeasurement(RESOLUTION, MEASURE);
  }
  else
    state = FINISHED;
  return ",\"voltage\":" + String(voltageMem[MEMORY_SIZE - 1], 2) + ",\"averageVolt\":" + String(getVolts(), 2) + ",\"ampere\":" + String(currentMem[MEMORY_SIZE - 1], 2) + ",\"averageAmpere\":" + String(getAmperes(), 2) + ",\"mW\":" + String(voltageMem[MEMORY_SIZE - 1] * currentMem[MEMORY_SIZE - 1], 2);
}

void finished()
{
  if (count < 5)
  {
    count++;
    battery(DISCONNECT);
    chargeOrDischarge(DISCHARGE);
    delay(1000);
  }
  else
    delay(32767);
}

//------ Main ------------------------------------------------------------------

void setup()
{
  clearMemory();
  Serial.begin(115200);
  Serial.println("{\"mode\":\"STARTING\"}");
  ACS.autoMidPoint();
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(CHARGE_OR_DISCHARGE_PIN, OUTPUT);
  pinMode(BATTERY_PIN, OUTPUT);
  pinMode(8, OUTPUT);
  digitalWrite(8, HIGH);
  pinMode(9, OUTPUT);
  digitalWrite(9, LOW);
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
  delay(990);
}