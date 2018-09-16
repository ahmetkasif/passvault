var $ = require('jquery');
var moment = require('moment');
var generator = require('generate-password');
var alertify = require('alertifyjs');

moment.locale('tr');

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

function showPassword(index){
    if(document.getElementById('show-password' + index).value == 0){
        document.getElementById('show-password' + index).value = 1;
        document.getElementById('show-password' + index).innerHTML = "<i class='fas fa-eye'><i/>";
        document.getElementById('list-password-' + index).setAttribute('type', 'text');
    } else {
        document.getElementById('show-password' + index).value = 0;
        document.getElementById('show-password' + index).innerHTML = "<i class='fas fa-eye-slash'><i/>";
        document.getElementById('list-password-' + index).setAttribute('type', 'password');
    }
}

function addPassword() {
    var data = {};
    data.name = document.getElementById("custom-password-name").value;
    data.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
    data.updatedAt = moment().format('MMMM Do YYYY, h:mm:ss a');
    data.password = document.getElementById("custom-password-value").value;

    db.insert(data, function (err, newDoc) {
        loadPasswords();
        alertify.notify('Şifre başarıyla eklendi', 'success');
    });
}

function updateDate() {
    document.getElementById('current-date').innerHTML = "Tarih: " + moment().format('MMMM Do YYYY, h:mm:ss a');
    setTimeout(function () { updateDate(); }, 1000);
}

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
                    loadPasswords();
                    alertify.notify('Şifre başarıyla güncellendi', 'success');
                    document.getElementById("password-create").innerText = "Şifre Üret";
                });
        }
    });
};

function updatePasswordForm(id) {
    db.findOne({
        _id: id
    }, function (err, doc) {
        document.getElementById("password-name").value = doc.name;
        document.getElementById("password-length").value = doc.length;
        document.getElementById("password-type-numbers").checked = doc.numbers;
        document.getElementById("password-type-symbols").checked = doc.symbols;
        document.getElementById("password-type-uppercase").checked = doc.uppercase;
        document.getElementById("password-type-simchar").checked = doc.excludeSimilarCharacters;
        document.getElementById("password-create").innerHTML = "<i class='fas fa-sync'>";
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
            data += "<td scope='col'>" + "<div class='input-group mb-3'><input id='list-password-" + i + "' type='password' class='form-control' value='";
            data += doc.password;
            data += "' aria-describedby='password-icon'><div class='input-group-append'><button id='show-password" + i + "' class='input-group-text' onclick=showPassword(" + i + ")><i class='fas fa-eye-slash'><i/></button></div></td>";
            data += "<td scope='col'><div class='btn-group' role='group'><button type='button' value='0' class='btn btn-sm btn-info' onclick=updatePasswordForm('";
            data += doc._id;
            data += "')><i class='fas fa-edit'></i></button>";
            data += "<button type='button' class='btn btn-sm btn-danger' onclick=deletePassword('";
            data += doc._id;
            data += "')><i class='fas fa-eraser'></i></button></div></td>";
            data += "</tr>";
        });

        // Generate password inline form
        data += "<tr>" +
            "<td>#</td>" +
            "<td><input type='text' class='form-control' id='password-name' placeholder='Şifre Adı'></td>" +
            "<td><input type='number' class='form-control' id='password-length' placeholder='Şifre Uzunluğu'></td>" +
            "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-numbers'></td>" +
            "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-symbols'></td>" +
            "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-uppercase'></td>" +
            "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-simchar'></td>" +
            "<td class='checkbox-padding'>-</td>" +
            "<td class='checkbox-padding'>-</td>" +
            "<td class='checkbox-padding'>-</td>" +
            "<td class='checkbox-padding'><button id='password-create' type='button' class='btn btn-sm btn-success' onclick='createPassword()'><i class='fas fa-check'></i></button></td>" +
            "</tr>";

        document.getElementById("passwordTable").innerHTML = data;
    });
};

updateDate();
loadPasswords();