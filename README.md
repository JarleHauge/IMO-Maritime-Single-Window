# IMO-Maritime-Single-Window

Open a CMD window with administrator rights and run:

```
cd IMOMaritimeSingleWindow\Client
choco install nodejs // Yes, you will need to install chocolatey first
npm install -g @angular/cli
npm install
ng serve --host 0.0.0.0 --port 4201 --proxy-config proxy.config.json
```
