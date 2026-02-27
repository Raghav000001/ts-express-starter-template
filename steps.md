# Steps to set up the starter template

# 1. Clone the repository
git clone https://github.com/Raghav000001/ts-express-starter-template.git
# (If you want to clone it into a custom folder name:)
# git clone https://github.com/Raghav000001/ts-express-starter-template.git my-awesome-project

# 2. Go into the project folder
cd Express-Typescript-Starter-Project
# (If you used a custom name above, use that instead)
# cd my-awesome-project

# 3. Install all dependencies
npm install
# or shorter version:
# npm i

# 4. Create a .env file and add the PORT variable
# Recommended simple way (creates or overwrites .env):
echo "PORT=3000" > .env

# Alternative (appends if file already exists):
# echo "PORT=3000" >> .env

# 5. Start the development server
npm run dev