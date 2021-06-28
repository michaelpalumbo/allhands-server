**note: this readme is outdated, needs to be reqritten for heroku-hosted allhands servers... stay tuned... or open a new issue on the gihtub and tag @michaelpalumbo**

# allhands-server
In this self-hosted version of allhands, one person in your group will be running the server node on their own machine, and the rest of the group collaborators will need to connect to that server. This page provides installation and usage instructions, as well as how to configure a router to allow this to work. 

## Requirements

- This guide assumes you have some basic understanding of working with a command line interface; if not, try following [this guide first, thanks!](https://launchschool.com/books/command_line/read/introduction)

- Nodejs installed. To check if its installed, open a terminal and run ```node -v``` which should return a version number. If there's an error, you need to install it, by [downloading an installer from here.](https://nodejs.org/en/download/current/) 


### Install

1. Download the self-hosted version at 
2. cd into the /allhands folder
3. Install dependencies: ```npm install```

## How To:

- Only one person in your group should run the server at a given time. If you are NOT the one running the server, use one of several available [allhands apps](https://www.npmjs.com/package/allhands)

- The server is run separately from allhands. If you are running the server, you'll still need to run allhands in order to send-receive data. 

- In order to allow others to connect to your server instance, your computer will need to be accessible to the public internet. The way to do this is to set up a port-forwarding rule. 

##### Port forwarding
Follow these instructions on setting up a port forwarding rule. When you reach **part 3** of the instructions, you might need to search for specific instructions for your particular router, for example the [Bell HomeHub 3000](https://www.youtube.com/watch?v=htDOe8eyvtA).

When creating the rule for allhands, you'll need to _**open port 8081 (UDP & TCP).**_

### Run the server

1. Open a new CLI window, and cd into the /allhands directory
2. Run the server: ```npm run server"
3. Now the server will be waiting for connections from other allhands clients. To test it yourself, open yet another CLI window, cd into /allhands, and run ```npm test```. Watch both CLI windows, you should see the test window sending data, while the server window reporting it has received this data.
4. Get your public IP address for this computer at [https://www.whatsmyip.org/](https://www.whatsmyip.org/). Your collaborators will need this address in order to connect to you. 

### Connect to the server as a client

1. When running the server, you'll still need to run the allhands app. In a new CLI window, get the most recent version with 
```shell
npm install -g allhands
```

2. In this new CLI window, run with: 
```shell
allhands
```

3. When asked which server type to use, select "Self-Hosted", and then enter "localhost" for the server address. 

## Usage

allhands is meant to work alongside other programs that can send/receive OSC data. Once you have the allhands app running and connected to the server, you should open your preferred program and try sending/receiving data. Example code for puredata and max/msp can be found at https://github.com/michaelpalumbo/allhands
