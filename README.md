# IAAPA 2022 Docker Stack

This is the Docker stack for a game created by Valtech for IAAPA 2022. 

## Included In This Stack
1. Rules Engine (using Rule Harvester)
1. Message Bus (using Rabbit MQ)
1. Database (using MongoDB)

## Software Requirements
1. [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/)
1. [Yarn](https://yarnpkg.com/getting-started/install)

   > ℹ️**INFO:** For Mac, if you installed Node via NVM and NVM via HomeBrew, `corepack` may not be installed for you automatically.  [You would then need to install it first before enabling it.](https://stackoverflow.com/a/70094249/3375398)

## How To Pull the Project
1. Download all needed tools from listed software requirements above.
1. [Clone the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) from GitHub.

## How To Run the Project
1. In Terminal, go to local directory root folder for the project.
1. Run `docker compose up -d` to start the stack.

## How To Edit the Project
1. Open project files in any editor to update and save.

## How To Push Changes to the Project
1. `git status` to check file changed.
1. `git restore {file}` to unstage files that should not be commited.
1. `git add {file}` to stage files that should be commited.
1. `git commit -m "{change info}"` to commit the files.
1. `git push` to push changes to GitHub.

