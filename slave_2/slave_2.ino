#include <Adafruit_NeoPixel.h>
#include <BluetoothSerial.h>
#include <Vector.h>

const char *pin = "9123";
String device_name = "ESP32-BT-Slave";
BluetoothSerial SerialBT;

const uint8_t leds_count = 14;
Adafruit_NeoPixel leds[leds_count] = {
  Adafruit_NeoPixel(300, 13, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(400, 12, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(260, 14, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(450, 27, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(370, 26, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(330, 25, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(150, 33, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(460, 32, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(30, 23, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(150, 22, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(320, 15, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(150, 2, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(150, 4, NEO_GRB + NEO_KHZ800)
};

uint32_t OFF = leds[0].Color(0, 0, 0);
uint32_t WHITE = leds[0].Color(255, 255, 255);
uint32_t RED = leds[0].Color(255, 0, 0);
uint32_t GREEN = leds[0].Color(0, 255, 0);
uint32_t DEFAULT_COLOR = leds[0].Color(0, 50, 0);
uint32_t WHITE_WARM = leds[0].Color(255, 160, 30);

class NewRoom {
public:
  int pin = 0;
  int count = 0;
  Vector<int> room_things;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////
bool DEBUG = true;

bool bt_last_state = false;
char last = 0;
String message = "";
NewRoom LastRoom[14];
NewRoom SendRoomReal[14];

uint64_t timer = 0;

int arr5[15] = { 124, 125, 126, 127, 154, 155, 178, 179, 202, 203, 226, 249, 250, 251, 252 };
int arr4[18] = { 134, 135, 136, 137, 138, 163, 167, 189, 191, 192, 193, 215, 241, 267, 268, 269, 270, 271 };
int arr0[12] = { 111, 112, 113, 138, 164, 165, 166, 190, 216, 242, 243, 244 };
int arr3[22] = { 132, 133, 166, 167, 200, 201, 234, 235, 268, 269, 301, 302, 303, 333, 334, 167, 199, 232, 264, 265, 298, 299 };
////////////////////////////////////////////////////////////////////////////////////////////////////////////

void sber() {
  for (int j = 0; j < 15; j++) {
    leds[5].setPixelColor(arr5[j], GREEN);
  }
  for (int j = 0; j < 18; j++) {
    leds[4].setPixelColor(arr4[j], GREEN);
  }
  for (int j = 0; j < 12; j++) {
    leds[0].setPixelColor(arr0[j], GREEN);
  }
  for (int j = 0; j < 22; j++) {
    leds[3].setPixelColor(arr3[j], GREEN);
  }

  leds[5].show();
  leds[4].show();
  leds[0].show();
  leds[3].show();
}

void parseMessage(String message) {
  message.remove(0, 1);

  int sum = 0;
  int k = 0;
  while (message[k] != ';') {
    sum = (sum * 10) + (message[k] - '0');
    k++;
  }

  message.remove(0, k + 1);

  NewRoom Room[sum];

  for (int i = 0; i < sum; i++) {
    Room[i].pin = (((message[2] - '0') * 10) + (message[3] - '0')) - 10;
    Room[i].count = message[5] - '0';
    int j = 7;

    int things[Room[i].count * 2];

    for (int n = 0; n < Room[i].count * 2; n++) {
      things[n] = 0;
      while (message[j] != ';') {
        things[n] = (things[n] * 10) + (message[j] - '0');
        j++;
      }
      j++;
      things[n]--;
      if (n % 2 != 0) {
        things[n] = (things[n] - things[n - 1]) + 1;
      }
      Room[i].room_things.push_back(things[n]);
    }
    message.remove(0, j + 2);
  }

  NewRoom R;

  for (int i = 0; i < sum; i++) {
    for (int j = 0; j < sum - 1; j++) {
      if (Room[j].pin > Room[j + 1].pin) {
        R = Room[j];
        Room[j] = Room[j + 1];
        Room[j + 1] = R;
      }
    }
  }

  int currentPin = Room[0].pin;

  NewRoom SendRoom[14];
  for (int i = 0; i < 14; i++) {
    SendRoom[i].pin = 69;
  }

  NewRoom finalSend;
  finalSend.pin = currentPin;
  int flatsCount = 0;

  for (int i = 0; i < sum; i++) {
    if (Room[i].pin == currentPin) {
      finalSend.count += Room[i].count;
      for (int j = 0; j < Room[i].count * 2; j++) {
        finalSend.room_things.push_back(Room[i].room_things[j]);
      }
    } else {
      SendRoom[finalSend.pin] = finalSend;

      currentPin = Room[i].pin;
      Vector<int> empty;
      finalSend.pin = currentPin;
      finalSend.count = Room[i].count;
      finalSend.room_things = empty;
      for (int j = 0; j < Room[i].count * 2; j++) {
        finalSend.room_things.push_back(Room[i].room_things[j]);
      }
    }
    SendRoom[finalSend.pin] = finalSend;
  }

  for (int i = 0; i < 14; i++) {
    SendRoomReal[i] = SendRoom[i];
  }
}

void setup() {
  Serial.begin(115200);

  SerialBT.begin(device_name);
  SerialBT.setPin("9123");

  allLedsBegin();
  allLedsSetBrightness(255);
  allLedsFill(OFF);
  allLedsShow();
}

void loop() {
  if (SerialBT.available() > 0) {
    char c = SerialBT.read();
    if (c == 'A'){ 
      message = "";
    }

    if ((c != 'A') && (c != 'Z')) {
      message += c;
    }

    if (c == 'Z') {
      Serial.println(message);
      parseMessage(message);

      for (int i = 0; i < 14; i++) {
        if (SendRoomReal[i].pin != 69) {
          for (int j = 0; j < SendRoomReal[i].count; j++) {
            leds[SendRoomReal[i].pin].fill(WHITE, SendRoomReal[i].room_things[j * 2], SendRoomReal[i].room_things[(j * 2) + 1]);
            Serial.print("Pin: ");
            Serial.print(SendRoomReal[i].pin);
            Serial.print("  start: ");
            Serial.print(SendRoomReal[i].room_things[j * 2]);
            Serial.print("  end: ");
            Serial.println(SendRoomReal[i].room_things[(j * 2) + 1]);
          }
          leds[SendRoomReal[i].pin].show();
        }
      }
    }
  }










  if ((millis() - timer) >= 1000){
    bool a = SerialBT.connected();
    if (a && !bt_last_state){
      Serial.println("CUM");
      bt_last_state = true;
    } 

    if (!a){
      SerialBT.disconnect();
      bt_last_state = false;
    }

    timer = millis();
  }

}



void allLedsBegin() {
  for (int i = 0; i < leds_count; i++) {
    leds[i].begin();
  }
}

void allLedsSetBrightness(uint8_t value) {
  for (int i = 0; i < leds_count; i++) {
    leds[i].setBrightness(value);
  }
}

void allLedsFill(uint32_t color) {
  for (int i = 0; i < leds_count; i++) {
    leds[i].fill(color);
  }
}

void allLedsShow() {
  for (int i = 0; i < leds_count; i++) {
    leds[i].show();
  }
}