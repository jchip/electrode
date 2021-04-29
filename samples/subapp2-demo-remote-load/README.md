# subapp2-demo-remote-load


To demo remote loading a subapp with webpack5 federated module.

This app acts as the host that loads the remote subapp.


To setup and try:

1. Terminal 1 - start this app with `fun dev`
2. Terminal 2 - start [subapp2-demo-remote-expose](../subapp2-demo-remote-expose) with `PORT=3001 fun dev`
3. load http://localhost:3000
4. click the button `"test load remote Demo1 subapp"`
