var $ = require('jquery');
var shajs = require('sha.js');
var moment = require('moment');
var generator = require('generate-password');
var alertify = require('alertifyjs');

moment.locale('tr');

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

alertify.defaults = {
    autoReset: true,
    basic: false,
    closable: true,
    closableByDimmer: true,
    frameless: true,
    maintainFocus: true,
    maximizable: false,
    modal: true,
    movable: false,
    moveBounded: false,
    overflow: true,
    padding: true,
    pinnable: true,
    pinned: true,
    preventBodyShift: false,
    resizable: false,
    startMaximized: false,
    transition: 'pulse',

    notifier: {
        delay: 3,
        position: 'top-left',
        closeButton: true
    },

    glossary: {
        title: 'Passvault',
        ok: 'Tamam',
        cancel: 'İptal Et'
    },

    theme: {
        input: 'alert-input',
        ok: 'alert-ok',
        cancel: 'alert-cancel'
    }
};

var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data/database.db',
        autoload: true
    });

function createPassword() {
    db.find({
        name: document.getElementById("password-name").value
    }, function (err, docs) {
        var data = {};
        data.name = document.getElementById("password-name").value;
        data.length = document.getElementById("password-length").value;
        data.numbers = document.getElementById("password-type-numbers").checked;
        data.symbols = document.getElementById("password-type-symbols").checked;
        data.uppercase = document.getElementById("password-type-uppercase").checked;
        data.excludeSimilarCharacters = document.getElementById("password-type-simchar").checked;
        data.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
        data.updatedAt = moment().format('MMMM Do YYYY, h:mm:ss a');
        data.password = generator.generate({
            length: data.length,
            numbers: data.numbers,
            symbols: data.symbols,
            uppercase: data.uppercase,
            excludeSimilarCharacters: data.excludeSimilarCharacters,
        });

        if (docs.length == 0) {
            db.insert(data, function (err, newDoc) {
                resetForm();
                loadPasswords();
                alertify.notify('Şifre başarıyla eklendi', 'success');
            });
        } else {
            db.update({
                name: data.name
            }, {
                $set: {
                    name: data.name,
                    length: data.length,
                    numbers: data.numbers,
                    symbols: data.symbols,
                    uppercase: data.uppercase,
                    excludeSimilarCharacters: data.excludeSimilarCharacters,
                    updatedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
                    password: data.password,
                }
            }, function (err, numReplaced) {
                resetForm();
                loadPasswords();
                alertify.notify('Şifre başarıyla güncellendi', 'success');
                document.getElementById("password-create").innerText = "Şifre Üret";
            });
        }
    });
};

function updatePassword(id) {
    db.findOne({
        _id: id
    }, function (err, doc) {
        document.getElementById("password-name").value = doc.name;
        document.getElementById("password-length").value = doc.length;
        document.getElementById("password-type-numbers").checked = doc.numbers;
        document.getElementById("password-type-symbols").checked = doc.symbols;
        document.getElementById("password-type-uppercase").checked = doc.uppercase;
        document.getElementById("password-type-simchar").checked = doc.excludeSimilarCharacters;
        document.getElementById("password-create").innerText = "Şifreyi Güncelle";
    });
};

function resetForm(id) {
    db.findOne({
        _id: id
    }, function (err, doc) {
        document.getElementById("password-name").value = "";
        document.getElementById("password-length").value = "";
        document.getElementById("password-type-numbers").checked = false;
        document.getElementById("password-type-symbols").checked = false;
        document.getElementById("password-type-uppercase").checked = false;
        document.getElementById("password-type-simchar").checked = false;
        alertify.notify('Form sıfırlandı', 'success');
        document.getElementById("password-create").innerText = "Şifre Üret";
    });
};

function deletePassword(id) {
    db.remove({
        _id: id
    }, function (err, numRemoved) {
        alertify.notify('Şifre başarıyla silindi', 'warning');
        loadPasswords();
    });
};

function loadPasswords() {
    var i = 0;
    var data = '';
    db.find({}, function (err, docs) {
        docs.forEach(doc => {
            i = i + 1;
            data += "<tr>";
            data += "<td scope='col'>" + i + "</td>";
            data += "<td scope='col'>" + doc.name + "</td>";
            data += "<td scope='col'>" + doc.length + "</td>";
            if (doc.numbers)
                data += "<td scope='col'>Evet</td>";
            else
                data += "<td scope='col'>Hayır</td>";
            if (doc.symbols)
                data += "<td scope='col'>Evet</td>";
            else
                data += "<td scope='col'>Hayır</td>";
            if (doc.uppercase)
                data += "<td scope='col'>Var</td>";
            else
                data += "<td scope='col'>Yok</td>";
            if (doc.excludeSimilarCharacters)
                data += "<td scope='col'>Yasak</td>";
            else
                data += "<td scope='col'>İzin verildi</td>";
            data += "<td scope='col'>" + doc.createdAt + "</td>";
            data += "<td scope='col'>" + doc.updatedAt + "</td>";
            data += "<td scope='col'>" + doc.password + "</td>";
            data += "<td scope='col'><button type='button' class='btn btn-info' onclick=updatePassword('";
            data += doc._id;
            data += "')>Güncelle</button></td>";
            data += "<td scope='col'><button type='button' class='btn btn-danger' onclick=deletePassword('";
            data += doc._id;
            data += "')>Sil</button></td>";
            data += "</tr>";
        });
        document.getElementById("passwordTable").innerHTML = data;
    });
};

loadPasswords();