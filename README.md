# ossyexpress

git 
Server running on http://localhost:4000


You must proxy requests to port 4000 through NGINX so that:

api.kisuku.com  →  Express app on port 4000


Right now, the HTML page loads because Hestia created a static website, but your API is NOT connected to that domain yet.

✅ 2. Cloudflare DNS — YES, you must add the subdomain

You must add this in Cloudflare:

Type	Name	Value	Proxy
A	api	your server IP	OFF (DNS only) ⚠

Why Proxy OFF?
Cloudflare blocks requests to random ports. Your API is served internally on port 4000, so Cloudflare must not interfere.

✅ 3. NGINX config must proxy traffic to Express

Make sure this file exists:

/etc/nginx/sites-available/api.kisuku.com

And inside put:

server {
listen 80;
server_name api.kisuku.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


Then enable it:

sudo ln -s /etc/nginx/sites-available/api.kisuku.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

✅ 4. REMOVE the index.html from the API domain

Right now, Hestia created:

/home/crashten/web/api.kisuku.com/public_html/index.html


This page loads — but we don't want a static site here.

Delete it:

sudo rm /home/crashten/web/api.kisuku.com/public_html/index.html


Your API domain should forward EVERYTHING to Express, not serve HTML.

✅ 5. Update your React frontend

Replace:

axios.get("http://localhost:4000/api/data")


With:

axios.get("https://api.kisuku.com/api/data")


React must call the domain, NOT localhost.

🟢 After all this, test it:
curl http://api.kisuku.com/api/data


You should get:

{
"message": "This is data from the Express server",
"time": "2025-12-09T..."
}

🚀 Summary — Here’s what you needed:

✔ Create DNS record in Cloudflare
✔ Create /etc/nginx/sites-available/api.kisuku.com
✔ Enable it with symlink
✔ Remove static HTML page
✔ Ensure PM2 keeps Express running on port 4000
✔ Update React to call the new API domain

If you want, I can check your NGINX config or Cloudflare DNS screenshot — just send it.

You said:
ubuntu@crashten:~$ ls
hst-install-ubuntu.sh  hst-install.sh  hst-install.sh.1  tmp  web
ubuntu@crashten:~$ cd /etc/nginx/sites-available/api.kisuku.com
-bash: cd: /etc/nginx/sites-available/api.kisuku.com: Not a directory
ubuntu@crashten:~$
ChatGPT said:

That’s correct — the file:

/etc/nginx/sites-available/api.kisuku.com


is a file, not a directory.
You cannot cd into it.

To open or edit it, you do:

sudo nano /etc/nginx/sites-available/api.kisuku.com

To confirm it exists:
ls -l /etc/nginx/sites-available/


You should see:

-rw-r--r-- 1 root root   xxx api.kisuku.com

✅ What you need to do next
1. Open the NGINX file and paste the proxy config
   sudo nano /etc/nginx/sites-available/api.kisuku.com


Paste:

server {
listen 80;
server_name api.kisuku.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


Save:

CTRL + O
ENTER
CTRL + X

2. Make sure the symlink exists
   sudo ln -s /etc/nginx/sites-available/api.kisuku.com /etc/nginx/sites-enabled/


If it already says "File exists", that's fine.

3. Test NGINX
   sudo nginx -t


Should show:

syntax is ok
test is successful

4. Reload NGINX
   sudo systemctl reload nginx

5. Test your API domain
   curl http://api.kisuku.com/api/data


You should get:

{"message":"This is data from the Express server","time":"..."}


If you get anything else (404, HTML, Cloudflare error, etc.), send me the output and I’ll fix it.

You said:
ubuntu@crashten:~$ sudo nano /etc/nginx/sites-available/api.kisuku.com
ubuntu@crashten:~$ sudo ln -s /etc/nginx/sites-available/api.kisuku.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
ln: failed to create symbolic link '/etc/nginx/sites-enabled/api.kisuku.com': File exists
ubuntu@crashten:~$
ChatGPT said:

The message:

File exists


means the symlink in /etc/nginx/sites-enabled/ is already there — this is normal and correct.
It means NGINX is already loading the config for api.kisuku.com.

So now the next step is to verify NGINX is actually routing to your Express server.

✅ STEP 1 — Test NGINX

Run:

sudo nginx -t


You should see:

syntax is ok
test is successful


If yes → continue.

✅ STEP 2 — Reload NGINX again just to be sure
sudo systemctl reload nginx

✅ STEP 3 — Does your Express API respond through the domain?

Run:

curl http://api.kisuku.com/api/data


Expected output:

{"message":"This is data from the Express server","time":"2025-12-09T..."}

❗ If it does NOT work, check these:
1. Is Express actually running on port 4000?
   pm2 list


You should see:

ossyexpress-test  online   port 4000


If not:

pm2 restart ossyexpress-test

2. Is Cloudflare DNS properly set?

Go to Cloudflare → DNS
You MUST have this record:

Type	Name	Value	Proxy
A	api.kisuku.com	Your server IP	OFF (gray cloud)

Important: For API traffic you must turn OFF the orange cloud so Cloudflare does not block port 4000 proxying.

🚀 After this, the React frontend should call:
axios.get("https://api.kisuku.com/api/data")


NOT localhost.

Send me the output of:
curl http://api.kisuku.com/api/data


And I'll diagnose the next step.