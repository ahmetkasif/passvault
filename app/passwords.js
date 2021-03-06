const $ = require('jquery');
const moment = require('moment');
const generator = require('generate-password');
const alertify = require('alertifyjs');
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const CryptoJS = require("crypto-js");
const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const remote = require('electron').remote;
const dialog = require('electron').remote.dialog;

moment.locale('tr');

var currentpath;
var dataObject;

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$(document).keypress(
    function (event) {
        if (event.which == '13')
            event.preventDefault();
    }
);

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
        position: 'bottom-left',
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

function initialize() {
    currentpath = path.join(userDataPath, 'database.json');
    dataObject = {
        hash: 0,
        user: {
            username: 'unknown',
            email: 'unknown',
            vaultpass: 'unknown'
        },
        password: {
            lastID: 0,
            vault: [

            ]
        }
    };

    updateDate();

    if (fs.existsSync(currentpath)) {
        $('#loginModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    } else {
        $('#signupModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }
}

function login() {
    var vaultpass = document.getElementById("loginvaultpass").value;

    try {
        loadDisk(vaultpass);
        $('#loginModal').modal('hide');
        alertify.notify('Giriş yapıldı.', 'success');
        loadPasswords('any');
    } catch (error) {
        alertify.notify('Şifrenizi yanlış girdiniz!', 'warning');
        console.log(error);
    }
    return;
}

function signup() {
    var username = document.getElementById("signupusername").value;
    var email = document.getElementById("signupemail").value;
    var vaultpass = document.getElementById("signupvaultpass").value;
    var revaultpass = document.getElementById("signuprevaultpass").value;

    if (vaultpass == revaultpass) {
        dataObject.user.username = username;
        dataObject.user.email = email;
        dataObject.user.vaultpass = vaultpass;

        $('#signupModal').modal('hide');
        alertify.notify('Kayıt başarıyla tamamlandı', 'success');
        loadPasswords('any');
    } else {
        alertify.notify('Şifreler uyuşmuyor', 'warning');
    }
    saveDisk();
    return;
}

function autocomp() {
    key = document.getElementById("search").value;
    loadPasswords(key);

    return;
}

function fpass() {
    alertify.notify('Henüz eklenmedi', 'warning');
    return;
}

function quitApp() {
    electron.remote.getCurrentWindow().close();
}

function saveDisk() {
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(dataObject), dataObject.user.vaultpass);
    fs.writeFileSync(currentpath, ciphertext);
    return;
}

function loadDisk(vaultpass) {
    var ciphertext = fs.readFileSync(currentpath);
    var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), vaultpass);
    dataObject = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return;
}

function showPassword(type, index) {
    if (type == 1) {
        if (document.getElementById('show-password' + index).value == 0) {
            document.getElementById('show-password' + index).value = 1;
            document.getElementById('show-password' + index).innerHTML = "<i class='fas fa-eye'><i/>";
            document.getElementById('list-password-' + index).setAttribute('type', 'text');
        } else {
            document.getElementById('show-password' + index).value = 0;
            document.getElementById('show-password' + index).innerHTML = "<i class='fas fa-eye-slash'><i/>";
            document.getElementById('list-password-' + index).setAttribute('type', 'password');
        }
        return;
    }

    if (document.getElementById('show-custom-password').value == 0) {
        document.getElementById('show-custom-password').value = 1;
        document.getElementById('show-custom-password').innerHTML = "<i class='fas fa-eye'><i/>";
        document.getElementById('custom-password-value').setAttribute('type', 'text');
    } else {
        document.getElementById('show-custom-password').value = 0;
        document.getElementById('show-custom-password').innerHTML = "<i class='fas fa-eye-slash'><i/>";
        document.getElementById('custom-password-value').setAttribute('type', 'password');
    }

    return;
}

function updateDate() {
    document.getElementById('current-date').innerHTML = "Tarih: " + moment().format('MMMM Do YYYY, h:mm:ss a');
    setTimeout(function () {
        updateDate();
    }, 1000);
}

function exportPasswords() {
    // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
    var filename = 'C:/Program Files/';
    dialog.showSaveDialog({ options: ['title', 'openDirectory'] }, (fileName) => {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }

        // fileName is a string that contains the path and filename created in the save file dialog.  
        fs.writeFile(fileName, JSON.stringify(dataObject), (err) => {
            if (err) {
                alertify.notify('Hata: ' + err.message, 'danger');
                return;
            }
            alertify.notify('Şifreler başarıyla dışarı aktarıldı.', 'success');
        });
    });

    return;
}

function importPasswords() {
    dialog.showOpenDialog({ properties: ['openFile'] }, (filepath) => {
        if (filepath === undefined) {
            alertify.notify('Dosya seçilmedi!', 'warning');
            return;
        }

        fs.readFile(filepath[0], 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }

            alertify.notify('Şifreler başarıyla içe aktarıldı', 'success');
            dataObject = JSON.parse(data);
            loadPasswords('any');
            saveDisk();
        });
    });

    return;
}

function addCustomPassword() {
    var data = {};

    data.name = document.getElementById("custom-password-name").value;
    data.password = document.getElementById("custom-password-value").value;
    data.length = data.password.toString().length;
    data.numbers = false;
    data.symbols = false;
    data.uppercase = false;
    data.excludeSimilarCharacters = false;
    data.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
    data.updatedAt = moment().format('MMMM Do YYYY, h:mm:ss a');

    // Saving custom password
    data.id = dataObject.password.lastID;
    dataObject.password.lastID = dataObject.password.lastID + 1;
    dataObject.password.vault.push(data);
    loadPasswords('any');
    saveDisk();
    alertify.notify('Eski şifre başarıyla eklendi', 'success');
    return;
}

function createPassword() {
    var data = {};

    data.name = document.getElementById("password-name").value;
    data.length = document.getElementById("password-length").value;
    data.numbers = document.getElementById("password-type-numbers").checked;
    data.symbols = document.getElementById("password-type-symbols").checked;
    data.uppercase = document.getElementById("password-type-uppercase").checked;
    data.excludeSimilarCharacters = document.getElementById("password-type-simchar").checked;
    data.updatedAt = moment().format('MMMM Do YYYY, h:mm:ss a');
    data.password = generator.generate({
        length: data.length,
        numbers: data.numbers,
        symbols: data.symbols,
        uppercase: data.uppercase,
        excludeSimilarCharacters: data.excludeSimilarCharacters,
    });

    // Updating password
    for (let i = 0; i < dataObject.password.vault.length; i++) {
        if (dataObject.password.vault[i].name == data.name) {
            data.id = dataObject.password.vault[i].id;
            data.createdAt = dataObject.password.vault[i].createdAt;
            dataObject.password.vault[i] = data;
            saveDisk();
            loadPasswords('any');
            alertify.notify('Şifre başarıyla güncellendi.', 'success');
            return;
        }
    }

    // Saving password
    data.id = dataObject.password.lastID;
    data.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
    dataObject.password.lastID = dataObject.password.lastID + 1;
    dataObject.password.vault.push(data);
    loadPasswords('any');
    saveDisk();
    alertify.notify('Şifre başarıyla oluşturuldu.', 'success');
    return;
}

function updatePasswordForm(id) {
    for (var i = 0; i < dataObject.password.vault.length; i++) {
        if (dataObject.password.vault[i].id == id) {
            let data = dataObject.password.vault[i];
            document.getElementById("password-name").value = data.name;
            document.getElementById("password-length").value = data.length;
            document.getElementById("password-type-numbers").checked = data.numbers;
            document.getElementById("password-type-symbols").checked = data.symbols;
            document.getElementById("password-type-uppercase").checked = data.uppercase;
            document.getElementById("password-type-simchar").checked = data.excludeSimilarCharacters;
            document.getElementById("password-createdat").innerText = data.createdAt;
            document.getElementById("password-updatedat").innerText = data.updatedAt;
            document.getElementsByName("password-create").innerHTML = "<i class='fas fa-sync'>";
            document.getElementsByName("password-create").id = "password-update-" + data.id;
            break;
        }
    }
    return;
}

function deletePassword(id) {
    for (var i = 0; i < dataObject.password.vault.length; i++) {
        if (dataObject.password.vault[i].id == id) {
            dataObject.password.vault.splice(i, 1);
            alertify.notify('Şifre başarıyla silindi', 'success');
            loadPasswords('any');
            saveDisk();
            return;
        }
    }
    alertify.notify('Bir hata oluştu', 'warning');
    return;
}

function loadPasswords(name) {
    var i = 0;
    var data = '';

    dataObject.password.vault.forEach(doc => {
        i = i + 1;
        if (name == 'any' || doc.name.includes(name)) {
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
            data += "<td scope='col'>" + "<div class='input-group'><input id='list-password-" + i + "' type='password' class='form-control' value='";
            data += doc.password;
            data += "' aria-describedby='password-icon'><div class='input-group-append'><button id='show-password" + i + "' class='input-group-text' data-toggle='tooltip' data-placement='top' title='Göster / Gizle' onclick=showPassword(" + 1 + "," + i + ")><i class='fas fa-eye-slash'><i/></button></div></td>";
            data += "<td scope='col'><div class='btn-group' role='group'><button type='button' value='0' class='btn btn-sm btn-info' onclick=updatePasswordForm('";
            data += doc.id;
            data += "')><i class='fas fa-edit'></i></button>";
            data += "<button type='button' class='btn btn-sm btn-danger' onclick=deletePassword('";
            data += doc.id;
            data += "')><i class='fas fa-eraser'></i></button></div></td>";
            data += "</tr>";
        }
    });

    // Password generate form
    data += "<tr id='password-create-form'>" +
        "<td>#</td>" +
        "<td><input type='text' class='form-control' id='password-name' placeholder='Şifre Adı' required></td>" +
        "<td><input type='number' class='form-control' id='password-length' placeholder='Uzunluk' required></td>" +
        "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-numbers'></td>" +
        "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-symbols'></td>" +
        "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-uppercase'></td>" +
        "<td class='checkbox-padding'><input type='checkbox' class='control-input' id='password-type-simchar'></td>" +
        "<td id='password-createdat' class='checkbox-padding'>-</td>" +
        "<td id='password-updatedat' class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td><div class='btn-group' role='group'>" +
        "</button><button name='password-create' type='button' class='btn btn-sm btn-success' data-toggle='tooltip' data-placement='top' title='Şifre Oluştur' onclick='createPassword()'><i class='fas fa-check'></i></button>" +
        "</div></td>" +
        "</tr>";

    // Custom password form
    data += "<tr id='password-create-form'>" +
        "<td>#</td>" +
        "<td><input type='text' class='form-control' id='custom-password-name' placeholder='Özel Şifre Adı' required></td>" +
        "<td><div class='input-group'>" +
        "<input type='password' class='form-control' id='custom-password-value' placeholder='Şifre' required>" +
        "<div class='input-group-append'>" +
        "<button id='show-custom-password' class='input-group-text' data-toggle='tooltip' data-placement='top' title='Göster / Gizle' onclick=showPassword(0)>" +
        "<i class='fas fa-eye-slash'><i/></button></div></div>"+
        "</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td class='checkbox-padding'>-</td>" +
        "<td><div class='btn-group text-center' role='group'>" +
        "<button name='custom-password' type='button' class='btn btn-sm btn-warning' data-toggle='tooltip' data-placement='top' title='Eski Şifre Gir' onclick='addCustomPassword()'><i class='fas fa-save'></i>" +
        "</div></td>" +
        "</tr>";

    document.getElementById("passwordTable").innerHTML = data;
    return;
}

initialize();