# socket.io-txt

Socket.IO Adapter implementation by Textfile
(for practice)

## Example

```javascript
var io = require('socket.io')(http);
var txt = require("socket.io-txt");
io.adapter( txt({ name: "session.txt" }) );
```
## Options
The following options are arrowed:

- `name`:the name of text file which you use.

## Install
```
npm install socket.io-txt
```

## License
MIT