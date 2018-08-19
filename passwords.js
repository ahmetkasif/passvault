var shajs = require('sha.js')
var $ = require('jquery');
var moment = require('moment');
moment.locale('tr');

var countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central Arfrican Republic", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauro", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];

var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data/database.db',
        autoload: true
    });

let deneme;

function personalInfoUpdate() {
    var data = {
        type: 0,
        name: document.getElementById("name").value,
        surname: document.getElementById("surname").value,
        city: document.getElementById("city").value,
        phone: document.getElementById("phone").value,
        masterPass: document.getElementById("master-password").value,
        createdAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
        updatedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
    };

    var hashData = data.name.toString() + data.surname.toString() + data.city.toString() + data.phone.toString() + data.masterPass.toString();
    data.hash = shajs('sha256').update(hashData).digest('hex');

    db.count({ name: data.name }, function (err, count) {
        if (count > 0) {
            db.update({ name: data.name }, { $set: { name: data.name, surname: data.surname, city: data.city, phone: data.phone, masterPass: data.masterPass, hash: data.hash, updatedAt: moment().format('MMMM Do YYYY, h:mm:ss a') } }, function (err, numReplaced) {
                console.log("Update successfull, affected entries: " + numReplaced);
            });
            loadPInfo();
        } else {
            db.insert(data, function (err, newDoc) {
                console.log("Insertion successfully completed.");
            });
            loadPInfo();
        }
    });
};

function personalInfoReset() {
    db.remove({
        type: 0
    }, {}, function (err, numRemoved) {
        loadPInfo();
    });
};

function loadPInfo() {
    db.find({
        type: 0
    }, function (err, docs) {
        if (docs.length > 0) {
            document.getElementById("name").value = docs[0].name;
            document.getElementById("surname").value = docs[0].surname;
            document.getElementById("city").value = docs[0].city;
            document.getElementById("phone").value = docs[0].phone;
            document.getElementById("master-password").value = docs[0].masterPass;
            document.getElementById("createdAt").value = docs[0].createdAt;
            document.getElementById("updatedAt").value = docs[0].updatedAt;
            document.getElementById("hash").value = docs[0].hash;
        } else {
            document.getElementById("name").value = "";
            document.getElementById("surname").value = "";
            document.getElementById("city").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("master-password").value = "";
            document.getElementById("createdAt").value = "";
            document.getElementById("updatedAt").value = "";
            document.getElementById("hash").value = "";
        }
    });
};

function userInfoUpdate() {
    console.log("user info update");
};

function createPassword() {
    db.find({
        type: 0
    }, function (err, docs) {
        var hash;
        if (docs.length > 0) {
            if (docs[0].hash != undefined) {
                var data = {};
                data.name = document.getElementById("password-name").value;
                data.type = $("input[name=password-type]:checked").val();
                data.length = document.getElementById("password-length").value;

                var hashData = docs[0].hash + data.name.toString() + data.length.toString() + data.type.toString();
                data.hash = shajs('sha256').update(hashData).digest('hex');

                var start = Math.floor(Math.random() * (64 - data.length));
                var end = start + parseInt(data.length);
                data.password = data.hash.toString().substring(start, end);

                data.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
                data.updatedAt = moment().format('MMMM Do YYYY, h:mm:ss a');

                db.insert(data, function (err, newDoc) {
                    console.log("New Password added.");
                });

                loadPasswords();
            } else {
                console.log("Create hash first.");
            }
        } else {
            console.log("Enter your information and create hash first.");
        }
    });
};

function updatePassword() {
    console.log("password update");
};

function deletePassword(id) {
    db.remove({
        _id: id
    }, {}, function (err, numRemoved) {
        console.log("entry removed");
    });
    loadPasswords();
};

function loadPasswords() {
    var i = 0;
    var data = '';
    db.find({ $or: [{ type: '1' }, { type: '2' }, {type: '3'}] }, function (err, docs) {
        docs.forEach(doc => {
            i = i + 1;
            data += "<tr>";
            data += "<td scope='col'>" + i + "</td>";
            data += "<td scope='col'>" + doc.name + "</td>";
            data += "<td scope='col'>" + doc.type + "</td>";
            data += "<td scope='col'>" + doc.length + "</td>";
            data += "<td scope='col'>" + doc.createdAt + "</td>";
            data += "<td scope='col'>" + doc.updatedAt + "</td>";
            data += "<td scope='col'>" + doc.password + "</td>";
            data += "<td scope='col'><button type='button' class='btn btn-info disabled' onclick=updatePassword('";
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

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

autocomplete(document.getElementById("search"), search);
loadPInfo();
loadPasswords();