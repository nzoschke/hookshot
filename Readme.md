# Hookshot

End-to-end testing of Segment event delivery via the Platform API.

```shell
$ npm install

$ export TOKEN=...

$ ./hookshot.js
server:       listening on 3000
server:       accessible at https://f80b01f9.ngrok.io
workspace:    workspaces/segment-noah
source:       workspaces/segment-noah/sources/hookshot
dest:         workspaces/segment-noah/sources/hookshot/destinations/webhooks
⏱  configure: 1086.337ms
event:        { success: true }
request:      api-7A0EzRVH40lJFLc9VerVMH3gLHLL8w0E
⏱  send/recv: 3595.263ms
```
