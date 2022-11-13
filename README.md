# Valtech Themed Entertainment Studio, IAAPA 2022 "Beat the Buzz" Backend

This is the backend (a Docker stack) for the "Beat the Buzz" game created by Valtech for IAAPA 2022. 

![IAAPA AFTERPARTY BEAT THE BUZZ 2022](./documentation/media/iaapa-afterparty-beat-the-buzz-2022.jpg)

## Game Description

### Game Play

Feel your turn and slap the station as fast as you can before the buzz ends! Six players play from a podium console where they interpret signals to know when it is their turn to score as much as possible before the turn ends. If players score past their turn, they benefit the other player whose turn it is

### Theory of Operation

Each player approaches a podium stastion and uses an RFID card to check into one of six stations. Each station has a feedback device to indicate their turn and a scoring button. Both devices as well as lights and other elements are connected to local hardware, which is in turn connected to show control.

The physical game elements are controlled by a central show control server, which is responsible for:

* Keeping track of the game modes: Loading, Playing, Idle, etc.
* Controlling sounds, lights, etc.
* Sending UDP signals to a game server.

In addition, a backend game server (this stack) is keeping track of player game state and a leaderboard.

Finally, a UNITY application monitors a message bus for game state changes and updates the game UI accordingly.

This project represents the backend game server component.

## Included In This Stack (Game Server)
1. A rules engine service that receives signals from the game show control system (implementing our [Open-Source project Rule Harvester](https://github.com/valtech-sd/rule-harvester))
2. A RabbitMQ message bus used to send signals to the game UI implemented in Unity.
3. A MongoDB database to keep player state.

### Dependencies
1. [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/)
2. (OPTIONAL if you want to run tools locally) [Yarn](https://yarnpkg.com/getting-started/install)

   > ℹ️ **NOTE:** For Mac, if you installed Node via NVM and NVM via HomeBrew, `corepack` may not be installed for you automatically.  [You would then need to install it first before enabling it.](https://stackoverflow.com/a/70094249/3375398)
   
## Running the Project and its Components
   
> ℹ️ **Note:** The first time you run the project, it will take a while to download the images and build the containers. Subsequent runs will be much faster.

### How To Run the Server Stack in PROD mode
1. Edit docker-compose.yml, scroll to the "rules-engine" service:
   * change the `NODE_ENV` environment variable to `production`.
   * Uncomment the line for the "Production Command".
2. In Terminal, go to local directory root folder for the project.
3. Run `docker compose up -d` to start the stack.

> ℹ️ **Note:** In PROD mode, if you make code changes to the server stack code, you'll need to restart the docker stack.

### How To Run the Server Stack in DEV mode
1. Edit docker-compose.yml, scroll to the "rules-engine" service:
   * change the `NODE_ENV` environment variable to `dev`.
   * Uncomment the line for the "Dev Command".
2. In Terminal, go to local directory root folder for the project.
3. Run `docker compose up -d` to start the stack.

> ℹ️ **Note:** In DEV mode, if you make code changes to the server stack code, nodemon will automatically restart the server.

### The server is running, now what?

With the server running, you can send UDP signals.

### How to Run the Simulator Tools

The simulator tools allow you to send simulated signals to the stack. This is useful for testing the stack and the rules engine.

The commands can be run as follows:
```bash
$ ./docker-compose-run.sh simulator <yarn command>
```

See the YARN commands in the file `simulator/package.json` for the available commands.

### How to import players into the iaapa db in the mongodb service

The process is:
1. Copy the data file to the `mongoimport` folder. Be sure to use the structure of the provided example-import.csv
2. Run the `mongoimport` command (below).
3. Verify the data was imported correctly.

```bash
./docker-compose-mongoimport.sh <file name>
```

> **Notes:** 
> - The `mongoimport` command will fail if the file is not in the `./mongodb/mongoimport` folder.
> - The import will do an UPSERT, so if you run the command again, it will update the existing records based on the rfid field.

## Project Lifecycle

### How To Pull the Project
1. Download all needed tools from listed software requirements above.
2. [Clone the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) from GitHub.

### How To Edit the Project
1. Open project files in any editor to update and save.
2. Depending on the files changed, you might need to restart the server stack.

### How To Push Changes to the Project (on command line GIT)
1. `git status` to check file changed.
2. `git restore {file}` to unstage files that should not be commited.
3. `git add {file}` to stage files that should be commited.
4. `git commit -m "{change info}"` to commit the files.
5. `git push` to push changes to GitHub.

Alternatively, use a GUI tool like [GitHub Desktop](https://desktop.github.com/) or [Sourcetree](https://www.sourcetreeapp.com) to push changes to GitHub.

## Credits

**Game Design**
Jenny Lim, Erica McCay

**Backend Development**
Daniel Morris, Le Cabrera, Eric Soto

**Unity Development**
Natan Couture-Dumais, Le Cabrera

**Project Leadership**
Victoria Gonzalez, Eric Soto

**Game Show Control**
Joe Fox, Chris Large

## Roadmap

- Explain the examples in simulator/examples
- Add the data contract documentation for the UDP messages to be received
- Explain how different UDP messages control different parts of the game backend
- Add the data contract documentation for the RabbitMQ messages to be sent for the UI