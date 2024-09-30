### Concourse Minion 4 Chrome

Disclaimer: Proof Of Concept - code is primitive and maybe it is missing lots of scenarios.

This is a simple tool to add some shortcut in your Concourse page. 

### Customize it

Go to `./manifest.json`

Change `$.content_scripts.matches` to add your concourse host you want to apply this extension.


TODO

Buttons for deactivating/activating all the jobs shown in the screen.

![image](https://github.com/user-attachments/assets/9cefc300-5c21-4507-9ce7-9b48410bf397)


Button to the right to get the fly command for hijacking that task

![image](https://github.com/user-attachments/assets/06d54e0d-6fb3-4588-b570-a62be1047781)


### Install

Because it is not registered with a Chrome Extension developer account, you need to install as a developer

1. Go to chrome://extensions
2. Activate Developer mode
3. Install unpacked extension
4. Select the root folder of this repo

