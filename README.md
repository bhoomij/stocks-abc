Prerequisite:
- Environment: Node 18, Npm 10.2.3
- Registered account with brevo to send email alerts and api key

Steps:
- clone repo
- `cd stocks-abc`
- `npm install`
- `cp .env.example .env` and update envs
- update `symbols.txt` file with Indian stock symbols you want to get alerts for
- `node ./main.js`
