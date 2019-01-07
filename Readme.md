# Hookshot

End-to-end testing of Segment event delivery via the [Segment Config API](https://segment.com/docs/config-api/). It:

1. Starts a local webserver
2. Exposes the webserver to the internet via https://ngrok.com/
3. Creates a `hookshot` source
4. Creates a `webhook` destination for the `ngrok.io` address
5. Sends a Segment Track event
6. Receives the event via the webhook to the local webserver

## Quick Start

Get the repo and install dependencies:

```shell
$ git clone https://github.com/nzoschke/hookshot.git
$ cd hookshot
$ npm install
```

Create a [Personal Access Token](https://reference.segmentapis.com/#cd642f96-0fca-42a1-a727-e16fd33c7e8f).

```shell
$ USER=me@example.com
$ PASS=<PASSWORD>
$ WORKSPACE=workspaces/myworkspace

$ curl https://platform.segmentapis.com/v1beta/access-tokens \
  -u "$USER:$PASS" \
  -d "{
    'access_token': {
      'description': 'hookshot',
      'scopes': 'workspace',
      'workspace_names': ['$WORKSPACE']
    }
  }"
```

Example output:

```json
{
 "name": "access-tokens/1234",
 "description": "hookshot",
 "scopes": "workspace",
 "create_time": "2019-01-07T22:08:19Z",
 "token": "RwUjywIe8wT7ohFSPKWdFjDc53wB0dwdRaqB41Bf_58.DswMCZ4ZxLYqYvLatm9a5Rk12y4qfKE5inaqpBKgI9U",
 "workspace_names": [
  "workspaces/myworkspace"
 ]
}
```

Save the access token to a `.env` file:

```shell
$ echo TOKEN=RwUjywIe8wT7ohFSPKWdFjDc53wB0dwdRaqB41Bf_58.DswMCZ4ZxLYqYvLatm9a5Rk12y4qfKE5inaqpBKgI9U > .env
```

Run the script:

```shell
$ ./hookshot.js
server:       listening on 3000
server:       accessible at https://f80b01f9.ngrok.io
workspace:    workspaces/myworkspace
source:       workspaces/myworkspace/sources/hookshot
dest:         workspaces/myworkspace/sources/hookshot/destinations/webhooks
⏱  configure: 1086.337ms
event:        { success: true }
request:      api-7A0EzRVH40lJFLc9VerVMH3gLHLL8w0E
⏱  send/recv: 3595.263ms
```
