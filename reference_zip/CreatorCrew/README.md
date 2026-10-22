# The Creator Crew - run it on an IP address

Same app as the prototype, served over HTTP so it opens on an IP address.

## Run (Windows cmd)
    cd CreatorCrew
    start.bat              (default port 8080)
    start.bat 3000         (custom port)

Or directly:
    python server.py       or      node server.js

It prints something like:
    On this PC:        http://localhost:8080
    On your network:   http://192.168.1.25:8080

Open the "On your network" address on your phone or any device on the same Wi-Fi.

## Needs
Python 3 (python.org, tick "Add Python to PATH") OR Node.js. No packages to install.

## If other devices cannot connect
Windows Firewall may ask to allow Python/Node on private networks - click Allow.
Or run once in an Administrator cmd:
    netsh advfirewall firewall add rule name="Creator Crew" dir=in action=allow protocol=TCP localport=8080

## Folders
    ui/    the app (index.html, app.js, data.js, styles.css) - unchanged
    docs/  HLD.html design document, served at /docs/HLD.html

Still a demo: Instagram is simulated and the numbers are sample data (see ui/data.js).
