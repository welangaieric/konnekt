const station = 1;
const OK = 200;
const RequestType = {
    JSON: 'Json',
    TEXT: 'Text'
};
const MethodType = {
    POST: 'POST',
    GET: 'GET'
}
const numberRegex = /^\d{10}$/;
const header = document.getElementById('main-header');
let packagesData = [];
let packageAmount = "";
let txtPhone = document.getElementById('phone');
let sheetBG = document.getElementById("bottom-sheet-bg");
// let btnSubscribe = document.getElementById('btn-buy');
let checkoutId = ''
// let statusUrl = ''
let paymentToken = ''

let dailySubs = document.getElementById("daily-sub");
let weeklySubs = document.getElementById("weekly-sub");
let monthlySubs = document.getElementById("monthly-sub");

let btnViewDaily = document.getElementById("btn-view-daily");
let btnViewWeekly = document.getElementById("btn-view-weekly");
let btnViewMonthly = document.getElementById("btn-view-monthly");

const URL1 = "https://konnektsmartlife.org";
const URL2 = "https://api.konnektsmartlife.org";
const ADMIN_ID = "nSWjYdy7C1QtWOmIJfB7jlSnGXr1";
const V1 = "/konnekt/api/v1";
const isDaraja = 1;
const fetchData = (url, data = '', method = MethodType.POST, type = RequestType.JSON) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        // xhr.open("POST", url, true);
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        // xhr.setRequestHeader("Content-type", "multipart/form-data");
        if (type === RequestType.TEXT)
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        else
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // //     xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.send(data);
        xhr.onload = function () {
            const data = {
                "status": this.status,
                "data": this.responseText
            }
            resolve(JSON.stringify(data));
        }

        xhr.onerror = function () {
            reject("Connection error. Reload and try again.")
        }
    });
const loadPackages = async () => {
    try {
        const response = await fetch(`${URL2}${V1}/packages?uid=${ADMIN_ID}&station=${station}`);
        if (!response.ok) {
            return ""
        }
        const packages = await response.json();
        return JSON.stringify(packages)
    } catch (e) {
        console.log(e)
        return ""
    }

}
window.onload = function () {
    loadPackages()
        .then((response) => {
            document.getElementById('package-loader')
                .classList.add('hidden');
            if (!response) {
                document.getElementById('empty-packages')
                    .classList.remove('hidden');
                console.log('No packages found');
                return;
            }
            const dailyPackagesList = document.querySelector('#daily-sub');
            const weeklyPackagesList = document.querySelector('#weekly-sub');
            const monthlyPackagesList = document.querySelector('#monthly-sub');
            console.log(response, "Done")
            const packages = JSON.parse(response)
            packages.forEach((wifiPackage) => {
                let expiry = getExpirationDuration(wifiPackage.duration);
                let entry = document.createElement('li')
                entry.classList.add('package_entry');
                let rxTx = formatSpeed(wifiPackage.speed);
                let validity = getExpirationTime(wifiPackage.duration);
                entry.innerHTML = createPackage(wifiPackage.profile, wifiPackage.amount, validity, rxTx);
                switch (expiry) {
                    case 0:
                        dailyPackagesList.appendChild(entry);
                        break;
                    case 1:
                        weeklyPackagesList.appendChild(entry);
                        break;
                    case 2:
                        monthlyPackagesList.appendChild(entry);
                        break;
                    default:
                        dailyPackagesList.appendChild(entry);
                        break;
                }
                animatePackages('.pkg_1');
                packagesData.push({name: wifiPackage.profile, validity: validity, amount: wifiPackage.amount})

            });

            // console.log(JSON.stringify(packagesData));

            $('.btn_subscribe').on('click', function () {
                console.log($(this).attr("data-amount"));
                packageAmount = $(this).attr("data-amount");

                showSubscriptionDialog($(this).attr("data-name"), $(this).attr("data-amount"), $(this).attr("data-validity"))
            })

        })
        .catch((e) => {
            document.getElementById('package-loader')
                .classList.add('hidden');
            console.log(e);
            showSnackbar(`${e}`);
        });

    let buyForm = document.getElementById('frm-buy');
    buyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let phoneNumber = txtPhone.value;

        if (!phoneNumber || !phoneNumber.match(numberRegex)) {
            txtPhone.parentElement.classList.add('is-invalid')
            return;
        }
        subscribe();
    });

    $("#faq-list .faq__entry").click(function () {
        $("#faq-list").children().removeClass("active");
        this.classList.toggle("active");
        let listI = document.getElementsByClassName("faq__entry");
        for (let i = 0; i < listI.length; i++) {
            if (!listI[i].classList.contains("active")) {
                const content = listI[i].lastElementChild;
                content.style.maxHeight = null;
            }
        }
        // if ($(this).classList.)
        // $(this).addClass('active');

        const content = this.lastElementChild;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            this.classList.toggle("active");
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });

//    Subscriptions
    btnViewDaily.addEventListener('click', e => {
        e.preventDefault()
        btnViewWeekly.classList.remove('sub_selected');
        btnViewMonthly.classList.remove('sub_selected');
        btnViewDaily.classList.add('sub_selected');
        viewPackage(SUBSCRIPTION_SELECTION.DAILY)

    });
    btnViewWeekly.addEventListener('click', e => {
        e.preventDefault()
        btnViewDaily.classList.remove('sub_selected');
        btnViewMonthly.classList.remove('sub_selected');
        btnViewWeekly.classList.add('sub_selected');
        viewPackage(SUBSCRIPTION_SELECTION.WEEKLY)

    });
    btnViewMonthly.addEventListener('click', e => {
        e.preventDefault()
        btnViewWeekly.classList.remove('sub_selected');
        btnViewDaily.classList.remove('sub_selected');
        btnViewMonthly.classList.add('sub_selected');
        viewPackage(SUBSCRIPTION_SELECTION.MONTHLY)
    });
}


const SUBSCRIPTION_SELECTION = {
    DAILY: 0, WEEKLY: 1, MONTHLY: 2
}

function viewPackage(selection = SUBSCRIPTION_SELECTION.DAILY) {
    switch (selection) {
        case SUBSCRIPTION_SELECTION.DAILY:
            weeklySubs.classList.add('hidden');
            monthlySubs.classList.add('hidden');
            dailySubs.classList.remove('hidden');
            animatePackages('.pkg_1');
            break;
        case SUBSCRIPTION_SELECTION.WEEKLY:
            dailySubs.classList.add('hidden');
            monthlySubs.classList.add('hidden');
            weeklySubs.classList.remove('hidden')
            animatePackages('.pkg_2');
            break;
        case  SUBSCRIPTION_SELECTION.MONTHLY:
            weeklySubs.classList.add('hidden');
            dailySubs.classList.add('hidden');
            monthlySubs.classList.remove('hidden')
            animatePackages('.pkg_3');
            break;
        default:
            monthlySubs.classList.add('hidden');
            weeklySubs.classList.add('hidden');
            dailySubs.classList.remove('hidden');
            animatePackages('.pkg_3');
            break;
    }
}

function animatePackages(element) {
    document.querySelectorAll(`${element} .package_entry`)
        .forEach((item, index) => {
            animateElement(item, 'rotateInDownLeft').then(() => {

            });
        });
}

function subscribe() {
    if (!packageAmount) {
        console.log('Amount required');
        showSnackbar('Amount required');
        return;
    }
    let phoneNumber = document.getElementById('phone').value;
    if (!phoneNumber.match(numberRegex)) {
        console.log('Phone required');
        showSnackbar('Invalid phone number');
        return;
    }

    let data = {'uid': ADMIN_ID, 'amount': packageAmount, 'phone': phoneNumber, 'isdaraja': isDaraja}

    console.log(JSON.stringify(data));

    toggleWaitMe('body');
    fetchData(`${URL1}${V1}/subscribe`, JSON.stringify(data)).then((result) => {

        toggleWaitMe('body', false);
        let response = JSON.parse(result);
        if (response.status === OK) {
            if (!response.data) {
                showSnackbar('Subscription error');
                return;
            }
            console.log(response.data);
            showSnackbar('Payment process initiated');

            const pushResponse = JSON.parse(response.data);
            checkoutId = pushResponse.checkoutId;
            paymentToken = pushResponse.token;

            scrollToTop();
            checkCode();
        } else {
            showSnackbar(`${response.data}`, 'Retry', subscribe);
        }
    }).catch((e) => {
        console.log(e)
        toggleWaitMe('body', false);
        showSnackbar(`${e}`);
    })

}

function showSubscriptionDialog(name, amount, validity) {
    document.getElementById('close-acc-sheet')
        .addEventListener('click', (e) => {
            e.preventDefault();
            toggleSubscriptionSheet(false);
        });

    document.getElementById('package-title')
        .innerHTML = name;
    document.getElementById('package-amount')
        .innerHTML = amount;
    document.getElementById('package-validity')
        .innerHTML = validity;

    toggleSubscriptionSheet();
}

function toggleSubscriptionSheet(show = true) {
    if (show) {
        sheetBG.classList.add('scrim')
        sheetBG.style.display = "block";
        document.getElementById("acc-sheet-content").style.display = "block";
        animateCSS('acc-sheet-content', "slideInUp").then(() => {
            // sheet.style.display = "none";
        }).catch(() => {
            console.log("Error animating sheet");
        });
        return;
    }
    sheetBG.classList.remove('scrim')
    // console.log('Hiding')
    animateCSS('acc-sheet-content', "slideOutDown").then(() => {
        sheetBG.style.display = "none";
        document.getElementById("acc-sheet-content").style.display = "none";
    }).catch(() => {
        console.log("Error animating sheet");
    });
}

// function toggleLoadingButton(element, disable = true) {
//     element.classList.toggle('loading_button');
//     element.disabled = disable
// }

const asyncCheckCode = async () => {
    console.log("Checking");
    try {
        const response = await fetch(`${URL2}/code?checkout=${checkoutId}`);
        if (response.ok) {
            return await response.text()
        } else {
            showSnackbar('Auto login error', 'Retry', retrieveCode);
            return ""
        }
    } catch (e) {
        console.log(e)
        showSnackbar(`${e}`);
        return ""
    }

}

function retrieveCode() {
    console.log(checkoutId);
    notifyPayment();
    asyncCheckCode().then((result) => {
        console.log(result);
        if (result) {
            cancelCodeCheck()
            autoLogin(result)
        }
    })
    // fetch(`${URL2}/code?checkout=${checkoutId}`)
    //     .then(response => {
    //         console.log(response)
    //         if (response.ok) {
    //             response.text().then(code => {
    //                 console.log(code)
    //                 cancelCodeCheck();
    //             });
    //
    //             // autoLogin(code);
    //         } else {
    //             showSnackbar('Auto login error', 'Retry', retrieveCode);
    //         }
    //     })
    //     .catch(e => {
    //
    //     });
}

function autoLogin(code) {
    console.log(code);
    document.getElementById('txt-code')
        .value = code;
    doLogin();
}


function showSnackbar(message = '', buttonText = '', event) {

    const snackbar = document.querySelector('.mdc-snackbar');
    document.querySelector('.mdc-snackbar__label')
        .innerHTML = `${message}`;
    document.getElementById('snack-action')
        .innerHTML = `${buttonText}`;

    if (!buttonText) {
        document.getElementById('btn-snack-action')
            .classList.add('hidden');
    }
    if (event) {
        document.getElementById('btn-snack-action')
            .addEventListener('click', (e) => {
                e.preventDefault();
                event();
            });
    }
    snackbar.classList.add('show');
    setTimeout(function () {
        snackbar.classList.remove("show");
    }, 6200);
}

const createPackage = (name, amount, duration, speed) => {
    return `<p class="package_title">${name}</p>
            <span class="package_price">ksh. ${amount}</span>
            <button class="btn_subscribe" data-amount='${amount}' data-validity='${duration}' data-name='${name}'>Buy</button>
            <span class="package_specs"><i class="material-icons">hourglass_top</i>Valid for<strong class="expiry">${duration}</strong></span>
            <span class="package_specs"><i class="material-icons">cloud_sync</i><strong>${speed}</strong>Speed</span>`;
}
const getExpirationTime = (seconds) => {
    let formatted = dayjs.duration(seconds, 'seconds')
        .format('Y [years] M [months] D [days] H [hours] m [minutes] s [seconds]')
    return formatted
        .replace('0 years', '')
        .replace('0 months', '')
        .replace('0 days', '')
        .replace('0 hours', '')
        .replace('0 minutes', '')
        .replace('0 seconds', '')
        .replace('1 years', '1 year')
        .replace('1 months', '1 month')
        .replace('1 days', '1 day')
        .replace('1 hours', '1 hour')
        .replace('1 minutes', '1 minute')
        .replace('1 seconds', '1 second')
        .trim()
}
const getExpirationDuration = (seconds) => {
    let expiry = getExpirationTime(seconds).toUpperCase();
    let type;
    if (expiry.includes("HOUR")) {
        type = 0
    } else if (expiry.includes('DAY')) {
        let expiryLength = parseInt(getDurationLength(expiry));
        type = (expiryLength < 7) ? 0 : 1;
    } else {
        type = 2
    }
    return type;
}

const getDurationLength = (durationString) => {
    return durationString
        .replace('YEARS', '')
        .replace('YEAR', '')
        .replace('MONTHS', '')
        .replace('MONTH', '')
        .replace('DAYS', '')
        .replace('DAY', '')
        .replace('HOURS', '')
        .replace('HOUR', '')
        .replace('MINUTES', '')
        .replace('MINUTE', '')
        .replace('SECONDS', '')
        .replace('SECOND', '')
        .trim()
}

const formatSpeed = (speed) => {
    let rateLimitData = speed.toUpperCase().split(" ")
    let rateLimit = rateLimitData[1] ? rateLimitData[1] : rateLimitData[0];
    let rxTx;
    let rate = rateLimit.split("/")[0];
    if (rate.endsWith('K')) {
        let speed = parseFloat(rate.replace('K', '')) / 1000;
        rxTx = `Upto ${speed} MBps`
    } else {
        rxTx = `Upto ${rate.replace('M', ' MBps')}`;
    }
    return rxTx;
}
const animateCSS = (element, animation, duration = '0.5s', prefix = 'animate__') =>
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = document.getElementById(element);

        node.classList.add(`${prefix}animated`, animationName);
        node.style.setProperty('--animate-duration', duration);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve(node);
        }

        node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });

const animateElement = (element, animation, duration = '0.5s', prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = element;

        node.classList.add(`${prefix}animated`, animationName);
        // node.style.setProperty('--animate-duration', duration);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve(node);
        }

        node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });

function notifyPayment() {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr.info('Checking payment');
}


let paymentCheck, codeCheck;

function checkPayment() {
    if (paymentCheck)
        cancelPaymentCheck();
    paymentCheck = setInterval(checkSubscriptionStatus, 3000);
}

function checkCode() {
    if (codeCheck)
        cancelCodeCheck();
    codeCheck = setInterval(retrieveCode, 4000);
}

function cancelPaymentCheck() {
    clearInterval(paymentCheck)
}

function cancelCodeCheck() {
    clearInterval(codeCheck)
}

(function () {
    const doc = document.documentElement;
    const w = window;

    let prevScroll = w.scrollY || doc.scrollTop;
    let curScroll;
    let direction = 0;
    let prevDirection = 0;

    const checkScroll = function () {

        /*
        ** Find the direction of scroll
        ** 0 - initial, 1 - up, 2 - down
        */

        curScroll = w.scrollY || doc.scrollTop;
        if (curScroll > prevScroll) {
            //scrolled up
            direction = 2;
        } else if (curScroll < prevScroll) {
            //scrolled down
            direction = 1;
        }

        if (direction !== prevDirection) {
            toggleHeader(direction, curScroll);
        }

        prevScroll = curScroll;
        let y;
        const scroll = $(window).scrollTop();
        const win = $(window).height();
        const view = $("#landing");
        const height = view.height();
        const offset = view.offset().top;
        y = ((100 * scroll) / (height + win)) + ((100 * (win - offset)) / (height + win)) - 20.7;
        if (y > 100) {
            y = 100;
        } else if (y < 0) {
            y = 0;
        }
        // var out = String(y) + "%";
        // console.log(out)
        // view.css("background-position-y", out);
        if (y >= 40) {
            header.classList.add('header_light');
        } else {
            header.classList.remove('header_light');
        }
    };

    let toggleHeader = function (direction, curScroll) {
        if (direction === 2 && curScroll > 52) {

            //replace 52 with the height of your header in px

            header.classList.add('header_hidden');
            prevDirection = direction;
        } else if (direction === 1) {
            header.classList.remove('header_hidden');
            prevDirection = direction;
        }
    };

    window.addEventListener('scroll', checkScroll);

})();

function toggleWaitMe(element, show = true) {
    if (show)
        $(element).waitMe({
            effect: 'win8',
            text: '',
            bg: 'rgba(255, 255, 255, 1)',
            color: ['#9C27B0', '#9C27B0', '#03A9F4', '#CDDC39', '#03A9F4', '#9C27B0'],
            maxSize: '',
            waitTime: -1,
            textPos: 'vertical',
            fontSize: '',
            source: '',
            onClose: function () {
                toggleSubscriptionSheet(false);
            }
        });
    else $(element).waitMe("hide");
}

function scrollToTop() {
    document.getElementById('landing').scrollIntoView();
}

String.prototype.equalsIgnoreCase = function (compareString) {
    return this.toUpperCase() === compareString.toUpperCase();
};
