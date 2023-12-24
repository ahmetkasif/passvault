const bootstrap = require('bootstrap');
const alertify = require('alertifyjs');
const moment = require('moment');
const generator = require('generate-password-browser');

import './scss/app.scss';
import "@fortawesome/fontawesome-free/js/all";

import './js/index.js';

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

var dataObject = {
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
$("body").addClass( "bg-info" );

// ----------------- MODAL INITS-----------------

const loginModal = new bootstrap.Modal('#loginModal', {
	keyboard: false,
	backdrop: 'static'
});

const signupModal = new bootstrap.Modal('#signupModal', {
	keyboard: false,
	backdrop: 'static'
});

const aboutModal = new bootstrap.Modal('#aboutModal', {
	keyboard: false,
	backdrop: 'static'
});

const createPWModal = new bootstrap.Modal('#createPWModal', {
	keyboard: false,
});

const customPWModal = new bootstrap.Modal('#customPWModal', {
	keyboard: false,
});

// ----------- REGISTER CHECK -------------------

fileAPI.checkFileExistence()
.then((fileExists) => {
    if (fileExists) {
        loginModal.show();
    } else {
        signupModal.show();
    }
})
.catch((error) => {
    console.error(error);
});

// ----------- ABOUT ---------------------------

document.getElementById('aboutToggler').addEventListener('click', () => {
    aboutModal.show();
});

document.getElementById('closeAbout').addEventListener('click', () => {
    aboutModal.hide();
});

// ----------- LOGIN --------------------------

document.getElementById('closeWindowLog').addEventListener('click', () => {
    window.api.sendToMain('close-window-request', 'Close Window!');
});

document.getElementById('login').addEventListener('click', () => {
    var vaultpass = document.getElementById("loginvaultpass").value;

    window.loginAPI.loginRequest('login-request', vaultpass).then((response) => {
        if (response.result) {
            dataObject = response.dataObject;
            loginModal.hide();
            loadPasswords('any');
            alertify.notify('Giriş yapıldı.', 'success');
        } else {
            alertify.notify('Giriş Başarısız', 'warning');
        }
    })
    .catch((error) => {
        alertify.notify('Giriş Başarısız'+error, 'warning');
    });
});

// ----------- REGISTER --------------------------

document.getElementById('closeWindowReg').addEventListener('click', () => {
    window.api.sendToMain('close-window-request', 'Close Window!');
});

document.getElementById('register').addEventListener('click', () => {
    var username = document.getElementById("signupusername").value;
    var email = document.getElementById("signupemail").value;
    var vaultpass = document.getElementById("signupvaultpass").value;
    var revaultpass = document.getElementById("signuprevaultpass").value;
    
    if (vaultpass == revaultpass) {
        dataObject.user.username = username;
        dataObject.user.email = email;
        dataObject.user.vaultpass = vaultpass;

        signupModal.hide();
        loadPasswords('any');

        alertify.notify('Kayıt başarıyla tamamlandı', 'success');
    } else {
        alertify.notify('Şifreler uyuşmuyor', 'warning');
    }

    window.saveDiskAPI.saveDiskRequest('save-disk-request', dataObject);
});

// ----------- LOAD PWS --------------------------

function loadPasswords(name) {
    var i = 0;
    var data = '';

    dataObject.password.vault.forEach(doc => {
        if (name == 'any' || doc.name.includes(name)) {
            data += "<tr>";
            data += "<td scope='col'>" + doc.id + "</td>";
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
            data += "<td scope='col'>" + "<div class='input-group'><input id='list-password-" + doc.id + "' type='password' class='form-control' value='";
            data += doc.password;
            data += "' aria-describedby='password-icon'><button id='showPassword' value='"+doc.id+"' class='input-group-text' data-toggle='tooltip' data-placement='top' title='Göster / Gizle'><i class='fas fa-eye-slash'><i/></button></td>";
            data += "<td scope='col'><div class='btn-group' role='group'><button type='button' class='btn btn-sm btn-info' id='updatePassword' disabled value='"+doc.id+"'><i class='fas fa-edit'></i></button>";
            data += "<button type='button' class='btn btn-sm btn-danger' id='deletePassword' value='"+doc.id+"'><i class='fas fa-eraser'></i></button></div></td>";
            data += "</tr>";
        }
        i = i + 1;
    });

    document.getElementById("passwordTable").innerHTML = data;

    let deletebtns = document.querySelectorAll("button#deletePassword");

    deletebtns.forEach(item => {
        item.addEventListener('click', () => deletePassword(item.value))
    })

    let updatebtns = document.querySelectorAll("button#updatePassword");

    updatebtns.forEach(item => {
        item.addEventListener('click', () => updatePassword(item.value))
    })

    let showbtns = document.querySelectorAll("button#showPassword");

    showbtns.forEach(item => {
        item.addEventListener('click', () => showPassword(item.value))
    })

    return;
}

// ----------- NEW PASSWORD --------------------------

document.getElementById('opencreatePWModal').addEventListener('click', () => {
    createPWModal.show();
});

document.getElementById('createPassword').addEventListener('click', () => {
    var data = {};

    data.name = document.getElementById("password-name").value;
    data.length = document.getElementById("password-length").value;
    data.numbers = document.getElementById("password-type-numbers").checked;
    data.symbols = document.getElementById("password-type-symbols").checked;
    data.uppercase = document.getElementById("password-type-uppercase").checked;
    data.excludeSimilarCharacters = document.getElementById("password-type-simchar").checked;
    data.updatedAt = moment().format('MMMM Do YYYY, h:mm:ss a');

    if (data.length < 4){
        alertify.notify('Şifre en az 4 karakter uzunluğunda olabilir.', 'warning');
    } else {
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
                window.saveDiskAPI.saveDiskRequest('save-disk-request', dataObject);
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
    
        window.saveDiskAPI.saveDiskRequest('save-disk-request', dataObject);
        createPWModal.hide();
        alertify.notify('Şifre oluşturuldu.', 'success');
    }

    return;
});

// ----------- CUSTOM PASSWORD --------------------------

document.getElementById('opencustomPWModal').addEventListener('click', () => {
    customPWModal.show();
});

document.getElementById('customPassword').addEventListener('click', () => {
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
    window.saveDiskAPI.saveDiskRequest('save-disk-request', dataObject);
    alertify.notify('Şifre eklendi', 'success');
});

// ----------- DELETE PASSWORD --------------------------

function deletePassword(value, index, array) {
    for (var i = 0; i < dataObject.password.vault.length; i++) {
        if (dataObject.password.vault[i].id == value) {
            dataObject.password.vault.splice(i, 1);
            alertify.notify('Şifre başarıyla silindi', 'success');
            loadPasswords('any');
            window.saveDiskAPI.saveDiskRequest('save-disk-request', dataObject);
            return;
        }
    }
    alertify.notify('Bir hata oluştu', 'warning');
    return;
}

// ----------- UPDATE PASSWORD --------------------------

function updatePassword(value, index, array) {
    /*for (var i = 0; i < dataObject.password.vault.length; i++) {
        if (dataObject.password.vault[i].id == id) {
            dataObject.password.vault.splice(i, 1);
            alertify.notify('Şifre başarıyla silindi', 'success');
            loadPasswords('any');
            saveDisk();
            return;
        }
    }*/
    alertify.notify('Bir hata oluştu', 'warning');
    return;
}

// ----------- SHOW PASSWORD --------------------------

function showPassword(value, index, array) {
    if (document.getElementById('list-password-'+value).type == "password") {
        document.getElementById('list-password-'+value).setAttribute('type', 'text');
    } else {
        document.getElementById('list-password-'+value).setAttribute('type', 'password');
    }
}

// ----------- AUTOCOMPLETE --------------------------

document.getElementById('search').addEventListener('keyup', () => {
    loadPasswords(document.getElementById("search").value);

    return;
});

// ----------- EXPORT PWS --------------------------

document.getElementById('exportPasswords').addEventListener('click', () => {
    window.api.exportPW('export-passwords', dataObject);
});

// ----------- IMPORT PWS --------------------------

document.getElementById('importPasswords').addEventListener('click', () => {
    window.api.importPW('import-passwords', dataObject.user.vaultpass).then((response) => {
        if (response.result == true) {
            dataObject = response.dataObject;
            loginModal.hide();
            loadPasswords('any');
            alertify.notify('İçe aktarıldı.', 'success');
        } else {
            alertify.notify('İçe aktarma başarısız', 'warning');
        }
    })
    .catch((error) => {
        alertify.notify('İçe aktarma hatası: '+error, 'warning');
    });
});

