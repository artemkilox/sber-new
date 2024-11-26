#include <esp_now.h>
#include <Adafruit_NeoPixel.h>
#include <WiFi.h>
//#include <Vector.h>

uint8_t broadcastAddress[] = { 0x40, 0x22, 0xD8, 0xEA, 0x7F, 0xEC };
//40:22:D8:EA:7F:EC родная
//A0:B7:65:DD:87:98 тестовая
/////////////////////////////////////////////////

typedef struct struct_message {
    char text[100]; // Размер массива должен быть достаточно большим для хранения вашего сообщения
} struct_message;

struct_message myData;

/////////////////////////////////////////////////

String message = "";
int rooms_count = 0;
bool tick = false;
bool mode = false;
unsigned long timer = 0;

/////////////////////////////////////////////////


const uint8_t leds_count = 3;
Adafruit_NeoPixel leds[leds_count] = {
  Adafruit_NeoPixel(300, 13, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(300, 12, NEO_GRB + NEO_KHZ800),
  Adafruit_NeoPixel(300, 14, NEO_GRB + NEO_KHZ800)
};

uint32_t OFF = leds[0].Color(0, 0, 0);
uint32_t WHITE = leds[0].Color(255, 255, 255);
uint32_t RED = leds[0].Color(255, 0, 0);
uint32_t DEFAULT_COLOR = leds[0].Color(0, 50, 0);

////////////////////////////////////////////////

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {

    Serial.print("Last Packet Send Status: ");

    Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");

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

void setup() {
  Serial.begin(115200);

  Serial2.begin(9600);  // arduino
  Serial2.write('Z');

  pinMode(4, OUTPUT);  // механизм
  digitalWrite(4, LOW);

  // allLedsBegin();
  // allLedsSetBrightness(255);
  // allLedsFill(OFF);
  // allLedsShow();

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  strcpy(myData.text, "H");
  esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));

  // esp_now_register_send_cb(OnDataSent);

  // esp_now_peer_info_t peerInfo;

  // memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  // peerInfo.channel = 0;  // Использовать тот же канал
  // peerInfo.encrypt = false; // Шифрование отключено

  // if (esp_now_add_peer(&peerInfo) != ESP_OK) {
  //   Serial.println("Failed to add peer");
  //   return;
  // }
}

const char *msg = "H";

void loop()
 {
  if ((mode) && ((millis() - timer) >= 2000000)) {
    Serial2.write('Z');
    allLedsFill(OFF);
    allLedsShow();
    mode = false;
  }

  if (Serial.available() > 0) {
    char c = Serial.read();
    Serial.print("Mess: ");
    Serial.println(c);

    if (c == 'P')
    {
      message = "";
      tick = !tick;
      digitalWrite(4, HIGH);
      delay(300);
      digitalWrite(4, LOW);

      digitalWrite(2, HIGH);
      delay(300);
      digitalWrite(2, LOW);

      if (tick) {
        Serial2.write('X');
        allLedsFill(WHITE);
        allLedsShow();
        mode = true;
        timer = millis();
      } else {
        Serial2.write('Z');
        allLedsFill(OFF);
        allLedsShow();
      }
    }

    if (c == 'H')
    {
      Serial.println("foo");
      strcpy(myData.text, msg);
      esp_now_send(broadcastAddress, (uint8_t *)&myData, sizeof(myData));
      Serial.println("bar");
    }
  }
}


//A;1;S;1;2;3;F;Z
