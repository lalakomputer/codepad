/*jshint esnext: true */

const CodeMirror = require(ß.BPD + '/modules/codemirror/mode/meta.js');
const padejs = ß.BPD + '/modules/pad/public/pad.ejs';
const errejs = ß.BPD + '/modules/pad/public/err.ejs';
const txtejs = ß.BPD + '/modules/pad/public/txt.ejs';
const preejs = ß.BPD + '/modules/pad/public/pre.ejs';
const embedejs = ß.BPD + '/modules/pad/public/embed.ejs';

function send_files() {
    for (let i in ß.io.sockets.sockets) {
        let socket = ß.io.sockets.sockets[i];
        if (socket.files_socket) socket.emit('files', ß.projectfiles);
    }
}

ß.app.get('/p/*', function(req, res, next) {

  	if (ß.USE_BASICAUTH)
    if (!req.session.username) {
        if (!req.headers.authorization) return res.end("Authorisation failure.");
        var userpass = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString().split(":");
        req.session.username = userpass.shift();
    }

    var entry = req.params[0];
    var filename = req.params[0].split('/').pop();

    var fullpath = "/srv/codepad-project/" + entry;

    var dot = filename.lastIndexOf(".");
    var ext = 'txt';
    if (dot > -1) ext = filename.substring(dot + 1, filename.length).toLowerCase();

    var mode = CodeMirror.findModeByFileName(filename);
    if (mode) {
        if (mode.mode !== 'null')
            res.render(padejs, {
                theme: ß.theme,
                file: entry,
                mode: mode.mode
            });
        else res.render(txtejs, {
            theme: ß.theme,
            file: entry
        });
        return;
    }

    //if (ext === 'pdf') return res.sendFile(fullpath);
    var ent = entry.toLowerCase();

    if (ext === 'log' || ext === 'csr' || ext === 'crt' || ext === 'key' || ext === 'pem' || ext === 'pid' || ent === 'version' || ent === 'license') {
        ß.fs.readFile(fullpath, function(err, data) {
            đ(err);
            if (err) return res.render(errejs, {
                theme: ß.theme,
                file: entry,
                code: err.code
            });
            res.render(preejs, {
                txt: data
            });
        });
        return;
    }

    // pdf, jpg, and similar ...
    res.sendFile(fullpath, {}, function(err) {
        đ(err);
        if (err) return res.render(errejs, {
            theme: ß.theme,
            file: entry,
            code: err.code
        });
    });

});