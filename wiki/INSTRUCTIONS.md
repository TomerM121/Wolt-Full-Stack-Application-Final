# System Design Wolt Documentation


This document outlines the orderly process of compiling, running, and using the system, including the backend servers, MongoDB database, and the client applications.

---

## 1. Environment Setup

**Instructions for Running:**

**1. Build and start the containers in the background:**
```bash
docker compose up -d --build
```

**2. To run the web app enter in your browser:**
```bash
http://localhost:5173
```

**3. To run the mobile app enter in the command line from the root directory:**
```bash
cd ui/mobile
npm install
npx expo start -c   
```
**4. To run from mobile android emulator**
Wait for the QR code to appear in the terminal, then press a.
(Note: Make sure your Android emulator is already running in the background before doing this).

**5. To run from mobile ios emulator**
Wait for the QR code to appear in the terminal, then press i.
(Note: Make sure your ios emulator is already running in the background before doing this).

## 2. Web Screenshots
When opening the web aplication this is the home screen:
(you can choose to login, register or just browse restaurants)

<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/640d9c47-97b6-4085-bf25-4279ccdddd74" />
This is the registartion form:

<img width="1920" height="934" alt="image" src="https://github.com/user-attachments/assets/7f0cecbc-d90a-423b-8fd2-dee2748914e3" />

And this is the login form:

<img width="1920" height="961" alt="image" src="https://github.com/user-attachments/assets/b008422a-36ac-4d7f-b5be-e9b0d9042202" />

This is the home screen where you can browse restaurants

<img width="1920" height="928" alt="image" src="https://github.com/user-attachments/assets/c57527b0-e7a9-4862-9495-09361a1dbef3" />

To make an order, first click on a restaurant:

<img width="1916" height="945" alt="image" src="https://github.com/user-attachments/assets/8ad21ff6-1372-49d3-b71e-d2736b1f7bcd" />

Then click on a product and click on 'add to cart':

<img width="1920" height="953" alt="image" src="https://github.com/user-attachments/assets/8771f9d0-2033-4301-b7e0-3abac1064d92" />

Click on 'my cart' for watching and managing your active orders, and order history:

<img width="1913" height="955" alt="image" src="https://github.com/user-attachments/assets/da00d342-c785-4a56-99cf-109e9d0af6cf" />

Click on 'Owner Dashboard' to edit your restaurants details, and add new products:

<img width="1920" height="913" alt="image" src="https://github.com/user-attachments/assets/4b983c4f-f977-4cde-bec7-a3b4a20f1ea5" />

You can also search for products and restaurants then contain a certain string:

<img width="1914" height="932" alt="image" src="https://github.com/user-attachments/assets/55a100f6-d18a-4480-828d-b064bb174758" />

## 3. Mobile Screenshots
This is the registartion form:

<img width="373" height="810" alt="image" src="https://github.com/user-attachments/assets/cf92647e-aaa8-4ac1-96bc-525fa039d406" />


And this is the login form:

<img width="369" height="805" alt="image" src="https://github.com/user-attachments/assets/db802c2e-38b1-440c-a78a-a3b805ab1da8" />


This is the home screen where you can browse restaurants

<img width="364" height="813" alt="image" src="https://github.com/user-attachments/assets/e624740b-d5a8-4c53-a2df-7c5aab149822" />


To make an order, first click on a restaurant:

<img width="377" height="816" alt="image" src="https://github.com/user-attachments/assets/51ffb68b-cbd1-464b-8412-241f6feb9b6f" />


Then click on the plus next to the product that you want:

<img width="369" height="807" alt="image" src="https://github.com/user-attachments/assets/3d9e9133-29d7-42f8-a84c-0a4c2cfddaae" />


Click on 'orders' for watching and managing your active orders, and order history:

<img width="367" height="807" alt="image" src="https://github.com/user-attachments/assets/de7a3eb4-5e7a-44b9-9fa8-0d41ae184f99" />

Click on 'account' to see your profile details:

<img width="355" height="801" alt="image" src="https://github.com/user-attachments/assets/0154096c-e4c6-4263-b0cd-23093ecd9011" />

From that screen you can also logout, change to dark mode and edit youe restaurant:

<img width="353" height="781" alt="image" src="https://github.com/user-attachments/assets/5ba408ea-161d-4a4e-a37c-c9f12e007dd5" />

Here you can edit your restaurant details, and edit your restaurant products

(Note: to edit your restaurant from the profile view click on 'Manage My Restaurant')


You can also search for products and restaurants then contain a certain string:

<img width="380" height="809" alt="image" src="https://github.com/user-attachments/assets/0b6b485b-85b0-461f-9c9f-4e0f0a084e1b" />


