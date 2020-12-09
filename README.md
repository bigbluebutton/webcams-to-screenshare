# Introduction

This prototype explores using Chrome to simulate to the role of an MCU in a BigBlueButton session.  

Today, in a BigBlueButton each webcam is an individual stream sent to or received from Kurento.  In regular classes (under 25 studnets) with a few webcams, this approach works very well.  For each webcam shared by a user, the Kurento server receives the incoming webcam stream from the browser and forwards it to all other browsers in the session.  In this sense, Kurento acts as a selective forwarding unit (SFU).  There is no processing of the incoming stream.  The CPU overhead is low.

However, the problem occurs when there are large numbers of users in the meeting.  When a meeting grows to 100 users with 25 of them sharing webcams, for example, this would required Kurent to handle 2,500 webcam streams.   Kurento does not have infinite capacity, so by default there are [settings in BigBlueButton](https://github.com/bigbluebutton/bbb-webrtc-sfu/blob/master/config/default.example.yml#L159-L170) to limit the maximun number of allowed streams in a session or on the server.

To avoid large numbers of streams altogether, one solution is to have Kurento act as a media control unit (MCU).  As a MCU, Kurento would take the incoming webcam streams and composits them into a single outgoing video stream.  In the above scenario, Kurento would receive 25 webcam streams, composite into a single outgoing stream, and broadcast out 100 streams of the composit video (a totoal of 125 streams, not 2,500).  However, compositing live video streams is very CPU intensive. The CPU overhead is high.

# Prototyping using Chrome as a MCU

This project explores compositing the video streams outside of Kurento.  This prototype uses Chrome to fulfill the role of an MCU by using screen sharing to send back a single video stream to Kurento.  

In this prototype, Chrome runs within Docker container and can run on a different server.  When run, chrome is controled using selenium, loads the BigBlueButton, and does the following: 

  1. hides the User list and presentation (the screen becomes a grid of the webcams)
  1. takes presenter control, and
  1. begins screen sharing.

Once it starts, the presentation area for other users then displays a grid of webcams.

## Install

This prototype uses a single BASH script to build the Docker image (if needed) and run the Docker container with a join URL.

~~~
./build-and-run.sh "https://bbb.example.com/bigbluebutton/api/join?fullName=BOT&meetingID=random-9225193&password=mp&redirect=true&checksum=d5c69b10f26eced2e9f9e0019b92c1341a501e36"
~~~
