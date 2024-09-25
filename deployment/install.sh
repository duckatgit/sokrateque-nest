# upgrade ubuntu version if 18.04
# apt-get update
# apt-get upgrade
# apt-get dist-upgrade
# apt install update-manager-core
# do-release-upgrade
# apt-get remove --purge mysql-server mysql-client mysql-common
# apt-get autoremove
# apt-get autoclean
# nano /etc/mysql/mysql.conf.d/mysqld.cnf (Locate the line that starts with sql_mode and remove NO_AUTO_CREATE_USER from the list of values.)
# apt-get install mysql-server
# nano /etc/nginx/sites-available/default (7.2 to 7.4) then systemctl restart nginx


sudo -s
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get update && apt-get -y upgrade
apt-get install -y nodejs

cd /home/they
git clone https://github.com/tjacowalvis/Sokrateque_Node.js-.git
cd Sokrateque_Node.js-/
npm install
npm run build

nano .env
'''
PORT=3000

SQL_PASSWORD=''
SQL_DATABASE="sokrateque_staging"
SQL_USERNAME='admin'
SQL_PORT=3306
SQL_HOST="localhost"

BASE_URL="https://backend-staging.sokrateque.ai"

SEND_GRID_KEY=""

ALBERT_ENDPOINT="http://albert.sokrates.ai:8004"

MAIL_HOST='smtp.gmail.com' 
MAIL_PORT='465'
MAIL_USER=''
MAIL_PASS=''

CLIENT_URL=

BOX_URI='http://13.81.110.15:8081/cloud/'
'''

# create db
mysql -u root -p
CREATE DATABASE sokrateque_staging;


npm install -g pm2
pm2 start dist/main.js --name backend
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u they --hp /home/they
pm2 save

# Testing
curl http://localhost:3000


nano /etc/nginx/sites-available/nodejs-backend
'''
server {
    listen 80;
    server_name backend-staging.sokrateque.ai;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
'''

rm /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/nodejs-backend /etc/nginx/sites-enabled/
systemctl reload nginx
certbot --nginx -d backend-staging.sokrateque.ai


