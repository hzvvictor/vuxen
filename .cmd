npm init -y
npm install typescript @types/node --save-dev

npx tsc --init

npm i --save-dev @types/express

md src

echo. > src/index.ts

echo. > .gitignore
echo node_modules > .gitignore

echo. > .npmignore
echo node_modules > .npmignore

git init
git remote add origin https://github.com/hzvvictor/vuxen.git
git branch -M master