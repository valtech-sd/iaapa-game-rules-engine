#!/bin/sh

#
# This is a SHELL SCRIPT can run YARN commands inside the rules-engine container's simulator directory.
# This script displays a console with choices. Pick a number to run a specific command.
#

# Change to the simulator directory inside the container
cd /home/node/simulator || exit

# Loop until the user chooses to exit

until [ "$action" -eq "0" ]; do
  # clear the screen
  clear
  # Show a menu of actions
  echo "Pick which action to run:"
  echo "0. Exit"
  echo "1. Run a simulated game with generated data (random players)"
  echo "2. Display the Game Screen UI (shows game status as a game runs)"
  echo "3. Display the Leaderboard UI (shows leaderboard messages when received)"
  echo "4. Force a publishing of the current daily leaderboard"
  echo "5. Force game mode to end"
  # Read the user's choice
  read -p "Action: " action
  # Decide what to do based on the user's choice
  case $action in
      0)
          exit 0
          ;;
      1)
          yarn sim:showcontrol
          ;;
      2)
          yarn sim:unity-gamescreen
          ;;
      3)
          yarn sim:unity-leaderboard
          ;;
      4)
          yarn udp:leaderboardget
          ;;
      5)
          yarn udp:gamemodeend
          ;;
      *)
          echo "Invalid option"
          ;;
  esac

done;
