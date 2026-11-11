# Server configurations

```ssh
# Switch to root if needed
su -l root

# Update FreeBSD repository catalogue
pkg update -f
```

## Install Chromium

```ssh
pkg install chromium
```

## Install Node

```ssh
pkg install node14-14.16.1
pkg install npm-node14-6.14.8
```

## Install Git

```ssh
pkg install git
```

## Install and Setup MongoDB (Optional when using MongoDB Atlas)

```ssh
pkg install mongodb44-4.4.2
```

| NOTE: if package is not exist you can run `pkg search mongodb` to check available packages

```ssh
# Enable mongodb to run at boot time
sysrc mongod_enable="YES"

# Start mongodb
service mongod start

# Enable mongodb to run at boot time
sysrc mongod_enable="YES"
```

## Install and Setup Redis

```ssh
pkg install redis5-5.0.12

# Enable redis to run at boot time
sysrc redis_enable="YES"

# Start redis
service redis start
```

## Install and Setup Nginx

```ssh
pkg install nginx-1.18.0_49,2

# Enable nginx to run at boot time:
sysrc nginx_enable="YES"

# Update Nginx configuration
# Open /usr/local/etc/nginx/nginx.conf
ee /usr/local/etc/nginx/nginx.conf
```

### Create a rule that will proxy_pass all /api/ requests to nodejs app

```ssh
location /api/ {
    proxy_pass http://127.0.0.1:8080/;

    # pass original ip address
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # websocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Make sure that nginx config is still valid

```ssh
nginx -t
```

### Run nginx

```ssh
service nginx start
```

### Install ffmpeg

```ssh
pkg install ffmpeg-4.3.2_1,1
```

### Install certificate

```ssh
pkg install py37-certbot-1.13.0,1
pkg install py37-certbot-nginx-1.13.0

certbot --nginx -d qa-api.shabbat.com
```

## Deployment

We have bitbucket pipeline that builds and deploy the built server into `/home/ec2-user/projects/server/dist` folder.

We have bitbucket pipeline that builds and deploy the built frontend into `/home/ec2-user/projects/frontend/dist` folder.

For bitbucket pipeline setup, you need to add repository variables and add IP address for the server in the following link.

https://bitbucket.org/shabbat/frontend/admin/addon/admin/pipelines/ssh-keys
https://bitbucket.org/shabbat/server/admin/addon/admin/pipelines/ssh-keys

## Install PM2

```ssh
npm install pm2 -g
```

### To run the server on the freebsd instance

```ssh
cd /projects/server
pm2 start npm --name server --log /var/log/shabbat/server.log -- run start
```

### To run the media processor on the freebsd instance

```ssh
cd /projects/server
pm2 start npm --name "media-processor" --log /var/log/shabbat/media-processor.log -- run media-processor
```

### To run the worker on the freebsd instance

```ssh
cd /projects/server
pm2 start npm --name "worker" --log /var/log/shabbat/worker.log -- run worker
```
