# Rhythmworks-Dev-Recon

Bank reconciliation project by Rhythmworks Solutions.

### Setting Up your Environment

It is recommended that you work on Linux (preferably Ubuntu/Debian) since the Postgres adapters work great on Linux. The development environment can also be setup on Windows using the default Python installer from [python.org](https://python.org). 

On a Debian-based distribution you can install the Python development environment with the following commands - 
```bash
sudo apt-get update
sudo apt-get install python3-pip python3-dev python3-venv libpq-dev postgresql postgresql-contrib
```

For Windows, simply download the Python installer. The development and virtual environment bindings are pre-installed. Install PostgreSQL from the installer given [here](https://www.postgresql.org/download/windows/). 


#### Using Python Virtual Environment

Using a virtual environment, ensures that dependency conflicts are avoided and same versions of all the dependencies are maintained by everyone.
Create and activate the virtual environment for the Django backend with - 

```bash
cd backend
python3 -m venv env
source env/bin/activate 
```
Install the required dependencies with - 
```bash
pip3 install -r requirements.txt
```
After you are done with the project development work, deactivate the environment with the ```deactivate``` command. 

Everytime you begin the development work, always activate the virtual environment with ```source env/bin/activate```.


#### Installing Angular

Download and install the following pre-requisites for Angular 10 -

**Ensure that the version specified below matches your installation**. 

Check the version on your system with ```node -v```

- Node JS 12.18.3 (LTS): [Instructions for Ubuntu](https://github.com/nodesource/distributions/blob/master/README.md)
- NPM 6.14.6 (Is automatically installed with NodeJS)

Note: If you already have a different version of NodeJS installed, NVM (Node Version Manager can easily manage and maintain multiple versions of NodeJS)

Install NVM with -  
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
Now install v12.18.3 with 

```bash
nvm install 12.18.3
```

Finally, install Angular with -

```bash
npm install -g @angular/cli
```

Run the frontend development server with - 

```bash
cd frontend 
ng serve --open 
```