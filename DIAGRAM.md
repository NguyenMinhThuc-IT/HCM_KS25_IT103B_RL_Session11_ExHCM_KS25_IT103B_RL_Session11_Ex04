# So do Luong Du lieu (Data Flow Diagram - Smart Home)

mermaid
graph TD
A([Nguoi dung / Sensor System]) -->|Gui yeu cau hoac kich hoat| B[triggerScene Dispatcher]
A -->|Thong tin thiet bi moi| C[createDevice Module]

C -->|Tham dinh Validator| C1{Du lieu hop le?}
C1 -->|Khong| C2[Tra ve loi Validator]
C1 -->|Co| C3[(Smart Home Device List)]

B -->|Tra cuu Scene| D{Scene Name?}
D -->|GoodMorning| E[Turn ON Lights & AC]
D -->|LeaveHome| F[Turn OFF Heavy Devices & Lock Door]
D -->|SleepMode| G[Dim Lights & Set AC Low Power]
D -->|Unknown Scene| H[Edge Case: Bao loi Scene]

E --> C3
F --> C3
G --> C3

C3 -->|Truy van trang thai On/Off| I[calculateEnergy Engine]
I -->|Tong cong suat P| J{Overload Check P > MaxLimit?}
J -->|Co| K[Edge Case: Trien khai Safety Cutoff Auto Off]
J -->|Khong| L[Xuat Bao cao Nang luong & Trang thai]