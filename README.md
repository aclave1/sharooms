# sharooms
Project for sharing documents within a classroom. Supports tiled displays controlled by a cellphone.

# Info:

This was a project for LSU CSC 4243: Interface design. The assignment was to implement a system which interacted with a tiled display, and was driven by a mobile device.

# Usage:

The screens each visit <serverip>:1337/screen to register with the app. The user then visits <serverip>:1337/mobile to view the mobile interface. The user can then either 

* A. Upload an image to the server, and choose which screen to display it on 
* B. Choose an existing image and choose which screen to display it on.

# Architecture: 

When the screens register, their socketIds are put into a hashtable. Each screen is assigned a number based on the order they registered in the room. The user then visits the mobile site and is given these numbers. When the user picks an image and a screen, the room name, image id, and screen id are all sent to the server. The server decides which screen the user wanted and sends the filepath corresponding to the image to the screen with socket.io. The screen then immediately trys to download the picture and display it!

Here's a diagram: 

![Sharooms architecture](http://i.imgur.com/biKtI8w.png)

Setup:

run ./configure

ctrl+c to stop grunt

node app.js
